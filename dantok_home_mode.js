/* =====================================================================
   단톡방 첫 화면 고르기 (2026-11-22) — 🚪 방 문 새 첫 화면(home.html) 시안
   · 'classic' = 지금 첫 화면(index.html)   · 'new' = 새 첫 화면(home.html: 지금 할 일 · 방 문 · 처음 설정 2단계)
   · 모든 분을 한 번에 바꾸려면 아래 ALL 만 'new' 로, 되돌리려면 'classic' 으로 (앱 업데이트 필요 없음)
   · 이 폰만 시험: home.html?try=1 · 새 화면 아래 [예전 첫 화면으로] 로 원래대로
   ===================================================================== */
(function(){
  var ALL = 'new';   // 2026-11-22 개편 — 새 첫 화면(되돌리려면 'classic')   // ← 전체 전환 스위치: 'classic' | 'new'
  var m = ALL;
  try { var l = localStorage.getItem('dantok_home_mode'); if (l === 'new' || l === 'classic') m = l; } catch (e) {}
  window.DANTOK_HOME = m;
  window.DANTOK_HOME_ALL = ALL;
})();
