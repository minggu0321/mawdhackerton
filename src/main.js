import { getDataSourceMeta, getNeighborhoods, getSituationRecommendations } from './data/neighborhoodRepository.js';
import { seoulHousingSignals } from './data/seoulHousingSignals.js';
import { seoulBusinessSignals, SEOUL_BUSINESS_SIGNAL_META } from './data/seoulBusinessSignals.js';

const app = document.querySelector('#app');
const neighborhoods = getNeighborhoods();
const dataSource = getDataSourceMeta();
const featuredNeighborhoods = neighborhoods.slice(0, 5);

// 실제 좌표가 아닌, 서울 지도형 MVP UI를 위한 상대 배치 값입니다.
const mapPositions = {
  'mock-yeonhui': { x: 27, y: 29 }, 'mock-mullae': { x: 39, y: 69 },
  'mock-mangwon': { x: 23, y: 47 }, 'mock-seongsu': { x: 68, y: 47 },
  'mock-sangdo': { x: 49, y: 70 }, 'mock-suyeong': { x: 36, y: 15 },
  'mock-huamdong': { x: 52, y: 47 }, 'mock-bulgwang': { x: 20, y: 22 },
  'mock-cheonho': { x: 85, y: 61 }, 'mock-guro': { x: 27, y: 73 },
};

const getChangeLabel = (score) => (score >= 75 ? '변화 빠름' : score >= 60 ? '변화 감지' : '관찰 중');

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="NEXT SPOT 홈"><span class="brand-mark">N</span><span>NEXT SPOT</span></a>
    <span class="header-status"><i></i>${dataSource.label} · 서울시 공개 통계 포함</span>
  </header>
  <main id="top">
    <section class="hero">
      <div class="hero-kicker"><span>✦</span> 서울의 다음 핫플 후보</div>
      <h1>사람들이 몰리기 전에,<br /><em>다음 동네</em>를 발견하세요.</h1>
      <p class="hero-copy">NEXT SPOT은 지역 변화 신호를 모아 앞으로 주목받을 가능성이 있는 동네를 보여주는 서비스입니다.</p>
      <div class="hero-stats"><span><b>10</b>개 관찰 동네</span><span><b>3</b>개 변화 축</span><span><b>0~100</b> 설명형 지수</span></div>
    </section>
    <section class="discovery-workspace" aria-labelledby="chat-title">
      <aside class="chat-panel">
        <div class="chat-panel-head"><div><p class="eyebrow">NEXT SPOT GUIDE</p><h2 id="chat-title">어떤 동네를 찾고 있나요?</h2></div><span class="chat-live"><i></i>LIVE</span></div>
        <div class="chat-history" id="chat-history" aria-live="polite"><div class="chat-message assistant"><span class="chat-avatar">N</span><p>원하는 분위기나 상황을 말해 주세요.<br /><b>“조용한 카페와 산책이 좋은 곳”</b>처럼 입력하면 변화 신호를 찾아볼게요.</p></div></div>
        <form class="chat-form" id="chat-form"><input id="chat-input" autocomplete="off" placeholder="예: 주말에 조용한 데이트" aria-label="찾고 싶은 동네 입력" /><button type="submit" aria-label="검색">↑</button></form>
        <div class="prompt-chips"><button type="button">조용한 카페</button><button type="button">새로운 데이트</button><button type="button">산책하기 좋은 곳</button></div>
      </aside>
      <div class="search-result-preview"><div class="search-state" id="search-state"><span class="search-dot"></span><span>키워드를 입력하면 변화 신호를 검색합니다</span></div><div class="mini-result-map" id="mini-result-map"><svg class="mini-map-svg" viewBox="0 0 600 300" role="img" aria-label="서울 변화 신호 지도"><rect width="600" height="300" fill="#eef2f5"/><path d="M120 72 L210 42 L320 58 L410 38 L505 82 L530 145 L485 188 L510 238 L390 270 L275 245 L170 272 L78 218 L105 160 L65 118 Z" fill="#e3e8ec" stroke="#cbd3da"/><path d="M95 166 C155 145 205 155 260 130 S360 125 415 102 S485 100 530 82" fill="none" stroke="#8cc8f5" stroke-width="18" stroke-linecap="round"/><path d="M95 166 C155 145 205 155 260 130 S360 125 415 102 S485 100 530 82" fill="none" stroke="#b9def7" stroke-width="3" stroke-linecap="round"/></svg><div class="mini-map-label">서울 변화 신호 지도</div></div><div class="search-result-list" id="search-result-list"><p>추천 결과가 여기에 표시됩니다.</p></div></div>
    </section>
    <section class="map-section" aria-labelledby="map-title">
      <div class="section-heading"><div><p class="eyebrow">NEXT SPOT MAP</p><h2 id="map-title">서울의 변화 신호를 한눈에</h2></div><div class="map-legend"><span><i class="legend-dot high"></i>점수 높음</span><span><i class="legend-dot"></i>관찰 중</span></div></div>
      <div class="map-shell"><div class="map-copy"><span class="map-copy-label">NEXT SPOT INDEX</span><strong>변화가 빠르지만<br />아직 과밀하지 않은 곳</strong><p>마커에 후보 점수와 변화 정도를 표시합니다.</p></div><div class="seoul-map" aria-label="서울의 NEXT SPOT 후보 지역 지도형 UI" id="seoul-map"></div><p class="map-disclaimer">서울 지도형 UI · 마커 위치와 수치는 개발용 mock 데이터입니다.</p></div>
    </section>
    <section class="situation-section" aria-labelledby="situation-title"><div class="section-heading"><div><p class="eyebrow">FIND YOUR NEXT SPOT</p><h2 id="situation-title">오늘의 상황으로 다음 동네 찾기</h2></div><p class="section-note">맛집 순위가 아닌, 덜 붐비는 동네 변화 신호를 추천합니다.</p></div><div class="situation-filters" id="situation-filters"></div><div class="recommendation-intro"><span>✦</span><p id="recommendation-copy"></p></div><div class="recommendation-grid" id="recommendation-grid" aria-live="polite"></div><p class="recommendation-disclaimer">코스의 장소명과 순서는 서비스 흐름 검증을 위한 개발용 mock 데이터입니다.</p></section>
    <section class="section attention-section" aria-labelledby="candidate-title">
      <div class="section-heading"><div><p class="eyebrow">CURATED FOR NOW</p><h2 id="candidate-title">지금 주목할 동네</h2></div><p class="section-note">현재 인기보다, 최근 변화의 속도를 봅니다.</p></div>
      <div class="candidate-grid" id="candidate-grid"></div>
    </section>
    <section class="section how-it-works" aria-labelledby="how-title"><p class="eyebrow">HOW IT WORKS</p><h2 id="how-title">점수는 이렇게 만들어집니다</h2><div class="signal-grid"><article><span>01</span><h3>지역 변화</h3><p>신규 설치·이동·입주 같은 초기 변화를 확인합니다.</p></article><article><span>02</span><h3>상권 신호</h3><p>신규 점포·문화공간·생활인구 변화를 함께 봅니다.</p></article><article><span>03</span><h3>후보와 근거</h3><p>확정이 아닌 가능성으로, 판단 근거를 함께 보여줍니다.</p></article></div></section>
  </main>
  <footer>MAWD Challenge MVP · NEXT SPOT</footer>
  <dialog class="detail-dialog" id="detail-dialog" aria-labelledby="detail-title"><div class="dialog-content" id="detail-content"></div></dialog>`;

document.querySelector('#candidate-grid').innerHTML = featuredNeighborhoods.map((neighborhood) => `
  <article class="candidate-card" data-neighborhood-id="${neighborhood.id}" tabindex="0" role="button" aria-label="${neighborhood.name} 상세 보기"><div class="card-topline"><span class="rank">TOP ${String(neighborhood.rank).padStart(2, '0')}</span><span class="crowding-badge ${neighborhood.crowdingLabel}">${neighborhood.crowdingLabel}</span></div><div class="card-title-row"><div><h3>${neighborhood.name}</h3><p class="district">${neighborhood.district}</p></div><div class="card-score"><small>NEXT SPOT</small><strong>${neighborhood.score}</strong></div></div><div class="change-line"><span>↑</span> ${getChangeLabel(neighborhood.changeScore)} <b>변화 ${neighborhood.changeScore}</b></div><p class="reason-title">왜 뜨는가?</p><ul class="signal-list">${neighborhood.signals.slice(0, 3).map((signal) => `<li>${signal}</li>`).join('')}</ul><div class="visit-meta"><span>현재 혼잡도 <b>${neighborhood.crowdingLabel}</b></span><span>추천 <b>${neighborhood.recommendedVisitTime}</b></span></div><span class="card-detail-link">상세 신호 보기 →</span></article>`).join('');

document.querySelector('#seoul-map').innerHTML = neighborhoods.map((neighborhood) => {
  const position = mapPositions[neighborhood.id];
  const featured = neighborhood.rank <= 5 ? 'featured' : '';
  return `<button class="map-marker ${featured}" data-neighborhood-id="${neighborhood.id}" style="--x:${position.x}%; --y:${position.y}%" type="button" aria-label="${neighborhood.name}, NEXT SPOT ${neighborhood.score}"><span class="marker-pulse"></span><span class="marker-score">${neighborhood.score}</span><span class="marker-label">${neighborhood.name}<small>↑ ${neighborhood.changeScore}</small></span></button>`;
}).join('');

const situations = ['데이트', '카페', '산책', '친구와 놀기', '조용한 동네', '새로운 곳 발견'];
const filterContainer = document.querySelector('#situation-filters');
const recommendationGrid = document.querySelector('#recommendation-grid');
const recommendationCopy = document.querySelector('#recommendation-copy');
let activeSituation = '새로운 곳 발견';

const situationCopy = (situation) => `${situation}에 어울리는, 아직 과밀하지 않은 다음 동네 후보입니다.`;

const renderSituationRecommendations = () => {
  filterContainer.innerHTML = situations.map((situation) => `<button class="situation-filter ${situation === activeSituation ? 'active' : ''}" type="button" data-situation="${situation}">${situation}</button>`).join('');
  recommendationCopy.textContent = situationCopy(activeSituation);
  const recommendations = getSituationRecommendations(activeSituation);
  recommendationGrid.innerHTML = recommendations.length ? recommendations.map((neighborhood, index) => `
    <article class="recommendation-card" data-neighborhood-id="${neighborhood.id}" tabindex="0" role="button" aria-label="${neighborhood.name} 상세 보기"><div class="recommendation-top"><span>추천 ${index + 1}</span><span class="crowding-badge ${neighborhood.crowdingLabel}">${neighborhood.crowdingLabel}</span></div><div class="recommendation-name"><div><h3>${neighborhood.name}</h3><p>${neighborhood.district}</p></div><strong><small>NEXT SPOT</small>${neighborhood.score}</strong></div><p class="recommendation-reason">${neighborhood.signals[0]}</p><div class="course"><span>MOCK 산책 코스</span><ol>${neighborhood.experiences.course.map((place) => `<li>${place}</li>`).join('')}</ol></div><div class="recommendation-bottom"><span>현재 혼잡도 <b>${neighborhood.crowdingLabel}</b></span><span>${neighborhood.recommendedVisitTime}</span></div></article>`).join('')
  : `<div class="empty-state"><strong>아직 맞는 후보를 찾지 못했어요.</strong><p>다른 상황을 선택해 새로운 동네를 탐색해 보세요.</p></div>`;
  filterContainer.querySelectorAll('[data-situation]').forEach((button) => button.addEventListener('click', () => { activeSituation = button.dataset.situation; renderSituationRecommendations(); }));
  bindDetailTriggers();
};

const dialog = document.querySelector('#detail-dialog');
const detailContent = document.querySelector('#detail-content');

const renderBarChart = (series) => {
  const max = Math.max(...series.map((item) => item.value));
  return `<div class="trend-chart">${series.map((item) => `<div class="trend-column"><span class="trend-value">${item.value}</span><span class="trend-bar" style="height:${Math.max(16, Math.round((item.value / max) * 100))}%"></span><small>${item.month}</small></div>`).join('')}</div>`;
};

const openDetail = (id) => {
  const neighborhood = neighborhoods.find((item) => item.id === id);
  if (!neighborhood) return;
  const { detail } = neighborhood;
  const housing = seoulHousingSignals[neighborhood.district];
  const businessActivity = seoulBusinessSignals[neighborhood.district];
  const externalStats = housing || businessActivity !== undefined;
  detailContent.innerHTML = `
    <button class="dialog-close" type="button" aria-label="상세 패널 닫기">×</button>
    <div class="detail-top"><div><p class="eyebrow">NEIGHBORHOOD SIGNAL DETAIL</p><h2 id="detail-title">${neighborhood.name}</h2><p>${neighborhood.district} · 기준월 ${neighborhood.referenceMonth} · <b>개발용 mock 분석</b></p></div><div class="detail-score"><span>NEXT SPOT SCORE</span><strong>${neighborhood.score}</strong><small>설명형 휴리스틱</small></div></div>
    <section class="detail-status"><div><span>현재 상태</span><strong>${getChangeLabel(neighborhood.changeScore)} · 혼잡도 ${neighborhood.crowdingLabel}</strong></div><p>현재 인기만 높은 곳보다, 최근 변화가 빠르고 방문 여유가 남은 후보를 찾습니다.</p></section>
    <section class="detail-section"><div class="detail-heading"><div><p class="eyebrow">CHANGE SIGNALS</p><h3>왜 앞으로 뜰 것으로 보나요?</h3></div><span class="mock-chip">개발용 mock + 서울시 외부 통계</span></div><div class="signal-card-grid">${detail.signalCards.map((signal) => `<article class="detail-signal-card ${signal.tone}"><span>${signal.label}</span><strong>${signal.value}</strong><small>${signal.note}</small></article>`).join('')}</div></section>
    <section class="detail-section trend-section"><div class="detail-heading"><div><p class="eyebrow">3-MONTH MOMENTUM</p><h3>최근 3개월 변화</h3></div><span>변화 신호 지수</span></div>${renderBarChart(detail.monthlyMomentum)}<p class="chart-note">※ 5~7월 추이는 현재 mock 데이터의 비교값을 기반으로 만든 개발용 시각화입니다.</p></section>
    <section class="detail-section transparent-section"><div class="detail-heading"><div><p class="eyebrow">OPEN EVIDENCE</p><h3>AI가 아니라 데이터로 보는 이 동네의 변화</h3></div></div><div class="evidence-list"><div><span>신규 인터넷 설치 신호</span><b>${detail.signalCards[0].value}</b></div><div><span>신규 점포 순증</span><b>${detail.signalCards[2].value}</b></div><div><span>생활인구 변화</span><b>${detail.signalCards[3].value}</b></div><div><span>문화공간 변화</span><b>${detail.signalCards[4].value}</b></div><div><span>현재 혼잡도</span><b>${neighborhood.crowdingScore}/100</b></div></div><p class="evidence-copy">NEXT SPOT은 머신러닝 예측이 아닙니다. 인터넷 설치·이동·상권·생활인구·문화공간·혼잡도 신호를 0~100으로 정규화해, 고정 가중치로 계산한 MVP용 휴리스틱입니다.</p></section>
    <section class="detail-section external-data-section"><div class="detail-heading"><div><p class="eyebrow">SEOUL OPEN DATA</p><h3>서울시 통계로 확인한 외부 신호</h3></div><span class="source-chip">서울부동산정보광장</span></div><div class="external-data-grid"><article><span>민간 미분양</span><strong>${housing ? `${housing.privateUnsoldUnits}호` : '자료 없음'}</strong><small>기준일 ${housing?.referenceDate ?? '2026-06-30'}</small></article><article><span>상업·업무용 거래 활동</span><strong>${businessActivity !== undefined ? `${businessActivity}건` : '자료 없음'}</strong><small>${SEOUL_BUSINESS_SIGNAL_META.referencePeriod} · ${SEOUL_BUSINESS_SIGNAL_META.unit}</small></article></div><p class="evidence-copy">이 값은 지역 변화를 해석하기 위한 외부 참고 통계입니다. NEXT SPOT 점수를 단독으로 결정하지 않으며, 실제 미래 상권이나 거래량을 보장하지 않습니다.</p></section>
    <section class="visit-recommendation"><div><span>현재 혼잡도</span><strong>${neighborhood.crowdingLabel} · ${neighborhood.crowdingScore}/100</strong></div><div><span>추천 방문 시간</span><strong>${neighborhood.recommendedVisitTime}</strong></div><div><span>추천 이유</span><strong>${neighborhood.signals[0]}</strong></div></section>
    <p class="uncertainty-note">예측에는 불확실성이 있습니다. 현재 표시된 정보는 실제 데이터가 아닌 화면·분석 로직 검증용 mock 데이터입니다.</p>`;
  detailContent.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.showModal();
};

const bindDetailTriggers = () => document.querySelectorAll('[data-neighborhood-id]').forEach((element) => {
  if (element.dataset.detailBound) return;
  element.dataset.detailBound = 'true';
  element.addEventListener('click', () => openDetail(element.dataset.neighborhoodId));
  element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openDetail(element.dataset.neighborhoodId); } });
});

const chatHistory = document.querySelector('#chat-history');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const searchState = document.querySelector('#search-state');
const searchResultList = document.querySelector('#search-result-list');
const miniMap = document.querySelector('#mini-result-map');
const runKeywordSearch = (keyword) => {
  chatHistory.insertAdjacentHTML('beforeend', `<div class="chat-message user"><p>${keyword}</p></div><div class="chat-message assistant loading-message"><span class="chat-avatar">N</span><p><span class="typing-dots"><i></i><i></i><i></i></span> 변화 신호를 검색하고 있어요…</p></div>`);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  searchState.classList.add('is-searching'); searchState.innerHTML = '<span class="search-dot"></span><span>인구·상권·생활인구 신호를 분석 중입니다</span>';
  searchResultList.innerHTML = '<div class="result-skeleton"></div><div class="result-skeleton"></div>';
  setTimeout(() => {
    const results = getSituationRecommendations(keyword.includes('데이트') ? '데이트' : keyword.includes('카페') ? '카페' : keyword.includes('산책') ? '산책' : '새로운 곳 발견').slice(0, 3);
    document.querySelector('.loading-message')?.remove();
    chatHistory.insertAdjacentHTML('beforeend', `<div class="chat-message assistant"><span class="chat-avatar">N</span><p><b>${results[0]?.name || '연남동'}</b>처럼 아직 과밀하지 않으면서 변화가 빠른 동네를 찾았어요.</p></div>`);
    searchState.classList.remove('is-searching'); searchState.innerHTML = '<span class="search-dot success"></span><span>검색 완료 · 변화 신호 기반 추천</span>';
    miniMap.innerHTML = '<svg class="mini-map-svg" viewBox="0 0 600 300" role="img" aria-label="서울 변화 신호 지도"><rect width="600" height="300" fill="#eef2f5"/><path d="M120 72 L210 42 L320 58 L410 38 L505 82 L530 145 L485 188 L510 238 L390 270 L275 245 L170 272 L78 218 L105 160 L65 118 Z" fill="#e3e8ec" stroke="#cbd3da"/><path d="M95 166 C155 145 205 155 260 130 S360 125 415 102 S485 100 530 82" fill="none" stroke="#8cc8f5" stroke-width="18" stroke-linecap="round"/><path d="M95 166 C155 145 205 155 260 130 S360 125 415 102 S485 100 530 82" fill="none" stroke="#b9def7" stroke-width="3" stroke-linecap="round"/></svg><div class="mini-map-label">서울 변화 신호 지도</div>' + results.map((n, i) => `<button class="mini-marker" data-neighborhood-id="${n.id}" style="left:${25 + i * 25}%;top:${35 + (i % 2) * 23}%"><b>${n.score}</b><span>${n.name}</span></button>`).join('');
    searchResultList.innerHTML = results.map(n => `<article class="search-result" data-neighborhood-id="${n.id}"><div><b>${n.name}</b><span>${n.signals[0]}</span></div><strong>${n.score}<small>NEXT SPOT</small></strong></article>`).join('');
    bindDetailTriggers(); chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 1100);
};
chatForm.addEventListener('submit', (event) => { event.preventDefault(); const keyword = chatInput.value.trim(); if (!keyword) return; chatInput.value = ''; runKeywordSearch(keyword); });
document.querySelectorAll('.prompt-chips button').forEach((button) => button.addEventListener('click', () => runKeywordSearch(button.textContent)));

renderSituationRecommendations();
bindDetailTriggers();

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
