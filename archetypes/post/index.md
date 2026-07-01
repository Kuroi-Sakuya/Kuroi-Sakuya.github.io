---
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"   # ← 换成中文标题
date: {{ .Date }}
slug: {{ .File.ContentBaseName }}      # 链接为 /p/<slug>/，默认取文件夹名
description:      # 一句话摘要（分享卡片 og:description / SEO 会用到）
categories:
    - 随笔
tags: []          # 例如 [黄昏, 随笔]
# 封面（可选）：把图片（如 cover.png）放进本文件夹，再取消下一行注释
# image: cover.png
---

（在这里开始写……）
