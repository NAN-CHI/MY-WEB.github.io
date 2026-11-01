/* =========================================================================
   登录门禁：在 <head> 里同步执行，没有登录状态就立刻跳登录页
   （放在 head 里、页面绘制之前跑，所以不会先闪一下内容）

   认两种凭证：
     · jq-local-unlock —— 本地口令通过后写入（不联网）
     · jq-auth-session —— Supabase 登录后写入
   ========================================================================= */
(function () {
  var SESSION = 'jq-auth-session';
  var LOCAL   = 'jq-local-unlock';
  var LOGIN   = 'login.html';
  var ok = false;

  try {
    var s = JSON.parse(localStorage.getItem(SESSION) || 'null');
    if (s && s.access_token) ok = true;

    var u = JSON.parse(localStorage.getItem(LOCAL) || 'null');
    if (u && u.until && u.until > Date.now()) ok = true;
  } catch (e) {
    ok = false;
  }

  if (ok) return;

  var here = location.pathname.split('/').pop() || 'index.html';
  if (here === LOGIN) return;

  location.replace(LOGIN + '?next=' + encodeURIComponent(here + (location.search || '')));
})();
