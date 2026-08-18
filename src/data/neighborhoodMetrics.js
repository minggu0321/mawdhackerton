/**
 * NEXT SPOT MVP의 설명 가능한 휴리스틱 점수 모듈입니다.
 * 머신러닝 예측 모델이나 실제 상권 예측값이 아닙니다.
 * 모든 feature는 0~100으로 정규화한 뒤, 고정 가중치로 합산합니다.
 */

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const normalizeTo100 = (value, min, max) => {
  if (max === min) return 0;
  return Number(clamp(((value - min) / (max - min)) * 100).toFixed(1));
};

const percentChange = (current, previous) =>
  previous === 0 ? 0 : Number((((current - previous) / previous) * 100).toFixed(1));

const weightedAverage = (features) => {
  const totalWeight = features.reduce((sum, item) => sum + item.weight, 0);
  return totalWeight
    ? Number((features.reduce((sum, item) => sum + item.normalizedValue * item.weight, 0) / totalWeight).toFixed(1))
    : 0;
};

const feature = (id, label, rawValue, normalizedValue, weight, explanation) => ({
  id,
  label,
  rawValue,
  normalizedValue,
  weight,
  contribution: Number((normalizedValue * weight).toFixed(1)),
  explanation,
});

/**
 * 아정당 데이터 feature group입니다.
 * 현재는 mock 신규 인터넷 설치 신호만 사용합니다.
 * 실제 연동 시 이사 추정·웹 전환·콜 문의 feature를 이 함수에 추가합니다.
 */
export function buildAjeongSignalFeatures(raw) {
  const growthRate = percentChange(...raw.internetInstallSignal);
  return [
    feature('internet-install-growth', '신규 인터넷 설치 신호', growthRate, normalizeTo100(growthRate, -10, 70), 0.24, '신규 인터넷 설치 신호가 최근 크게 상승했습니다.'),
  ];
}

function buildPublicChangeFeatures(raw) {
  const populationGrowthRate = percentChange(...raw.population);
  const householdGrowthRate = percentChange(...raw.households);
  const moveInGrowthRate = percentChange(...raw.moveIns);
  const commercialNetGain = raw.newCafes + raw.newRestaurants - raw.closures;
  const culturalSpaceGrowth = raw.culturalSpaces[0] - raw.culturalSpaces[1];
  const livingPopulationGrowthRate = percentChange(...raw.livingPopulationIndex);

  return [
    feature('population-growth', '인구 변화', populationGrowthRate, normalizeTo100(populationGrowthRate, -1, 2.5), 0.1, '인구가 최근 증가했습니다.'),
    feature('household-growth', '세대 변화', householdGrowthRate, normalizeTo100(householdGrowthRate, -1, 3), 0.1, '세대 수가 최근 증가했습니다.'),
    feature('move-in-growth', '입주·이동 변화', moveInGrowthRate, normalizeTo100(moveInGrowthRate, -10, 70), 0.14, '입주·이동 변화가 뚜렷합니다.'),
    feature('commercial-net-gain', '상권 순증', commercialNetGain, normalizeTo100(commercialNetGain, -5, 15), 0.18, '최근 신규 점포가 빠르게 증가하고 있습니다.'),
    feature('culture-growth', '문화공간 증가', culturalSpaceGrowth, normalizeTo100(culturalSpaceGrowth, 0, 5), 0.1, '문화공간이 최근 늘고 있습니다.'),
    feature('living-population-growth', '생활인구 증가', livingPopulationGrowthRate, normalizeTo100(livingPopulationGrowthRate, -5, 30), 0.14, '생활인구가 최근 3개월 동안 증가했습니다.'),
  ];
}

function buildDiscoveryFeatures(raw) {
  const culturalSpaceDiversity = normalizeTo100(raw.culturalSpaces[0], 0, 25);
  const nonOvercrowding = 100 - normalizeTo100(raw.currentCrowdingScore, 45, 95);
  const overcrowdingPenalty = normalizeTo100(raw.currentCrowdingScore, 70, 95);

  return {
    baseFeatures: [
      feature('business-diversity', '업종 다양성', raw.businessDiversityScore, raw.businessDiversityScore, 0.45, '카페·식사·생활 업종의 구성이 다양합니다.'),
      feature('culture-diversity', '문화공간 다양성', raw.culturalSpaces[0], culturalSpaceDiversity, 0.25, '문화공간 선택지가 충분합니다.'),
      feature('non-overcrowding', '과밀 회피', raw.currentCrowdingScore, nonOvercrowding, 0.3, '아직 현재 혼잡도가 낮은 편입니다.'),
    ],
    overcrowdingPenalty,
  };
}

function buildVisitFitFeatures(raw, livingPopulationGrowthRate) {
  const currentCrowdingFit = 100 - normalizeTo100(raw.currentCrowdingScore, 45, 95);
  const livingGrowthFit = normalizeTo100(livingPopulationGrowthRate, -5, 30);
  const cafeAndFoodConnection = normalizeTo100(raw.newCafes + raw.newRestaurants, 0, 16);
  const cultureConnection = normalizeTo100(raw.culturalSpaces[0], 0, 25);
  const neighborhoodConnection = Number((cafeAndFoodConnection * 0.4 + cultureConnection * 0.3 + raw.businessDiversityScore * 0.3).toFixed(1));

  return [
    feature('current-crowding', '현재 혼잡도', raw.currentCrowdingScore, currentCrowdingFit, 0.4, '현재 혼잡도가 과도하지 않아 방문하기 좋습니다.'),
    feature('visit-living-growth', '생활인구 변화', livingPopulationGrowthRate, livingGrowthFit, 0.25, '동네 활동성이 증가하는 흐름입니다.'),
    feature('neighborhood-connection', '동네 연결성', neighborhoodConnection, neighborhoodConnection, 0.35, '카페·식사·문화공간을 연결한 동네 경험을 만들기 좋습니다.'),
  ];
}

function buildReasons(featureGroups) {
  const allFeatures = [...featureGroups.change.features, ...featureGroups.discovery.features, ...featureGroups.visitFit.features];
  return allFeatures
    .filter((item) => item.normalizedValue >= 55)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((item) => item.explanation);
}

export function calculateNeighborhoodMetrics(raw) {
  const ajeongFeatures = buildAjeongSignalFeatures(raw);
  const publicChangeFeatures = buildPublicChangeFeatures(raw);
  const changeFeatures = [...ajeongFeatures, ...publicChangeFeatures];
  const changeScore = weightedAverage(changeFeatures);

  const discovery = buildDiscoveryFeatures(raw);
  const discoveryBaseScore = weightedAverage(discovery.baseFeatures);
  const discoveryScore = Number(clamp(discoveryBaseScore - discovery.overcrowdingPenalty * 0.25).toFixed(1));

  const livingPopulationGrowthRate = percentChange(...raw.livingPopulationIndex);
  const visitFitFeatures = buildVisitFitFeatures(raw, livingPopulationGrowthRate);
  const visitFitScore = weightedAverage(visitFitFeatures);
  const nextSpotScore = Math.round(changeScore * 0.5 + discoveryScore * 0.3 + visitFitScore * 0.2);

  const featureGroups = {
    change: { score: changeScore, features: changeFeatures },
    discovery: { score: discoveryScore, features: discovery.baseFeatures, overcrowdingPenalty: discovery.overcrowdingPenalty },
    visitFit: { score: visitFitScore, features: visitFitFeatures },
  };
  const commercialNetGain = raw.newCafes + raw.newRestaurants - raw.closures;
  const culturalSpaceGrowth = raw.culturalSpaces[0] - raw.culturalSpaces[1];

  return {
    ...raw,
    metrics: {
      modelType: 'explainable-heuristic-mvp',
      recentChangeAmount: changeScore,
      changeVelocity: Number((changeScore / 3).toFixed(1)), // 최근 3개월 비교 가정
      commercialNetGain,
      livingPopulationGrowthRate,
      culturalSpaceGrowth,
      crowdingScore: raw.currentCrowdingScore,
      businessDiversityScore: raw.businessDiversityScore,
      internetInstallGrowthRate: percentChange(...raw.internetInstallSignal),
      populationGrowthRate: percentChange(...raw.population),
      householdGrowthRate: percentChange(...raw.households),
      moveInGrowthRate: percentChange(...raw.moveIns),
      changeScore,
      discoveryScore,
      visitFitScore,
      nextSpotScore,
      normalizedFeatures: Object.fromEntries([...changeFeatures, ...discovery.baseFeatures, ...visitFitFeatures].map((item) => [item.id, item.normalizedValue])),
      featureGroups,
      contributionFactors: [...changeFeatures, ...discovery.baseFeatures, ...visitFitFeatures].sort((a, b) => b.contribution - a.contribution),
      reasons: buildReasons(featureGroups),
    },
  };
}
