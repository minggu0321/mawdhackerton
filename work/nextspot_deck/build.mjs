import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const outDir = 'outputs';
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { bg:'#F7F8F4', ink:'#18231D', forest:'#1C4B36', green:'#57925B', lime:'#DCECC9', orange:'#E99228', muted:'#637168', white:'#FFFFFF' };
function box(slide, text, x,y,w,h, size, color=C.ink, bold=false){ const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}}); s.text=text; s.text.style={fontSize:size,color,bold}; return s; }
function rect(slide,x,y,w,h,fill,rad='rounded-2xl'){ return slide.shapes.add({geometry:'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill,width:0},borderRadius:rad}); }
function base(title, kicker){ const s=deck.slides.add(); s.background.fill=C.bg; box(s,kicker,72,46,500,20,14,C.green,true); box(s,title,72,78,1100,70,38,C.ink,true); return s; }
function footer(s,n){ box(s,`NEXT SPOT · MAWD Challenge MVP · ${n}`,72,676,700,18,11,C.muted,false); }

let s=deck.slides.add(); s.background.fill=C.forest; box(s,'NEXT SPOT',80,86,500,40,20,C.lime,true); box(s,'“서울은 너무 붐비고…\n새로운 곳은 어디 없을까?”',80,170,950,150,52,C.white,true); box(s,'퇴근 후 혼자 쉬고 싶은 날, 주말에 조용한 데이트를 하고 싶은 날\n우리는 이미 유명해진 핫플 말고 아직 과밀하지 않은 동네를 찾습니다.',84,370,900,70,22,'#C9DDCC'); box(s,'그 질문에서 NEXT SPOT이 시작됐습니다.',84,570,700,30,18,C.lime,true);

s=base('사용자의 진짜 질문은 “어디가 유명해?”가 아니라 “어디가 곧 좋아질까?”입니다.','01 · USER SCENARIO'); box(s,'퇴근 후, 이미 붐비는 성수·연남 대신 조용하지만 분위기 있는 동네를 찾는다.',72,190,1080,50,24,C.ink); const qs=[['상황','사람은 많고, 대기는 싫다'],['기존 행동','인스타그램·지도·AI에 검색한다'],['남은 문제','결과는 이미 유명한 장소 중심이다']]; qs.forEach((q,i)=>{const x=72+i*385;rect(s,x,290,340,190,i===1?C.forest:'#EAF1E5');box(s,q[0],x+24,320,260,24,18,i===1?C.lime:C.muted,true);box(s,q[1],x+24,375,285,55,23,i===1?C.white:C.ink,true)}); footer(s,2);

s=base('키워드를 입력하면, 지도와 근거가 함께 나옵니다.','02 · EXPERIENCE'); rect(s,72,180,350,430,C.white); box(s,'어떤 동네를 찾고 있나요?',98,215,280,35,22,C.ink,true); box(s,'주말에 조용한 데이트',98,330,250,46,18,C.white,true); rect(s,94,320,270,64,C.forest); box(s,'주말에 조용한 데이트',112,340,220,22,16,C.white); box(s,'변화 신호를 검색하고 있어요…',98,430,270,35,16,C.muted); rect(s,470,180,670,330,'#E4EEDB'); box(s,'서울 변화 신호 지도',500,210,300,26,18,'#496046',true); for (const [x,y,v] of [[650,320,'87'],[820,390,'84'],[950,300,'81']]) { const c=s.shapes.add({geometry:'ellipse',position:{left:x,top:y,width:58,height:58},fill:C.orange,line:{style:'solid',fill:C.white,width:2}}); box(s,v,x+16,y+18,30,20,16,C.white,true); } box(s,'추천 리스트 · 연남동 · 망원동 · 문래동',500,550,600,28,18,C.ink,true); footer(s,3);

s=base('NEXT SPOT 점수는 예측값이 아니라, 설명 가능한 신호의 조합입니다.','03 · DATA LOGIC'); const cols=[['변화 점수','신규 설치 · 인구/세대\n입주 · 점포 · 문화공간 · 생활인구','50%'],['발견 점수','업종 다양성 · 문화 다양성\n혼잡도 페널티','30%'],['방문 적합 점수','현재 혼잡도 · 생활인구\n카페·식사·문화 연결성','20%']]; cols.forEach((c,i)=>{const x=72+i*385; rect(s,x,210,340,250,i===0?C.forest:'#EAF1E5'); box(s,c[0],x+24,240,280,30,22,i===0?C.white:C.ink,true); box(s,c[1],x+24,305,285,70,18,i===0?'#D8E9D1':C.muted); box(s,c[2],x+24,405,100,30,25,i===0?C.lime:C.green,true);}); box(s,'모든 입력값은 0~100으로 정규화하며, 각 지역의 기여 요인을 함께 보여줍니다.',72,530,1000,40,20,C.ink); footer(s,4);

s=base('NEXT SPOT의 핵심은 “왜 추천했는가”를 보여주는 것입니다.','04 · TRANSPARENT EVIDENCE'); rect(s,72,190,500,370,C.forest); box(s,'연남동',108,230,300,42,34,C.white,true); box(s,'NEXT SPOT SCORE',108,300,250,20,14,C.lime,true); box(s,'87',108,330,150,80,64,C.white,true); box(s,'현재 혼잡도 62/100 · 보통',108,450,330,26,17,'#D8E9D1'); rect(s,630,190,510,370,C.white); box(s,'왜 뜨는가?',662,225,250,32,24,C.ink,true); box(s,'+ 신규 점포 32%\n+ 생활인구 18%\n+ 문화공간 3개\n+ 아직 과밀하지 않음',662,300,360,150,24,C.green,true); footer(s,5);

s=base('처음부터 구독을 팔기보다, 의사결정에 필요한 리포트부터 검증합니다.','05 · BUSINESS MODEL'); const rows=[['지금','개인 사용자 무료','키워드 탐색·지도·상세 근거'],['초기 매출 실험','1회성 출점 후보지 리포트','브랜드에 맞는 다음 후보 5곳'],['장기 확장','프랜차이즈·공공기관','입지 분석·지역 변화 모니터링']]; rows.forEach((r,i)=>{const y=190+i*115; rect(s,72,y,1060,86,i===0?'#EAF1E5':C.white); box(s,r[0],100,y+22,180,24,18,C.green,true); box(s,r[1],330,y+19,300,28,21,C.ink,true); box(s,r[2],680,y+22,390,24,17,C.muted);}); box(s,'가격과 구매 가능성은 모두 검증이 필요한 가설입니다.',72,560,900,30,18,C.orange,true); footer(s,6);

s=base('5시간 안에 검증할 것은 “예측의 정확도”보다 “발견 경험의 가치”입니다.','06 · MVP & NEXT STEP'); const steps=['1. 키워드 입력','2. 지도·추천 결과','3. 상세 근거 확인','4. 저장·공유']; steps.forEach((t,i)=>{const x=72+i*275; rect(s,x,220,220,130,i===0?C.forest:'#EAF1E5'); box(s,t,x+20,260,180,28,20,i===0?C.white:C.ink,true); box(s,['검색 완료율','카드 클릭률','상세 진입률','저장·공유율'][i],x+20,310,180,20,15,i===0?'#D8E9D1':C.muted);}); box(s,'NEXT SPOT은 먼저 개인의 다음 동네 발견을 무료로 해결하고, 이후 출점 의사결정 데이터로 확장합니다.',72,500,1040,60,24,C.ink,true); footer(s,7);

await fs.mkdir(outDir,{recursive:true}); const pptx=await PresentationFile.exportPptx(deck); await pptx.save(`${outDir}/next_spot_pitch_pain_solution.pptx`);
for (const [i,sl] of deck.slides.items.entries()){ const png=await deck.export({slide:sl,format:'png',scale:1}); await fs.writeFile(`work/nextspot_deck/slide-${i+1}.png`,new Uint8Array(await png.arrayBuffer())); }
