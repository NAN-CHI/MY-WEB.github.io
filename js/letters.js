/* =========================================================================
   飘屏字母：A–Z 每个字母一种颜色，缓缓从屏幕底部飘向顶部
   ---------------------------------------------------------------------------
   每个字母是一个 .float-letter 固定定位元素：
   - 外层负责「上升」（floatRise），内层 <i> 负责「左右摇摆」（floatSway）
   - 位置、大小、速度、摇摆幅度全部随机；负动画延迟让开场即散布全屏
   - 尊重系统的「减少动态效果」设置：开启时不生成，直接跳过
   ========================================================================= */
(function () {
  'use strict';

  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  /* 系统要求减少动效时，不加飘屏 */
  if (reduced) return;

  /* A–Z，26 个字母，每个一种颜色（浅色纸面与深色夜间下都清晰） */
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  var COLORS = [
    '#E5543A', '#F0A93B', '#E7C35A', '#A8C256', '#6BA85C', '#3E9E7D',
    '#2FA8A8', '#3E9BB5', '#5B8BD4', '#7B7FD4', '#9B6BD4', '#C45BB5',
    '#E5538B', '#D8432A', '#EF8A3C', '#D9B13C', '#7FB24C', '#3F9E5C',
    '#3FA88E', '#3E9FB5', '#4A88CC', '#6A74C9', '#9A6EC9', '#C65CA8',
    '#E55787', '#F07A5A'
  ];

  var frag = document.createDocumentFragment();

  for (var i = 0; i < LETTERS.length; i++) {
    var el = document.createElement('span');
    el.className = 'float-letter';

    var dur   = (10 + Math.random() * 14).toFixed(2);   /* 一次上升 10–24s */
    var delay = (-Math.random() * dur).toFixed(2);      /* 负延迟：开场即分散 */
    var size  = Math.round(13 + Math.random() * 13);    /* 小字母 13–26px */
    var left  = (Math.random() * 100).toFixed(1);       /* 0–100vw */
    var sway  = Math.round(18 + Math.random() * 34);    /* 摇摆 18–52px */

    el.style.left = left + '%';
    el.style.setProperty('--dur', dur + 's');
    el.style.setProperty('--delay', delay + 's');
    el.style.setProperty('--size', size + 'px');
    el.style.setProperty('--color', COLORS[i]);
    el.style.setProperty('--sway', sway + 'px');

    var letter = document.createElement('i');
    letter.textContent = LETTERS[i];
    el.appendChild(letter);

    frag.appendChild(el);
  }

  document.body.appendChild(frag);
})();
