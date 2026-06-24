# 项目说明 / 给未来 Claude 的备忘

Kuroi-Sakuya 的个人博客，部署在 GitHub Pages（`https://kuroi-sakuya.github.io/`）。

## 技术栈
- **Hugo（extended）+ Stack 主题**（`themes/hugo-theme-stack`，git submodule，固定 v3.34.2）。
- 部署：推送到 `master` → GitHub Actions（`.github/workflows/hugo.yml`）自动构建并发布。Pages 来源已设为 “GitHub Actions”。
- 开发分支：`claude/sharp-bell-9rhqr6`；改完开 PR 合并到 `master` 上线。
- 本地构建：`hugo --gc --minify`。

## 目录约定
- 文章：`content/post/<slug>/index.md`（front matter 带 title/date/categories/tags，可选 `image:` 封面）。
- 页面：`content/page/{about,archives,search,links}/`。
- `static/memorial/`：旧站「你也喜欢小鱼吗」的存档，**完整保留但不在主站任何 UI 里链接它**。除非主人明确要求，不要再加指向 `/memorial/` 的入口。

## 审美偏好（主人喜欢的风格）
- 整体：**温柔、文艺、暖色、二次元气息（孤独摇滚 / 武大樱花日落）**，亲密个人化，不要冷淡的技术风。
- 主题概念「**咲夜·花开的夜**」：浅色=日落樱花（樱粉/珊瑚），深色=雨夜霓虹（深靛+霓虹粉）。
- **字体用衬线、要好读**（思源宋体 Noto Serif SC + Source Serif 4）。**不要手写体**（不好读）。
- 自定义都放 `assets/scss/custom.scss` 和 `layouts/partials/head/custom.html`，**不要改主题 submodule 本体**（方便升级）。
- 网络资源（字体等）走 **jsDelivr** 等国内可达 CDN，**别用常被墙的 Google Fonts**。

## 注意
- 这是公开仓库，备忘里不要写私人/敏感信息。
