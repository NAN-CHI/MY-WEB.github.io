/* =========================================================================
   交互逻辑
   01 加载进度（小车 = 进度条）
   02 页面过场（幕布滑入 / 滑出）
   03 兜底（bfcache、无 JS）
   ========================================================================= */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var body = document.body;
  var veil = document.getElementById('veil');
  var reduced = false;

  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* ======================================================= 01 加载进度 */
  var loader = document.getElementById('loader');

  if (loader) {
    var track = document.getElementById('loaderTrack');
    var pctEl = document.getElementById('loaderPct');
    var tipEl = document.getElementById('loaderTip');

    /* 进度到不同阶段换一句文案 */
    var TIPS = [
      [0,  '正在检查车灯'],
      [26, '正在加满油箱'],
      [52, '正在播放驾驶歌单'],
      [76, '前方道路畅通'],
      [94, '准备出发']
    ];

    /* 同一个会话里第二次打开就不再等那么久 */
    var visited = false;
    try { visited = sessionStorage.getItem('site-visited') === '1'; } catch (e) {}

    var DURATION = reduced ? 700 : (visited ? 1100 : 2300);

    var startedAt = performance.now();
    var shown = 0;
    var tipIndex = -1;
    var finished = false;

    function isReady() {
      return document.readyState === 'complete';
    }

    function paint(value) {
      shown = value;

      var n = Math.min(100, Math.round(value));

      if (pctEl && pctEl.textContent !== String(n)) {
        pctEl.textContent = n;
      }

      track.style.setProperty('--p', (value / 100).toFixed(4));
      track.style.setProperty('--carpos', (value / 100).toFixed(4));
      track.setAttribute('aria-valuenow', String(n));

      for (var i = TIPS.length - 1; i >= 0; i--) {
        if (value >= TIPS[i][0]) {
          if (tipIndex !== i) {
            tipIndex = i;
            if (tipEl) tipEl.textContent = TIPS[i][1];
          }
          break;
        }
      }
    }

    function finish() {
      if (finished) return;
      finished = true;

      paint(100);
      loader.classList.add('is-done');

      /* 小车冲出右侧 */
      requestAnimationFrame(function () {
        track.style.setProperty('--carpos', '1.18');
      });

      try { sessionStorage.setItem('site-visited', '1'); } catch (e) {}

      /* 幕布拉起 + 主视觉入场 */
      window.setTimeout(function () {
        body.classList.add('is-ready');
        body.classList.remove('is-loading');
        loader.classList.add('is-out');
      }, 540);

      /* 彻底移除，避免挡住点击 */
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 1900);
    }

    function frame(now) {
      var t = Math.min((now - startedAt) / DURATION, 1);
      var eased = 1 - Math.pow(1 - t, 3);   /* 先快后慢 */
      var target = eased * 100;

      /* 资源还没加载完，就先停在 94% */
      if (!isReady() && target > 94) target = 94;

      var next = shown + (target - shown) * 0.15;

      if (target >= 100 && next > 99.4) next = 100;

      paint(next);

      if (next >= 100) {
        finish();
        return;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    /* 万一 rAF 被挂起（切到后台标签页），兜底直接收尾 */
    window.setTimeout(function () {
      if (!finished && isReady()) finish();
    }, DURATION + 6000);
  }

  /* ======================================================= 02 页面过场 */
  function isPlainClick(e) {
    return !(e.defaultPrevented || e.button !== 0 ||
             e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
  }

  document.addEventListener('click', function (e) {
    var target = e.target;

    if (!target || typeof target.closest !== 'function') return;

    var link = target.closest('a[data-transition]');
    if (!link) return;
    if (!isPlainClick(e)) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    /* 不支持动效或没有幕布时，直接跳转 */
    if (!veil || reduced) return;

    e.preventDefault();

    if (body.classList.contains('is-leaving')) return;

    /* 页面刚进来时幕布可能被 display:none 藏起来，这里恢复 */
    veil.style.display = '';

    /* 幕布上的文字跟着目标页变化 */
    var veilLabel = document.getElementById('veilLabel');
    var label = link.getAttribute('data-veil');
    if (veilLabel && label) veilLabel.textContent = label;

    body.classList.add('is-leaving');

    /* 幕布滑入约 0.65s，稍后跳转 */
    window.setTimeout(function () {
      window.location.href = href;
    }, 620);
  });

  /* 从首页过来：幕布已经盖住屏幕，这里让它滑走 */
  if (docEl.classList.contains('is-entering') && veil) {
    window.setTimeout(function () {
      veil.classList.add('is-leaving');
    }, 160);

    window.setTimeout(function () {
      veil.style.display = 'none';
      docEl.classList.remove('is-entering');
    }, 1150);
  }

  /* ======================================================= 02.5 复制邮箱 */
  function copyText(text) {
    var ok = false;

    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) {
      ok = false;
    }

    if (!ok && navigator.clipboard) {
      try { navigator.clipboard.writeText(text); } catch (err) {}
    }

    return ok;
  }

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || typeof target.closest !== 'function') return;

    var btn = target.closest('[data-copy-btn]');
    if (!btn) return;

    var holder = document.querySelector('[data-copy]');
    var text = btn.getAttribute('data-copy') || (holder ? holder.getAttribute('data-copy') : '');
    if (!text) return;

    var label = btn.querySelector('[data-copy-label]');
    var original = label ? label.textContent : '';

    copyText(text);

    btn.classList.add('is-done');
    if (label) label.textContent = '已复制 ✓';

    window.setTimeout(function () {
      btn.classList.remove('is-done');
      if (label) label.textContent = original;
    }, 1800);
  });

  /* ======================================================= 02.7 滚动渐入 */
  var revealables = document.querySelectorAll('[data-reveal-scroll]');

  if (revealables.length && !reduced && 'IntersectionObserver' in window) {
    body.classList.add('reveal-on');

    var revealObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('is-in');
          revealObserver.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var r = 0; r < revealables.length; r++) {
      revealObserver.observe(revealables[r]);
    }
  }
  /* ======================================================= 02.6 昼夜切换 */
  var themeBtn = document.querySelector('[data-theme-toggle]');

  function applyTheme(theme) {
    docEl.setAttribute('data-theme', theme);

    try { localStorage.setItem('site-theme', theme); } catch (e) {}

    if (themeBtn) {
      themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到白天模式' : '切换到夜间模式');
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#14130F' : '#F3EDE3');
  }

  applyTheme(docEl.getAttribute('data-theme') || 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }
  /* ======================================================= 03 兜底 */
  /* 浏览器「后退」可能从 bfcache 恢复页面，要把幕布状态清干净 */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;

    body.classList.remove('is-leaving');
    docEl.classList.remove('is-entering');

    if (veil) veil.style.display = 'none';

    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
      body.classList.add('is-ready');
      body.classList.remove('is-loading');
    }
  });
})();
