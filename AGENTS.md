# 01课堂 · UI 与工程工作约定

01课堂（凌一课堂）是家庭使用的中文启蒙练习册。「森森森林」是孩子选课和进入剧场回合的绘本学习地图，「家长选课」与「设置」供成人陪练和配置使用。

核心领域概念与统一词汇定义见 [GLOSSARY.md](GLOSSARY.md)，架构决策记录见 [docs/adr/](docs/adr/)。改动代码、撰写文案或新增测试时，优先沿用 `GLOSSARY.md` 中的标准术语（**科目 Subject**、**主题分组 Topic Group**、**教材年级 Textbook Grade**、**课目 Lesson**、**独立诗作 Poem Work**、**森森森林 Forest Map**、**家长选课 Parent Library**、**剧场回合 Stage Round**、**字义绘本 Wordbook Spread**、**字形笔顺 Stroke Order**、**森林实验室 Exploration**、**学习印章 Learning Stamp**、**夜间暖纸调 Warm Dusk Paper**）。

按页面用途选择下面的 skill，读取当前用户级安装中的 `SKILL.md`。需要安装时统一使用 `$CODEX_HOME/skills`（默认 `~/.codex/skills`）。

## 日常 Web UI

森森森林学习地图、主题分组架、剧场回合、字义绘本、古诗画卷、家长选课和家长设置都按以下顺序处理。Web 与 Tauri 共用的 React 页面也适用。

1. **`modern-web-guidance` 先查实现方式。** 改 HTML、CSS 或客户端交互前，用 `search` 查本次涉及的浏览器能力，命中后用 `retrieve` 读指南。采用新特性时，对照 `apps/web/vite.config.ts` 与 `apps/desktop/vite.config.ts` 的浏览器目标（`chrome111`、`safari16.4`、`firefox128`），共享页面还需考虑桌面 WebView 的支持情况（例如 `contentvisibilityautostatechange` 需搭配 `IntersectionObserver` 回退）。
2. **`impeccable` 主导学习与操作体验。** 从项目根目录运行该 skill 的 `scripts/impeccable context`，先看现有页面。学习页沿用森林课本的纸色、科目色和手绘水彩插画（深色模式下切换为低眩光的「夜间暖纸调」），让孩子先看清田字格字形、四线三格拼音声调、象形数字或积木点阵，再找到听读和作答按钮。答题反馈要能从文字读懂，选中状态不得改变 `border-width`、`padding` 或 `font-weight` 引起布局跳动。家长设置沿用已有表单控件、主题和中英文文案。
3. **`ponytail` 控制改动范围。** 两端共用的学习界面优先改 `packages/ui/src/learning/`，沿用 `learning.css`、`catalog.css` 与 `scenic-theater.css` 的变量和断点。设置页复用 `packages/ui/src/components/`。出题与答案规则归 `packages/shared/`，课程与水彩场景编排归 `packages/content/`，存储走已有的 `Platform` 接口。公开页面从 `packages/content/public/` 取随包水彩插画和音频，`rea/` 仅作本机研究与家庭预览。
4. **`domain-modeling` 维护领域一致性。** 当引入新的课程结构、进度规则或跨视图契约时，同步更新 `GLOSSARY.md`；若涉及难以逆转且有明确取舍的架构决策，在 `docs/adr/` 下补充简明 ADR。

## 官网、落地页和产品展示页

面向家长介绍产品、引导体验的页面，额外启用 **`design-taste-frontend`** 主导首屏、排版、素材和整页视觉节奏。优先用实际学习地图、剧场回合截图和原创水彩插画展示孩子能做什么。`modern-web-guidance` 管平台实现，`impeccable` 检查阅读与操作，`ponytail` 复用现有实现。展示页的样式限定在该页面内。

## 浏览器验收

每次交付可见或可交互的 UI 改动前，使用 **`verification-before-completion`** 核实本次改动。最后一次修改后重新走受影响的流程。

- **从真实入口操作。** 在项目根目录运行 `pnpm dev:web`，用真实浏览器打开 `http://localhost:5173/`。按改动选场景：
  - 改 **汉字（森林识字绘本）**：验证 13 组水彩分组架、字义绘本滑动翻页、「看笔顺」逐笔演示与「找字」问答。
  - 改 **数字（草莓果园）** 或 **加减（数字积木）**：验证象形数字记忆卡、采草莓送小熊、积木合体/拆分与戴数字帽，先答错再答对，检查两次反馈。
  - 改 **拼音（拼音百灵谷）** 或 **英语（英语绘本馆）**：验证 2.5D 水彩舞台、四线三格/声母拼读/四声调百灵鸟飞行、单词字母拼写（拼一拼）与听音/听词三选一问答。
  - 改 **古诗（古诗画卷）**：选有正文的篇目验证 2.5D 舞台、逐句听读或遮句接背，并确认跨年级同篇诗作在「家长选课」中学习印章互通。
  - 改 **进度或设置**：回森森森林或分组架刷新，确认学习印章数量与「已学 X/Y」持久保留；验证设置页「重置学习印章」二次确认与深色模式「夜间暖纸调」。
- **检查实际画面。** 布局改动至少看手机竖屏和桌面窗口，可用 `390×844` 和 `1100×760`。检查字形、声调、按钮有无裁切或遮挡，以及页面有无横向溢出（`scrollWidth <= innerWidth`）。改交互时用键盘走一遍，看焦点和结果提示。涉及动效时同时复查系统 `prefers-reduced-motion: reduce` 与应用内 `data-reduce-motion="true"` 模式。一起查看控制台错误及相关资源请求。
- **按影响面补工程验证。** 类型与行为改动运行 `pnpm typecheck`、`pnpm test`。资源路径、拆包或发布相关改动运行 `pnpm build:web` 并确认剧场、3D 引擎与笔顺数据按需懒加载。涉及原生能力时，用 `pnpm dev:desktop` 在 Tauri 窗口验证相应操作。展示页另运行 `design-taste-frontend` 的视觉检查，查看生成的截图。
- **交付时给出可复查的证据。** 写明实际视口、操作和观察到的结果，视觉改动附关键状态截图或其路径，命令附运行结果。浏览器或原生环境受限时，写清未验项和具体原因，仅对实际验证过的范围给出结论。
