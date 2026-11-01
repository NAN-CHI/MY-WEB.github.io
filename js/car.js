/* =========================================================================
   小车图形（内联 SVG）
   —— 朝左行驶。所有 [data-car] 元素都会被填入同一辆车。
   —— 想换车的样子，只改这里即可；颜色在 css/style.css 的 .car-svg 里。
   ========================================================================= */
(function () {
  'use strict';

  var wheel = function (cx) {
    return (
      '<g class="car__wheel">' +
        '<circle class="car__tire" cx="' + cx + '" cy="90" r="20"/>' +
        '<circle class="car__rim" cx="' + cx + '" cy="90" r="9.5"/>' +
        '<path class="car__spokes" d="M' + cx + ' 80.5V99.5M' + (cx - 9.5) + ' 90h19"/>' +
        '<circle class="car__hub" cx="' + cx + '" cy="90" r="3"/>' +
      '</g>'
    );
  };

  var CAR =
    '<svg class="car-svg" viewBox="0 0 240 112" fill="none" ' +
         'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +

      /* 车灯的光晕 */
      '<circle class="car__glow" cx="30" cy="62" r="19"/>' +

      /* 车轮（画在车身后面，被轮眉挡住上半部分） */
      '<g class="car__wheels">' + wheel(58) + wheel(182) + '</g>' +

      /* 车身 */
      '<path class="car__body" d="M20 88L20 62Q20 53 33 51L70 46L94 24Q97 21 102 21' +
        'L154 21Q159 21 161 25L174 46L212 51Q224 53 224 64L224 88L200 88' +
        'A24 24 0 0 0 164 88L76 88A24 24 0 0 0 40 88Z"/>' +

      /* 车窗 */
      '<path class="car__window" d="M100.5 43L106.5 29H126V43Z"/>' +
      '<path class="car__window" d="M130 43V29H148.5L160 43Z"/>' +
      '<path class="car__shine" d="M107 39.5L112.5 32.5"/>' +

      /* 细节 */
      '<path class="car__seam" d="M128 46V86"/>' +
      '<rect class="car__handle" x="108" y="55" width="13" height="4" rx="2"/>' +
      '<rect class="car__handle" x="136" y="55" width="13" height="4" rx="2"/>' +
      '<rect class="car__headlight" x="22" y="56" width="14" height="10" rx="5"/>' +
      '<rect class="car__taillight" x="212" y="57" width="9" height="9" rx="4"/>' +
    '</svg>';

  function mount() {
    var slots = document.querySelectorAll('[data-car]');
    for (var i = 0; i < slots.length; i++) {
      if (!slots[i].firstChild) slots[i].innerHTML = CAR;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
