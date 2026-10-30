# 内容来源、分类与更新口径

核对日期：2026-10-30（Asia/Shanghai）。本次通过已连接的 GitHub 读取 Wang-Kuz 仓库元数据、下列 README，以及少量必要架构/源码文件。这里保存脱敏摘要和来源索引，不保存私有源码原文、业务数据、人员信息、客户部署地址或凭据。

## 两层数据

- `data/repositories.json`：本次连接返回的 46 个仓库元数据，包含学习骨架、资料库与本网站。仓库总数不等于已开发或已交付项目数。私有仓库链接需要访问者自身权限。
- `data/portfolio.seed.json`：46 个已阅读资料并整理的双语条目，与仓库清单一一对应，其中 6 个为首页长篇案例。学习骨架和资料库也展示真实状态，不作为交付能力证明。
- 网站后台保存到本地运行数据，编辑不会自动改种子文件。同步 GitHub 元数据不能自动重写人工案例、升级验收状态或添加未经核对的分类。
- 用户本次明确要求全栈、Agent 开发、算法工程、FDE 四类个人定位；这些属于个人定位，不表示全部项目由一人独立完成。未补造具体任职、年限、学历学校、联系方式、奖项、客户背书或性能成绩。

## 初始统计

| 口径 | 数量 | 定义 |
| --- | ---: | --- |
| 仓库清单 | 46 | 连接返回的自有仓库，本次快照 |
| 展示案例 | 46 | `visible=true` 的案例 |
| 主叙事案例 | 6 | `featured=true` 的案例 |
| AI 相关 | 18 | 模型调用、机器学习实验、神经 TTS、Agent 或直接服务 AI 的数据工具 |
| Agent 相关 | 3 | 已有 Agent 协作、工具编排、上下文/证据维护机制 |
| RAG 项目 | 0 | 本轮未找到足以支撑已实现检索增强生成的案例，不从“知识库”推断 |
| 企业场景 | 7 | 已有内部业务、运营或组织现场用途；不是合规、安全或企业级成熟度认证 |
| 管理系统 | 18 | 提供业务对象、流程或管理端；学习项目同样单独标注边界 |
| 软件/应用 | 39 | 有应用或工具实现；不表示全部可安装成品或生产验收通过 |
| 算法实验 | 10 | 包含分类、融合、数据处理或数值方法实验；不是原创算法数量 |
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

## 全量收录后的事实边界

- AIproject：当前为 Flask 的 Hello World 学习骨架，不能因名称含 AI 纳入 AI 项目数。
- 岗位推荐与私域新闻推送仓库的旧元数据 size=0 已过时，本次读取到实际实现；按源码标注 AI/Agent 和企业运营场景，仍不标记部署验收。
- 全部 46 个仓库现在均有介绍。Workflow-Software-Copyright 是模板资料库，YLZ34-Project 是数据资料库，均不计入软件、AI 或算法实现。
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

## 2026-10-30 补齐的 22 个条目

下列为本次只读核对的路径和 blob SHA。所有新增条目均未标记生产部署，原型与学习边界见各条目 outcome/evidence。

| 项目 | 读取路径与版本 |
| --- | --- |
| Flask 入门示例 | [README.md](https://github.com/Wang-Kuz/AIproject/blob/main/README.md) `013cdab6b557fed241e5fc89950b80fdc99ac979`；[app.py](https://github.com/Wang-Kuz/AIproject/blob/main/app.py) `5d20a01c8c95d62b4dc9fdaa266772e2365e933e` |
| JavaFX BMI 计算练习 | [README.md](https://github.com/Wang-Kuz/BMIcalculate/blob/main/README.md) `daae8f7fb25c1496005dc9fb5283533a3bbb4739`；[src/main/java/org/example/demo/BMIController.java](https://github.com/Wang-Kuz/BMIcalculate/blob/main/src/main/java/org/example/demo/BMIController.java) `8e307e1e6326ba7f294937fd1db5df2df7386692` |
| 停车场可视化与 OCR 演示 | [README.md](https://github.com/Wang-Kuz/CarParkingSystem/blob/main/README.md) `2f7006d8a0eab8b7cc654a86bbc43097111a62f1`；[backend/app.py](https://github.com/Wang-Kuz/CarParkingSystem/blob/main/backend/app.py) `6a0ca3c2b0cb74704a0c084c4a8d564484547139`；[backend/plate_recognition.py](https://github.com/Wang-Kuz/CarParkingSystem/blob/main/backend/plate_recognition.py) `ff81ab2df5a1d07d88cb2c3679267ba9871d32b5` |
| 车辆库存与驾驶人登记 | [README.md](https://github.com/Wang-Kuz/CARSystem-2/blob/main/README.md) `d265bf900e3f4661222ad4954cba80859ad28fa2`；[src/VehicleManagement.java](https://github.com/Wang-Kuz/CARSystem-2/blob/main/src/VehicleManagement.java) `00bf64b0bbc5032fc07be47e3990ae0c3ba38460` |
| 车库车辆管理练习 | [README.md](https://github.com/Wang-Kuz/CARVehicleManagementSystem/blob/main/README.md) `d5605e389cb1051c4780382f0a163f749fbf095e`；[src/main/java/com/example/vehiclemanagement/VehicleService.java](https://github.com/Wang-Kuz/CARVehicleManagementSystem/blob/main/src/main/java/com/example/vehiclemanagement/VehicleService.java) `31ac939f6496ff648dbb336d465f94d65643e956` |
| Java ZIP 压缩与解压工具 | [README.md](https://github.com/Wang-Kuz/CompressionTool/blob/main/README.md) `5cf34eda71d3142f1431b8b45e8ef6f88cbb18bb`；[src/main/java/org/example/ZipCompressor.java](https://github.com/Wang-Kuz/CompressionTool/blob/main/src/main/java/org/example/ZipCompressor.java) `0268d73ca048f02a010085f06615b859966f86af`；[src/main/java/org/example/ZipDecompressor.java](https://github.com/Wang-Kuz/CompressionTool/blob/main/src/main/java/org/example/ZipDecompressor.java) `b3f176e20ecb2bfff0c68ab14030f3fe535bd9e8` |
| 消费数据可视化演示 | [README.md](https://github.com/Wang-Kuz/Individual-Consumption/blob/main/README.md) `17f7b1cd024494f58e4fd35eea5d310401cbd684`；[personal/src/App.vue](https://github.com/Wang-Kuz/Individual-Consumption/blob/main/personal/src/App.vue) `2c6c3b8ca5602c19a48141bdf5a25817cda324d7` |
| 物资出入库管理实践 | [README.md](https://github.com/Wang-Kuz/InventoryManagementSystem/blob/main/README.md) `a9e4dc62a942845e04b871e8743595de301d4110`；[src/main/java/InventoryManagementSystem.java](https://github.com/Wang-Kuz/InventoryManagementSystem/blob/main/src/main/java/InventoryManagementSystem.java) `5e00d1794a40adbbdd41f16814b408db063da6d9` |
| 岗位推荐 · Hermes 智能体 | [README.md](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts/blob/main/README.md) `316f152f8352b9754e72284e0b273182a1d15ac3`；[app/hermes_bridge.py](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts/blob/main/app/hermes_bridge.py) `df19192609089c28a309bc4aef43965e00b58576`；[app/services/matching.py](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts/blob/main/app/services/matching.py) `b6c12ccaf15111bc52c9ecfbfa847ddb36b89ca0`；[app/services/conversation_agent.py](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts/blob/main/app/services/conversation_agent.py) `f239dce500c73ef373546a2d1108e5bc0745f9af`；[app/mcp_server.py](https://github.com/Wang-Kuz/Intelligent-Job-Recommendation-System-Job-Alerts/blob/main/app/mcp_server.py) `5abc4a5ca039c0eeb84424ab01529ed3504cf75d` |
| 桌面图书管理实践 | [README.md](https://github.com/Wang-Kuz/Library-Management-System/blob/main/README.md) `3196c47e6f45cd5dd460197177715aabbe0e3291`；[src/BookManager.java](https://github.com/Wang-Kuz/Library-Management-System/blob/main/src/BookManager.java) `cb8788ee7c27c71cab81b95033c9423ddf2eef5a`；[src/TransactionManager.java](https://github.com/Wang-Kuz/Library-Management-System/blob/main/src/TransactionManager.java) `0e3eda8e0f08fd612c1bbc32f6a83f26a74cc49e` |
| 校园失物招领平台 | [README.md](https://github.com/Wang-Kuz/Lostfound/blob/main/README.md) `97776d2584dfc6ed68a7a59a766d399711b68b36`；[backend/routes/item_routes.py](https://github.com/Wang-Kuz/Lostfound/blob/main/backend/routes/item_routes.py) `f352e6d2581ea8c015defc8de43ba12b2f101ebf` |
| 三角色乐队管理系统 | [README.md](https://github.com/Wang-Kuz/LuoHanGuoJinGroup/blob/main/README.md) `1291d4537885e022bf2416eb00901d8ccd383475`；[pom.xml](https://github.com/Wang-Kuz/LuoHanGuoJinGroup/blob/main/pom.xml) `d34989f33687f710312938301e5ccf529e486cc2`；[src/main/java/com/example/servlet/LoginServlet.java](https://github.com/Wang-Kuz/LuoHanGuoJinGroup/blob/main/src/main/java/com/example/servlet/LoginServlet.java) `5080e65320f352dda03db20a9b56ed87764ba0f9`；[src/main/java/com/example/servlet/band/AlbumAddServlet.java](https://github.com/Wang-Kuz/LuoHanGuoJinGroup/blob/main/src/main/java/com/example/servlet/band/AlbumAddServlet.java) `c062322436074be906e5db9da6b820abab3b05ad` |
| 个人工作站 · 网页与工具原型 | [README.md](https://github.com/Wang-Kuz/Personal-Workstation/blob/main/README.md) `faf92d126a32b23b5aaf9c095c6d2226a178454c`；[project/tools/algorithm-learn.html](https://github.com/Wang-Kuz/Personal-Workstation/blob/main/project/tools/algorithm-learn.html) `2b7b1f1341cd4ceae1e079c59b8fb3b72f847d2b`；[project/backend/api.py](https://github.com/Wang-Kuz/Personal-Workstation/blob/main/project/backend/api.py) `53eaa44652c0a1e59703c3710d6fd356f2b7f1a8` |
| SafeUpload · 加密文件管理实验 | [README.md](https://github.com/Wang-Kuz/SafeUpload/blob/main/README.md) `86f2d5ff3598dc5d888375373eace4a8dd841b6b`；[app/utils/crypto.py](https://github.com/Wang-Kuz/SafeUpload/blob/main/app/utils/crypto.py) `bcab3c1cd3a8c89674ba094168b925c78d7231e4`；[app/routes/main.py](https://github.com/Wang-Kuz/SafeUpload/blob/main/app/routes/main.py) `db295b6c37031f2cb303a90130f0f563c7a20aec` |
| 私域情报官 · 多 Agent 新闻工作流 | [README.md](https://github.com/Wang-Kuz/Service-Oriented-Private-Domain-Operations-News-Push-Assistant/blob/main/README.md) `a1424f034b52c7058702bc783e94d0ac1de33eeb`；[app/pipeline.py](https://github.com/Wang-Kuz/Service-Oriented-Private-Domain-Operations-News-Push-Assistant/blob/main/app/pipeline.py) `e00d7298d21038a5cf2940d92a4324b6f0726cfa`；[app/agents.py](https://github.com/Wang-Kuz/Service-Oriented-Private-Domain-Operations-News-Push-Assistant/blob/main/app/agents.py) `59adbf62fc030f4196ed86cd1086704f5daacf92`；[app/delivery_dispatcher.py](https://github.com/Wang-Kuz/Service-Oriented-Private-Domain-Operations-News-Push-Assistant/blob/main/app/delivery_dispatcher.py) `e28636712fef48a88091bfe2055fca71b808a004` |
| Java 贪吃蛇小游戏 | [README.md](https://github.com/Wang-Kuz/Snake-Game/blob/main/README.md) `02b876b965b7fd7bd3cd903d0d2e340d386139ad`；[src/GamePanel.java](https://github.com/Wang-Kuz/Snake-Game/blob/main/src/GamePanel.java) `46f752641af129b1e1c631254f4749363dba0c08` |
| Python 基础与遥感学习集 | [README.md](https://github.com/Wang-Kuz/Test-FirstUseGithub/blob/test-1/README.md) `819dfd157da6a7f152cad8a74c13511af85d0ea2`；[04_oop/01_classes_and_objects.py](https://github.com/Wang-Kuz/Test-FirstUseGithub/blob/test-1/04_oop/01_classes_and_objects.py) `ba2dac88777742f890a822741a7f3350df7d0167`；[remote_sensing/03_image_analysis/01_image_analysis.py](https://github.com/Wang-Kuz/Test-FirstUseGithub/blob/test-1/remote_sensing/03_image_analysis/01_image_analysis.py) `4a48f6ab9664c7e72415f41497535bccc1365f2a` |
| 高光谱遥感算法实验工程 | [README.md](https://github.com/Wang-Kuz/TIFproject/blob/main/README.md) `f7ca8283e5ee480e56fd47776658ba886dfdc03e`；[band_selection/band_selection.py](https://github.com/Wang-Kuz/TIFproject/blob/main/band_selection/band_selection.py) `8fcbd5bbfa3b399affec62e6da45620b8bfac2f2`；[Algorithm/cnn_visualization.py](https://github.com/Wang-Kuz/TIFproject/blob/main/Algorithm/cnn_visualization.py) `7055128992608f2b4f73266a4213efac6a75e943` |
| 软件著作权材料模板库 | [README.md](https://github.com/Wang-Kuz/Workflow-Software-Copyright/blob/main/README.md) `1b2a6730f2a249af891d875a08962db89f2936ad`；[docs/模板目录与用途.md](https://github.com/Wang-Kuz/Workflow-Software-Copyright/blob/main/docs/%E6%A8%A1%E6%9D%BF%E7%9B%AE%E5%BD%95%E4%B8%8E%E7%94%A8%E9%80%94.md) `508a1de7dd9fc194cf4a9149f3be0e59526aa2b0` |
| Titanic 分类学习资料 | [README.md](https://github.com/Wang-Kuz/YLZ34-Project/blob/main/README.md) `e63bee477ff1d9550fc8a1bf7f21dda6a6b23083`；[docs/数据字典与质量.md](https://github.com/Wang-Kuz/YLZ34-Project/blob/main/docs/%E6%95%B0%E6%8D%AE%E5%AD%97%E5%85%B8%E4%B8%8E%E8%B4%A8%E9%87%8F.md) `5c9245a2b2a8c0b8a5218254292591a6b834fd9a` |
| ZZC-T 桌面通讯录 | [README.md](https://github.com/Wang-Kuz/ZZC-T_Contact_System/blob/main/README.md) `7275803f5edfc2ff06bd12515e8e36e164b48ffc`；[src/main/java/com/contact/system/App.java](https://github.com/Wang-Kuz/ZZC-T_Contact_System/blob/main/src/main/java/com/contact/system/App.java) `698a9fe4e51935c062e3843cf1f181a612d63352`；[src/main/java/com/contact/system/dao/ContactDAO.java](https://github.com/Wang-Kuz/ZZC-T_Contact_System/blob/main/src/main/java/com/contact/system/dao/ContactDAO.java) `82420357ea15f783ab25e235963798bd73109c1a`；[pom.xml](https://github.com/Wang-Kuz/ZZC-T_Contact_System/blob/main/pom.xml) `14f3045ad6da0c1a8b0de3202adefb4ad2c8f895` |
| Kuz 个人作品集与电子简历 | [README.md](https://github.com/Wang-Kuz/Kuz_PSCV_Web/blob/main/README.md) |
