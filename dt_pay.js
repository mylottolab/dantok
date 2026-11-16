/* 💬 단톡방 결제 (dantok.kr) — 앱 안이면 구글 · 애플, 웹이면 이니시스 카드.
   상품 (자동 결제 없음): 방 1년 연장 · 방 저장 +10GB · 내 갤러리 5GB · 15GB
   결제가 끝나면 서버(dt_grant_paid)가 바로 넣고, 웹은 paid.html 로 돌아옵니다.
   2026-11-17 */
(function(){
  window.sb = DT.sb;   // aliascall_store.js 가 이 연결로 영수증을 보냅니다
  var P = DT.PLANS = {
    dantok_room_1y:  { price: '9,900원', name: '방 이용 1년 연장', who: 'room' },
    dantok_room_10g: { price: '7,900원', name: '방 저장 공간 +10GB · 1년', who: 'room' },
    dantok_gal_5g:   { price: '4,900원', name: '내 갤러리 5GB · 1년 (동영상 가능)', who: 'me' },
    dantok_gal_15g:  { price: '9,900원', name: '내 갤러리 15GB · 1년 (동영상 가능)', who: 'me' },
  };
  var BACK = 'dt_pay_back', onDone = null;
  function finish(r){
    r = r || {};
    if (r.ok) { DT.toast('결제가 끝났어요. 고맙습니다!'); if (onDone) onDone(r); return; }
    if (r.canceled) return DT.toast('결제를 취소했어요.');
    if (r.pending) return DT.toast('결제가 아직 끝나지 않았어요. 끝나면 자동으로 적용돼요.');
    var why = String(r.error || '');
    if (/[{}]|permission|HTTP|androidpublisher|token|apple/i.test(why)) why = '결제 확인이 늦어지고 있어요. 다시 결제하지 마시고 잠시 뒤 앱을 다시 열어 주세요.';
    DT.toast('결제를 마치지 못했어요. ' + why);
  }
  if (window.ACStore) ACStore.onDone = finish;   // 결제 도중 앱이 꺼졌다 켜져도 여기서 마무리
  DT.buy = async function(sku, target, done){
    onDone = done || null;
    if (window.ACStore && ACStore.oldApp && ACStore.oldApp()) return DT.toast('앱을 최신으로 업데이트한 뒤 다시 눌러 주세요.');
    await DT.ready();
    if (window.ACStore && ACStore.inApp()) { ACStore.onDone = finish; await ACStore.buy(sku, { usageKind: 'dantok', usageTargetId: target || null }); return; }
    if (!window.ACWeb) return DT.toast('결제 창을 열지 못했어요. 새로 고친 뒤 다시 눌러 주세요.');
    try { localStorage.setItem(BACK, location.href); } catch (e) {}
    await ACWeb.inicis(DT.sb, sku, { usageKind: 'dantok', usageTargetId: target || null }, { buyername: '단톡방 회원', buyertel: '', buyeremail: '' });
  };
  /* 상품 고르는 칸: 이름 · 값 · 무엇이 되는지 · 자동 결제 없음 · 이 휴대폰 계정에 붙음 */
  DT.planSheet = function(title, lead, skus, target, done){
    var s = DT.sheet('<h3>' + title + '</h3>' + (lead ? '<p class="hint">' + lead + '</p>' : '') +
      skus.map(function(k){ return '<button class="btn ' + (k === skus[0] ? 'sun' : 'g') + '" type="button" data-k="' + k + '" style="justify-content:space-between"><span>' + DT.esc(P[k].name) + '</span><span>' + P[k].price + '</span></button>'; }).join('') +
      '<p class="hint">자동 결제가 없어요. 기간이 끝나기 전에 원할 때 다시 사면 이어서 늘어나요. 이용권은 지금 이 휴대폰의 단톡방 계정에 붙어요(휴대폰을 바꾸기 전에 ☰ → 「휴대폰 바꿀 때」를 해 두세요).</p>');
    s.el.querySelectorAll('[data-k]').forEach(function(b){ b.onclick = function(){ s.close(); DT.buy(b.getAttribute('data-k'), target, done); }; });
  };
})();
