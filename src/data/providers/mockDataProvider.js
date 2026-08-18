import { MOCK_NEIGHBORHOOD_MONTHLY_SIGNALS } from '../mockMonthlyNeighborhoodSignals.js';

/** 개발 전용 원천 신호 provider. 실제 데이터와 절대 섞지 않습니다. */
export const MockDataProvider = {
  type: 'mock',
  getMetadata: () => ({
    label: '개발용 mock 데이터',
    disclaimer: '모든 수치와 후보 순위는 화면·계산 로직 검증을 위한 가상 값입니다.',
  }),
  getMonthlySignals: () => MOCK_NEIGHBORHOOD_MONTHLY_SIGNALS,
};
