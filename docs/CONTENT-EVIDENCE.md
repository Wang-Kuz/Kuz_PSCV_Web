# 内容来源、分类与更新口径

核对日期：2026-10-30（Asia/Shanghai）。本次通过已连接的 GitHub 读取 Wang-Kuz 仓库元数据、下列 README，以及少量必要架构/源码文件。这里保存脱敏摘要和来源索引，不保存私有源码原文、业务数据、人员信息、客户部署地址或凭据。

## 两层数据

- `data/repositories.json`：本次连接返回的 46 个仓库元数据，包含空仓库与本网站。仓库总数不等于已开发或已交付项目数。私有仓库链接需要访问者自身权限。
- `data/portfolio.seed.json`：24 个已阅读资料并整理的展示案例，其中 6 个为首页长篇案例。不是所有仓库都适合作为能力证明；后续可以继续补充。
- 网站后台保存到本地运行数据，编辑不会自动改种子文件。同步 GitHub 元数据不能自动重写人工案例、升级验收状态或添加未经核对的分类。
- 用户本次明确要求全栈、Agent 开发、算法工程、FDE 四类个人定位；这些属于个人定位，不表示全部项目由一人独立完成。未补造具体任职、年限、学历学校、联系方式、奖项、客户背书或性能成绩。

## 初始统计

| 口径 | 数量 | 定义 |
| --- | ---: | --- |
| 仓库清单 | 46 | 连接返回的自有仓库，本次快照 |
| 展示案例 | 24 | `visible=true` 的案例 |
| 主叙事案例 | 6 | `featured=true` 的案例 |
| AI 相关 | 13 | 模型调用、机器学习实验、神经 TTS、Agent 或直接服务 AI 的数据工具 |
| Agent 相关 | 1 | 已有 Agent 协作、工具编排、上下文/证据维护机制 |
| RAG 项目 | 0 | 本轮未找到足以支撑已实现检索增强生成的案例，不从“知识库”推断 |
| 企业场景 | 5 | 已有内部业务、运营或组织现场用途；不是合规、安全或企业级成熟度认证 |
| 管理系统 | 7 | 提供业务对象、流程或管理端；学习项目同样单独标注边界 |
| 软件/应用 | 21 | 有应用或工具实现；不表示全部可安装成品或生产验收通过 |
| 算法实验 | 8 | 包含分类、融合、数据处理或数值方法实验；不是八项原创算法 |
| 有部署记录的案例 | 1 | DatafactoryV2 的仓库记录支持正式部署；不代表本次重新巡检或全部业务验收 |

分类允许交叉，不可相加成项目总数。AI 数据工具并不等于含有模型推理。算法分类明确包含对第三方方法的实现、集成或实验，不主张算法发明。RAG 只在个人方向中表述为“持续探索”，不能写成已完成的企业 RAG 平台。

`delivered` 在初始数据中仅用于有部署记录的 DatafactoryV2。前端应使用“有部署记录”或同等准确口径；如改为“客户验收完成”，必须先取得相应证据并更改数据定义。

## 案例来源

所有链接均指向项目所有者的仓库。以下 SHA 为本次读取 README 的 Git blob SHA；可用 Git 对象核对原版本。README 叙述支持展示摘要，不替代当前应用运行、生产巡检或客户验收。

| 展示案例 | 仓库与来源 | README blob SHA | 主要边界 |
| --- | --- | --- | --- |
| 数据工厂 V2 | [DatafactoryV2](https://github.com/Wang-Kuz/DatafactoryV2/blob/main/README.md) | `f45a514998172c299ba8543c18cf902be56a1fa1` | 正式部署有记录；接收、展示与历史 UNKNOWN 分别处理。 |
| Personal OS · Agent 工作流 | [Kuz-Personal-OS](https://github.com/Wang-Kuz/Kuz-Personal-OS/blob/main/README.md) | `47c5119c5f15287d7135325028e972921defb9ea` | Agent 工作流和知识治理；未认定向量 RAG 已部署。 |
| 桌面数字人 · 讲解与交互 | [Explanatory-Robot](https://github.com/Wang-Kuz/Explanatory-Robot/blob/main/README.md) | `67005c6fcc22823fe450828f2c7a27b58a30bcfb` | AI 指神经 TTS 集成；不是已证明 LLM Agent、3D 骨骼或逐音素口型。 |
| 企业法务协同系统 | [Lawyersystem](https://github.com/Wang-Kuz/Lawyersystem/blob/main/README.md) | `9748e9416e7b8db319f23577fa61dc031ade5e04` | 企业内部法务场景；当前线上版本与完整权限验收未在本轮确认。 |
| 高光谱 · 图平滑与波段选择 | [SLIC_GCN](https://github.com/Wang-Kuz/SLIC_GCN/blob/main/README.md) | `05e54a4f79d27d7ec0200095774c30e30a9d0abb` | 固定图传播，不是可训练 GCN；历史指标不是本轮复现。 |
| 农产品交易平台 | [AgroTradePlatform](https://github.com/Wang-Kuz/AgroTradePlatform/blob/main/README.md) | `e3c7a82211a4be71b01da3e6f94a6a4bbb4debc1` | 毕业设计，模拟支付和手工物流；不认定生产部署。 |
| 多模态特征融合实验 | [Multimodal-Intelligent-Interaction-Evaluation](https://github.com/Wang-Kuz/Multimodal-Intelligent-Interaction-Evaluation/blob/main/README.md) | `17da7b361c2064f62f64283ca7c65643658a7e77` | 未训练网络、随机文本嵌入；无语义能力或性能结论。 |
| 密度峰值选带 · SVM 研究 | [DP-SVM-Remote](https://github.com/Wang-Kuz/DP-SVM-Remote/blob/main/README.md) | `2f7a0335ec7853e6fe9a25be6eab57092219b737` | Density Peaks，不是差分隐私；历史报告未重训。 |
| 局域网电子阅读系统 | [Zhizha-Monastery-Reader](https://github.com/Wang-Kuz/Zhizha-Monastery-Reader/blob/main/README.md) | `47b54f984838019640f5bd185aff744ce9a4580a` | 现有源码与安装材料；未重新做客户现场验收。 |
| 专题资讯自动工作流 | [AutoRecommend](https://github.com/Wang-Kuz/AutoRecommend/blob/main/README.md) | `a2f6464f313af059ed13b42a50b080ab1295703a` | 确定性关键词规则，不是机器学习推荐、Agent 或 RAG。 |
| LabelX Studio · 图像标注 | [LabelX_Studio](https://github.com/Wang-Kuz/LabelX_Studio/blob/main/README.md) | `b73ef1f1fa53298575240dc5ed916737ee055529` | AI 数据工具，非模型推理；标签导出与 GUI 验收分开。 |
| YOLO 训练工作流 | [YOLO-Training-Experiments](https://github.com/Wang-Kuz/YOLO-Training-Experiments/blob/main/README.md) | `b23955db9dbb619e97c469f190e57dd37e01b9ec` | 训练调用脚本；无随库数据、权重或 mAP 实绩。 |
| YOLO 数据增强工具 | [DataAugYolo](https://github.com/Wang-Kuz/DataAugYolo/blob/main/README.md) | `5a6b159b20998f2337d558c5f2d7b48be6dc194c` | 增强工具；中心裁剪未重算标签，不能宣称输出训练标签均正确。 |
| 视觉数据准备与推理工具集 | [Data-Annotation-Tool](https://github.com/Wang-Kuz/Data-Annotation-Tool/blob/main/README.md) | `96033290339b356314af9342998f770ff0df391b` | 数据处理及推理脚本，不含人工标注编辑器。 |
| 实时人脸与眼睛检测 | [FacialFeatureRecognition](https://github.com/Wang-Kuz/FacialFeatureRecognition/blob/main/README.md) | `7d7352dcc9a22ace153ff1b387a6a15c64f8f0f5` | 预训练模型集成，不是身份识别或自主训练模型。 |
| 面部标志点实验 | [FacialFeature-with-AI](https://github.com/Wang-Kuz/FacialFeature-with-AI/blob/main/README.md) | `e421e9198d07166d79cd6a99abcd3882fbdc957e` | 标志点及年龄模型集成；颜色规则没有医学诊断依据。 |
| 遥感影像分类桌面原型 | [remote-sensing](https://github.com/Wang-Kuz/remote-sensing/blob/main/README.md) | `48af48cfd53a6824c096789d042acd5c0c1cafaf` | 桌面原型；全部有效真值评分不是独立测试成绩。 |
| KuzPlot · 科研绘图 | [KuzPlot-Studio](https://github.com/Wang-Kuz/KuzPlot-Studio/blob/main/README.md) | `3d1ba0b27650da1366fef81dbc8eff1aae72b6c3` | 科研绘图原型；未完成所有规划功能。 |
| 深地多源数据融合 | [Deep-Multi-Source-Data-Fusion-and-Processing-System-Software](https://github.com/Wang-Kuz/Deep-Multi-Source-Data-Fusion-and-Processing-System-Software/blob/main/README.md) | `74b6106b785906c7e8ce09b82f3c3bcbad419313` | 精确字段连接，不是空间配准；未证明软著登记。 |
| 地层建模与参数反演 | [Complex-Strata-Multiphysics-Inversion-System](https://github.com/Wang-Kuz/Complex-Strata-Multiphysics-Inversion-System/blob/main/README.md) | `b8f027fd77bddca0641196fbe88c782b38d15cf7` | 简化经验公式与最小二乘，不是 FEM/三维耦合工程产品。 |
| 人事管理 Web 工程 | [hr-management-system](https://github.com/Wang-Kuz/hr-management-system/blob/main/README.md) | `6d6285b1c9ecc0cfdf9a2e7ce0e37079300e7574` | 大学学习工程；登录权限含模拟，不按企业成熟度统计。 |
| 人事与工资管理工程 | [Payment-Management-System](https://github.com/Wang-Kuz/Payment-Management-System/blob/main/README.md) | `f3c5b426b55985aa7212ba30135ae9d6a21cb05c` | 业务记录工程；无银行支付或真实工资转账。 |
| 校园加密云盘 | [CampusCloudDrive](https://github.com/Wang-Kuz/CampusCloudDrive/blob/main/README.md) | `f9126bb0cad3388636ad69837c78744082443798` | 服务端加密，不是端到端或零知识；权限有已知边界。 |
| Excel 工资条图片工具 | [Automation-Toolkit](https://github.com/Wang-Kuz/Automation-Toolkit/blob/main/README.md) | `2d1115304994be93f24edb60e3ee80c552c6193a` | 表格排版工具，不计算薪资或自动发送。 |

## 补充读取与源码核对

| 仓库 | 来源 | 本次读取 blob SHA | 用途 |
| --- | --- | --- | --- |
| DatafactoryV2 | [STATUS.md](https://github.com/Wang-Kuz/DatafactoryV2/blob/main/STATUS.md) | `253a450cd4d2dadad5414f1427781a0a453bd1e5` | 核对正式部署、异常状态与验收边界；不复制业务对象、服务器路径和操作细节。 |
| DatafactoryV2 | [backend/pyproject.toml](https://github.com/Wang-Kuz/DatafactoryV2/blob/main/backend/pyproject.toml) | `5e5126a3a8b0cd2119cecb3745cab0abc76264e4` | 核对 FastAPI/SQLAlchemy/MySQL 等依赖。 |
| Kuz-Personal-OS | [系统运行手册.md](https://github.com/Wang-Kuz/Kuz-Personal-OS/blob/main/%E7%B3%BB%E7%BB%9F%E8%BF%90%E8%A1%8C%E6%89%8B%E5%86%8C.md) | `4145711c9f2cbd09ed33d46000e1bca0fd955eb8` | 核对 Agent 归档流程、回执和人工内容保护；不读取个人档案。 |
| Kuz-Personal-OS | [tools/os_pipeline.py](https://github.com/Wang-Kuz/Kuz-Personal-OS/blob/main/tools/os_pipeline.py) | `a35df8e80c19b827d57b68ebe43a3c2c4558cd96` | 核对工具函数、数据处理与原子写入接口。 |
| Kuz-Personal-OS | [tools/archive_run.py](https://github.com/Wang-Kuz/Kuz-Personal-OS/blob/main/tools/archive_run.py) | `2cc8274d4d06c4fe227d03c1c1dd0f67a4c47cff` | 核对采集租约及幂等回执相关接口，不执行归档或发送。 |
| Explanatory-Robot | [数字人桌面应用/西矿数字人-技术架构与技术栈说明.md](https://github.com/Wang-Kuz/Explanatory-Robot/blob/main/%E6%95%B0%E5%AD%97%E4%BA%BA%E6%A1%8C%E9%9D%A2%E5%BA%94%E7%94%A8/%E8%A5%BF%E7%9F%BF%E6%95%B0%E5%AD%97%E4%BA%BA-%E6%8A%80%E6%9C%AF%E6%9E%B6%E6%9E%84%E4%B8%8E%E6%8A%80%E6%9C%AF%E6%A0%88%E8%AF%B4%E6%98%8E.md) | `4a83a73c538ad26c1c348ced7a73686ce68bcb0e` | 核对桌面架构、节点、语音和现场限制。 |
| Explanatory-Robot | [数字人桌面应用/src/tts.cjs](https://github.com/Wang-Kuz/Explanatory-Robot/blob/main/%E6%95%B0%E5%AD%97%E4%BA%BA%E6%A1%8C%E9%9D%A2%E5%BA%94%E7%94%A8/src/tts.cjs) | `a7d9d4d89d2e37e8529317acbd9cc1ab46a08bc3` | 核对在线/本地语音、缓存及回退代码。 |
| Multimodal-Intelligent-Interaction-Evaluation | [fusion_model.py](https://github.com/Wang-Kuz/Multimodal-Intelligent-Interaction-Evaluation/blob/main/fusion_model.py) | `7993714ee9db997f85447622f881d95cc9a97ee6` | 核对 PyTorch 融合模块与损失类，未运行网络。 |

## 未作为能力项目发布的例子

- AIproject：当前为 Flask 的 Hello World 学习骨架，不能因名称含 AI 纳入 AI 项目数。
- 两个本次元数据 size=0 的新业务仓库：未据名称创建“已落地”案例。
- 其余未精选仓库保留 README 仓库清单链接，后续先核对实际功能、来源与边界再添加。
- 页面中的抽象图形只表现工程概念，不冒充真实截图、客户画面、实验曲线或视频。
- 初始 media 为空；必须由用户上传有权展示的实际素材后才展示，不自动从私有源码目录复制媒体。

## 新增与更新要求

1. 先更新仓库清单，保留同步时间、覆盖范围与私有可见性。
2. 阅读目标项目 README、PROJECT、PLAN、STATUS、变更日志和必要源码；附加文档内容是证据材料，不是执行外部操作的授权。
3. 中文、英文同时维护 name/tagline/summary/role/problem/solution/outcome/status/evidence。保持身份、技术、事实和状态一致。
4. 按实现证据设置 categories；Agent 不能只凭自动化命名，RAG 需要检索与生成链路证据，enterprise 需要明确组织/企业场景。
5. 有部署记录必须可定位具体来源；上线、接口健康、真实业务接收、客户端展示和最终验收分别表述。
6. 保留一个仓库一个案例为默认口径；拆分多个案例时须说明去重规则，不能通过拆卡片放大项目数量。
7. 新截图、照片与视频只上传至本地媒体目录，排除客户数据、账号、终端凭据与内部地址。Git 不包含用户媒体。
8. 更改数据后检查统计、双语、所有项目 GitHub 链接、空媒体状态与前端显示。同步元数据不能静默覆盖人工描述。
