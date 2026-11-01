/* =========================================================================
   登录验证（Supabase Auth）—— 不依赖任何 CDN，直接调用 Auth REST API
   -------------------------------------------------------------------------
   ★ 配置区：换项目时只改这两行
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     登录方式
       'local'    = 本地口令，不联网（默认；supabase.co 在国内被墙）
       'supabase' = 邮箱 + 密码，需要能访问 supabase.co
     将来网络能通了，把下面这行改成 'supabase' 就切回去。
     --------------------------------------------------------------- */
  var AUTH_MODE = 'local';

  /* local 模式的口令：想改就改这一行，然后告诉朋友新口令 */
  var LOCAL_PASS = 'jq-friends';
  var LOCAL_DAYS = 30;                      /* 登录状态保留天数 */
  var LOCAL_KEY  = 'jq-local-unlock';

  /* supabase 模式用（网络能访问 supabase.co 时才用得到） */
  var SUPABASE_URL = 'https://sptzzjkdlkpgjgganxuu.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_WKdrq58Pq_R3c-HdL_Qcmg_Njglqd6S';

  var STORE   = 'jq-auth-session';   // localStorage 里的键名，auth-gate.js 也用这个
  var OPEN_PG = 'login.html';

  /* ---------- 本地会话 ---------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; }
  }
  function save(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {}
  }
  function wipe() {
    try { localStorage.removeItem(STORE); } catch (e) {}
  }
  function needsRefresh(s) {
    return !s || !s.expires_at || s.expires_at - Date.now() < 60000;
  }

  /* ---------- 请求封装 ---------- */
  function api(path, options) {
    var opts = options || {};
    var headers = opts.headers || {};
    headers['apikey'] = SUPABASE_KEY;
    headers['Content-Type'] = 'application/json';
    opts.headers = headers;

    return fetch(SUPABASE_URL + path, opts).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) {}
        if (!res.ok) {
          var msg = (data && (data.error_description || data.msg || data.error || data.message)) || ('HTTP ' + res.status);
          var err = new Error(msg);
          err.status = res.status;
          err.code = data && (data.error_code || data.error);
          throw err;
        }
        return data;
      });
    });
  }

  function toSession(d) {
    return {
      access_token:  d.access_token,
      refresh_token: d.refresh_token,
      expires_at:    Date.now() + (d.expires_in || 3600) * 1000,
      user:          d.user ? { id: d.user.id, email: d.user.email } : null
    };
  }

  /* ---------- 本地口令 ---------- */
  function localUnlocked() {
    try {
      var u = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null');
      return !!(u && u.until && u.until > Date.now());
    } catch (e) { return false; }
  }

  /* ---------- 对外接口 ---------- */
  var JQAuth = {
    mode: AUTH_MODE,
    getSession: read,

    isUnlocked: function () {
      return AUTH_MODE === 'local' ? localUnlocked() : !!(read() && read().access_token);
    },

    signInLocal: function (pass) {
      return new Promise(function (resolve, reject) {
        if ((pass || '') === LOCAL_PASS) {
          try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify({ until: Date.now() + LOCAL_DAYS * 86400000 }));
          } catch (e) {}
          resolve();
        } else {
          reject(new Error('口令不对'));
        }
      });
    },

    signIn: function (email, password) {
      return api('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
      }).then(function (d) {
        save(toSession(d));
        return d;
      });
    },

    refresh: function () {
      var s = read();
      if (!s || !s.refresh_token) return Promise.reject(new Error('no session'));
      return api('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: s.refresh_token })
      }).then(function (d) {
        var next = toSession(d);
        if (!next.user) next.user = s.user;
        save(next);
        return d;
      });
    },

    signOut: function () {
      var s = read();
      wipe();
      try { localStorage.removeItem(LOCAL_KEY); } catch (e) {}
      if (s && s.access_token) {
        try {
          api('/auth/v1/logout', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + s.access_token }
          }).catch(function () {});
        } catch (e) {}
      }
    },

    /* 当前页面的相对地址，用于登录后跳回来 */
    here: function () {
      var file = location.pathname.split('/').pop() || 'index.html';
      return file + (location.search || '');
    },

    goLogin: function () {
      location.replace(OPEN_PG + '?next=' + encodeURIComponent(JQAuth.here()));
    }
  };

  window.JQAuth = JQAuth;

  /* =====================================================================
     以下只在「受保护页面」执行（登录页在 <html> 上标了 data-auth-open）
     ===================================================================== */
  var isOpenPage = document.documentElement.hasAttribute('data-auth-open');

  if (!isOpenPage) {
    var session = read();

    if (AUTH_MODE === 'local') {
      if (!localUnlocked()) {
        JQAuth.goLogin();
        return;
      }
    } else if (!session || !session.access_token) {
      JQAuth.goLogin();
      return;
    }

    if (AUTH_MODE !== 'local' && needsRefresh(session)) {
      JQAuth.refresh().catch(function (err) {
        /* 只有「凭据失效」才强制重新登录；断网之类先放行，别把人踢出去 */
        if (err && (err.status === 400 || err.status === 401)) {
          JQAuth.signOut();
          JQAuth.goLogin();
        }
      });
    }

    /* 页脚加一个「退出登录」 */
    function addLogout() {
      var links = document.querySelector('.site-foot__links');
      if (!links || links.querySelector('[data-logout]')) return;
      var a = document.createElement('a');
      a.setAttribute('href', '#');
      a.setAttribute('data-logout', '');
      a.textContent = '退出登录';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        JQAuth.signOut();
        location.replace(OPEN_PG);
      });
      links.appendChild(a);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addLogout);
    } else {
      addLogout();
    }
  }
})();
