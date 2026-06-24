---
title: 你好，世界
description: 新博客的第一篇
date: 2026-06-23
slug: hello
categories:
    - 随笔
tags:
    - 开始
---

这是新博客的第一篇文章。

从这里开始，记录生活、想法，以及我热爱的一切。

<!--more-->

以后我会在这里写下生活、想法，以及我热爱的一切。

## 怎么写新文章

在 `content/post/` 下新建一个文件夹，里面放一个 `index.md`，开头带上这样的信息：

```yaml
---
title: 文章标题
date: 2026-06-23
categories:
    - 分类
tags:
    - 标签
image: cover.jpg   # 可选：把封面图放在同一个文件夹里
---

正文从这里开始……
```

提交并推送到 `master`，GitHub 会自动构建上线。
