/* =========================================================================
   登录页逻辑
   -------------------------------------------------------------------------
   两种模式（由 js/auth.js 的 AUTH_MODE 决定）：
     local    → 只要口令，不联网
     supabase → 邮箱 + 密码
   ========================================================================= */
(function () {
  'use strict';

  var form   = document.getElementById('authForm');
  var email  = document.getElementById('authEmail');
  var pass   = document.getElementById('authPass');
  var error  = document.getElementById('authError');
  var submit = document.getElementById('authSubmit');
  var lede   = document.getElementById('authLede');
  var note   = document.getElementById('authNote');
  var emailField = document.getElementById('authEmailField');
  var passLabel  = document.getElementById('authPassLabel');

  if (!form || !window.JQAuth) return;

  var mode = window.JQAuth.mode || 'supabase';

  /* ---------- 按模式调整界面 ---------- */
  if (mode === 'local') {
    if (emailField) emailField.style.display = 'none';
    if (passLabel) passLabel.textContent = '口令';
    if (lede) lede.textContent = '这个站点只对朋友开放，输入口令就能进。';
    if (note) note.innerHTML = '口令找站主要一个。<br />登录状态会在这台设备上保留 30 天。';
  }

  /* ---------- 已经登录过就直接进站 ---------- */
  if (window.JQAuth.isUnlocked && window.JQAuth.isUnlocked()) {
    location.replace(nextUrl());
    return;
  }

  /* ---------- 只允许跳回站内的 .html 页面，防止被拿来跳外站 ---------- */
  function nextUrl() {
    var m = /[?&]next=([^&]*)/.exec(location.search);
    if (!m) return 'index.html';
    var target = '';
    try { target = decodeURIComponent(m[1]); } catch (e) { return 'index.html'; }
    if (/^[A-Za-z0-9._\-\u4e00-\u9fa5]+\.html(\?[A-Za-z0-9._\-\u4e00-\u9fa5=&%]*)?$/.test(target)) return target;
    return 'index.html';
  }

  function show(message) {
    if (error) error.textContent = message || '';
  }

  function setBusy(busy) {
    if (!submit) return;
    submit.disabled = busy;
    var label = submit.querySelector('span:nth-child(2)');
    if (label) label.textContent = busy ? '登录中…' : '登录';
  }

  /* ---------- 口令模式 ---------- */
  function submitLocal(password) {
    setBusy(true);
    window.JQAuth.signInLocal(password)
      .then(function () {
        if (!window.JQAuth.isUnlocked()) {
          setBusy(false);
          show('登录成功，但浏览器没保存住状态。请允许本站使用本地存储（或退出无痕模式）后再试。');
          return;
        }
        location.replace(nextUrl());
      })
      .catch(function () {
        setBusy(false);
        show('口令不对。');
        if (pass) { pass.value = ''; pass.focus(); }
      });
  }

  /* ---------- 邮箱 + 密码模式 ---------- */
  function submitSupabase(address, password) {
    setBusy(true);
    window.JQAuth.signIn(address, password)
      .then(function () {
        if (!window.JQAuth.getSession()) {
          setBusy(false);
          show('登录成功了，但浏览器没保存住登录状态。请允许本站使用本地存储（或退出无痕模式）后再试。');
          return;
        }
        location.replace(nextUrl());
      })
      .catch(function (err) {
        setBusy(false);
        var msg = (err && err.message) || '登录失败，稍后再试。';

        if (/invalid login credentials|invalid_grant|invalid email or password/i.test(msg)) {
          msg = '邮箱或密码不对。';
        } else if (/email not confirmed/i.test(msg)) {
          msg = '这个邮箱还没验证，去收件箱点一下确认链接。';
        } else if (/rate limit|too many/i.test(msg)) {
          msg = '试的次数有点多，等几分钟再试。';
        } else if ((err && err.name === 'TypeError') || /fetch|network|failed to fetch/i.test(msg)) {
          msg = '连不上登录服务器（网络访问不了 supabase.co）。可在新标签打开 https://sptzzjkdlkpgjgganxuu.supabase.co/auth/v1/health 自查：打不开就是网络问题。';
        }

        if (window.console && console.warn) console.warn('[登录失败]', err);
        show(msg);
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    show('');

    var password = (pass && pass.value) || '';

    if (mode === 'local') {
      if (!password) { show('请输入口令。'); return; }
      submitLocal(password);
      return;
    }

    var address = (email && email.value || '').trim();
    if (!address || !password) {
      show('邮箱和密码都要填。');
      return;
    }
    submitSupabase(address, password);
  });

  /* 邮箱框回车 → 跳到密码框 */
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target === email && pass) {
      e.preventDefault();
      pass.focus();
    }
  });

  if (mode === 'local' && pass) pass.focus();
})();
