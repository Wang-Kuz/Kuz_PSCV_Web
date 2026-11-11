# 页面与仓库边界

- KuzHomePage：Home 控制中心、页面管理、独立密码认证、配置方案、访问统计与 GitHub 同步入口。
- Kuz_PSCV_Web：公开品宣、项目列表、基础项目详情和内容数据 API；不再包含工作站源码副本。
- Personal-Workstation：project/ 下的工作站介绍、工具箱、工具、时间线、视觉与滚动逻辑。

公开路由：/kuzpscv/、/kuzpscv/?page=projects、/kuzpscv/?page=project-ID、/workstation/index.html、/workstation/studio.html。旧工作站路径兼容跳转。

PSCV 的 loopback 服务通过 WORKSTATION_ROOT 读取单独工作站部署目录，仅提供受限静态文件；不会发布其 Flask 后端。工作站内容配置经 Home 编辑，沿用 revision 校验与原子备份，不改变既有媒体位置。工作站页面目录元数据作为小型集成契约供 Home 与 PSCV 使用，工作站 HTML/CSS/JS 只存在于工作站仓库。

全站语言采用 localStorage kuz-language: zh/en。页面导航与板块选择分离，预览 focus 消息校验同源及父窗口。模板和历史静态数据不是已验证个人事实。
