import { REQUIRED_SCORE_FIELDS, STANDARD_NEIGHBORHOOD_FIELDS } from '../schema/standardNeighborhoodSchema.js';

const normalizeName = (name) => String(name ?? '').trim();
const isDateLike = (value) => /^\d{4}[-/.]?\d{1,2}([-/\.]?\d{1,2})?$/.test(String(value ?? '').trim());
const isRegionLike = (value) => /[가-힣].*(시|군|구|동|읍|면|리)$/.test(String(value ?? '').trim());
const missing = (values) => values.filter((value) => value === null || value === undefined || String(value).trim() === '').length;

/** 원본 행을 읽기만 하고, 실제 컬럼을 자동 확정하지 않는 파일 프로파일러입니다. */
export function inspectRows(rows, fileName = 'unknown') {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const samples = rows.slice(0, 20);
  const columnProfiles = columns.map((column) => {
    const values = samples.map((row) => row[column]);
    return {
      column,
      sampleValues: values.filter((value) => value !== '' && value != null).slice(0, 3),
      missingCount: missing(rows.map((row) => row[column])),
      dateLikeCount: values.filter(isDateLike).length,
      regionLikeCount: values.filter(isRegionLike).length,
    };
  });
  return {
    fileName,
    rowCount: rows.length,
    columns,
    columnProfiles,
    candidateColumns: {
      date: columnProfiles.filter((profile) => profile.dateLikeCount >= 2).map((profile) => profile.column),
      region: columnProfiles.filter((profile) => profile.regionLikeCount >= 2).map((profile) => profile.column),
    },
    aggregationHint: '집계 단위는 사용자가 지역·날짜 mapping을 확정한 뒤 지역 × 월 조합 수로 확인합니다.',
  };
}

/**
 * confirmedMapping 예: { name:'행정동명', referenceMonth:'접수월', internetInstallSignal:'설치건수' }
 * 이 함수는 이름이 비슷한 컬럼을 임의로 고르지 않습니다.
 */
export function mapRowsToStandardSchema(rows, confirmedMapping) {
  const unknownTargets = Object.keys(confirmedMapping).filter((key) => !STANDARD_NEIGHBORHOOD_FIELDS.includes(key));
  if (unknownTargets.length) throw new Error(`표준 schema에 없는 mapping 항목: ${unknownTargets.join(', ')}`);
  const missingSourceColumns = Object.values(confirmedMapping).filter((source) => !rows.some((row) => source in row));
  if (missingSourceColumns.length) throw new Error(`원본에서 찾을 수 없는 컬럼: ${missingSourceColumns.join(', ')}`);
  const unmappedRequired = REQUIRED_SCORE_FIELDS.filter((field) => !confirmedMapping[field]);
  if (unmappedRequired.length) throw new Error(`최소 mapping이 필요합니다: ${unmappedRequired.join(', ')}`);

  const mappedRows = rows.map((row, index) => Object.fromEntries(
    Object.entries(confirmedMapping).map(([target, source]) => [target, row[source]]),
  ));
  const regionMonthKeys = new Set(mappedRows.map((row) => `${row.name}__${row.referenceMonth}`));
  return {
    mappedRows,
    summary: {
      mappedRowCount: mappedRows.length,
      regionMonthCount: regionMonthKeys.size,
      duplicateRegionMonthRows: mappedRows.length - regionMonthKeys.size,
      note: '중복 지역 × 월 행의 합계·평균 방식은 원본 측정 단위를 확인한 뒤 사용자가 결정해야 합니다.',
    },
  };
}

/**
 * 지역 × 월 전처리와 feature 배열 생성이 끝난 실제 신호를 웹앱에 주입하는 provider입니다.
 * mock provider와 같은 getMonthlySignals 계약을 지켜 UI를 바꾸지 않습니다.
 */
export function createRealDataProvider({ monthlySignals, sourceName = '아정당 제공 데이터', mapping }) {
  if (!Array.isArray(monthlySignals)) throw new Error('monthlySignals는 지역 × 월 전처리 결과 배열이어야 합니다.');
  return {
    type: 'real',
    mapping,
    getMetadata: () => ({
      label: `${sourceName} · 확인된 mapping 적용`,
      disclaimer: '원본 컬럼과 집계 기준을 팀이 확인한 뒤 생성된 분석용 데이터입니다.',
    }),
    getMonthlySignals: () => monthlySignals,
  };
}

export const RealDataProvider = {
  type: 'real',
  inspectRows,
  mapRowsToStandardSchema,
  createRealDataProvider,
};
