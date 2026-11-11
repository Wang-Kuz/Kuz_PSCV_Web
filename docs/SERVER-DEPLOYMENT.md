# 服务器部署（2026-11-06）

项目部署目录为 `/opt/KuzPSCV`，代码、`local-data/`、ACME 验证目录与 `deploy/` 均位于此目录。部署来源为 GitHub main 提交 `519de7b8888c84fc69f4847c4aeb7750761a847e`，没有复制本地上传、凭据或日志。

运行方式：Ubuntu 的 Node.js 22，systemd 服务 `kuzpscv`，专用系统用户。应用仍监听 `127.0.0.1:4318`。Nginx 在 HTTPS 443 提供只读展示页，HTTP 80 自动跳转（ACME 验证路径除外），公开 portfolio/repositories/health 读取接口；公网屏蔽 admin、session、其他 API 和写操作。内容工作室通过 SSH 本地端口转发访问，不能直接开放原始应用端口。

`deploy/kuzpscv.service` 与 `deploy/nginx.conf` 是服务器配置源，对应系统目录使用符号链接。使用 `systemctl status kuzpscv`、`journalctl -u kuzpscv` 查看运行状况，`systemctl restart kuzpscv` 重启。用户编辑数据在 `local-data/`，升级前备份，禁止覆盖。

网站已使用可信 IP 证书提供 HTTPS 443；管理面板内部使用 18443，通过 Nginx 的 `/panel/` 访问；Hermes 通过 `/hermes/` 访问，公网无需额外开放这些内部应用端口。证书续签使用 webroot，部署钩子同时重启面板并重载 Nginx。公开展示上线仍需满足服务器所在地的备案要求。不要把服务器地址、密码或凭据提交仓库。

校验：12 项自动化回归及语法/内容检查通过；公网主页与 health 返回 200，admin/session 返回 404，PUT portfolio 返回 403。Edge 无头浏览器已验证作品集内容渲染、1Panel 登录及刷新后的概览、Hermes 登录后的管理界面；媒体播放和消息渠道未验收。


路径适配：Hermes 使用原生 X-Forwarded-Prefix 支持；1Panel v2.4.2 使用代理响应替换，将前端 history 基路径改为 /panel/，并保留 /assets/、/public/、/api/v2/ 路由。升级面板后必须回归登录、导航与刷新。作品集只读代理清除 Origin，避免本机 Origin 校验阻止 HTTPS 模块资源；公网写入限制保留。



2026-11-06 入口调整：作品集统一位于 /kuzpscv/，根路径返回 404，预留未来应用中心；/panel/ 和 /hermes/ 保留。Nginx 去除作品集前缀转发到本机服务，并对 HTML、脚本中的资源/API/媒体地址做前缀适配，不修改用户媒体数据。原根路径作品集 API 已关闭。浏览器验证新入口完整渲染和刷新通过；写入仍返回 403，管理与 session 返回 404。

2026-11-06 深层路由修复：面板入口改为 /1panel/，旧 /panel/ 重定向到新入口。面板 JS/CSS 使用 /1panel/assets/ 独立路径并重写动态加载映射，避免旧根路由 bundle 缓存。Hermes 的动态预加载仍生成根 assets 地址，代理将依赖映射统一适配至 /hermes/route-assets/；HTML 与模块引用保持同一 URL，避免重复模块实例。已通过真实浏览器登录、面板应用商店导航/刷新、Hermes chat 深链接与终端内容加载检查。未发送模型消息。更新应用版本后需重新验证资源映射。

2026-11-09：修复外部分享进入作品集返回 Cross-site requests are not allowed。原本机服务拒绝 Sec-Fetch-Site: cross-site；仅在四个公开只读 Nginx 代理位置清除该头，保留 GET/HEAD 白名单与管理/API 限制。浏览器从独立站点实际点击进入，捕获 cross-site 导航后页面渲染成功、无 JS/HTTP 错误；资源/读取接口200，admin/session404，PUT403，Home 未授权401。尚待用户微信真机复测。
