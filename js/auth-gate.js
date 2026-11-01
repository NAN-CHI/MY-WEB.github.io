/* =========================================================================
   登录门禁：在 <head> 里同步执行，没有 Supabase 会话就立刻跳登录页
   ========================================================================= */
(function () {
  var SESSION = 'jq-auth-session';
  var LOGIN   = 'login.html';
  var ok = false;

  try {
    var s = JSON.parse(localStorage.getItem(SESSION) || 'null');
    if (s && s.access_token) ok = true;
  } catch (e) { ok = false; }

  if (ok) return;

  var here = location.pathname.split('/').pop() || 'index.html';
  if (here === LOGIN) return;

  location.replace(LOGIN + '?next=' + encodeURIComponent(here + (location.search || '')));
})();
