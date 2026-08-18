/**
 * NEXT SPOT 내부 표준 schema입니다.
 * 각 필드는 실제 원본의 특정 컬럼을 뜻하지 않습니다. 대회 당일 확인된 mapping으로만 채웁니다.
 */
export const STANDARD_NEIGHBORHOOD_FIELDS = [
  'regionId', 'name', 'district', 'referenceMonth', 'internetInstallSignal',
  'population', 'households', 'moveIns', 'newCafes', 'newRestaurants',
  'closures', 'culturalSpaces', 'livingPopulationIndex',
  'currentCrowdingScore', 'businessDiversityScore',
];

export const REQUIRED_SCORE_FIELDS = ['name', 'referenceMonth'];
