
MAWD Challenge용 웹서비스 MVP입니다. **이미 유명한 핫플이 아니라, 지역 변화 신호를 바탕으로 앞으로 주목받을 가능성이 있는 동네 후보를 보여주는 서비스**를 목표로 합니다.

> 현재 UI의 모든 후보·점수·신호는 데모용 mock 데이터입니다. 실제 지역 현황이나 예측 결과를 뜻하지 않습니다.

## 발표자료

[NEXT SPOT 발표자료 다운로드](outputs/%EB%84%A5%EC%8A%A4%ED%8A%B8%EC%8A%A4%ED%8C%9F%20%ED%94%BC%ED%94%BC%ED%8B%B0%20%EC%B5%9C%EC%A2%85.pptx)

## 서울시 상업·업무용 거래 신호

[서울부동산정보광장 상업·업무용 실거래](https://land.seoul.go.kr/land/rtms/rtmsBusiness.do)를 Chrome에서 25개 자치구에 동일 조건으로 조회했습니다.

- 기준: 2026년 3분기, 상업·업무용, 지번 기준
- 공간 단위: 자치구 조회 후 법정동 거래 목록
- 수집 변수: 계약일, 거래금액, 건축물 주용도, 전용·연면적, 용도지역, 건축년도, 거래유형
- 현재 적용값: 자치구별 조회 행 수를 거래활동량 보조 지수로 정규화

조회 행 수는 거래금액 합계나 공식 거래건수와 동일하지 않으므로 `commercial-transaction-activity`라는 낮은 가중치의 참고 feature로만 사용합니다. 실제 운영에서는 원본 다운로드/API의 공식 집계건수로 교체해야 합니다.

| 자치구 | 조회 행 수 | 자치구 | 조회 행 수 |
|---|---:|---|---:|
| 강남구 | 244 | 강동구 | 52 |
| 강서구 | 136 | 관악구 | 80 |
| 광진구 | 120 | 구로구 | 124 |
| 마포구 | 152 | 영등포구 | 180 |
| 용산구 | 192 | 종로구 | 176 |
| 중구 | 332 | 중랑구 | 20 |

전체 25개 자치구 값은 `src/data/seoulBusinessSignals.js`에 보존했습니다.

## 서울시 상업·업무용 거래 데이터

[서울부동산정보광장 상업·업무용 실거래](https://land.seoul.go.kr/land/rtms/rtmsBusiness.do)는 자치구·법정동·분기/기간 기준으로 계약일, 거래금액, 건축물 주용도, 전용·연면적, 용도지역, 건축년도와 중개·직거래 유형을 제공합니다. 이 데이터는 국토교통부 실거래가 공개시스템 기반의 참고자료이며, 거래활동을 지역 변화의 보조 신호로 사용할 수 있습니다.

표준 schema의 `commercialTransactionActivity`는 실제 원본을 확인한 뒤 동일한 자치구·법정동·기간으로 집계한 거래 건수 또는 정규화된 거래활동 지수만 매핑합니다. 현재 mock 지역에는 이 값을 임의로 채우지 않았으며, 실제 수치처럼 표시하지 않습니다.

### 서울시 주거 변화 보조 신호

서울시 서울부동산정보광장의 2026-06-30 기준 자치구별 민간 미분양 총괄을 `src/data/seoulHousingSignals.js`에 연결했습니다. 미분양은 성장 신호로 간주하지 않고 주거 리스크로 해석해 NEXT SPOT 점수에 낮은 가중치의 보조 feature로 반영합니다. 현재 앱의 가상 동네와 자치구 통계의 공간 단위가 다르므로, 이 값은 실측 예측값이 아닌 외부 참고 신호입니다.

## 외부 데이터 근거

서울시 **서울부동산정보광장**의 공개 통계를 지역 변화 신호 후보로 검토하고 있습니다.

- [아파트 동향·부동산 거래현황](https://land.seoul.go.kr/land/rtms/aptTrend.do): 계약일 기준 아파트 매매·전세·월세 거래량, 평균 거래금액, 가격 변동률을 서울·자치구 단위로 확인할 수 있습니다. 사이트는 거래량이 공식 통계가 아닌 참고용이며 전일까지 신고된 자료라고 안내합니다.
- [민간 미분양 주택](https://land.seoul.go.kr/land/rent/rentCivilHouse.do): 서울시 주택정책실이 매월 구청 자료를 수합해 제공하며, 자치구·전용면적별 미분양 및 전월 대비 증감을 확인할 수 있습니다.

이 데이터는 신규 주거 공급·거래 활성도·미분양 리스크를 보조 feature로 추가할 수 있는 후보입니다. 현재 MVP 점수에는 아직 반영하지 않았으며, 실제 지역 변화·상권 성장과의 선후관계가 검증된 뒤 `주거 변화` feature 그룹으로 편입합니다.

## 기술 선택

- HTML + CSS + JavaScript ES modules
- 프레임워크·빌드 의존성 없음
> **사람들이 몰리기 전에, 다음 동네를 발견하세요.**

## 실행 방법
이미 유명해진 핫플을 따라가는 대신, 지역의 변화 신호를 분석해 앞으로 주목받을 가능성이 높은 동네를 먼저 발견하는 데이터 기반 지역 탐색 서비스입니다.

### 가장 간단한 방법
<p align="center">
  <a href="https://minggu0321.github.io/mawdhackerton/"><strong>Live Demo</strong></a> ·
  <a href="outputs/%EB%84%A5%EC%8A%A4%ED%8A%B8%EC%8A%A4%ED%8C%9F%20%ED%94%BC%ED%94%BC%ED%8B%B0%20%EC%B5%9C%EC%A2%85.pptx">
  <strong>Presentation</strong>
</a>
</p>

`index.html`을 브라우저에서 엽니다.
> ⚠️ 현재 서비스의 지역·점수·변화 신호는 **해커톤 개발용 mock 데이터**입니다. 실제 지역 현황이나 머신러닝 예측 결과를 의미하지 않습니다.

### 권장: 로컬 서버로 실행
## Why NEXT SPOT?

Python이 설치되어 있다면 프로젝트 루트에서 실행합니다.
서울의 인기 장소는 유명해진 뒤 빠르게 붐빕니다. 사용자는 사람이 너무 많지 않으면서도 새롭고 분위기 좋은 동네를 찾고 싶지만, 기존 지도·SNS 서비스는 대부분 현재 인기순과 리뷰순 장소를 보여줍니다.

```bash
python -m http.server 8000
```
NEXT SPOT은 “어디가 지금 유명한가?”가 아니라 **“어디에서 변화가 시작되고 있는가?”**를 봅니다.

그다음 `http://localhost:8000`을 엽니다.
## How it works

## 프로젝트 구조
사용자가 `조용한 데이트`, `카페와 산책`, `새로운 동네 발견` 같은 상황이나 키워드를 입력하면 지역별 변화 신호를 결합해 후보를 추천합니다.

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
지역 변화 데이터 → 변화·발견·방문 적합 점수 → NEXT SPOT SCORE와 추천 근거
```

## 실제 데이터 교체 방법
사용자가 확인할 수 있는 핵심 신호:

UI는 `getNeighborhoods()`만 사용합니다. 실제 아정당 또는 공개데이터를 연결할 때는 `src/data/neighborhoodRepository.js`의 mock import를 CSV/API 어댑터로 바꾸면 됩니다.
- 신규 인터넷 설치 신호
- 인구·세대·입주 변화
- 신규 카페·음식점·문화공간
- 생활인구 변화
- 현재 혼잡도·업종 다양성

### 현재 mock 원천 데이터
## MVP features

- 💬 키워드·상황 기반 conversational search
- 🗺️ 서울 지도형 후보 탐색
- 📈 지역별 NEXT SPOT 점수와 최근 변화 신호
- 🔎 점수 산정 근거를 보여주는 상세 패널
- 🕒 현재 혼잡도와 추천 방문 시간
- 🧭 데이트·카페·산책·조용한 동네별 추천 코스
- 🧪 MockDataProvider / RealDataProvider 분리 구조

`src/data/mockMonthlyNeighborhoodSignals.js`에는 서울 가상 동네 10개의 월간 신호가 있습니다. 각 동네는 지역명, 기준월, 신규 인터넷 설치 신호, 인구·세대·입주 변화, 신규 카페·음식점·폐업, 문화공간, 생활인구, 혼잡도, 업종 다양성을 포함합니다.
## Score model

`src/data/neighborhoodMetrics.js`는 아래 파생 지표를 계산합니다.
NEXT SPOT 점수는 머신러닝 예측값이 아닌 설명 가능한 휴리스틱 점수입니다. 모든 feature는 0~100으로 정규화합니다.

- 최근 변화량과 변화 속도
- 상권 순증
- 생활인구 증가율
- 문화공간 증가
- 현재 혼잡도와 업종 다양성
- 개발용 다음 핫플 모의 지수
```text
NEXT_SPOT_SCORE = 변화 점수 × 0.5 + 발견 점수 × 0.3 + 방문 적합 점수 × 0.2
```

모든 값은 **개발용 가상 값**이며 실측 데이터가 아닙니다.
## Tech stack

### 데이터 계산 빠른 검증
- HTML / CSS / JavaScript ES modules
- 프레임워크·빌드 의존성 없는 정적 웹앱
- Python HTTP server 또는 GitHub Pages

Node.js가 있는 환경에서는 아래 명령으로 10개 mock 지역의 점수 범위와 설명 문구 유무를 확인할 수 있습니다.
## Run locally

```bash
npm run check:data
python -m http.server 8000
```

## 다음 핫플 지수 (MVP 휴리스틱)
브라우저에서 [http://localhost:8000](http://localhost:8000)을 엽니다. 데이터 계산 검증은 `npm run check:data`로 실행합니다.

이 점수는 머신러닝 예측값이 아닙니다. 해커톤 MVP를 위한 **설명 가능한 고정 가중치 휴리스틱**입니다. 모든 입력 feature는 0~100 범위로 정규화한 뒤 계산합니다.
## Project structure

```text
NEXT_SPOT_SCORE = 변화 점수 × 0.5 + 발견 점수 × 0.3 + 방문 적합 점수 × 0.2
NEXT-SPOT/
├── index.html
├── src/
│   ├── main.js
│   ├── styles.css
│   └── data/
│       ├── mockMonthlyNeighborhoodSignals.js
│       ├── neighborhoodMetrics.js
│       ├── neighborhoodRepository.js
│       └── providers/
├── data/                 # 표준 schema와 실제 데이터 매핑 예시
├── scripts/              # 데이터 점검·검증 스크립트
├── docs/                 # 발표자료
├── package.json
└── README.md
```

## 발표자료

서비스 문제정의, 데이터 기반 해결방법, 기대효과와 확장 방향을 정리한 발표자료입니다.

- 📊 [Presentation deck](outputs/%EB%84%A5%EC%8A%A4%ED%8A%B8%EC%8A%A4%ED%8C%9F%20%ED%94%BC%ED%94%BC%ED%8B%B0%20%EC%B5%9C%EC%A2%85.pptx)

발표자료의 화면은 해커톤 발표용이며, 서비스의 지역 후보·점수·신호는 현재 개발용 mock 데이터입니다.

- 변화 점수: 신규 인터넷 설치, 인구·세대·입주 변화, 상권 순증, 문화공간·생활인구 증가
- 발견 점수: 업종 다양성, 문화공간 다양성, 과밀 회피 점수. 혼잡도 70 이상에는 추가 페널티를 적용합니다.
- 방문 적합 점수: 현재 혼잡도, 생활인구 변화, 카페·식사·문화공간 연결성

각 지역에는 `contributionFactors`와 `reasons`가 함께 반환됩니다. 따라서 UI는 단순 점수 대신 “최근 신규 점포가 빠르게 증가하고 있습니다.” 같은 설명을 보여줄 수 있습니다.

## 상세 패널

메인 카드 또는 지도 마커를 선택하면 상세 패널이 열립니다. 패널은 점수, 현재 혼잡도, 추천 방문 시간, 5개 변화 신호, 최근 3개월 변화 차트와 모델 근거를 보여줍니다. 현재 3개월 차트는 **원천 시계열이 확보되기 전의 개발용 mock 시각화**이며, 실제 데이터나 예측 결과가 아닙니다.
## Real data handoff

## 상황별 다음 동네 추천

데이트·카페·산책·친구와 놀기·조용한 동네·새로운 곳 발견 필터를 제공합니다. 필터는 맛집 순위를 만들지 않고, 상황별로 연결한 mock 경험 코스와 NEXT SPOT 점수·혼잡도를 기준으로 후보를 보여줍니다. 장소명과 코스는 모두 개발용 mock 데이터입니다.

### 실제 아정당 데이터 연동

`buildAjeongSignalFeatures()`가 아정당 신호를 분리한 모듈입니다. 현재는 mock 신규 인터넷 설치 신호만 쓰며, 실제 컬럼이 확보되면 이사 추정·웹 전환·콜 문의 등을 이 그룹에 추가하거나 교체할 수 있습니다. 공공 데이터와 UI 계층은 유지됩니다.

## 대회 당일: 실제 아정당 데이터 넣기
실제 아정당 컬럼을 미리 가정하지 않습니다. 대회 당일 원본 CSV·Excel을 확인한 뒤 다음 파이프라인에 연결합니다.

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
→ 컬럼·날짜·지역·결측치 점검
→ 팀이 확인한 mapping
→ 지역 × 월 표준 schema
→ feature 생성
→ NEXT SPOT SCORE
→ 웹사이트
```

반드시 실제 컬럼명, 날짜·지역 후보, 결측치, 동일한 `지역 × 월`의 중복 행과 원본 측정 단위를 확인합니다.
`MockDataProvider`와 `RealDataProvider`는 분리되어 있으며, UI는 provider 인터페이스만 사용합니다. 인터넷 신규 설치는 실제 이사를 완벽하게 의미하지 않는 보조 신호로만 사용하고, 인구·생활인구·상권 데이터와 함께 검증합니다.

### 2. 팀이 mapping을 확정
## Business potential

`data/realDataMapping.example.json`을 복사해 실제 mapping 파일을 만듭니다. 오른쪽 원본 컬럼명은 **대회 당일 파일을 확인한 뒤에만** 입력합니다. 최소 내부 표준 필드는 `name`, `referenceMonth`입니다. 신규 설치 등 다른 신호는 실제 제공 여부가 확인된 경우에만 추가합니다.
초기에는 개인 사용자의 새로운 동네 발견 경험을 제공하고, 장기적으로는 같은 지역 변화 데이터 엔진을 다음 고객에게 확장할 수 있습니다.

### 3. RealDataProvider 연결
- 프랜차이즈·부동산: 신규 출점 후보지와 성장 조기 신호
- 지자체·공공기관: 지역 활성화와 청년 유입 모니터링
- 지역 사업자: 주변 유입과 상권 변화 리포트

`src/data/providers/realDataProvider.js`의 `inspectRows(rows)`로 프로파일을 확인하고, 팀이 확정한 `confirmedMapping`을 `mapRowsToStandardSchema(rows, confirmedMapping)`에 넣습니다. 존재하지 않는 원본 컬럼, 알 수 없는 표준 필드, 필수 mapping 누락은 오류로 멈춥니다. 지역 × 월 중복 행의 합계·평균 방식은 원본 정의를 확인한 뒤 팀이 결정합니다.
위 내용은 현재 검증 중인 사업 가설이며, 시장 규모·가격·구매 가능성은 추가 인터뷰가 필요합니다.

전처리 결과가 현재 mock과 같은 월간 신호 형식이 되면 `createRealDataProvider({ monthlySignals, sourceName, mapping })`로 provider를 만들고 `getNeighborhoods(realProvider)`에 넣습니다. UI는 provider 인터페이스만 사용하므로 화면 컴포넌트를 다시 작성할 필요가 없습니다.
## Links

UI에 필요한 최소 필드 형식은 아래와 같습니다.
- 🌐 [Live Demo](https://minggu0321.github.io/mawdhackerton/)
- 📊 [Presentation deck](outputs/%EB%84%A5%EC%8A%A4%ED%8A%B8%EC%8A%A4%ED%8C%9F%20%ED%94%BC%ED%94%BC%ED%8B%B0%20%EC%B5%9C%EC%A2%85.pptx)
  

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
---

## 다음 구현 순서

1. 아정당 실제 데이터 컬럼 확인 후 어댑터 작성
2. 공공 인구·상권·생활인구 데이터를 `지역 × 월` 기준으로 결합
3. 점수 계산 규칙 구현
4. 후보 동네 상세 화면과 지도 추가
Built for **MAWD Challenge** · NEXT SPOT
