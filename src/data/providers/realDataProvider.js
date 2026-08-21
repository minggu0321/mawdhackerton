import { MOCK_NEIGHBORHOOD_MONTHLY_SIGNALS } from '../mockMonthlyNeighborhoodSignals.js';
import { AJEONG_SEOUL_INSTALL_SIGNALS } from '../ajeongRegionalSignals.js';

// 실제 아정당 CSV에서 확인된 신규 설치 신호를 기존 동네 mock의 자치구에 주입합니다.
// 공개 상권/인구 데이터가 아직 연결되지 않은 feature는 mock으로 남겨 출처를 분리합니다.
const DISTRICT_BY_REGION = {
  'mock-yeonhui': '서대문구', 'mock-mullae': '영등포구', 'mock-mangwon': '마포구', 'mock-seongsu': '성동구',
  'mock-sangdo': '동작구', 'mock-suyeong': '강동구', 'mock-huamdong': '용산구', 'mock-bulgwang': '은평구',
  'mock-cheonho': '광진구', 'mock-guro': '구로구',
};

export const RealDataProvider = {
  type: 'real-ajd',
  getMetadata: () => ({
    label: '아정당 실데이터 + 공개/개발 신호',
    disclaimer: '신규 인터넷 설치는 2023-07~2026-07 아정당 집계 데이터입니다. 인구·상권 등 나머지 신호는 개발용 mock입니다.',
    source: '05_regional_new_install.csv (아정당, 2026-08-18 제공)',
    referenceMonth: '2026-07',
  }),
  getMonthlySignals: () => MOCK_NEIGHBORHOOD_MONTHLY_SIGNALS.map((row) => {
    const signal = AJEONG_SEOUL_INSTALL_SIGNALS[DISTRICT_BY_REGION[row.id]];
    return signal ? { ...row, referenceMonth: signal.referenceMonth, internetInstallSignal: [signal.latest, signal.previous], ajeongData: true } : row;
  }),
};
