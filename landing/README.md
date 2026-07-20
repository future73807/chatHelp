# landing

`landing` 是 terln-agent 的落地页项目目录。

后续落地页相关的页面、组件、样式、素材、依赖和构建配置都放在这个目录内，避免和主项目的 Agent 能力、技能文件混在一起。

## 当前结构

```text
landing/
├── README.md
├── app.js
├── index.html
└── styles.css
```

## 技术栈

第一阶段落地页使用无框架静态 HTML/CSS/JS，保持单页展示和下载入口简单直接。

## 本地预览

落地页由 `server` 同域托管，本地访问：

```text
http://127.0.0.1:8787/
```

不要直接用 `file://` 打开 `index.html` 预览；页面会通过相对路径请求 `/api/releases/stable`。

## 开发约定

- 落地页相关代码只放在 `landing/` 目录下。
- 不在仓库根目录增加落地页专用依赖或配置，除非项目结构已经明确需要共享。
- 素材文件后续统一放到 `landing/assets/`。
