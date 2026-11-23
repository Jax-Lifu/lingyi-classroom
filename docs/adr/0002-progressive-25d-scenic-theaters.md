# 2.5D WebGL 剧场与 2D 水彩画卷渐进增强架构

古诗、拼音与英语三个科目的剧场回合需要呈现具有空间景深、昼夜天光、粒子氛围与角色轨迹（如游鹅、四声调百灵鸟飞行、单词快门光效）的绘本舞台，同时必须在浏览器与 Tauri 桌面 WebView（含不支持 WebGL2 或开启「减少动画」的环境）中保持零阻塞首屏与完整可玩性。

我们决定采用「2D 水彩图层即时首屏 + 按需懒加载 Three.js 2.5D 舞台」的渐进增强架构：
1. **目录卡片与首屏零 Three.js 依赖**：目录页与家长练习卡仅使用轻量 2D 水彩组件（`PoemCardBackdrop`、`PinyinCardBackdrop`、`EnglishCardBackdrop`），将 Three.js 与着色器代码完全隔离在路由级动态 `import()` chunk 中。
2. **双层无缝接管**：进入剧场回合时先渲染 2D 水彩 DOM 图层保证首帧可见与可交互；后台懒加载 WebGL2 舞台并在关键纹理就绪后（`onAvailable(true)`）接管画面，若 WebGL2 不可用或上下文丢失则自动回退至 2D 图层。
3. **离屏与后台零空转**：WebGL 渲染循环通过宿主节点的 `contentvisibilityautostatechange`（带 `IntersectionObserver` 回退）与 `document.visibilitychange` 自动挂起，并在 `prefers-reduced-motion: reduce` 或应用内 `data-reduce-motion="true"` 开启时停止连续帧请求。
