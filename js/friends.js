/* =========================================================================
   我和我的朋友们 · 页面渲染
   -------------------------------------------------------------------------
   依赖：js/friends-data.js（提供 window.FRIENDS_DATA）
   功能：照片墙（多展示位网格）
         每个人的板块（板块名与简介可在 friends.html 里覆盖）
         点击放大灯箱（左右切换 / Esc 关闭）
   设计：纯原生 JS，无外部依赖；遵循 prefers-reduced-motion
   ========================================================================= */
(function () {
  'use strict';

  var DATA = window.FRIENDS_DATA;
  if (!DATA) return;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function makeEl(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function srcOf(file) {
    return 'img/' + encodeURI(file);
  }

  /* 单张照片（按钮，点击进灯箱） */
  function photoButton(file) {
    var btn = makeEl('button', 'friends-photo');
    btn.type = 'button';
    btn.setAttribute('data-file', file);
    var img = document.createElement('img');
    img.src = srcOf(file);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    btn.appendChild(img);
    return btn;
  }

  /* 照片网格容器 */
  function grid(photos) {
    var g = makeEl('div', 'friends-grid');
    for (var i = 0; i < photos.length; i++) {
      g.appendChild(photoButton(photos[i]));
    }
    return g;
  }

  /* 区块头：标题 + 计数 */
  function sectionHead(title, count) {
    var head = makeEl('div', 'friends-section__head');
    head.appendChild(makeEl('h2', 'friends-section__title', title));
    head.appendChild(makeEl('span', 'friends-section__count', count + ' 张'));
    return head;
  }

  /* 取板块的标题 / 简介：先精确匹配文件夹名，再退一步做包含匹配，
     这样只改文件夹名、配置没跟着改，也能认出来 */
  function sectionInfo(name) {
    var map = window.FRIEND_INFO;
    if (!map) return null;
    if (map[name]) return map[name];
    for (var key in map) {
      if (!Object.prototype.hasOwnProperty.call(map, key)) continue;
      if (key.indexOf(name) !== -1 || name.indexOf(key) !== -1) return map[key];
    }
    return null;
  }

  /* ================================================= 灯箱 */
  var lightbox = (function () {
    var box = makeEl('div', 'lightbox');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', '照片预览');

    var img = makeEl('img', 'lightbox__img');
    img.alt = '';
    var closeBtn = makeEl('button', 'lightbox__close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', '关闭');
    var prev = makeEl('button', 'lightbox__arrow lightbox__arrow--prev', '‹');
    prev.type = 'button';
    prev.setAttribute('aria-label', '上一张');
    var next = makeEl('button', 'lightbox__arrow lightbox__arrow--next', '›');
    next.type = 'button';
    next.setAttribute('aria-label', '下一张');
    var count = makeEl('p', 'lightbox__count');

    box.appendChild(closeBtn);
    box.appendChild(prev);
    box.appendChild(img);
    box.appendChild(next);
    box.appendChild(count);
    document.body.appendChild(box);

    var files = [];
    var index = 0;

    function paint() {
      if (!files.length) return;
      img.src = srcOf(files[index]);
      count.textContent = (index + 1) + ' / ' + files.length;
    }

    function open(list, start) {
      files = list;
      index = start;
      paint();
      box.classList.add('is-open');
      document.body.classList.add('lightbox-open');
    }

    function closeLightbox() {
      box.classList.remove('is-open');
      document.body.classList.remove('lightbox-open');
    }

    function step(d) {
      if (!files.length) return;
      index = (index + d + files.length) % files.length;
      paint();
    }

    closeBtn.addEventListener('click', closeLightbox);
    box.addEventListener('click', function (e) {
      if (e.target === box) closeLightbox();
    });
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });

    return { open: open };
  })();

  /* 全局点击：照片 → 灯箱（从全部照片序列定位） */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || typeof t.closest !== 'function') return;
    var btn = t.closest('.friends-photo');
    if (!btn) return;
    var file = btn.getAttribute('data-file');
    var list = DATA.all || [];
    var start = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === file) { start = i; break; }
    }
    lightbox.open(list, start);
  });

  /* ================================================= 渲染 */

  var wallEl = document.querySelector('[data-friends-wall]');
  if (wallEl && DATA.all && DATA.all.length) {
    wallEl.appendChild(sectionHead('全部照片', DATA.all.length));
    wallEl.appendChild(grid(DATA.all));
  }

  var groupsEl = document.querySelector('[data-friends-groups]');
  if (groupsEl) {
    var groups = DATA.groups || [];
    if (groups.length) {
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        if (!grp.photos || !grp.photos.length) continue;
        var sec = makeEl('section', 'friends-group');
        var info = sectionInfo(grp.name);
        var groupTitle = (info && info.name) || grp.name;
        sec.appendChild(sectionHead(groupTitle, grp.photos.length));

        var groupIntro = (info && info.intro) || '';
        if (groupIntro) {
          sec.appendChild(makeEl('p', 'friends-group__intro', groupIntro));
        }

        sec.appendChild(grid(grp.photos));
        groupsEl.appendChild(sec);
      }
    } else {
      var empty = makeEl('p', 'friends-empty');
      empty.textContent = '还没有分板块的照片。在 img/friends/ 里新建一个以朋友名字命名的文件夹，把照片放进去，双击「更新照片.bat」再刷新本页，这里就会出现这位朋友的专属板块。';
      groupsEl.appendChild(empty);
    }
  }
})();
