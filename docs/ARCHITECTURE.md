# 架构文档 · 互联网冷冻小面包

> 个人博客，部署在 GitHub Pages：<https://kuroi-sakuya.github.io/>
> 主题概念「**咲夜·花开的夜**」——浅色＝日落樱花，深色＝雨夜霓虹。
> 本文件记录**当前架构现状**，便于自己/未来维护者快速理解。配套备忘见根目录 `CLAUDE.md`。

最后更新：随 `ee077a2`（Newsletter 单次确认文案）。

---

## 1. 技术栈与关键约束

| 项 | 取值 | 说明 |
|---|---|---|
| 静态生成器 | **Hugo extended v0.163.3** | 工作流里 `HUGO_VERSION` 固定；extended 版才有 SCSS / 图片处理 |
| 主题 | **Stack v3.34.2** | `themes/hugo-theme-stack`，**git submodule，固定 tag**，不改本体 |
| 部署 | **GitHub Actions → GitHub Pages** | Pages 来源＝“GitHub Actions”，推 `master` 自动构建上线 |
| 字体 | 思源宋体 + Source Serif 4，走 **jsDelivr** | 衬线、好读、文气；不用常被墙的 Google Fonts |
| 评论 | 自托管 **Waline**（VPS） | `https://kuroi-sakuya.duckdns.org` |
| 订阅 | 自托管 **Listmonk** + SMTP 中继（VPS） | `https://news.11100117.xyz` |

**三条容易踩的硬约束（务必记住）：**
1. **Stack 根字号 62.5% → `1rem = 10px`**。`custom.scss` 里所有 rem 都按这个换算，否则元素会“巨小无比”。
2. **LibSass 把 `min()`/`max()` 当 Sass 函数**，写进 CSS 会构建失败 → 用 `width:%` + `max-width:var()` 或 `clamp()`/`aspect-ratio`（后两者是纯 CSS，安全）。
3. **不改主题 submodule 本体**，所有定制走站点 `layouts/` 覆盖 + `assets/`，方便日后升级主题。

---

## 2. 仓库结构

```
.
├── hugo.yaml                     # 站点配置（唯一配置文件）
├── CLAUDE.md                     # 给维护者/AI 的备忘（风格偏好、约定、注意事项）
├── docs/ARCHITECTURE.md          # 本文件
├── .github/workflows/hugo.yml    # 构建 + 部署工作流
│
├── content/                      # 内容
│   ├── _index.md                 # 首页 front matter
│   ├── categories/_index.md      # 分类总览页
│   ├── page/{about,archives,search,links}/  # 独立页面
│   └── post/<slug>/index.md      # 文章（page bundle，封面图同目录）
│
├── layouts/                      # 站点模板覆盖（影子覆盖主题同名文件）
│   ├── _default/{baseof,single,list,archives}.html
│   ├── index.html                # 首页（多屏）
│   ├── 404.html
│   └── partials/
│       ├── header/banner.html            # 顶部导航 banner（取代主题左侧栏）
│       ├── head/custom.html              # 自定义字体加载（jsDelivr）
│       ├── footer/components/custom-font.html  # 留空＝禁用主题默认 Google Fonts
│       ├── home/{hero,timeline,guestbook}.html # 首页三段
│       └── newsletter.html               # 邮件订阅复用组件
│
├── assets/
│   ├── scss/custom.scss          # 所有自定义样式（style.scss 最后 @import，覆盖主题）
│   └── ts/custom.ts              # 所有自定义脚本（主题自动编译+加载）
│
├── static/
│   ├── favicon.png
│   └── memorial/                 # 旧站「你也喜欢小鱼吗」存档，完整保留但全站不链接
│
└── themes/hugo-theme-stack/      # 主题 submodule（只读，勿改）
```

---

## 3. 渲染架构

### 3.1 骨架：`_default/baseof.html`
全站统一骨架，**用顶部 banner 取代了 Stack 默认左侧栏**，并强制单栏：

```
<body class="{block body-class}">
  banner.html                       ← 顶部导航
  <div class="container single-col">
     {block right-sidebar}          ← 文章页按需注入（目前不放目录/小工具）
     <main class="full-width">{block main}</main>
  </div>
  footer/include.html
```

### 3.2 页面类型 → 模板映射

| 页面 | Kind | 模板 | 要点 |
|---|---|---|---|
| 首页 | home | `layouts/index.html` | 多屏：hero → timeline → guestbook |
| 分类总览 `/categories/` | taxonomy | `_default/list.html`（`taxonomy` 分支）| 分类卡片网格 + **底部标签云**（仅此页）|
| 分类/标签详情 `/categories/x/`、`/tags/x/` | term | `_default/list.html`（`term` 分支）| 标题 + 右上「返回」（按 `.Type` 动态回 `/categories/` 或 `/tags/`）+ **default 卡片列表**（带封面 banner）|
| 文章 `/p/<slug>/` | page | `_default/single.html` | 右上「返回」→ 所属分类；封面 + 正文 + 评论 + 订阅 |
| 时间线 `/archives/` | page(archives) | `_default/archives.html` | 纯文字竖向时间轴（年份→标题），无封面 |
| 普通 section 兜底 | section | `_default/list.html`（else 分支）| 同 term 的 default 卡片列表 |

### 3.3 首页三段（`layouts/index.html` → partials/home/）
- **hero.html**：第一屏。`#hero-typer` 由 `custom.ts` 填充（诗词 ↔ 签名打字机）+ 昼夜渐变背景 + 向下滚动箭头。
- **timeline.html**：第二/三屏「最近」。最多 12 篇，用主题 `article-list/compact`，但 **CSS 隐藏缩略图 → 纯文字**（标题+日期）+「阅读全部 →」跳 `/archives/`。
- **guestbook.html**：第四屏「留言板」。复用 Stack 内置 `comments/include.html`（Waline），其下挂 `newsletter.html`。

---

## 4. 自定义层（覆盖哲学）

三个挂载点，**主题 submodule 零改动**：

1. **`layouts/**`**：同名文件影子覆盖主题模板（Hugo 优先用站点的）。
2. **`assets/scss/custom.scss`**：被主题 `style.scss` **最后** `@import`，所以无需 `!important` 即可覆盖主题（仅响应式 `height` 这类要靠选择器特异性压过）。
3. **`assets/ts/custom.ts`**：主题 footer 的 `components/script.html` 会自动编译加载（esbuild，**非 ASCII 字符串会被转义成 `\uXXXX`**，验证产物时注意）。

banner 复用主题 JS 所需的元素 ID：`#toggle-menu` / `#main-menu`（`menu.ts` 移动端抽屉）、`#dark-mode-toggle`（`colorScheme.ts` 明暗切换）。主题若改这些选择器，需在 `custom.ts` 自写兜底。

---

## 5. 设计系统（「咲夜·花开的夜」）

定义在 `custom.scss` 顶部的 CSS 变量，明暗两套：

- **浅色（日落樱花）**：`--body-background:#fcf5f2`、`--accent-color:#df6d8e`（樱粉/珊瑚）。
- **深色（雨夜霓虹）**：`--body-background:#15161f`、`--accent-color:#ff8fb0`（深靛 + 霓虹粉）。
- **统一令牌**：`--site-max:1140px`（所有容器 `width:92%; max-width:var(--site-max); margin:0 auto`）、`--card-border-radius:16px`、胶囊 `999px`、阴影 `--shadow-l1..l4`（l1 静置 / l3 悬浮）、过渡 `.2s/.25s/.6s`。
- **卡片/胶囊词汇**：卡片悬浮 `translateY(-4px)+shadow-l3`；分类＝实心彩色 chip，标签＝描边胶囊（同几何、区别填充）。
- **字体**：`head/custom.html` 从 jsDelivr 加载 Noto Serif SC + Source Serif 4；`custom-font.html` 留空以禁用主题默认 Lato；`custom.scss` 有系统衬线兜底。

---

## 6. 前端交互（`assets/ts/custom.ts`）

四个独立 IIFE：
1. **heroTyper**：调一言诗词 API（`v1.hitokoto.cn?c=i`，每次不同、CORS、国内可达）↔ 签名「二象无常，遇而无往」，打字 + 删除循环；失败回退本地诗句表。
2. **readingProgress**：文章页顶部阅读进度条。
3. **scrollReveal**：`.reveal` 元素进入视口加 `.revealed` 渐显；`prefers-reduced-motion` 下直接显示。
4. **newsletter**：订阅表单 `fetch` POST 到 Listmonk `/subscription/form`（表单编码＝简单请求免预检），蜜罐反垃圾，原地提示成功/失败。

---

## 7. 内容模型

- **文章**＝page bundle：`content/post/<slug>/index.md`，front matter：`title/date/slug/categories/tags`，可选 `image:`（封面图放同目录，`params.featuredImageField: image`）。
- **封面图分工**：传图→列表页矮 banner（`height: clamp(14rem,20vw,19rem)`，只露一条）+ 文章页完整封面（圆角+淡入+Ken-Burns）；首页与时间线**不放图**；不传图→纯文字卡片，尺度一致。
- **分类 vs 标签（角色分工，不冗余）**：
  - **分类 Category**＝大栏目/类型（导航主结构，实心 chip，一篇通常一个）。
  - **标签 Tag**＝细粒度话题（可跨分类，文章底部描边胶囊，点击→`/tags/x/`；分类总览页底部有标签云）。
  - 两个 taxonomy 都默认开启；“按标签筛选”＝点标签进其 term 页（静态站的天然筛选）。

---

## 8. 外部服务（在 VPS 上，非本仓库）

| 服务 | 作用 | 地址 | 配置位置 |
|---|---|---|---|
| **Waline** | 评论/留言（匿名昵称即可，后台记 IP）| `kuroi-sakuya.duckdns.org` | `hugo.yaml → params.comments` |
| **Listmonk** + SMTP 中继(Brevo) | 邮件订阅 + 群发 | `news.11100117.xyz` | `hugo.yaml → params.newsletter`（enabled/serverURL/listUUID）|

- 订阅组件仅在「有留言板」的页面、且 `newsletter` 三项齐全时渲染（文章页 + 首页）。
- 列表设为 **single opt-in**（填邮箱即入库可群发，无需确认邮件）；发件用真域名 `11100117.xyz`（应配 SPF/DKIM/DMARC）。
- 跨域：前端要读到提交结果，Listmonk 反代需放行 `Access-Control-Allow-Origin: https://kuroi-sakuya.github.io`。
- ⚠️ **订阅者名单与评论数据只存在 VPS**，是全站最难重建的资产（详见第 10 节优化）。

---

## 9. 构建与部署

- **工作流** `.github/workflows/hugo.yml`：
  - 触发：push 到 `master`，或手动 `workflow_dispatch`。
  - `concurrency: group=pages, cancel-in-progress: true`（连续合并自动取代旧部署，不堆积）。
  - 步骤：装 Hugo extended → checkout（`submodules: recursive`）→ `hugo --gc --minify` → 上传 artifact → `deploy-pages`。
- **开发流程**：在 `claude/sharp-bell-9rhqr6` 开发 → 本地 `hugo --gc --minify` 验证 → 开 PR → 合并到 `master` → 自动部署。
  - ⚠️ **squash merge 的坑**：合并后 master 是新 SHA，开发分支会与 master 分叉；下次开发前需 `git rebase --onto origin/master <旧tip> <分支>` 把新提交挪到最新 master 上，避免“假冲突”。
- **本地命令**：开发预览 `hugo server`；产物构建 `hugo --gc --minify`（输出到 `public/`，已 gitignore）。

---

## 10. 归档

`static/memorial/` 是旧站「你也喜欢小鱼吗」的完整存档，**保留但全站任何 UI 都不链接它**；除非主人明确要求，不要再加指向 `/memorial/` 的入口。
