# 01课堂

「01」是「凌一」的简写，01课堂读作「凌一课堂」。这是一款给 4 岁以上孩子的家庭启蒙应用。孩子在「森森森林」里看绘本识字、采草莓认数、拼数字积木、在百灵谷练拼音、泛舟赏古诗、在绘本馆学英语。Web 与 Tauri 桌面壳使用同一套 React 页面、课程和练习规则。默认版本可单独安装依赖、测试和构建。

核心领域概念与统一词汇定义见 [GLOSSARY.md](GLOSSARY.md)，架构决策记录见 [docs/adr/](docs/adr/)，UI 与工程验收约定见 [AGENTS.md](AGENTS.md)。

## 启动 Web

使用 Node.js 22.12+ 和 pnpm 9.15.9，在项目根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm dev:web
```

浏览器访问 [本机学习地图](http://localhost:5173/)。`pnpm build:web` 生成 `apps/web/dist/`，可部署在静态 HTTP 服务或子目录下。学习印章通过平台适配器保存在本机；课程播放使用随包音频。

## Web 发布与 NAS

[访问 GitHub Pages](https://jax-lifu.github.io/lingyi-classroom/) · [绿联 NAS 通用包](https://github.com/Jax-Lifu/lingyi-classroom/releases/latest/download/lingyi-classroom-nas.zip) · [离线 Docker 镜像及校验和](https://github.com/Jax-Lifu/lingyi-classroom/releases/latest)

NAS 安装见 [绿联 Docker 项目说明](deploy/web/README.md)。家长选课、设置、剧场及其 3D 引擎、笔顺与音频均按使用时机加载。课目目录与首页共用的元数据随首页提供。手机可在首次访问时下载课堂资源，HTTPS 通过 Service Worker 读取校验过的本机资源包，普通 HTTP 的 NAS 地址预热浏览器缓存。

Web 源码位于 [source 分支](https://github.com/Jax-Lifu/lingyi-classroom/tree/source)，GitHub Pages 从 `main` 的 `/docs` 发布。创建新版时，先统一根目录、Web 和桌面应用的版本号，然后在对应源码提交上推送同名标签（例如 `0.1.3`）。NAS release 工作流会检查标签和版本、构建并测试源码，在 amd64 和 arm64 上启动容器验收，最后发布安装包和 SHA-256 校验和。

发布 Pages 时，将同一工作流的 `web-distribution` 构建产物同步到独立的 `main` 发布检出目录并推送。产物内的 `SOURCE_COMMIT` 记录源码提交。也可在源码目录运行 `scripts/prepare-web-release.sh /绝对路径/发布仓库` 进行本机预演。

| 科目 | 覆盖 | 剧场回合与互动玩法 |
|---|---|---|
| 常用汉字 | 13 组 · 300 字 | 每个字配有手绘水彩场景、字义动画、普通话例句与田字格**看笔顺**演示。支持看图选字、听字词、重看笔顺，也可进入「湖边烤鱼」与「林间种树」 |
| 认识数字 | 2 组 · 0–20 | 结合水彩象形数字记忆卡（如「3 像耳朵」），在草莓果园采草莓、放回多出的草莓、提篮送给小熊；10 以上可用十颗一篮，支持触屏与键盘快捷操作 |
| 十以内加减 | 2 组 · 66 道加法、66 道减法 | 数字积木（NumberBlocks）互动剧场：拖动或按 `Enter`/`Space` 将积木合体/拆分，点击积木逐块点数，并点选或按数字键为角色戴上正确的数字帽；也可切换到野餐小铺，数草莓后挂数字牌 |
| 汉语拼音 | 3 组 · 63 项 | 拼音百灵谷 2.5D 水彩剧场：提供四线三格字形、23 项声母提示字与相应的拼读或整体认读、四声调百灵鸟飞行轨迹与听音找拼音问答 |
| 小学古诗文 | 9 大意象主题 · 121 首独立诗作（教材 131 篇次） | 古诗画卷 2.5D 剧场：逐句跟读、遮句背诵与意境交互（如《咏鹅》拨水戏鹅、春夜诗词昼夜粒子氛围），跨年级重复篇次互通学习印章 |
| 生活英语 | 6 组 · 60 个词 | 英语绘本馆 2.5D 水彩剧场：听单词录音、看手绘水彩场景与双语例句、字母磁贴/键盘拼写单词（拼一拼）、听词找图快门拍照 |

古诗文目录来自[古文岛指定页面](https://www.guwendao.net/gushi/xiaoxue.aspx)。普通话采用家庭选定的 04 合成旁白，古诗按新录音的实际采样位置对齐逐句听读。语音经过自动复核，尚未逐篇人工审听。声母卡以「播、泼、摸、佛」等字和对应水彩画提示读音。呼读音与字音不同时分别标注，例如 f 呼读 fō，「佛像」的「佛」读 fó。每项拼音录音的含义及许可见[拼音来源记录](packages/content/sources/pinyin-audio.json)，录音署名与许可随发布物提供。

## 玩法与复用

首页的「森林实验室」可直接试玩三课：「火与风」把同一阵风带给火苗和竹子；「曹冲称象」用不同的石头组合对齐船舷水线；「你给我」通过交换说话人和递笔来辨认“我”。对应的关联字卡和《曹冲称象》也有入口，从任一入口完成实验都只给主课目盖章。例如从「船」进入「曹冲称象」，获得的是古诗文《曹冲称象》的学习印章。已有印章全部保留。

打开 Web 从「森森森林」选科目，再按 16:10 水彩主题分组选卡，分组卡实时展示本组已学进度（如 `已学 3/23`）。“听小熊念”读出眼前的图卡，滑动会停止领读。进入汉字字义绘本后，手指左滑或上滑学下一个字，右滑或下滑回看，随时可点「看笔顺」观察田字格一笔一画演示。“家长选课”支持按主题分组（古诗同时提供「森森森林主题」与「教材年级」双分组）、按**掌握状态（全部 / 未掌握 / 已掌握）**及关键字筛选，支持单卡查看笔顺、标记/取消学习印章，选好后点“用这项玩游戏”即可进入对应剧场回合；家长设置页支持深色模式「夜间暖纸调」、字号缩放、减少动画与独立重置本机学习印章。

- [Lottie Web](https://github.com/airbnb/lottie-web) 的轻量 SVG 播放器按每个字的插画与动作数据播放字义动画。点按、拖动、换字手势与奖励也使用随包绘本素材；系统或应用内开启减少动画模式时保留静态图示。
- [Three.js](https://github.com/mrdoob/three.js) 负责古诗、拼音、英语 2.5D 剧场的景深图层、天光着色器、粒子氛围与角色轨迹，并按路由动态拆包加载。WebGL 2 不可用或开启减少动画时自动回退至 2D 水彩图层，保留完整学习流程。
- [Hanzi Writer](https://github.com/chanind/hanzi-writer) 负责汉字字义绘本、家长选课与通关页的田字格逐笔演示；300 个字的轮廓和笔画中线来自随包的 [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) 子集，按需异步加载。
- [Howler.js](https://github.com/goldfire/howler.js) 负责语音播放、移动端音频解锁和音频片段。古诗的逐句位置及森林互动音效使用音频片段；用户主动点击听读按钮时自动解除静音并发声回应。
- 全站课程插画统一采用手绘水彩绘本素材（`art/wordbook/painted/`、`art/play/`、`art/poems/`、`art/numbers/`），原出处与许可随包提供。

## 工程结构

项目目录、npm 根包和 Rust 主包统一使用 `lingyi-classroom`。前端子包使用 `@lingyi-classroom/*`，桌面应用标识为 `com.lingyi.classroom`。

项目通过 [Jax-Lifu/Tauri2MonoRepo](https://github.com/Jax-Lifu/Tauri2MonoRepo) 的脚手架初始化，来源版本和上游提交记录在 [.template.json](.template.json)。

| 目录 | 职责 |
|---|---|
| `apps/web` | 浏览器入口、Vite 按需分包配置、Web 存储适配器 |
| `apps/desktop` | Tauri 2 入口、Rust 命令和桌面能力适配器 |
| `packages/ui` | 两端共用的 React 森森森林、剧场回合、家长选课和设置 |
| `packages/shared` | 平台能力接口、进度存储契约、出题与答案规则 |
| `packages/content` | 平台无关 JSON 课程、水彩场景编排、公开音频、原创插画和来源 |
| `packages/i18n`、`packages/tsconfig` | 模板共享的本地化和类型检查配置 |
| `docs/adr` | 架构决策记录（ADR） |

运行 `pnpm typecheck`、`pnpm test` 检查 TypeScript、课程完整性、出题边界及界面。桌面前端可运行 `pnpm --filter @lingyi-classroom/desktop build`。启动原生窗口需要目标平台的 Tauri 环境，命令为 `pnpm dev:desktop`。

## 本机研究归档

`rea/` 是 Git 忽略的本机目录，集中保存此前的研究材料、私用音画与历史原型。公开 Web 的源码和构建产物不依赖这个目录。保留归档的机器可以额外运行 `pnpm dev:web:home` 或 `pnpm build:web:home` 使用家庭预览；家庭构建输出在 `apps/web/dist-household/`。
