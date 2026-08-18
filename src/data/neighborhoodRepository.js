import { MockDataProvider } from './providers/mockDataProvider.js';
import { calculateNeighborhoodMetrics } from './neighborhoodMetrics.js';

const getCrowdingLabel = (score) => {
  if (score >= 75) return '혼잡';
  if (score >= 50) return '보통';
  return '여유';
};

const getRecommendedVisitTime = (score) => {
  if (score >= 75) return '평일 11:00~14:00';
  if (score >= 50) return '토요일 11:00~13:00';
  return '토요일 14:00~17:00';
};

const getRate = (current, previous) =>
  previous === 0 ? 0 : Number((((current - previous) / previous) * 100).toFixed(1));

const createMockThreeMonthSeries = (previous, current) => [
  Math.round(previous * 0.93),
  previous,
  current,
];

const MOCK_EXPERIENCES = {
  'mock-yeonhui': { situations: ['데이트', '카페', '산책', '조용한 동네', '새로운 곳 발견'], course: ['골목 커피 바', '작은 서점', '주택가 산책길'] },
  'mock-mullae': { situations: ['데이트', '카페', '친구와 놀기', '새로운 곳 발견'], course: ['철공소 골목', '로스터리 카페', '전시형 바'] },
  'mock-mangwon': { situations: ['데이트', '카페', '산책', '친구와 놀기'], course: ['동네 베이커리', '시장 골목', '하천 산책로'] },
  'mock-seongsu': { situations: ['데이트', '카페', '친구와 놀기'], course: ['팝업 거리', '디저트 카페', '서울숲 산책'] },
  'mock-sangdo': { situations: ['카페', '산책', '조용한 동네', '새로운 곳 발견'], course: ['언덕 카페', '동네 책방', '주거지 산책길'] },
  'mock-suyeong': { situations: ['산책', '조용한 동네', '새로운 곳 발견'], course: ['시장 입구', '동네 식당', '골목 산책길'] },
  'mock-huamdong': { situations: ['데이트', '카페', '산책', '조용한 동네'], course: ['언덕 전망길', '작은 카페', '독립 서점'] },
  'mock-bulgwang': { situations: ['산책', '조용한 동네', '새로운 곳 발견'], course: ['로컬 카페', '생활 골목', '근린공원'] },
  'mock-cheonho': { situations: ['데이트', '친구와 놀기', '카페'], course: ['로컬 식당', '문화 공간', '야간 산책길'] },
  'mock-guro': { situations: ['카페', '친구와 놀기', '새로운 곳 발견'], course: ['작업 카페', '상점 거리', '소규모 전시'] },
};

/**
 * UI가 데이터를 읽는 유일한 진입점입니다.
 * 실제 데이터 연동 시 아래 mock import를 CSV/API 어댑터로 바꾸면 됩니다.
 */
export function getNeighborhoods(provider = MockDataProvider) {
  return provider.getMonthlySignals()
    .map(calculateNeighborhoodMetrics)
    .sort((a, b) => b.metrics.nextSpotScore - a.metrics.nextSpotScore)
    .map((neighborhood, index) => ({
      ...neighborhood,
      rank: index + 1,
      score: neighborhood.metrics.nextSpotScore,
      confidenceLabel: '휴리스틱 mock 분석',
      signals: neighborhood.metrics.reasons,
      changeScore: Math.round(neighborhood.metrics.changeScore),
      crowdingScore: neighborhood.metrics.crowdingScore,
      crowdingLabel: getCrowdingLabel(neighborhood.metrics.crowdingScore),
      recommendedVisitTime: getRecommendedVisitTime(neighborhood.metrics.crowdingScore),
      experiences: MOCK_EXPERIENCES[neighborhood.id],
      detail: {
        // 개발용 3개월 모의 추이입니다. 실제 시계열 데이터가 아닙니다.
        monthlyMomentum: [
          { month: '5월', value: Math.max(35, Math.round(neighborhood.metrics.changeScore - 18)) },
          { month: '6월', value: Math.max(40, Math.round(neighborhood.metrics.changeScore - 8)) },
          { month: '7월', value: Math.round(neighborhood.metrics.changeScore) },
        ],
        signalCards: [
          { label: '신규 인터넷 설치', value: `${getRate(...neighborhood.internetInstallSignal) > 0 ? '+' : ''}${getRate(...neighborhood.internetInstallSignal)}%`, note: '최근 비교 기준', tone: 'mint' },
          { label: '인구·세대 변화', value: `${getRate(...neighborhood.population) > 0 ? '+' : ''}${getRate(...neighborhood.population)}%`, note: `세대 ${getRate(...neighborhood.households) > 0 ? '+' : ''}${getRate(...neighborhood.households)}%`, tone: 'blue' },
          { label: '신규 점포 순증', value: `${neighborhood.metrics.commercialNetGain > 0 ? '+' : ''}${neighborhood.metrics.commercialNetGain}개`, note: '카페·음식점·폐업 반영', tone: 'orange' },
          { label: '생활인구 변화', value: `${neighborhood.metrics.livingPopulationGrowthRate > 0 ? '+' : ''}${neighborhood.metrics.livingPopulationGrowthRate}%`, note: '최근 비교 기준', tone: 'purple' },
          { label: '문화공간 변화', value: `${neighborhood.metrics.culturalSpaceGrowth > 0 ? '+' : ''}${neighborhood.metrics.culturalSpaceGrowth}개`, note: '최근 비교 기준', tone: 'pink' },
        ],
        internetSeries: createMockThreeMonthSeries(neighborhood.internetInstallSignal[1], neighborhood.internetInstallSignal[0]),
      },
    }));
}

/** 상황별 후보 정렬. 실제 장소 추천·맛집 순위가 아닌 개발용 mock 경험 코스입니다. */
export function getSituationRecommendations(situation, provider = MockDataProvider) {
  return getNeighborhoods(provider)
    .filter((neighborhood) => neighborhood.experiences.situations.includes(situation))
    .sort((a, b) => {
      const aFit = situation === '조용한 동네' ? 100 - a.crowdingScore : a.score;
      const bFit = situation === '조용한 동네' ? 100 - b.crowdingScore : b.score;
      return bFit - aFit;
    })
    .slice(0, 3);
}

export function getDataSourceMeta(provider = MockDataProvider) {
  return provider.getMetadata();
}
