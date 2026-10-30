# 架构与实现

## 请求链路

浏览器 → `backend/server.mjs` → `frontend/` 静态文件与本地 JSON/媒体。服务仅绑定 IPv4 回环地址。浏览器不直接连接 GitHub；同步由本地 Node 调用 GitHub CLI 或 GitHub 公开 API。

`frontend/app.js` 读取 portfolio 与 repositories，构建双语展示、统计、项目详情及动效。`frontend/admin.js` 提供表单和 JSON 草稿编辑。`frontend/copy.js` 提供全部展示页默认文案，后台可覆盖。`frontend/lib.js` 提供 DOM 安全构造、API 调用与统计工具。`frontend/schema.js` 是前后端共享的纯数据校验，`backend/schema.mjs` 重新导出同一实现，避免 JSON 导入与服务端规则漂移。

## 内容层

- 初次启动读取 `data/portfolio.seed.json`。没有第一次保存时不复制一份无意义的运行数据。
- 存在 `local-data/portfolio.json` 时优先使用，避免 Git pull 或 seed 更新抹掉后台编辑。
- PUT 要求当前 revision；服务串行执行保存，冲突返回 409。校验通过后先备份旧值，再原子写临时文件并 rename，revision 自增。
- 旧内容备份不包含媒体。媒体追加式存储，移除项目引用不删除原始文件；手工清理前检查全部项目和备份引用。

## 媒体

使用 raw request body 流式写入，避免把整个大文件放进内存；文件名改为随机 UUID。校验扩展名、文件签名及 250 MiB 上限。支持 MP4/WebM/MOV 与 JPEG/PNG/WebP/GIF；不支持 HTML/SVG 上传。

服务实现 HEAD、Accept-Ranges、206/416 及单段 byte ranges，便于播放器跳转。节点秒数由数据保存，浏览器切换 currentTime。编码兼容性不由扩展名保证，优先 H.264 MP4/WebM。Range 的语义参考 [MDN HTTP Range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests)。

## 本机安全与可用性

校验 Host、Origin、Sec-Fetch-Site 和写操作随机令牌；限制可读目录与媒体路径；CSP 只允许本地资源；不加载外部字体/脚本。任何能访问此电脑的本机用户仍可打开后台，所以不能直接用于公网。

模态窗应有语义标题、键盘关闭和焦点管理，遵循 [MDN dialog 可访问性说明](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role)。动画避免拦截滚轮，并尊重 reduced-motion。

## GitHub 同步

`scripts/sync-github.mjs` 用 `execFile` 参数数组运行 `gh api --paginate --slurp`，限定 Wang-Kuz 自有仓库，凭证由 gh 管理。无 gh 时读取公开分页并保留旧条目，标记 partial。HTTP/CLI 均不写用户 GitHub 仓库。写入元数据与 README 时原子替换；脚本不修改 portfolio。

完整 API、字段和目录约定见 [CONTRACT.md](CONTRACT.md)。
