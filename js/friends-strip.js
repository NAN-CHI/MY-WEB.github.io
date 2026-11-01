/* =========================================================================
   首页「朋友们」三张照片预览
   -------------------------------------------------------------------------
   依赖 js/friends-data.js（window.FRIENDS_DATA）。
   从全部照片里按间隔挑 3 张，点任意一张带着幕布过场进 friends.html。
   ========================================================================= */
(function () {
  'use strict';

  var host = document.querySelector('[data-friends-strip]');
  var data = window.FRIENDS_DATA;

  if (!host || !data || !data.all || !data.all.length) return;

  var count = Math.min(3, data.all.length);
  var step = data.all.length / count;

  for (var i = 0; i < count; i++) {
    var file = data.all[Math.min(data.all.length - 1, Math.floor(i * step))];

    var link = document.createElement('a');
    link.className = 'friends-strip__item';
    link.setAttribute('href', 'friends.html?via=veil');
    link.setAttribute('data-transition', '');
    link.setAttribute('data-veil', '朋友们 · Friends');
    link.setAttribute('aria-label', '查看朋友们的照片');

    var img = document.createElement('img');
    img.src = 'img/' + encodeURI(file);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    link.appendChild(img);
    host.appendChild(link);
  }
})();
