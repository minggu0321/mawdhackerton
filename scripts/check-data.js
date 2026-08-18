import { getNeighborhoods } from '../src/data/neighborhoodRepository.js';

const neighborhoods = getNeighborhoods();
const hasInvalidResult = neighborhoods.some(
  (neighborhood) =>
    neighborhood.score < 0 ||
    neighborhood.score > 100 ||
    neighborhood.signals.length === 0,
);

if (neighborhoods.length !== 10 || hasInvalidResult) {
  throw new Error('NEXT SPOT mock score verification failed.');
}

console.table(
  neighborhoods.slice(0, 3).map(({ name, score, signals }) => ({
    neighborhood: name,
    score,
    topReason: signals[0],
  })),
);
