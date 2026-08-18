# NEXT SPOT

MAWD Challenge용 웹서비스 MVP입니다. **이미 유명한 핫플이 아니라, 지역 변화 신호를 바탕으로 앞으로 주목받을 가능성이 있는 동네 후보를 보여주는 서비스**를 목표로 합니다.

> 현재 UI의 모든 후보·점수·신호는 데모용 mock 데이터입니다. 실제 지역 현황이나 예측 결과를 뜻하지 않습니다.

## 기술 선택

- HTML + CSS + JavaScript ES modules
- 프레임워크·빌드 의존성 없음


## 실행 방법

### 가장 간단한 방법

`index.html`을 브라우저에서 엽니다.

### 권장: 로컬 서버로 실행

Python이 설치되어 있다면 프로젝트 루트에서 실행합니다.

```bash
python -m http.server 8000
```

그다음 `http://localhost:8000`을 엽니다.

## 프로젝트 구조

```text
NEXT-SPOT/
├── index.html                     # 앱 진입점
├── package.json                   # 데이터 검증 스크립트 설정 (외부 패키지 없음)
├── scripts/check-data.js          # mock 점수·설명 결과 검증
├── src/
│   ├── main.js                    # 화면 렌더링
│   ├── styles.css                 # MVP 스타일
│   └── data/
│       ├── mockMonthlyNeighborhoodSignals.js # 개발용 mock 원천 신호
│       ├── neighborhoodMetrics.js # 파생 지표·점수 계산
│       └── neighborhoodRepository.js # UI 데이터 교체 진입점
└── README.md
```

## 실제 데이터 교체 방법

UI는 `getNeighborhoods()`만 사용합니다. 실제 아정당 또는 공개데이터를 연결할 때는 `src/data/neighborhoodRepository.js`의 mock import를 CSV/API 어댑터로 바꾸면 됩니다.

### 현재 mock 원천 데이터

`src/data/mockMonthlyNeighborhoodSignals.js`에는 서울 가상 동네 10개의 월간 신호가 있습니다. 각 동네는 지역명, 기준월, 신규 인터넷 설치 신호, 인구·세대·입주 변화, 신규 카페·음식점·폐업, 문화공간, 생활인구, 혼잡도, 업종 다양성을 포함합니다.

`src/data/neighborhoodMetrics.js`는 아래 파생 지표를 계산합니다.

- 최근 변화량과 변화 속도
- 상권 순증
- 생활인구 증가율
- 문화공간 증가
- 현재 혼잡도와 업종 다양성
- 개발용 다음 핫플 모의 지수

모든 값은 **개발용 가상 값**이며 실측 데이터가 아닙니다.

### 데이터 계산 빠른 검증

Node.js가 있는 환경에서는 아래 명령으로 10개 mock 지역의 점수 범위와 설명 문구 유무를 확인할 수 있습니다.

```bash
npm run check:data
```

## 다음 핫플 지수 (MVP 휴리스틱)

이 점수는 머신러닝 예측값이 아닙니다. 해커톤 MVP를 위한 **설명 가능한 고정 가중치 휴리스틱**입니다. 모든 입력 feature는 0~100 범위로 정규화한 뒤 계산합니다.

```text
NEXT_SPOT_SCORE = 변화 점수 × 0.5 + 발견 점수 × 0.3 + 방문 적합 점수 × 0.2
```

- 변화 점수: 신규 인터넷 설치, 인구·세대·입주 변화, 상권 순증, 문화공간·생활인구 증가
- 발견 점수: 업종 다양성, 문화공간 다양성, 과밀 회피 점수. 혼잡도 70 이상에는 추가 페널티를 적용합니다.
- 방문 적합 점수: 현재 혼잡도, 생활인구 변화, 카페·식사·문화공간 연결성

각 지역에는 `contributionFactors`와 `reasons`가 함께 반환됩니다. 따라서 UI는 단순 점수 대신 “최근 신규 점포가 빠르게 증가하고 있습니다.” 같은 설명을 보여줄 수 있습니다.

## 상세 패널

메인 카드 또는 지도 마커를 선택하면 상세 패널이 열립니다. 패널은 점수, 현재 혼잡도, 추천 방문 시간, 5개 변화 신호, 최근 3개월 변화 차트와 모델 근거를 보여줍니다. 현재 3개월 차트는 **원천 시계열이 확보되기 전의 개발용 mock 시각화**이며, 실제 데이터나 예측 결과가 아닙니다.

## 상황별 다음 동네 추천

데이트·카페·산책·친구와 놀기·조용한 동네·새로운 곳 발견 필터를 제공합니다. 필터는 맛집 순위를 만들지 않고, 상황별로 연결한 mock 경험 코스와 NEXT SPOT 점수·혼잡도를 기준으로 후보를 보여줍니다. 장소명과 코스는 모두 개발용 mock 데이터입니다.

### 실제 아정당 데이터 연동

`buildAjeongSignalFeatures()`가 아정당 신호를 분리한 모듈입니다. 현재는 mock 신규 인터넷 설치 신호만 쓰며, 실제 컬럼이 확보되면 이사 추정·웹 전환·콜 문의 등을 이 그룹에 추가하거나 교체할 수 있습니다. 공공 데이터와 UI 계층은 유지됩니다.

## 대회 당일: 실제 아정당 데이터 넣기

웹앱은 `MockDataProvider`를 기본값으로 사용합니다. 실제 원본은 mock 파일을 덮어쓰지 않고 `RealDataProvider`에서 별도로 처리합니다.

```text
아정당 원본 CSV / Excel
        ↓
파일 점검 (컬럼·날짜·지역·결측치·집계 단위)
        ↓
팀이 확인한 표준 schema mapping
        ↓
지역 × 월 → feature 생성 → NEXT SPOT SCORE → 웹사이트
```

### 1. 원본 파일을 읽기 전용으로 점검

CSV와 기본 XLSX 파일은 아래 명령으로 확인합니다. 파일을 수정하지 않으며, 컬럼명·샘플 값·결측치·날짜/지역처럼 보이는 후보 컬럼만 출력합니다. 후보를 자동 mapping하지 않습니다.

```bash
python scripts/inspect_ajeong_data.py "data/ajeong_raw.xlsx"
```

반드시 실제 컬럼명, 날짜·지역 후보, 결측치, 동일한 `지역 × 월`의 중복 행과 원본 측정 단위를 확인합니다.

### 2. 팀이 mapping을 확정

`data/realDataMapping.example.json`을 복사해 실제 mapping 파일을 만듭니다. 오른쪽 원본 컬럼명은 **대회 당일 파일을 확인한 뒤에만** 입력합니다. 최소 내부 표준 필드는 `name`, `referenceMonth`입니다. 신규 설치 등 다른 신호는 실제 제공 여부가 확인된 경우에만 추가합니다.

### 3. RealDataProvider 연결

`src/data/providers/realDataProvider.js`의 `inspectRows(rows)`로 프로파일을 확인하고, 팀이 확정한 `confirmedMapping`을 `mapRowsToStandardSchema(rows, confirmedMapping)`에 넣습니다. 존재하지 않는 원본 컬럼, 알 수 없는 표준 필드, 필수 mapping 누락은 오류로 멈춥니다. 지역 × 월 중복 행의 합계·평균 방식은 원본 정의를 확인한 뒤 팀이 결정합니다.

전처리 결과가 현재 mock과 같은 월간 신호 형식이 되면 `createRealDataProvider({ monthlySignals, sourceName, mapping })`로 provider를 만들고 `getNeighborhoods(realProvider)`에 넣습니다. UI는 provider 인터페이스만 사용하므로 화면 컴포넌트를 다시 작성할 필요가 없습니다.

UI에 필요한 최소 필드 형식은 아래와 같습니다.

```js
{
  regionId: 'unique-region-id',
  rank: 1,
  name: '동네명',
  district: '시군구',
  timeframe: '향후 3개월 관찰',
  score: 82,              // 0~100
  confidenceLabel: '관찰 필요',
  signals: ['근거 1', '근거 2', '근거 3']
}
```

## 다음 구현 순서

1. 아정당 실제 데이터 컬럼 확인 후 어댑터 작성
2. 공공 인구·상권·생활인구 데이터를 `지역 × 월` 기준으로 결합
3. 점수 계산 규칙 구현
4. 후보 동네 상세 화면과 지도 추가
