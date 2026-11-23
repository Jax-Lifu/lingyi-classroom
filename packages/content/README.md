# 首批课程

`src/data/` 存放与 React、Tauri 和浏览器无关的纯 JSON。每个条目有稳定 ID。添加课程时沿用同类字段，将本地媒体放进 `public/media/`，运行工作区的 `pnpm test`。

- 汉字包含字、带调拼音与示例词。英语包含英文词和中文义。两包均使用本机语音合成，普通话 Tingting、美式英语 Samantha。
- 拼音使用 audio-cmn 的普通话真人录音。页面区分完整示范音与例字。录音及许可随包保留，详见 [ATTRIBUTION](public/media/pinyin/ATTRIBUTION.txt)。
- 古诗文保留指定列表中的教材分组和重复收录。每个有正文的条目含逐句文本、音频相对路径和句起点（秒）。只有索引的篇目提供来源与备注。在“遮句接背”模式下，每句可单独揭示；显示全文时每句可单听。[目录与核验记录](sources/poetry-verification.json)
- 数字和十以内算式由 `@lingyi-classroom/shared` 的确定性规则生成。题目音频文件名与其稳定 ID 对应。`add-2-3` 与 `add-3-2` 是两道题。
