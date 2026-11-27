/* 💬 단톡방 공통 (dantok.kr) — 서버(가림 프로젝트) 연결 · 익명 로그인 · 도우미.
   전화번호 · 가입 없이 휴대폰마다 익명 로그인 하나를 만들어 씁니다(공기계도 와이파이만 있으면 됨).
   2026-11-17 1단계 문자방. */
(function(){
  var URL0 = 'https://qmwaraittiurkynszjts.supabase.co';
  var KEY0 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2FyYWl0dGl1cmt5bnN6anRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3ODQ5OTUsImV4cCI6MjEwMjM2MDk5NX0.9Qr2vFzDCSKS54N6C5QN44BvCzIPTMQyVz7nX3GqT9Y';
  var sb = window.supabase.createClient(URL0, KEY0, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'dantok-auth' } });
  var ERR = {
    login: '연결을 다시 시도해 주세요.', no_name: '방 이름을 적어 주세요.', no_nick: '별명을 적어 주세요.', too_many_rooms: '한 사람이 방을 5개까지 만들 수 있어요.',
    bad_date: '끝나는 날은 오늘 이후로 골라 주세요.', no_room: '이 코드의 방이 없어요. 코드를 다시 확인해 주세요.', kicked: '방장이 내보낸 방이라 다시 들어갈 수 없어요.',
    blocked: '운영 규칙 때문에 멈춘 방이에요.', full: '방이 꽉 찼어요. 방장에게 말씀해 주세요.', not_member: '이 방 사람이 아니에요.',
    expired: '이용 기간이 끝났어요. 방장이 연장하면 다시 쓸 수 있어요.', closed: '닫힌 방이에요.', empty: '글을 적어 주세요.', quota: '방 저장 공간이 다 찼어요. 방장에게 말씀해 주세요.',
    too_big: '파일이 너무 커요(100MB까지).', path: '올리기에 실패했어요.', slow: '너무 빨리 보내고 있어요. 잠시 뒤에 보내 주세요.', not_owner: '방장만 할 수 있어요.',
    not_mine: '내 글만 지울 수 있어요.', away_days: '자리비움 기간은 7일에서 365일 사이로 정해 주세요.', claimed: '이미 다른 분이 방장 맡기를 신청했어요.', owner_here: '방장이 아직 자리를 비운 지 오래되지 않았어요.', bad_avatar: '이 사진은 쓸 수 없어요.', self: '나 자신은 내보낼 수 없어요.'
  };
  try { setTimeout(function(){ sb.rpc('weave_log_access', { p_app: 'dantok', p_dev: (function(){ try { var k = 'weave_dev', v = localStorage.getItem(k); if (!v) { v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('d' + Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem(k, v); } return v; } catch (e) { return null; } })() }).then(function(){}, function(){}); }, 2500); } catch (e) {}   /* 🛡 접속 기록(3개월 보관) — weave_safety.sql */
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var tt; function toast(m){ var t = $('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('on'); }, 2600); }
  function errText(e){ if (!e) return '잠시 뒤에 다시 해 주세요.'; if (typeof e === 'string') return ERR[e] || e; var m = String(e.message || e); if (e.hint === 'weave_limit') return m; if (/Failed to fetch|NetworkError|network/i.test(m)) return '인터넷 연결을 확인해 주세요.'; return '잠시 뒤에 다시 해 주세요.'; }
  var readyP = null;
  function ready(){
    if (readyP) return readyP;
    readyP = (async function(){
      var s = (await sb.auth.getSession()).data.session;
      if (s && s.user) return s.user;
      var r = await sb.auth.signInAnonymously();
      if (r.error) { readyP = null; throw r.error; }
      return r.data.user;
    })();
    return readyP;
  }
  async function rpc(fn, args){ await ready(); var r = await sb.rpc(fn, args || {}); if (r.error) throw r.error; return r.data; }
  function initial(n){ n = String(n || '?').trim(); return n ? Array.from(n)[0] : '?'; }
  function av(nick, color, size, avatar){
    var st = size ? 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .42) + 'px' : '';
    if (avatar && avatar.indexOf('p:') === 0) return '<img class="av" alt="" data-path="' + esc(avatar.slice(2)) + '" style="' + st + '">';
    if (avatar && avatar.indexOf('e:') === 0) return '<span class="av emo" style="' + st + (size ? ';font-size:' + Math.round(size * .55) + 'px' : '') + '">' + esc(avatar.slice(2)) + '</span>';
    return '<span class="av" style="background:var(--c' + ((color | 0) % 8) + ');' + st + '">' + esc(initial(nick)) + '</span>';
  }
  function when(t){
    var d = new Date(t), n = new Date(), hm = (d.getHours() < 12 ? '오전 ' : '오후 ') + ((d.getHours() % 12) || 12) + ':' + String(d.getMinutes()).padStart(2, '0');
    if (d.toDateString() === n.toDateString()) return hm;
    var y = new Date(n); y.setDate(n.getDate() - 1); if (d.toDateString() === y.toDateString()) return '어제';
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }
  function hm(t){ var d = new Date(t); return (d.getHours() < 12 ? '오전 ' : '오후 ') + ((d.getHours() % 12) || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function day(t){ var d = new Date(t); return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' + '일월화수목금토'.charAt(d.getDay()) + '요일'; }
  function size(b){ b = +b || 0; if (!b) return '0MB'; return b >= 1073741824 ? (b / 1073741824).toFixed(1) + 'GB' : b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB'; }
  function sheet(html){
    var bg = document.createElement('div'); bg.className = 'sheet-bg';
    bg.innerHTML = '<div class="sheet" role="dialog">' + html + '</div>';
    bg.addEventListener('click', function(e){ if (e.target === bg) close(); });
    function close(){ bg.remove(); }
    document.body.appendChild(bg); return { el: bg.firstChild, close: close };
  }
  /* 주야간 바꾸기 단추 (고른 값은 이 휴대폰에만 기억) */
  function themeBtn(where){
    var R = document.documentElement;
    function dark(){ var t = R.getAttribute('data-theme'); return t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches); }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'iconbtn'; b.id = 'dtTheme';
    function paint(){ var d = dark(); b.textContent = d ? '☀️' : '🌙'; b.title = b.ariaLabel = d ? '주간 모드로' : '야간 모드로'; }
    b.onclick = function(){ var t = dark() ? 'light' : 'dark'; R.setAttribute('data-theme', t); try { localStorage.setItem('dt_theme', t); } catch (e) {} paint(); };
    paint(); if (where) where.appendChild(b); return b;
  }
  async function copy(text){
    try { await navigator.clipboard.writeText(text); toast('복사했어요.'); }
    catch (e) { var i = document.createElement('textarea'); i.value = text; document.body.appendChild(i); i.select(); try { document.execCommand('copy'); toast('복사했어요.'); } catch (x) { toast(text); } i.remove(); }
  }
  async function share(title, text, url){
    try { if (navigator.share) { await navigator.share({ title: title, text: text, url: url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    copy(text + ' ' + url);
  }
  /* 🎵 같이 듣기: 회사가 고른 곡은 부름 서버(gallery_music · 공개 보관함 alias-music)에 있습니다. 읽기만 합니다. */
  var BU_URL = 'https://azredlrnvsssfjytaotb.supabase.co';
  var BU_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cmVkbHJudnNzc2ZqeXRhb3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDg1MjgsImV4cCI6MjEwMzk4NDUyOH0.2gTxzr54vRSZzFnyhLSd1Imv3OnwRBQs925CYeXdonI';
  var bu = null;
  async function songs(){
    if (!bu) bu = window.supabase.createClient(BU_URL, BU_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'dantok-music' } });
    var r = await bu.from('gallery_music').select('id, title, artist, path, mood, seconds').eq('is_active', true).order('sort').order('title');
    return r.data || [];
  }
  function songUrl(path){ return BU_URL + '/storage/v1/object/public/alias-music/' + String(path).split('/').map(encodeURIComponent).join('/'); }
  /* 📲 휴대폰 바꿀 때: 지금의 이름 없는 계정에 아이디 · 비밀번호를 붙여 둡니다(전화번호 · 이메일 필요 없음).
     새 휴대폰에서 같은 아이디로 들어오면 내 방 · 갤러리 · 이용권이 그대로 따라옵니다. */
  var KEEP_DOMAIN = '@dantok.guest.aliascall.internal';
  function idOk(v){ return /^[a-z0-9_]{4,20}$/.test(v); }
  async function keepSheet(after){
    var u = await ready(), anon = u.is_anonymous !== false && !u.email;
    if (!anon) {
      var id = String(u.email || '').split('@')[0];
      sheet('<h3>📲 휴대폰 바꿀 때</h3><p>이 휴대폰은 아이디 <b>' + esc(id) + '</b>로 지켜지고 있어요.</p><p class="hint">새 휴대폰에서 단톡방 첫 화면 → 「다른 휴대폰에서 쓰던 방 가져오기」에 이 아이디와 비밀번호를 넣으면 내 방 · 갤러리 · 이용권이 그대로 와요.</p>');
      return;
    }
    var s = sheet('<h3>📲 휴대폰 바꿀 때 (내 방 지키기)</h3><p class="hint">지금은 이 휴대폰에만 내 방이 기억돼요. 아이디와 비밀번호를 정해 두면 휴대폰을 바꾸거나 앱을 지웠다 깔아도 내 방 · 갤러리 · 산 이용권을 그대로 가져와요. 전화번호 · 이메일은 필요 없어요.</p>' +
      '<label>아이디 (영문 소문자 · 숫자 4~20자)<input id="kId" maxlength="20" autocapitalize="none" autocomplete="username" placeholder="예) mom1958"></label>' +
      '<label>비밀번호 (6자 이상)<input id="kPw" type="password" maxlength="40" autocomplete="new-password"></label>' +
      '<p class="err" id="kE" hidden></p><button class="btn sun" type="button" id="kGo">정해 두기</button><p class="hint">⚠ 아이디 · 비밀번호를 잊으면 찾아 드릴 수 없어요. 꼭 적어 두세요.</p>');
    $('kGo').onclick = async function(){
      var id = $('kId').value.trim().toLowerCase(), pw = $('kPw').value, b = this;
      var err = function(m){ $('kE').textContent = m; $('kE').hidden = false; b.disabled = false; };
      if (!idOk(id)) return err('아이디는 영문 소문자 · 숫자 4~20자로 정해 주세요.');
      if (pw.length < 6) return err('비밀번호는 6자 이상으로 정해 주세요.');
      b.disabled = true;
      var r = await sb.auth.updateUser({ email: id + KEEP_DOMAIN, password: pw });
      if (r.error) return err(/already|registered|exists/i.test(r.error.message) ? '이미 있는 아이디예요. 다른 아이디로 정해 주세요.' : '정하지 못했어요. 잠시 뒤에 다시 해 주세요.');
      var u2 = (await sb.auth.getUser()).data.user;
      if (!u2 || !u2.email) return err('정하지 못했어요. 잠시 뒤에 다시 해 주세요.');
      s.close(); toast('아이디 ' + id + '로 지켜 두었어요. 꼭 적어 두세요.'); if (after) after();
    };
  }
  /* 새 휴대폰에서: 아이디 · 비밀번호로 내 방 가져오기 */
  function restoreSheet(done){
    var s = sheet('<h3>📲 다른 휴대폰에서 쓰던 방 가져오기</h3><p class="hint">예전 휴대폰에서 「휴대폰 바꿀 때」로 정해 둔 아이디와 비밀번호를 넣어 주세요.</p>' +
      '<label>아이디<input id="rId" maxlength="20" autocapitalize="none" autocomplete="username"></label><label>비밀번호<input id="rPw" type="password" maxlength="40" autocomplete="current-password"></label>' +
      '<p class="err" id="rE" hidden></p><button class="btn" type="button" id="rGo">가져오기</button><p class="hint">⚠ 이 휴대폰에서 아이디 없이 만든 방이 있으면 그 방은 이 휴대폰에서 보이지 않게 돼요.</p>');
    $('rGo').onclick = async function(){
      var id = $('rId').value.trim().toLowerCase(), b = this; b.disabled = true;
      var r = await sb.auth.signInWithPassword({ email: id + KEEP_DOMAIN, password: $('rPw').value });
      if (r.error) { $('rE').textContent = '아이디나 비밀번호가 맞지 않아요.'; $('rE').hidden = false; b.disabled = false; return; }
      readyP = null; s.close(); toast('가져왔어요!'); if (done) done();
    };
  }
  /* 📲 아직 아이디를 정하지 않은 사람에게 미리 알리는 띠 (나중에 → 7일 동안 숨김) */
  async function keepBanner(box, force){
    if (!box) return;
    try {
      var u = await ready();
      if (u.email) { box.hidden = true; return; }
      var later = 0; try { later = +localStorage.getItem('dt_keep_later') || 0; } catch (e) {}
      if (!force && Date.now() - later < 7 * 864e5) { box.hidden = true; return; }
      box.innerHTML = '<div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:24px">📲</span><div style="flex:1;min-width:0"><b>휴대폰을 바꿀 예정이세요?</b>' +
        '<p class="hint" style="margin:2px 0 0">지금은 내 방이 이 휴대폰에만 기억돼요. 아이디 · 비밀번호를 정해 두면 휴대폰을 바꾸거나 앱을 지워도 내 방 · 갤러리 · 산 이용권이 그대로 와요.</p></div></div>' +
        '<div class="row"><button class="btn sun" type="button" data-k="go" style="padding:11px">지금 정해 두기</button><button class="btn g" type="button" data-k="later" style="padding:11px">나중에</button></div>';
      box.hidden = false;
      box.querySelector('[data-k=go]').onclick = function(){ keepSheet(function(){ box.hidden = true; }); };
      box.querySelector('[data-k=later]').onclick = function(){ try { localStorage.setItem('dt_keep_later', String(Date.now())); } catch (e) {} box.hidden = true; };
    } catch (e) { box.hidden = true; }
  }
  /* 🔔 단톡방 앱 안에서만: 휴대폰 알림 주소를 서버(dt_push)에 맡깁니다. 웹에서는 아무것도 안 합니다.
     처음 한 번 허락을 묻고, 그 뒤로는 하루에 한 번 주소를 새로 맞춥니다. 알림을 누르면 그 방으로. */
  function isApp(){ try { return window.ALIAS_APP === 'dantok' || !!(window.AliasNative && AliasNative.appKind && AliasNative.appKind() === 'dantok'); } catch (e) { return false; } }
  function PN(){ try { return isApp() && window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() && Capacitor.Plugins && Capacitor.Plugins.PushNotifications; } catch (e) { return null; } }
  function pushToken(P){
    return new Promise(function(res, rej){
      var done = false, t = setTimeout(function(){ if (!done) { done = true; rej(new Error('timeout')); } }, 15000);
      P.addListener('registration', function(x){ if (!done) { done = true; clearTimeout(t); res(x.value); } });
      P.addListener('registrationError', function(e){ if (!done) { done = true; clearTimeout(t); rej(new Error(JSON.stringify(e))); } });
      P.register();
    });
  }
  async function pushSync(){
    var P = PN(); if (!P) return;
    var last = 0; try { last = +localStorage.getItem('dt_push_at') || 0; } catch (e) {}
    var capsNow = ''; try { if (window.AliasNative && typeof AliasNative.caps === 'function') capsNow = String(AliasNative.caps() || ''); } catch (e) {}
    var capsSaved = ''; try { capsSaved = localStorage.getItem('dt_push_caps') || ''; } catch (e) {}
    if (Date.now() - last < 86400e3 && capsNow === capsSaved) return;   // 🔴 2026-11-22 새 앱으로 바뀌면 바로 다시 적음
    await ready();
    var perm = await P.checkPermissions();
    if (perm.receive !== 'granted') { perm = await P.requestPermissions(); if (perm.receive !== 'granted') return; }
    var tk = await pushToken(P);
    /* 🔴 2026-11-22 — 새 앱이면(알림에서 바로 답장 qr1) 기기 종류에 붙여 적어 둡니다 */
    var caps = ''; try { if (window.AliasNative && typeof AliasNative.caps === 'function') caps = String(AliasNative.caps() || ''); } catch (e) {}
    var r = await sb.rpc('dt_push_set', { p_token: tk, p_platform: ((Capacitor.getPlatform && Capacitor.getPlatform()) || '') + (caps ? ':' + caps : '') });
    if (r.data && r.data.ok) { try { localStorage.setItem('dt_push_at', String(Date.now())); localStorage.setItem('dt_push_caps', caps); } catch (e) {} }
  }
  (function(){ var P = PN(); if (!P || window.__dtTap) return; window.__dtTap = true;
    P.addListener('pushNotificationActionPerformed', function(a){ var d = (a && a.notification && a.notification.data) || {}; if (d.url && /^room\.html\?r=[0-9a-f-]{36}$/.test(d.url)) location.href = d.url; });
    setTimeout(function(){ pushSync().catch(function(){}); }, 1500); })();
  window.DT = { sb: sb, URL0: URL0, $: $, esc: esc, toast: toast, errText: errText, ERR: ERR, ready: ready, rpc: rpc, av: av, initial: initial,
                when: when, hm: hm, day: day, size: size, sheet: sheet, themeBtn: themeBtn, copy: copy, share: share, SITE: 'https://dantok.kr/', songs: songs, songUrl: songUrl, keepSheet: keepSheet, restoreSheet: restoreSheet, keepBanner: keepBanner, isApp: isApp, pushSync: pushSync };
})();
