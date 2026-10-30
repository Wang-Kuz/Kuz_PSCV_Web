# Kuz — Personal Showcase & CV

一个持续生长的双语个人作品集：全栈开发、Agent 工程、算法实践与 FDE。以真实项目为线索，用产品叙事展示从问题分析、技术实现到交付的能力。

A bilingual, locally hosted portfolio for full-stack development, Agent engineering, algorithms and forward-deployed engineering. Curated project stories, editable content, and a local media library.

## 本地启动

需要 **Node.js 22 或更新版本**；无需安装 npm 依赖。Windows 双击根目录 **`启动网页.cmd`**，自动打开 [展示页](http://127.0.0.1:4318)。双击 `停止网页.cmd` 可停止由启动脚本创建的服务。已运行时重复启动会复用服务。

命令行方式：

```powershell
npm start
```

在终端运行时用 Ctrl+C 停止。网页需要本地 HTTP 服务，不能直接双击 HTML 来使用上传与编辑功能。没有部署到云端。

## 使用与维护

- 展示页：中英切换、动画、滚动渐进呈现、统计、精选案例、筛选、GitHub 链接、项目详情媒体库。
- 1.1 视觉：大字与大数字层级、鼠标驱动金属曲面、滚动镜头推进、逐词亮起、六类项目动态图形与局部光影。支持减少动态效果，WebGL 不可用或运行中丢失时降级 Canvas；维护参见 [视觉与交互规范](docs/DESIGN.md)。
- [内容工作室](http://127.0.0.1:4318/admin)：修改双语个人介绍、页面文案、项目、分类、排序和显示状态；上传视频/截图/照片；设置视频秒数节点；保存后刷新展示页。
- 隐藏管理入口为页脚 `◌`，快捷键 `Alt + Shift + E`，直接访问 `/admin` 也可进入。仅绑定本机回环地址；隐藏按钮不是身份认证。
- 本机内容位于 `local-data/portfolio.json`，上传位于 `local-data/uploads/`；每次保存前将旧内容备份到 `local-data/backups/`。这些目录不进入 Git。
- [维护手册](docs/MAINTENANCE.md)说明添加案例、GitHub 同步、内容与媒体备份、故障恢复和 Agent 工作方式。
- [内容证据](docs/CONTENT-EVIDENCE.md)说明每个案例的依据与边界。仓库数量、展示项目、交付数量是不同口径；分类可以重叠。

视频可直接播放并跳到指定章节；推荐 H.264 MP4 或 WebM。上传 MOV 不保证当前浏览器支持其内部编码。单文件限 250 MiB。未提供的视频与截图保持为空，不使用伪造演示。

## 宣传资料

网站与工程介绍完整覆盖 46 个仓库条目，精选叙事保留 6 个。最终 PDF 位于 `output/pdf/`，Word 位于 `output/docx/`；导出、逐页核验与长期更新参见 [宣传资料维护](docs/EXPORT.md)。

## GitHub 更新

双击 `同步GitHub.cmd`、在后台点击同步，或运行：

```powershell
npm run sync:github
```

已登录的 GitHub CLI 用于分页读取全部自有仓库；不可用时回退到公开 API，保留既有私有条目并注明部分覆盖。同步只更新 `data/repositories.json` 与下方生成索引，不覆盖人工案例、上传资料或本地编辑。不自动提交或推送，不把新仓库名称推断为 AI/企业案例。新增项目在后台整理或由 Agent 按维护手册录入。

## 开发入口

| 路径 | 用途 |
| --- | --- |
| `frontend/` | 原生 ES Modules 展示页与内容工作室 |
| `backend/` | Node 原生 HTTP、本地数据与媒体服务 |
| `data/portfolio.seed.json` | 经整理可公开的初始双语内容 |
| `data/repositories.json` | GitHub 仓库元数据索引 |
| `scripts/` | 启停、同步、验证脚本 |
| `tests/` | HTTP、持久化、安全边界、同步与统计回归 |
| `local-data/` | 不进 Git 的本机编辑、上传、备份、运行日志 |

```powershell
npm test
npm run check
git diff --check
```

这是无需打包的本地应用，`npm run check` 执行语法、内容 schema、仓库索引与文档链接验证；不能把它描述为浏览器实测或生产验收。

## Agent 文档入口

先读 [AGENTS.md](AGENTS.md)、[PROJECT.md](PROJECT.md)、[PLAN.md](PLAN.md)、[STATUS.md](STATUS.md)、[变更与发布日志](变更与发布日志.md)。再读 [架构](docs/ARCHITECTURE.md)、[数据/API 合同](docs/CONTRACT.md)、[维护手册](docs/MAINTENANCE.md)、[验证清单](版本核验清单.md)。

目标仓库：[Wang-Kuz/Kuz_PSCV_Web](https://github.com/Wang-Kuz/Kuz_PSCV_Web)。公开库只含源码、整理后的项目摘要及用户要求的仓库链接；不含私有项目源码、凭证和上传文件。

## 全部 GitHub 仓库

以下区块由同步脚本维护；Private 链接只有获授权的 GitHub 用户能打开。

<!-- REPOSITORIES:START -->

仓库索引更新：2026-10-30 · 46 个仓库 · 账号仓库清单。私有仓库需要访问权限；仓库数量不等于已交付项目数量。

| 仓库 / Repository | 访问 / Visibility |
| --- | --- |
| [AgroTradePlatform](https://github.com/Wang-Kuz/AgroTradePlatform) | Private · 需授权 |
| [AIproject](https://github.com/Wang-Kuz/AIproject) | Private · 需授权 |
| [Automation-Toolkit](https://github.com/Wang-Kuz/Automation-Toolkit) | Private · 需授权 |
| [AutoRecommend](https://github.com/Wang-Kuz/AutoRecommend) | Private · 需授权 |
| [BMIcalculate](https://github.com/Wang-Kuz/BMIcalculate) | Private · 需授权 |
| [CampusCloudDrive](https://github.com/Wang-Kuz/CampusCloudDrive) | Private · 需授权 |
| [CarParkingSystem](https://github.com/Wang-Kuz/CarParkingSystem) | Private · 需授权 |
| [CARSystem-2](https://github.com/Wang-Kuz/CARSystem-2) | Private · 需授权 |
| [CARVehicleManagementSystem](https://github.com/Wang-Kuz/CARVehicleManagementSystem) | Private · 需授权 |
| [Complex-Strata-Multiphysics-Inversion-System](https://github.com/Wang-Kuz/Complex-Strata-Multiphysics-Inversion-System) | Private · 需授权 |
| [CompressionTool](https://github.com/Wang-Kuz/CompressionTool) | Private · 需授权 |
| [Data-Annotation-Tool](https://github.com/Wang-Kuz/Data-Annotation-Tool) | Private · 需授权 |
| [DataAugYolo](https://github.com/Wang-Kuz/DataAugYolo) | Private · 需授权 |
| [DatafactoryV2](https://github.com/Wang-Kuz/DatafactoryV2) | Private · 需授权 |
| [Deep-Multi-Source-Data-Fusion-and-Processing-System-Software](https://github.com/Wang-Kuz/Deep-Multi-Source-Data-Fusion-and-Processing-System-Software) | Private · 需授权 |
| [DP-SVM-Remote](https://github.com/Wang-Kuz/DP-SVM-Remote) | Private · 需授权 |
| [Explanatory-Robot](https://github.com/Wang-Kuz/Explanatory-Robot) | Private · 需授权 |
| [FacialFeature-with-AI](https://github.com/Wang-Kuz/FacialFeature-with-AI) | Private · 需授权 |
| [FacialFeatureRecognition](https://github.com/Wang-Kuz/FacialFeatureRecognition) | Private · 需授权 |
| [hr-management-system](https://github.com/Wang-Kuz/hr-management-system) | Private · 需授权 |
| [Individual-Consumption](https://github.com/Wang-Kuz/Individual-Consumption) | Private · 需授权 |
| [Intelligent-Job-Recommendation-System-Job-Alerts](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts) | Private · 需授权 |
| [InventoryManagementSystem](https://github.com/Wang-Kuz/InventoryManagementSystem) | Private · 需授权 |
| [Kuz_PSCV_Web](https://github.com/Wang-Kuz/Kuz_PSCV_Web) | Public |
| [Kuz-Personal-OS](https://github.com/Wang-Kuz/Kuz-Personal-OS) | Private · 需授权 |
| [KuzPlot-Studio](https://github.com/Wang-Kuz/KuzPlot-Studio) | Private · 需授权 |
| [LabelX_Studio](https://github.com/Wang-Kuz/LabelX_Studio) | Private · 需授权 |
| [Lawyersystem](https://github.com/Wang-Kuz/Lawyersystem) | Private · 需授权 |
| [Library-Management-System](https://github.com/Wang-Kuz/Library-Management-System) | Private · 需授权 |
| [Lostfound](https://github.com/Wang-Kuz/Lostfound) | Private · 需授权 |
| [LuoHanGuoJinGroup](https://github.com/Wang-Kuz/LuoHanGuoJinGroup) | Private · 需授权 |
| [Multimodal-Intelligent-Interaction-Evaluation](https://github.com/Wang-Kuz/Multimodal-Intelligent-Interaction-Evaluation) | Private · 需授权 |
| [Payment-Management-System](https://github.com/Wang-Kuz/Payment-Management-System) | Private · 需授权 |
| [Personal-Workstation](https://github.com/Wang-Kuz/Personal-Workstation) | Private · 需授权 |
| [remote-sensing](https://github.com/Wang-Kuz/remote-sensing) | Private · 需授权 |
| [SafeUpload](https://github.com/Wang-Kuz/SafeUpload) | Private · 需授权 |
| [Service-Oriented-Private-Domain-Operations-News-Push-Assistant](https://github.com/Wang-Kuz/Service-Oriented-Private-Domain-Operations-News-Push-Assistant) | Private · 需授权 |
| [SLIC_GCN](https://github.com/Wang-Kuz/SLIC_GCN) | Private · 需授权 |
| [Snake-Game](https://github.com/Wang-Kuz/Snake-Game) | Private · 需授权 |
| [Test-FirstUseGithub](https://github.com/Wang-Kuz/Test-FirstUseGithub) | Private · 需授权 |
| [TIFproject](https://github.com/Wang-Kuz/TIFproject) | Private · 需授权 |
| [Workflow-Software-Copyright](https://github.com/Wang-Kuz/Workflow-Software-Copyright) | Private · 需授权 |
| [YLZ34-Project](https://github.com/Wang-Kuz/YLZ34-Project) | Private · 需授权 |
| [YOLO-Training-Experiments](https://github.com/Wang-Kuz/YOLO-Training-Experiments) | Private · 需授权 |
| [Zhizha-Monastery-Reader](https://github.com/Wang-Kuz/Zhizha-Monastery-Reader) | Private · 需授权 |
| [ZZC-T_Contact_System](https://github.com/Wang-Kuz/ZZC-T_Contact_System) | Private · 需授权 |

<!-- REPOSITORIES:END -->
