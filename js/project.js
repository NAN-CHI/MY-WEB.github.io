/* =========================================================================
   项目详情数据 + 渲染
   —— 内容来自 D:\py-works\venv\Scripts\代码 里的 Python 练习代码。
   —— 改 title / desc / body / highlights 即可；id 要和 works.html 的链接一致。
   ========================================================================= */
(function () {
  'use strict';

  var PROJECTS = [
    {
      id: 'tetris',
      num: '01',
      title: '俄罗斯方块',
      desc: '用 tkinter 的 Canvas 从零写的俄罗斯方块：20×12 的棋盘、7 种方块、消行计分。',
      year: '2024',
      role: '独立开发',
      type: '桌面游戏',
      status: '可运行',
      body: [
        '整个游戏跑在 tkinter 的 Canvas 上：20 行 × 12 列，每格 30 像素，用一块块矩形拼出棋盘。7 种方块（Z / O / S / T / I / L / J）用相对坐标定义，移动和旋转都是对这一组坐标做变换，不用为每个方向单独画图。',
        '下落由 win.after(150) 驱动的游戏循环负责；消行加 10 分、上面的行整体下移，标题栏实时显示分数，结束时弹窗给出最终得分。没有用任何游戏引擎，全部是 Canvas 上的重绘。'
      ],
      highlights: [
        { t: '形状系统', d: '7 种方块用相对坐标描述，旋转只需变换坐标。' },
        { t: '消行计分', d: '消行 +10 分，标题栏实时刷新，Game Over 弹窗结算。' },
        { t: '零依赖', d: '只用标准库 tkinter，双击 py 就能跑。' }
      ]
    },
    {
      id: 'pikachu',
      num: '02',
      title: '皮卡丘',
      desc: '450 行 turtle 代码画出来的皮卡丘，没有贴一张图片。',
      year: '2024',
      role: '独立完成',
      type: '创意绘图',
      status: '可运行',
      body: [
        '全部用 turtle 海龟画笔完成，没有引用任何图片素材。核心是自己写的两个函数 radian_left / radian_right：每次多转一点角度、多走一点距离，用「增量」逼近一段弧线，这样就不用把曲线上的每个点硬编码进去。',
        '耳朵、脸颊、眼睛和尾巴都是用这些弧线一段段拼出来的；每块颜色单独 begin_fill / end_fill，边界干净。运行起来可以看到它一笔一笔把整只皮卡丘画完。'
      ],
      highlights: [
        { t: '自写曲线函数', d: '用角度与步长递增逼近弧线，省掉大量硬编码坐标。' },
        { t: '分层上色', d: '每个色块独立起笔、填充、收笔，色块之间互不污染。' },
        { t: '450 行', d: '代码里大半是在调坐标和角度——慢，但画得准。' }
      ]
    },
    {
      id: 'novel',
      num: '03',
      title: '小说爬虫',
      desc: '输入一个书号，把整本小说按章节抓下来，一章一个 txt。',
      year: '2024',
      role: '独立完成',
      type: '爬虫脚本',
      status: '可运行',
      body: [
        '程序先去目录页拿到每一章的标题和链接，再逐章请求正文。抓取用 requests.Session 复用连接、固定 User-Agent；解析用 parsel 的 CSS 选择器，标题、链接、正文各取所需。',
        '每一章单独存成一个 txt，文件名就是章节名；对请求异常和空内容都做了判断，会跳过并打印，不会因为一章失败就中断整本。输入的书号也做了字符校验，避免把非法字符带进文件路径。'
      ],
      highlights: [
        { t: '会话复用', d: '同一个 Session 走完全程，比每章新建连接更稳。' },
        { t: 'CSS 选择器', d: 'parsel 按选择器取数据，换网站只需改这几行。' },
        { t: '容错', d: '请求失败或章节为空会跳过并打印，不中断全书。' }
      ]
    },
    {
      id: 'camera',
      num: '04',
      title: '摄像头录制',
      desc: 'OpenCV + 线程：一边预览画面，一边按帧率录一段 MP4。',
      year: '2025',
      role: '独立开发',
      type: '桌面工具',
      status: '可运行',
      body: [
        '把摄像头读帧放进一个 threading.Thread 子类：子线程负责采集和 imshow 预览，主线程负责保存，避免预览窗口阻塞录制。',
        '录制用 VideoWriter 指定 MP4V 编码，按 fps × 秒数算出总帧数逐帧写入；停止时释放摄像头、销毁窗口。同一个文件夹里还放着灰度、旋转、保存的几段练习。'
      ],
      highlights: [
        { t: '线程封装', d: '采集、预览、释放都收在一个类里，退出时干净收尾。' },
        { t: '帧数控制', d: '用 fps × 时长算总帧数，不靠 sleep 硬等。' },
        { t: '可扩展', d: '同一套代码里接入了灰度、旋转、截图保存。' }
      ]
    },
    {
      id: 'wall',
      num: '05',
      title: '心形相片墙',
      desc: '用一张 21×17 的 0/1 点阵当模板，把相册里的照片拼成一颗心。',
      year: '2024',
      role: '独立完成',
      type: '图像处理',
      status: '可运行',
      body: [
        '先把爱心形状拆成一个 21 行 × 17 列的 0/1 点阵：0 的位置放照片，1 的位置留白。程序遍历点阵，把相册里的照片依次缩放到 192×192，再贴到画布对应的格子上。',
        '最后合成一张大图并保存。想换形状只要改那个二维数组，不用动逻辑；单张图片打不开时会跳过，不影响整张墙。'
      ],
      highlights: [
        { t: '点阵模板', d: '形状写成二维数组，改 0/1 就换轮廓。' },
        { t: '批量合成', d: 'PIL 的 resize + paste 逐格贴图，自动铺满画布。' },
        { t: '容错', d: '某张图读不出来就跳过，不会整张失败。' }
      ]
    },
    {
      id: 'cake',
      num: '06',
      title: '生日蛋糕',
      desc: '442 行 turtle 坐标、22 层填充色，一笔一笔画出一只蛋糕。',
      year: '2024',
      role: '独立完成',
      type: '创意绘图',
      status: '可运行',
      body: [
        '442 行 turtle 代码，几乎全是手调的坐标：先用 drawX / drawY 封装水平和竖直的走笔，再把蛋糕体、奶油、装饰一层层叠上去。',
        '整幅图用了 22 次 begin_fill、48 次换色，色块之间靠描边收口，所以放大看边缘也是干净的。改颜色或层数只要调对应的那一段。'
      ],
      highlights: [
        { t: '纯坐标绘制', d: '不依赖任何图片素材，全部由代码画出来。' },
        { t: '分层填色', d: '22 层填充、48 次换色，从底层到顶层依次绘制。' },
        { t: '可改', d: '颜色和层数都是独立段落，改哪里都能立刻看到效果。' }
      ]
    }
  ];

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  var id = param('id');
  var index = -1;

  for (var i = 0; i < PROJECTS.length; i++) {
    if (PROJECTS[i].id === id) { index = i; break; }
  }

  /* 找不到项目就回列表页 */
  if (index < 0) {
    window.location.replace('works.html');
    return;
  }

  var p = PROJECTS[index];

  function fill(selector, value) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  fill('[data-p="num"]', p.num);
  fill('[data-p="title"]', p.title);
  fill('[data-p="desc"]', p.desc);
  fill('[data-p="year"]', p.year);
  fill('[data-p="role"]', p.role);
  fill('[data-p="type"]', p.type);
  fill('[data-p="status"]', p.status);

  document.title = p.title + ' · J Q';

  var bodyWrap = document.querySelector('[data-p="body"]');
  if (bodyWrap) {
    for (var b = 0; b < p.body.length; b++) {
      var para = document.createElement('p');
      para.textContent = p.body[b];
      bodyWrap.appendChild(para);
    }
  }

  var listWrap = document.querySelector('[data-p="highlights"]');
  if (listWrap) {
    for (var h = 0; h < p.highlights.length; h++) {
      var item = p.highlights[h];
      var li = document.createElement('li');
      li.className = 'list__item';

      var num = document.createElement('span');
      num.className = 'list__num';
      num.textContent = '0' + (h + 1);

      var box = document.createElement('div');
      var title = document.createElement('h3');
      title.className = 'list__title';
      title.textContent = item.t;
      var desc = document.createElement('p');
      desc.className = 'list__desc';
      desc.textContent = item.d;

      box.appendChild(title);
      box.appendChild(desc);
      li.appendChild(num);
      li.appendChild(box);
      listWrap.appendChild(li);
    }
  }

  /* 上一个 / 下一个 */
  var prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  var next = PROJECTS[(index + 1) % PROJECTS.length];

  function wire(selector, target) {
    var link = document.querySelector(selector);
    if (!link) return;
    link.setAttribute('href', 'project.html?via=veil&id=' + encodeURIComponent(target.id));
    var t = link.querySelector('.project-nav__title');
    if (t) t.textContent = target.title;
  }

  wire('[data-prev]', prev);
  wire('[data-next]', next);
})();
