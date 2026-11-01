# J Q · 个人主页

一个「小车开路」主题的个人网站：加载动画是一条公路（进度条就是一辆小车），首页是一幕会动的小车场景，点击按钮带着幕布过场进入「关于我」；其余页面（作品 / 笔记 / 联系 / 项目详情）沿用同一套视觉与交互，并支持白天 / 夜间两套配色。

## 怎么打开

直接双击 `index.html` 即可（纯静态，不需要服务器、不依赖任何外部资源）。

放到线上就整包丢给任意静态托管（GitHub Pages / Vercel / Netlify）。

## 页面地图

```
index.html      首页：加载页 → 主视觉 → 跑马灯 → 精选作品 → 简介 → 一些数字 → 最近笔记 → 朋友们 → 页脚
about.html      关于我：故事、我在做什么、现在、经历时间线、工具箱、问答、工作以外、基本信息
works.html      作品：6 个 Python 项目的列表（每行左侧有小缩略图）
project.html    项目详情：?id=tetris 带项目 id 进入，内容由 js/project.js 渲染
notes.html      笔记：6 条可展开的短文（点标题展开全文）
friends.html    我和我的朋友们：顶部自动轮播 + 全部照片墙 + 每人一个板块，照片由 js/friends-data.js 数据驱动
花.html         彩蛋：粒子玫瑰花束（原有 Canvas 动画，接了黑幕入场与返回）
contact.html    联系：邮箱（可一键复制）、社交链接、合作流程、合作状态
```

导航栏在六个主页面之间通用（主页 / 关于我 / 作品 / 笔记 / 朋友们 / 联系），当前页会高亮；右侧是昼夜切换钮。

## 交互流程

1. **加载页**：虚线公路上，小车从 0% 开到 100%，实时显示百分比；轮子转、带速度线，下方文案在 26% / 52% / 76% / 94% 时自动换。
   进度会等 `window.load` 真正完成才收尾，最短展示 2.3 秒（同一会话第二次打开缩到 1.1 秒）。
2. **100% 之后**：小车冲出右侧 → 幕布向上拉起 → 主视觉逐项浮起，小车从右边驶入停在公路中间。
3. **主视觉**：路面虚线向右滚动（相对运动），看起来就是小车在向左行驶。
4. **页面过场**：点任意链接，墨黑幕布从右侧滑入（里面也有一条公路和一辆小车，文字显示目标页名），
   跳转后新页面一上来幕布已覆盖，再向左滑出、内容升起 —— 一镜到底。
5. **作品列表**：鼠标悬停某一行，右侧箭头会变成一辆开过来的小车（轮子在转）。
6. **笔记页**：用原生 `<details>` 做展开，不依赖 JS，键盘也能操作。
7. **联系页**：点「复制邮箱」把地址复制到剪贴板，按钮短暂变成「已复制 ✓」。
8. **滚动渐入**：首屏之下的板块（数字、笔记、作品列表）进入视口时轻微上浮淡入。
9. **小信封**：每个页面打开时，右下角会从屏幕上方落下一个圆形小信封，落地后轻轻浮动；点它直接写邮件。
   加载页 / 幕布还在的时候，下落会先暂停，等页面真正露出来再开始；滚到页脚时它会被页脚盖住，不会挡按钮。
10. **昼夜切换**：导航右侧的圆钮切换白天 / 夜间，两套完整配色（纸色 ↔ 墨色）。首次打开跟随系统设置，
    点过之后记在 `localStorage`，换页也保持一致。
11. **送你一朵花**：每个页面的页脚，主按钮右边还有一个「✿ 看到最后了，送你一朵花吧」，
    点它走同一套幕布过场进入 `花.html`（粒子玫瑰花束）。那一页进来先黑屏再淡出，
    左上角有「← 返回」可以回到首页。

## 文件结构

```
index.html / works.html / notes.html / friends.html / about.html / contact.html / project.html / 花.html
css/style.css       全部样式（配色变量、布局、动画）
js/car.js           小车的 SVG（全站共用，改这里就换车）
js/app.js           加载进度 + 页面过场 + 昼夜切换 + 复制邮箱 + 滚动渐入
js/project.js       项目详情的文案数据与渲染
js/friends.js       朋友页的轮播 / 照片墙 / 板块 / 灯箱渲染
js/friends-strip.js 首页「朋友们」三张照片预览
js/friends-names.js 板块名称与简介（想改名字只改这个文件）
js/friends-data.js  朋友页的照片数据（由 update-friends.ps1 自动生成，勿手改）
img/                照片：img/friends/<板块名>/ = 各板块（也会自动进入「全部照片」与轮播）
update-friends.ps1  一键更新照片数据的扫描脚本
更新照片.bat        一键更新的双击入口（调用上面的脚本）
compress-photos.ps1 把 img 下的照片压到长边 1400px / JPEG 80
压缩照片.bat        压缩的双击入口（上传 GitHub 前跑一次）
README.md           就是本文件
```

## 想改的地方

| 想改什么 | 改哪里 |
| --- | --- |
| 名字（J Q） | 首页大字是 `index.html` 里的 `.wordmark`：J 实心 / Q 描边（`-webkit-text-stroke`）/ 朱红句点；其余位置直接搜 `J Q` |
| 介绍文案 | 各页面里直接搜中文；`<title>`、`<meta name="description">` 也记得改 |
| 作品列表 | `works.html` 里的 `.work-row`（首页 `index.html` 只放了前 3 个） |
| 作品缩略图 | 每行开头的 `work-row__thumb thumb-a ~ thumb-e`，换 `thumb-x` 就是换配色 |
| 项目详情内容 | `js/project.js` 顶部的 `PROJECTS` 数组：标题、简介、正文、亮点（现为俄罗斯方块、皮卡丘、小说爬虫、摄像头录制、心形相片墙、生日蛋糕） |
| 新增一个项目 | 在 `PROJECTS` 里照抄一段（换个 `id`），再在 `works.html` 加一行链接 `project.html?via=veil&id=你的id` |
| 笔记 | `notes.html`，照着 `<details class="note">` 的结构往下加 |
| 朋友们的照片 | 新照片放进 `img/`（进入轮播与照片墙）；想给某位朋友单独开板块，就把照片放进 `img/friends/<名字>/`（板块名 = 文件夹名，改成朋友名字就是按人分），然后双击「更新照片.bat」、刷新 `friends.html`。板块名称/简介改 `js/friends-names.js`（`name` = 标题，`intro` = 简介，一行一个板块）；照片压体积用「压缩照片.bat」 |
| 首页的数字 | `index.html` 里 `.stats__item` |
| 关于我的故事 / 经历 / 问答 | `about.html` 里带 `✏️` 注释的段落、`.timeline` 与 `.qa` |
| 合作流程 | `contact.html` 里带 `✏️` 注释的 `.list` |
| 邮箱、社交链接 | 搜 `hello@example.com` 和 `href="#"`；联系页的复制按钮改 `data-copy` |
| 小信封的收件人 | 各页面搜 `class="envelope"`，改它的 `href="mailto:..."` |
| 送花按钮 | 各页页脚的 `cta--flower`，文字与跳转目标都在这里（`花.html`） |
| 主色（现在的朱红） | `css/style.css` 顶部 `--accent`；小车的红是 `--car` |
| 纸色背景 / 夜间背景 | `--paper` 系列；夜间在文件末尾 `html[data-theme="dark"]` 里整组覆盖 |
| 车的样子 | `js/car.js` 里的 SVG 路径 |
| 加载时长 | `js/app.js` 里的 `DURATION`（默认 2300ms） |
| 小车大小、公路高度 | `css/style.css` 里 `.hero__car` 的 `width`、`--road-h` |
| 过场快慢 | `.veil` 的 `transition` 时长，配合 `js/app.js` 里跳转前的 620ms |

## 部署到 GitHub（照片体积）

GitHub 的实际限制：单个文件 100 MB（网页拖拽上传是 25 MB）、仓库建议 1 GB 以内、Pages 站点上限 1 GB。
所以真正要留意的不是「传不上去」，而是别让仓库变肥、手机加载变慢。

现在是 **约 2.7 MB**（19 张照片压到长边 1400px 后共 2.5 MB，之前是 15.1 MB）。

加新照片后的固定流程：

1. 照片放进 `img/friends/<板块名>/`
2. 双击 **更新照片.bat** → 重新生成 `js/friends-data.js`
3. 双击 **压缩照片.bat** → 体积通常降到原来的 1/3
4. 上传：`img/` 整个文件夹 + `js/friends-data.js`

照片只存一份：`friends-data.js` 里记的是 `friends/板块名/文件名` 这样的相对路径，
所以不需要再往 `img/` 根目录放副本。
## 登录验证

除 `login.html` 外，所有页面都要先登录。两种模式，在 `js/auth.js` 顶部的 `AUTH_MODE` 切换。

- 密钥在 `js/auth.js` 顶部的 `SUPABASE_URL` / `SUPABASE_KEY`（用的是 anon / publishable key，公开在前端是设计如此，不是泄露）
- 门禁在 `js/auth-gate.js`：写在 `<head>` 里同步执行，没登录会在页面绘制前直接跳走，不会闪内容
- 登录成功回到你刚才想进的那一页（`?next=`），并且只允许跳站内 `.html`
- 会话存在 `localStorage` 的 `jq-auth-session` 里，access token 快过期时用 refresh token 自动续
- 页脚的「退出登录」是 `js/auth.js` 自动插入的（花页没有页脚，所以没有）

### 口令模式（`AUTH_MODE = 'local'`，当前默认）

只需要一个口令，不联网，国内网络也能用。

- 口令写在 `js/auth.js` 的 `LOCAL_PASS = 'jq-friends'`，改成你自己的，然后告诉朋友
- 登录状态存 `localStorage` 的 `jq-local-unlock`，默认保留 30 天（`LOCAL_DAYS` 可改）
- 页脚有「退出登录」

⚠️ 这是**前端校验**：口令会出现在页面 JS 里，懂技术的人能直接读到，
它挡的是「随手点开链接的人」，不是防破解。真要防住，得配合后端（见下面的 Supabase 模式）。

### Supabase 模式（`AUTH_MODE = 'supabase'`）

邮箱 + 密码，需要网络能访问 `supabase.co`。
（目前 `*.supabase.co` 在国内会被连接重置，`supabase.com` 官网却能打开 —— 用之前先确认你这边访问得了。）
### Supabase 模式：怎么给人开账号

登录页没有注册入口，账号要在 Supabase 后台建：

1. 打开 Supabase 控制台 → **Authentication → Users → Add user**
2. 填邮箱 + 密码，**勾上 Auto Confirm User**（不勾就得收邮件点确认，而默认邮件服务每天有额度）
3. 把这组邮箱密码发给朋友

想彻底禁止注册，可以顺手关掉 **Authentication → Providers → Email → Enable sign ups**。

### 重要：这只挡页面，不挡图片

GitHub Pages 是纯静态托管。登录只是让**页面**在浏览器里先被拦下来，
`img/friends/xxx.jpg` 这种图片地址本身仍然是公开的 —— 知道链接就能直接打开。

要真正保护照片，得把 `img/` 挪到 **Supabase Storage 的私有桶**，
再用登录后的 token 去换签名链接（或用一个 Edge Function 代理）。
这一步改动比较大，需要的话再单独做。
## 一些实现说明

- 页面之间用 `?via=veil` 标记「是带着幕布过来的」，新页面首帧就把幕布盖好，所以不会闪白。
- 复制邮箱用了 `document.execCommand('copy')`，本地 `file://` 打开也能用（不依赖 https）。
- 滚动渐入是渐进增强：只有 JS 给 `body` 加上 `.reveal-on` 才会隐藏待入场元素，所以关掉 JS 内容照常显示。
- 主题走 CSS 变量：白天是纸色 + 墨字，夜间整组反过来；切主题时底色有 0.45s 过渡。
  首屏的 `<script>` 会在第一次绘制前把 `data-theme` 写上去，所以不会先闪一下白天再变黑。
- 手机端：导航收成六个小字，作品行隐藏标签与年份，笔记隐藏分类，按钮始终居中在车正下方。
- 遵循系统「减少动态效果」设置：开启后会跳过过场、缩短加载、停掉跑马灯、车轮、信封与滚动渐入。
- 项目详情页的文案由 JS 填充，所以直接打开 `project.html`（没有 id）会回到作品列表。
