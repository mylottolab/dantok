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
    not_mine: '내 글만 지울 수 있어요.', bad_avatar: '이 사진은 쓸 수 없어요.', self: '나 자신은 내보낼 수 없어요.'
  };
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var tt; function toast(m){ var t = $('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('on'); }, 2600); }
  function errText(e){ if (!e) return '잠시 뒤에 다시 해 주세요.'; if (typeof e === 'string') return ERR[e] || e; var m = String(e.message || e); if (/Failed to fetch|NetworkError|network/i.test(m)) return '인터넷 연결을 확인해 주세요.'; return '잠시 뒤에 다시 해 주세요.'; }
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
  window.DT = { sb: sb, URL0: URL0, $: $, esc: esc, toast: toast, errText: errText, ERR: ERR, ready: ready, rpc: rpc, av: av, initial: initial,
                when: when, hm: hm, day: day, size: size, sheet: sheet, themeBtn: themeBtn, copy: copy, share: share, SITE: 'https://dantok.kr/', songs: songs, songUrl: songUrl };
})();
