# 学习画卷的夜间暖纸护眼调与无障碍偏好映射

用户在设置页配置的「主题模式（浅色 / 深色 / 跟随系统）」、「主题色」、「字体大小（小 / 中 / 大）」与「减少动画」通过根节点的 `data-theme`、`data-accent`、`data-font-size` 与 `data-reduce-motion` 属性下发。然而，儿童学习界面（`.learning`）承载了大量半透明水彩图层、田字格与四线三格，若直接套用纯黑背景或反色滤镜，会破坏水彩插画的纸本温润感并导致画框边缘突兀。

我们决定采用「夜间暖纸调（Warm Dusk Paper）+ 渐进无障碍映射」策略：
1. **深色模式（`data-theme="dark"`）**：将 `.learning` 的纸张底色切换为低眩光的森林烛光羊皮纸调（`--paper: #d8d2be`、`--card: #e8e2cf`、`--ink: #1d3326`），大幅降低夜间屏幕发光亮度，同时与全站绘本纸页、田字格、四线三格及水彩插画保持高对比度（> 9:1）与色彩和谐。
2. **字号与主题色（`data-font-size` / `data-accent`）**：按比例缩放家长选课、提示语、目录芯片与诗文行距，并将用户所选主题色映射至焦点环与家长选课激活态。
3. **减少动画全链路统一（`data-reduce-motion="true"`）**：除 CSS 过渡与 3D 舞台外，`LottieLayer`（字义与手势 SVG 动画）、`GlyphTrace`（汉字笔顺动画）、`WordFeed`（滑页过渡）与 `NumberBlocksMath`（积木动效）均同时监听系统 `prefers-reduced-motion: reduce` 与根节点 `data-reduce-motion="true"`，开启时直接呈现静态完成态。
