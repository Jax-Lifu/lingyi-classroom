export const poemGroupOrder = [
  "小动物",
  "看山水",
  "花草和春天",
  "月亮和星星",
  "刮风和下雪",
  "小朋友玩耍",
  "小船和朋友",
  "大漠和英雄",
  "古代小故事",
] as const;

export type PoemGroupId = (typeof poemGroupOrder)[number];

export interface PoemGroupMeta {
  id: PoemGroupId;
  subtitle: string;
  cover: string;
  badgeArt: string;
}

export const poemGroups: readonly PoemGroupMeta[] = [
  {
    id: "小动物",
    subtitle: "白鹅 · 蜻蜓 · 小鸡",
    cover: "art/poems/bg-goose-pond.webp",
    badgeArt: "art/play/goose.webp",
  },
  {
    id: "看山水",
    subtitle: "瀑布 · 高山 · 红枫",
    cover: "art/poems/bg-lushan-waterfall.webp",
    badgeArt: "art/wordbook/painted/landscape-picture.webp",
  },
  {
    id: "花草和春天",
    subtitle: "春晓 · 柳树 · 荷花",
    cover: "art/poems/bg-spring-garden.webp",
    badgeArt: "art/wordbook/painted/blossom.webp",
  },
  {
    id: "月亮和星星",
    subtitle: "明月 · 银河 · 渔灯",
    cover: "art/wordbook/night.webp",
    badgeArt: "art/play/moon.webp",
  },
  {
    id: "刮风和下雪",
    subtitle: "大风 · 寒雪 · 梅花",
    cover: "art/poems/bg-snow-river.webp",
    badgeArt: "art/wordbook/painted/snowflake.webp",
  },
  {
    id: "小朋友玩耍",
    subtitle: "采莲 · 钓鱼 · 放风筝",
    cover: "art/wordbook/meadow.webp",
    badgeArt: "art/wordbook/child.webp",
  },
  {
    id: "小船和朋友",
    subtitle: "乘舟 · 送别 · 过节",
    cover: "art/play/pond.webp",
    badgeArt: "art/play/boat.webp",
  },
  {
    id: "大漠和英雄",
    subtitle: "边关 · 骏马 · 豪情",
    cover: "art/poems/bg-frontier-dusk.webp",
    badgeArt: "art/wordbook/painted/horse.webp",
  },
  {
    id: "古代小故事",
    subtitle: "称象 · 砸缸 · 守株",
    cover: "art/clearing.webp",
    badgeArt: "art/wordbook/painted/elephant.webp",
  },
];

export const poemGroupMap: Readonly<Record<PoemGroupId, PoemGroupMeta>> =
  Object.fromEntries(poemGroups.map((g) => [g.id, g])) as Record<
    PoemGroupId,
    PoemGroupMeta
  >;

export const poemBackdropUrls = {
  "goose-pond": "art/poems/bg-goose-pond.webp",
  "lushan-waterfall": "art/poems/bg-lushan-waterfall.webp",
  "spring-garden": "art/poems/bg-spring-garden.webp",
  "snow-river": "art/poems/bg-snow-river.webp",
  "frontier-dusk": "art/poems/bg-frontier-dusk.webp",
  "pond-sunrise": "art/play/pond.webp",
  "autumn-river": "art/wordbook/dawn.webp",
  "starry-night": "art/wordbook/night.webp",
  "storm-plain": "art/wordbook/storm.webp",
  meadow: "art/wordbook/meadow.webp",
  "clearing-lake": "art/clearing.webp",
  "blossom-canopy": "art/play/canopy.webp",
  "sunny-field": "art/play/orchard.webp",
} as const;

export type PoemBackdropId = keyof typeof poemBackdropUrls;
export type PoemTime = "day" | "dawn" | "dusk" | "night" | "mist" | "snow";
export type PoemAtmosphere =
  | "none"
  | "petals"
  | "snow"
  | "rain"
  | "stars"
  | "fireflies"
  | "leaves"
  | "wind"
  | "ripples"
  | "mist"
  | "sparks"
  | "clouds";

export type PoemDramaId =
  | "yong-e"
  | "lushan-waterfall"
  | "jing-ye-si"
  | "chun-xiao"
  | "jiang-xue"
  | "hua"
  | "feng"
  | "gu-lang-yue-xing"
  | "min-nong"
  | "deng-guan-que-lou"
  | "xiao-chi"
  | "chi-shang"
  | "hua-ji"
  | "mei-hua"
  | "cun-ju"
  | "zao-fa-bai-di-cheng";

export type PoemArchetype =
  | "water-voyage"
  | "mountain-mist"
  | "night-moon"
  | "spring-blossom"
  | "winter-plum"
  | "frontier-epic"
  | "pastoral-child"
  | "ancient-fable";

export type PoemCastTag =
  | "poet"
  | "poet-bow"
  | "fisherman"
  | "farmer"
  | "child"
  | "pavilion"
  | "skiff"
  | "lantern"
  | "plum"
  | "willow"
  | "kite"
  | "rooster"
  | "dragonfly"
  | "lotus-bud"
  | "frontier"
  | "jar"
  | "scroll";

export type PoemMotion =
  | "idle"
  | "float"
  | "swim"
  | "fly"
  | "sway"
  | "rise"
  | "fall"
  | "glow"
  | "grow"
  | "sail"
  | "hop"
  | "flutter"
  | "drift"
  | "pulse"
  | "glide";

// Coordinates & height are percentages of the 16:9 stage.
export type PoemLayer = readonly [
  picture: string,
  x: number,
  y: number,
  height: number,
  motion?: PoemMotion,
  beat?: number,
  dx?: number,
  dy?: number,
];

export interface PoemScene {
  group: PoemGroupId;
  backdrop: PoemBackdropId;
  time: PoemTime;
  atmosphere: PoemAtmosphere;
  story: string;
  shortHint?: string;
  drama?: PoemDramaId;
  archetype?: PoemArchetype;
  cast?: readonly PoemCastTag[];
  layers: readonly PoemLayer[];
  verseNotes?: readonly string[];
}

const p = (name: string) => `art/wordbook/painted/${name}.webp`;

export const poemScenes: Readonly<Record<string, PoemScene>> = {
  // === 1. 小动物 (11) ===
  "p1a-j01": {
    group: "小动物",
    backdrop: "goose-pond",
    time: "dawn",
    atmosphere: "ripples",
    drama: "yong-e",
    story: "7岁的骆宾王站在柳树池塘边，看着大白鹅仰头唱歌、红脚掌拨动绿水。",
    layers: [
      ["art/play/goose.webp", 56, 56, 36, "swim", 0, 8, 0],
      ["art/wordbook/child.webp", 20, 62, 34, "hop", 0, 2, -2],
      ["art/play/lily.webp", 75, 67, 17, "float", 2],
      [p("music"), 61, 27, 15, "rise", 1, 3, -6],
    ],
    verseNotes: [
      "大白鹅游进绿绿的池塘，昂起脖子大声“鹅、鹅、鹅”地叫！",
      "看它弯弯长长的脖子仰向天空，欢快地唱起歌来。",
      "雪白的羽毛轻轻浮在碧绿的水面上，像一朵小白云。",
      "橘红色的鸭掌一左一右拨动清清的波浪，水花闪呀闪！",
    ],
  },
  "p1b-j04": {
    group: "小动物",
    backdrop: "sunny-field",
    time: "dawn",
    atmosphere: "clouds",
    drama: "hua-ji",
    archetype: "pastoral-child",
    cast: ["rooster"],
    story: "雪白的大公鸡顶着红红的鸡冠大步走来，清晨一声叫，千家万户都打开了门。",
    layers: [
      [p("chick"), 48, 57, 36, "hop", 0, 6, 0],
      ["art/play/sun.webp", 81, 22, 22, "rise", 3, 0, -5],
      [p("house"), 22, 52, 32, "idle", 3],
      [p("music"), 57, 31, 15, "pulse", 2],
    ],
    verseNotes: [
      "不用裁缝做衣裳，它天生戴着鲜红的鸡冠。",
      "一身雪白的羽毛，神气十足地走过来啦。",
      "平时不随便乱说话，静静地守着小院。",
      "早晨一开口啼叫，太阳升起，家家户户都开门醒来啦！",
    ],
  },
  "p1b-k05": {
    group: "小动物",
    backdrop: "goose-pond",
    time: "day",
    atmosphere: "ripples",
    drama: "xiao-chi",
    archetype: "spring-blossom",
    cast: ["dragonfly", "lotus-bud"],
    story: "安静的夏初小池塘里，刚冒出尖尖角的小荷叶上，早早停了一只小蜻蜓。",
    layers: [
      ["art/play/lily.webp", 52, 61, 26, "grow", 2],
      [p("butterfly"), 54, 41, 18, "flutter", 3, 0, 5],
      [p("water-drop"), 27, 56, 17, "float", 0],
      ["art/play/sun.webp", 80, 21, 19, "glow", 1],
    ],
    verseNotes: [
      "细细的泉水舍不得流太快，安静地流出小水花。",
      "树影倒映在池塘里，喜欢晴天里柔和的微风。",
      "嫩绿的小荷叶才刚刚露出尖尖的小角。",
      "早有一只灵巧的小蜻蜓，悄悄落在了荷叶尖上！",
    ],
  },
  "p1a-k01": {
    group: "小动物",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "ripples",
    story: "满池碧绿的莲叶像撑开的小伞，小红鱼在莲叶东西南北快乐地绕圈做游戏。",
    layers: [
      ["art/fish.webp", 52, 56, 23, "swim", 2, 12, -3],
      ["art/play/lily.webp", 30, 62, 22, "float", 1],
      ["art/play/lily.webp", 72, 60, 21, "float", 1],
      ["art/play/boat.webp", 22, 43, 22, "sail", 0],
    ],
  },
  "p2a-k04": {
    group: "小动物",
    backdrop: "meadow",
    time: "day",
    atmosphere: "wind",
    story: "天高高的、草绿绿的大草原上，风把高高的青草吹弯，露出成群的牛和羊。",
    layers: [
      [p("cow"), 36, 61, 28, "idle", 6],
      [p("sheep"), 67, 63, 25, "hop", 6],
      [p("grass"), 50, 69, 21, "sway", 5, 4, 0],
      [p("cloud"), 36, 22, 18, "drift", 0, 8, 0],
    ],
  },
  "p2b-k03": {
    group: "小动物",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "clouds",
    shortHint: "两个黄鹂",
    story: "两只黄鹂在翠绿柳枝上唱歌，一行白鹭飞上蓝天，窗口望见雪山和远航的大船。",
    layers: [
      ["art/play/bird.webp", 34, 41, 22, "hop", 0],
      ["art/play/bird.webp", 64, 30, 19, "fly", 1, 10, -8],
      ["art/play/mountain.webp", 76, 48, 25, "idle", 2],
      ["art/play/boat.webp", 30, 67, 22, "sail", 3],
    ],
  },
  "p3b-k01": {
    group: "小动物",
    backdrop: "meadow",
    time: "dawn",
    atmosphere: "petals",
    shortHint: "迟日江山丽",
    story: "春天的太阳暖洋洋，花草香香的，燕子忙着飞来飞去衔泥筑巢，鸳鸯在沙岸边打盹。",
    layers: [
      ["art/play/bird.webp", 35, 36, 22, "fly", 2, 12, -4],
      [p("duck"), 63, 62, 24, "float", 3],
      [p("daisy"), 28, 67, 19, "grow", 1],
      ["art/play/sun.webp", 78, 22, 20, "glow", 0],
    ],
  },
  "p3b-k02": {
    group: "小动物",
    backdrop: "goose-pond",
    time: "dawn",
    atmosphere: "petals",
    story: "竹林外桃花开了两三枝，几只小鸭子欢欢喜喜跳进变暖的春江水里游泳。",
    layers: [
      [p("duck"), 54, 60, 29, "swim", 1, 10, 0],
      [p("bamboo"), 24, 51, 37, "sway", 0],
      [p("blossom"), 74, 36, 21, "glow", 0],
      ["art/fish.webp", 74, 68, 16, "swim", 3, -6, 0],
    ],
  },
  "p4b-j03": {
    group: "小动物",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    story: "不管平地还是高山，小蜜蜂每天从早到晚扑扇翅膀采百花、酿出香甜的花蜜。",
    layers: [
      [p("honeybee"), 48, 43, 25, "flutter", 2, 8, -4],
      [p("sunflower"), 28, 62, 29, "sway", 1],
      [p("tulip"), 71, 61, 25, "sway", 1],
      [p("honey-jar"), 77, 68, 19, "pulse", 3],
    ],
  },
  "p5b-j02": {
    group: "小动物",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "petals",
    story: "夜深了，春天的山谷安静极了，桂花轻轻飘落，一轮明月升起惊醒了枝头的小山鸟。",
    layers: [
      ["art/play/moon.webp", 74, 24, 24, "glow", 2],
      ["art/play/bird.webp", 36, 48, 22, "fly", 2, 8, -6],
      [p("blossom"), 54, 58, 16, "fall", 0, 2, 12],
      ["art/play/mountain.webp", 25, 59, 28, "idle", 1],
    ],
  },
  "p6b-k04": {
    group: "小动物",
    backdrop: "frontier-dusk",
    time: "night",
    atmosphere: "wind",
    story: "银白色的月光照在如雪的大漠沙地上，小骏马昂首扬蹄，准备戴上金笼头驰骋秋夜。",
    layers: [
      [p("horse"), 52, 57, 38, "hop", 3, 10, -2],
      ["art/play/moon.webp", 76, 22, 20, "glow", 1],
      ["art/play/mountain.webp", 24, 50, 24, "idle", 1],
    ],
  },

  // === 2. 看山水 (15) ===
  "p2a-k02": {
    group: "看山水",
    backdrop: "lushan-waterfall",
    time: "dawn",
    atmosphere: "mist",
    drama: "lushan-waterfall",
    story: "太阳照着庐山香炉峰升起紫色云雾，李白沿着石阶来到山下，仰望飞泻而下的大瀑布，仿佛银河从天上落下来。",
    layers: [
      ["art/play/sun.webp", 22, 22, 20, "glow", 0],
      ["art/wordbook/waterdrop.webp", 67, 45, 32, "fall", 1, 0, 8],
      ["art/wordbook/painted/star.webp", 74, 19, 15, "pulse", 3],
      ["art/play/mountain.webp", 33, 52, 28, "idle", 0],
    ],
    verseNotes: [
      "清晨太阳照亮香炉峰，山腰升起袅袅紫烟；李白沿着山路走来。",
      "李白停在青松旁抬头远望：高高的瀑布像一条银带挂在山崖前！",
      "瀑布从高高的悬崖上直冲下来，水花飞溅，水雾滚滚翻腾。",
      "太壮观了！好像天上的星光银河从九重高空直落进大山里！",
    ],
  },
  "p1a-j02": {
    group: "看山水",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "none",
    drama: "hua",
    story: "走进一幅神奇的山水画：远看青山有颜色，走近却听不见流水声；春天过去了花还在开，人走近小鸟也不害怕。",
    layers: [
      [p("landscape-picture"), 50, 48, 42, "pulse", 0],
      ["art/play/mountain.webp", 30, 56, 24, "idle", 0],
      [p("blossom"), 70, 39, 19, "grow", 2],
      ["art/play/bird.webp", 67, 57, 19, "idle", 3],
    ],
    verseNotes: [
      "远远看去，画卷里连绵的大山青翠又鲜明。",
      "凑近竖起耳朵听一听，画里的小河却安安静静没有水声。",
      "春天已经悄悄走远了，画里的花朵却还开得灿烂。",
      "有人走近画卷拍拍手，枝头的小鸟一点儿也不惊慌——原来是一幅画！",
    ],
  },
  "p2a-k01": {
    group: "看山水",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "clouds",
    drama: "deng-guan-que-lou",
    story: "太阳靠着远山慢慢落下，黄河奔向大海；要想看得更远，就鼓起勇气再登上一层高楼！",
    layers: [
      ["art/play/sun.webp", 26, 36, 23, "fall", 0, 0, 8],
      ["art/play/mountain.webp", 25, 58, 28, "idle", 0],
      [p("wave"), 71, 61, 22, "swim", 1, 8, 0],
      [p("house"), 56, 48, 28, "rise", 3, 0, -5],
    ],
    verseNotes: [
      "金红的落日靠着西边的青山慢慢沉下去。",
      "滚滚的黄河水奔流向前，一直流向遥远的大海。",
      "真想把眼睛望到千里之外，看清更宽广的风景呀。",
      "那就一步一步再登上一层高楼——站得更高，看得更远！",
    ],
  },
  "p3a-k05": {
    group: "看山水",
    backdrop: "autumn-river",
    time: "day",
    atmosphere: "clouds",
    story: "高大的天门山像被江水劈开，碧绿长江滚滚东流，一只小帆船从太阳升起的天边悠悠驶来。",
    layers: [
      ["art/play/mountain.webp", 26, 49, 34, "idle", 0],
      ["art/play/mountain.webp", 74, 49, 34, "idle", 2],
      ["art/play/boat.webp", 51, 56, 25, "sail", 3, -6, 2],
      ["art/play/sun.webp", 54, 24, 18, "glow", 3],
    ],
  },
  "p3a-k01": {
    group: "看山水",
    backdrop: "pond-sunrise",
    time: "night",
    atmosphere: "stars",
    story: "秋夜的月光像镜面洒在平静的洞庭湖上，湖心的小翠山看起来就像白银盘里托着一颗小青螺。",
    layers: [
      ["art/play/moon.webp", 68, 23, 24, "glow", 0],
      ["art/play/mountain.webp", 50, 56, 24, "idle", 2],
      ["art/play/plate.webp", 50, 68, 22, "float", 3],
    ],
  },
  "p3a-k06": {
    group: "看山水",
    backdrop: "goose-pond",
    time: "mist",
    atmosphere: "rain",
    story: "晴天阳光下的西湖水光波光粼粼真好看，下雨天雾蒙蒙的青山也像仙境一样美！",
    layers: [
      ["art/play/sun.webp", 27, 23, 20, "glow", 0],
      [p("rain-cloud"), 71, 22, 20, "drift", 1],
      ["art/play/boat.webp", 50, 60, 26, "sail", 0],
    ],
  },
  "p3a-k02": {
    group: "看山水",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "leaves",
    story: "沿着弯曲的石径走上秋天的寒山，停下来看深红的枫叶——被秋霜染红的枫林比二月春花还要红艳！",
    layers: [
      [p("maple-leaf"), 34, 39, 24, "drift", 3, 6, 8],
      [p("maple-leaf"), 64, 47, 21, "drift", 2, -5, 7],
      ["art/play/tree.webp", 25, 56, 35, "sway", 2],
      [p("house"), 72, 46, 22, "idle", 1],
    ],
  },
  "p3a-k04": {
    group: "看山水",
    backdrop: "blossom-canopy",
    time: "dusk",
    atmosphere: "leaves",
    story: "安静的空山里看不见人影，只听见远处传来说话声，夕阳余晖照进深林，落在绿绿的青苔上。",
    layers: [
      ["art/play/tree.webp", 26, 52, 39, "sway", 0],
      [p("deer"), 62, 60, 27, "idle", 1],
      ["art/play/sun.webp", 75, 24, 19, "glow", 2],
      [p("grass"), 50, 72, 19, "grow", 3],
    ],
  },
  "p3b-k03": {
    group: "看山水",
    backdrop: "blossom-canopy",
    time: "day",
    atmosphere: "clouds",
    story: "梅子黄澄澄的晴朗天，坐完小船又走上翠绿山路，浓浓的树荫下传来四五声清脆的黄鹂鸣唱。",
    layers: [
      ["art/play/boat.webp", 27, 62, 23, "sail", 1],
      ["art/play/bird.webp", 67, 36, 22, "fly", 3, 6, -4],
      ["art/play/tree.webp", 52, 54, 34, "sway", 2],
      ["art/play/sun.webp", 80, 21, 18, "glow", 0],
    ],
  },
  "p4a-k02": {
    group: "看山水",
    backdrop: "lushan-waterfall",
    time: "mist",
    atmosphere: "mist",
    story: "横看庐山是一道山岭，侧看是一座尖峰，站在山里面总是只看到眼前一角，跳出来才能看清整座庐山。",
    layers: [
      ["art/play/mountain.webp", 33, 52, 33, "idle", 0],
      ["art/play/mountain.webp", 68, 54, 29, "idle", 1],
      [p("cloud"), 52, 30, 20, "drift", 2, 10, 0],
    ],
  },
  "p4b-j04": {
    group: "看山水",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "clouds",
    story: "成群的飞鸟向高空飞去，连最后一朵白云也悠闲飘走，只有诗人和安静的敬亭山彼此看着看不够。",
    layers: [
      ["art/play/mountain.webp", 54, 54, 34, "idle", 3],
      ["art/play/bird.webp", 26, 28, 17, "fly", 0, 14, -10],
      [p("cloud"), 72, 25, 20, "drift", 1, 12, 0],
    ],
  },
  "p5a-k05": {
    group: "看山水",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "ripples",
    story: "一场新雨过后秋山特别清爽，明月穿过松林照亮石头上的清泉，洗衣姑娘笑着回家，莲叶晃动让出渔船。",
    layers: [
      ["art/play/moon.webp", 52, 23, 22, "glow", 2],
      [p("water-drop"), 30, 58, 19, "fall", 3],
      [p("bamboo"), 76, 52, 35, "sway", 4],
      ["art/play/boat.webp", 64, 67, 21, "sail", 5],
    ],
  },
  "p6a-k07": {
    group: "看山水",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    story: "院子打扫得干干净净没有青苔，小河绕着农田流淌，推开木门就能看见两座青翠的大山把绿意送进屋里。",
    layers: [
      [p("house"), 32, 54, 33, "idle", 0],
      ["art/play/mountain.webp", 70, 50, 32, "idle", 3],
      [p("blossom"), 54, 62, 18, "grow", 1],
    ],
  },
  "p6b-k05": {
    group: "看山水",
    backdrop: "storm-plain",
    time: "mist",
    atmosphere: "sparks",
    story: "经历千锤百炼走出深山、不怕烈火考验的石灰石，一心只想把清清白白留在人间。",
    layers: [
      [p("stone"), 46, 61, 31, "idle", 0],
      ["art/wordbook/fire.webp", 64, 55, 31, "pulse", 1],
      ["art/play/mountain.webp", 26, 49, 28, "idle", 0],
    ],
  },
  "p6b-k06": {
    group: "看山水",
    backdrop: "lushan-waterfall",
    time: "mist",
    atmosphere: "wind",
    story: "翠竹把根深深扎进青山岩石缝里，不管东西南北哪边吹来狂风，它都笔直又坚定地站立着。",
    layers: [
      [p("bamboo"), 52, 50, 44, "sway", 3],
      [p("stone"), 52, 69, 22, "idle", 1],
      ["art/play/mountain.webp", 24, 53, 28, "idle", 0],
    ],
  },

  // === 3. 花草和春天 (19) ===
  "p1b-j01": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "dawn",
    atmosphere: "petals",
    drama: "chun-xiao",
    story: "春天的早晨睡得可香啦，窗外到处都是小鸟吱吱喳喳的叫声；昨晚刮风又下雨，不知道花园里落了多少花瓣呢。",
    layers: [
      [p("window"), 49, 44, 39, "idle", 0],
      ["art/play/bird.webp", 66, 36, 20, "hop", 1],
      [p("blossom"), 33, 56, 20, "fall", 3, 4, 12],
      [p("blossom"), 67, 63, 18, "fall", 3, -4, 10],
    ],
    verseNotes: [
      "春天睡得暖融融、甜滋滋，不知不觉天已经亮啦！",
      "竖起耳朵听，窗外枝头到处都是小鸟清脆的欢叫声。",
      "昨晚还沙沙下过一阵春夜的风和春雨呢。",
      "推开窗看一看，院子里轻轻落下了多少粉红花瓣呀？",
    ],
  },
  "p2b-k01": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "wind",
    story: "高高的柳树像用碧玉打扮过，千万条绿丝带垂在春风里，原来是二月细细的春风小剪刀裁出这么嫩的柳叶。",
    layers: [
      ["art/play/tree.webp", 49, 51, 44, "sway", 0],
      [p("green-leaf"), 34, 44, 19, "drift", 2],
      [p("green-leaf"), 66, 48, 19, "drift", 3],
    ],
  },
  "p2b-k04": {
    group: "花草和春天",
    backdrop: "goose-pond",
    time: "day",
    atmosphere: "petals",
    story: "六月的西湖实在太美啦，绿得望不到边的荷叶一直连到天边，阳光照在粉红荷花上格外鲜艳。",
    layers: [
      ["art/play/lily.webp", 33, 62, 23, "float", 2],
      ["art/play/lily.webp", 67, 61, 24, "float", 2],
      [p("blossom"), 50, 54, 24, "grow", 3],
      ["art/play/sun.webp", 78, 22, 20, "glow", 3],
    ],
  },
  "p2b-j01": {
    group: "花草和春天",
    backdrop: "meadow",
    time: "day",
    atmosphere: "wind",
    story: "草原上的青草每年秋天变黄、冬天藏进泥土，可只要春风轻轻一吹，嫩芽立刻又冒出绿油油的一片！",
    layers: [
      [p("grass"), 34, 62, 28, "grow", 3],
      [p("grass"), 66, 62, 28, "grow", 3],
      [p("seedling"), 50, 65, 24, "grow", 3],
      ["art/wordbook/fire.webp", 74, 48, 20, "pulse", 2],
    ],
  },
  "p3b-j01": {
    group: "花草和春天",
    backdrop: "pond-sunrise",
    time: "dawn",
    atmosphere: "petals",
    story: "太阳升起的时候，江边的红花比火还要红艳；春天一来，清清的江水绿得像一块发光的蓝绿宝石。",
    layers: [
      ["art/play/sun.webp", 72, 24, 23, "glow", 2],
      [p("blossom"), 31, 56, 23, "grow", 2],
      ["art/play/boat.webp", 56, 60, 23, "sail", 3],
    ],
  },
  "p3b-j03": {
    group: "花草和春天",
    backdrop: "lushan-waterfall",
    time: "day",
    atmosphere: "petals",
    story: "山脚下的春花都快谢完啦，走进山顶的小寺庙，却惊喜发现满树桃花刚刚开得热热闹闹！",
    layers: [
      [p("blossom"), 36, 44, 25, "grow", 1],
      [p("blossom"), 64, 40, 23, "grow", 1],
      [p("house"), 56, 56, 26, "idle", 1],
      ["art/play/mountain.webp", 26, 57, 27, "idle", 0],
    ],
  },
  "p4a-j01": {
    group: "花草和春天",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "leaves",
    story: "秋天池塘荷叶虽已枯尽，菊花却还骄傲地顶着寒霜开放；记好啦，黄橙和青橘成熟的时候才是一年最美的好光景！",
    layers: [
      [p("orange"), 37, 56, 25, "glow", 3],
      [p("daisy"), 63, 59, 25, "sway", 1],
      [p("maple-leaf"), 74, 34, 18, "fall", 0, -4, 10],
    ],
  },
  "p4b-k01": {
    group: "花草和春天",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "petals",
    story: "初夏乡村太阳长长的，金黄梅子和肥大杏子挂满枝头，雪白的麦花旁边只有黄蝴蝶和蜻蜓飞来飞去。",
    layers: [
      [p("butterfly"), 38, 41, 22, "flutter", 3, 10, -4],
      [p("butterfly"), 65, 48, 20, "flutter", 3, -8, 3],
      [p("rice-stalks"), 30, 62, 26, "sway", 1],
      [p("peach"), 72, 57, 21, "glow", 0],
    ],
  },
  "p4b-j02": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    shortHint: "江畔独步寻花",
    story: "暖洋洋的春风里，江边一丛桃花开得满树粉红又娇嫩，深红的和浅粉的花朵真不知道该先喜欢哪一朵。",
    layers: [
      [p("blossom"), 36, 46, 28, "grow", 2],
      [p("blossom"), 59, 43, 30, "grow", 3],
      [p("butterfly"), 73, 36, 17, "flutter", 1],
    ],
  },
  "p6a-j01": {
    group: "花草和春天",
    backdrop: "blossom-canopy",
    time: "day",
    atmosphere: "petals",
    shortHint: "其五·桃花",
    story: "黄师塔前的江水向东流去，微风里那一整簇无主的桃花深红浅红交织，美得让人舍不得走开。",
    layers: [
      [p("blossom"), 45, 45, 29, "grow", 2],
      [p("blossom"), 65, 51, 26, "grow", 3],
      [p("honeybee"), 31, 41, 18, "flutter", 1],
    ],
  },
  "p5a-k07": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    shortHint: "早春·天街小雨",
    story: "早春下着像酥油一样柔润的细雨，远远看去草地好像铺了淡淡的新绿，走近一看小草才刚刚冒芽。",
    layers: [
      [p("rain-cloud"), 48, 23, 22, "drift", 0],
      [p("seedling"), 35, 65, 23, "grow", 1],
      [p("seedling"), 63, 66, 22, "grow", 1],
      [p("water-drop"), 48, 44, 15, "fall", 0, 0, 10],
    ],
  },
  "p6b-s04": {
    group: "花草和春天",
    backdrop: "meadow",
    time: "mist",
    atmosphere: "rain",
    shortHint: "草色遥看近却无",
    story: "初春细雨滋润大地，远远望见一层浅浅嫩绿的草芽，这正是春天最让人欣喜的小时候。",
    layers: [
      [p("seedling"), 49, 63, 26, "grow", 1],
      [p("rain-cloud"), 62, 23, 21, "drift", 0],
      [p("grass"), 30, 66, 22, "grow", 1],
    ],
  },
  "p6a-k06": {
    group: "花草和春天",
    backdrop: "pond-sunrise",
    time: "mist",
    atmosphere: "rain",
    story: "千里江南黄莺啼叫、绿树映着红花，水村山城酒旗在春风里飘扬，远处的楼台掩映在细细春雨里。",
    layers: [
      ["art/play/bird.webp", 29, 34, 20, "fly", 0],
      [p("house"), 66, 51, 28, "idle", 2],
      [p("blossom"), 45, 56, 19, "glow", 0],
      [p("rain-cloud"), 52, 21, 20, "drift", 3],
    ],
  },
  "p6b-s03": {
    group: "花草和春天",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "rain",
    story: "懂事的好春雨挑了安静的夜晚随着微风悄悄飘落，第二天清晨，全城的花朵都湿润饱满、开得鲜红沉甸。",
    layers: [
      [p("rain-cloud"), 52, 22, 22, "drift", 1],
      ["art/play/boat.webp", 70, 62, 21, "sail", 2],
      [p("lamp"), 69, 53, 14, "glow", 2],
      [p("blossom"), 34, 59, 25, "grow", 3],
    ],
  },
  "p6b-s07": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    story: "轻轻敲半天柴门没人在家，可满园子的春色哪关得住呀，一枝红艳艳的杏花早伸出院墙外冲着人笑呢！",
    layers: [
      [p("door"), 36, 56, 32, "idle", 1],
      [p("blossom"), 64, 39, 30, "grow", 3, 6, -4],
      [p("grass"), 35, 70, 17, "idle", 0],
    ],
  },
  "p6b-s09": {
    group: "花草和春天",
    backdrop: "blossom-canopy",
    time: "mist",
    atmosphere: "rain",
    story: "松林间的沙路被雨水冲得干净无泥，山下兰芽浸在向西流的小溪里，连白头发爷爷也像少年一样精神爽朗！",
    layers: [
      [p("seedling"), 35, 62, 23, "grow", 1],
      ["art/play/bird.webp", 67, 36, 20, "hop", 3],
      [p("water-drop"), 52, 57, 17, "swim", 4, -8, 0],
    ],
  },
  "p6b-s10": {
    group: "花草和春天",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    story: "春天跑去哪里了呢？问一问枝头叽叽喳喳唱了上百遍的黄鹂，原来春天乘着春风飞过蔷薇花架啦。",
    layers: [
      ["art/play/bird.webp", 49, 41, 24, "fly", 3, 12, -5],
      [p("tulip"), 30, 60, 25, "sway", 3],
      [p("blossom"), 72, 53, 25, "sway", 3],
    ],
  },
  "p6b-j01": {
    group: "花草和春天",
    backdrop: "sunny-field",
    time: "dawn",
    atmosphere: "clouds",
    story: "园子里的向日葵等着朝阳晒干露水，百川向东流去不回头；趁着年少有朝气，要好好加油长大呀！",
    layers: [
      [p("sunflower"), 48, 56, 36, "grow", 0],
      ["art/play/sun.webp", 76, 22, 23, "rise", 1, 0, -5],
      [p("water-drop"), 40, 48, 14, "glow", 0],
    ],
  },
  "p5a-j04": {
    group: "花草和春天",
    backdrop: "goose-pond",
    time: "day",
    atmosphere: "clouds",
    story: "方方的小池塘像一面亮晶晶的镜子映出蓝天白云，为什么池水这么清澈？因为有源源不断的活水天天流进来！",
    layers: [
      [p("mirror"), 48, 53, 29, "glow", 0],
      [p("cloud"), 62, 23, 21, "drift", 1, 8, 0],
      [p("water-drop"), 28, 57, 20, "swim", 3, 8, 0],
    ],
  },

  // === 4. 月亮和星星 (12) ===
  "p1b-k01": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    drama: "jing-ye-si",
    story: "夜晚安静极了，一轮明亮的白月亮透过木窗把银光洒在床前，诗人抬头望向圆月，低头想念远方的家。",
    layers: [
      ["art/play/moon.webp", 73, 23, 23, "glow", 0],
      [p("window"), 62, 39, 32, "idle", 0],
      [p("bed"), 28, 63, 33, "idle", 0],
      ["art/wordbook/painted/star.webp", 45, 22, 13, "pulse", 2],
    ],
    verseNotes: [
      "清亮的月光透过窗子，轻轻洒在小小的木床前面。",
      "白白的月光照在地上，好像下了一层薄薄的银色秋霜！",
      "诗人抬起头，静静望着天上圆又亮的明月。",
      "他轻轻低下头，想起了远方温暖的家乡和亲人。",
    ],
  },
  "p1a-j04": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    drama: "gu-lang-yue-xing",
    story: "小时候李白不认识月亮，把它叫作白玉大圆盘，又猜它是神仙的白玉镜子，高高飞在青青云端里。",
    layers: [
      ["art/play/moon.webp", 56, 29, 28, "rise", 3, 0, -5],
      ["art/play/plate.webp", 29, 34, 21, "pulse", 1],
      [p("mirror"), 76, 36, 20, "pulse", 2],
      ["art/wordbook/child.webp", 30, 68, 30, "idle", 0],
    ],
    verseNotes: [
      "小李白抬头看着天上发光的圆东西，还不知道它叫月亮呢。",
      "圆圆白白的，叫它一个亮晶晶的“白玉大圆盘”吧！",
      "再多看一眼，它又像仙女梳妆台上的白玉明镜。",
      "亮晶晶的明镜轻轻飞上高高的青云端啦！",
    ],
  },
  "p2a-j03": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    story: "住在高高山顶小寺庙的百尺高楼上，伸一伸手好像就能摘到亮闪闪的星星，都不敢大声说话呢！",
    layers: [
      [p("star"), 36, 23, 20, "pulse", 1],
      [p("star"), 62, 20, 22, "pulse", 1],
      [p("star"), 76, 33, 17, "pulse", 1],
      [p("house"), 38, 61, 33, "idle", 0],
    ],
  },
  "p3a-j02": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "ripples",
    story: "没有月亮的黑夜里，江面上只有渔船一盏小小的灯火像萤火虫，微风一吹水波荡开，一盏灯碎成满河小星星！",
    layers: [
      ["art/play/boat.webp", 49, 57, 27, "sail", 0],
      [p("lamp"), 51, 47, 17, "glow", 1],
      [p("star"), 28, 67, 14, "pulse", 3],
      [p("star"), 72, 66, 14, "pulse", 3],
    ],
  },
  "p4a-k01": {
    group: "月亮和星星",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "stars",
    story: "傍晚夕阳照在江水上一半碧绿一半火红；到夜晚九月初三，草叶露水像圆珍珠，弯弯的月亮像一把小银弓。",
    layers: [
      ["art/play/sun.webp", 26, 34, 22, "fall", 0, 0, 6],
      ["art/wordbook/moon.webp", 74, 24, 23, "glow", 3],
      [p("water-drop"), 48, 67, 17, "glow", 3],
    ],
  },
  "p4a-j02": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    story: "深夜里烛影长长，银河慢慢西沉，星星渐渐淡去，碧海青天之间，广寒宫里只见一轮静静的明月。",
    layers: [
      ["art/play/moon.webp", 67, 25, 25, "glow", 3],
      [p("lamp"), 29, 59, 24, "glow", 0],
      [p("star"), 45, 22, 16, "pulse", 1],
    ],
  },
  "p5a-k06": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "leaves",
    story: "月亮西落、乌鸦轻啼的深秋寒夜，小船停在枫树桥边对着一盏渔火，远处寒山寺半夜传来悠悠钟声。",
    layers: [
      ["art/play/boat.webp", 48, 61, 27, "sail", 1],
      [p("bell"), 76, 31, 22, "sway", 3],
      [p("maple-leaf"), 26, 44, 21, "fall", 1],
      [p("lamp"), 51, 51, 15, "glow", 1],
    ],
  },
  "p5a-j01": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    story: "七夕夏夜仰望深蓝星空，牛郎星和织女星正在鹊桥相会，家家小院仰望秋月，小姑娘们比谁穿针线最灵巧！",
    layers: [
      [p("bridge"), 50, 44, 26, "glow", 1],
      [p("star"), 30, 24, 18, "pulse", 1],
      [p("star"), 70, 24, 18, "pulse", 1],
      ["art/play/moon.webp", 50, 20, 17, "glow", 2],
    ],
  },
  "p6a-k01": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "mist",
    story: "把小船停在起着轻雾的小洲旁，旷野辽阔得好像天空压在低矮的树梢上，清清的江水倒映着月亮离人好近。",
    layers: [
      ["art/play/boat.webp", 44, 62, 26, "sail", 0],
      ["art/play/moon.webp", 70, 26, 22, "glow", 3],
      ["art/play/tree.webp", 22, 54, 32, "idle", 2],
    ],
  },
  "p6a-k03": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "fireflies",
    story: "明月照亮枝头惊飞了喜鹊，夜风送来稻花香和池塘一片蛙声；天外闪烁几颗星，绕过小溪石桥突然看见老茅店！",
    layers: [
      ["art/play/moon.webp", 26, 22, 22, "glow", 0],
      [p("frog"), 67, 67, 21, "hop", 3],
      [p("star"), 69, 20, 16, "pulse", 4],
      [p("bridge"), 46, 61, 24, "idle", 7],
    ],
  },
  "p6b-k02": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    story: "高高的天河两岸，亮晶晶的织女星与牵牛星隔着清浅的银河相望，默默彼此牵挂。",
    layers: [
      [p("star"), 28, 28, 22, "pulse", 0],
      [p("star"), 73, 28, 22, "pulse", 0],
      [p("yarn"), 50, 56, 23, "sway", 3],
    ],
  },
  "p6b-k03": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "stars",
    story: "中秋月光把小院照得雪白，乌鸦悄悄歇在树梢，清凉秋露沾湿院里的桂花；今晚人人都在抬头看同一轮明月。",
    layers: [
      ["art/play/moon.webp", 52, 22, 26, "glow", 2],
      ["art/play/bird.webp", 27, 45, 19, "idle", 0],
      [p("blossom"), 72, 55, 22, "glow", 1],
    ],
  },

  // === 5. 刮风和下雪 (9) ===
  "p1a-j05": {
    group: "刮风和下雪",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "wind",
    drama: "feng",
    story: "看不见摸不着的风其实力气可大了：吹落秋天树叶，吹开二月春花，吹起大江千尺波浪，吹弯万竿翠竹！",
    layers: [
      ["art/wordbook/windtree.webp", 33, 52, 39, "sway", 0],
      [p("maple-leaf"), 68, 46, 21, "fall", 0, 10, 10],
      [p("blossom"), 64, 59, 21, "grow", 1],
      [p("bamboo"), 73, 51, 36, "sway", 3],
    ],
    verseNotes: [
      "呼——秋风吹过树梢，金红的树叶一片片飘落下来！",
      "暖暖的春风轻轻拂过枝头，二月的小花全都笑开了花。",
      "大风吹过大江水面，激起雪白翻涌的千尺浪花！",
      "阵阵大风钻进翠绿的竹林里，整片竹竿齐刷刷地斜弯下去！",
    ],
  },
  "p2a-k03": {
    group: "刮风和下雪",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    drama: "jiang-xue",
    story: "大雪下个不停，千座山头没有鸟飞，万条小路不见人影，只有一位戴斗笠穿蓑衣的老爷爷坐在小船里独自钓鱼。",
    layers: [
      ["art/play/boat.webp", 52, 62, 29, "sail", 2],
      [p("snowflake"), 30, 26, 17, "fall", 0, 2, 14],
      [p("snowflake"), 72, 32, 16, "fall", 0, -2, 14],
      ["art/fish.webp", 49, 75, 14, "swim", 3, 6, 0],
    ],
    verseNotes: [
      "大雪纷飞，千座连绵的高山上飞鸟都看不见一只。",
      "白雪盖住了万条山间小路，一点儿脚印也没有。",
      "冰冷的大江中央，一叶孤单的小船上坐着戴斗笠的渔翁。",
      "雪花还在静静飘落，老渔翁依然稳稳拿着鱼竿独钓寒江！",
    ],
  },
  "p2a-j01": {
    group: "刮风和下雪",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    drama: "mei-hua",
    archetype: "winter-plum",
    cast: ["plum"],
    story: "墙角边几枝红梅一点也不怕冷，在大雪里独自开放；老远就知道那不是雪花，因为阵阵幽香飘过来了！",
    layers: [
      [p("blossom"), 44, 44, 28, "grow", 1],
      [p("blossom"), 61, 52, 23, "grow", 1],
      [p("snowflake"), 32, 26, 17, "fall", 2, 2, 10],
      [p("snowflake"), 74, 30, 16, "fall", 2, -2, 10],
    ],
    verseNotes: [
      "墙角边静静探出几枝梅花枝，挺立在冬日院墙旁。",
      "满天寒风大雪里，梅花一点也不怕冷，独自热烈地开放。",
      "远远望过去洁白得像雪一样，可我知道它不是雪花——",
      "一阵阵清幽的暗香正随风飘过来，一眼就知道是凌寒的梅花！",
    ],
  },
  "p4a-k03": {
    group: "刮风和下雪",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    story: "梅花和雪花比赛谁更能代表春天，诗人想半天也没分出胜负：梅花没雪那么洁白，可雪花却少了一段清香呀！",
    layers: [
      [p("blossom"), 36, 51, 29, "glow", 2],
      [p("snowflake"), 66, 48, 28, "pulse", 2],
    ],
  },
  "p4b-k06": {
    group: "刮风和下雪",
    backdrop: "clearing-lake",
    time: "mist",
    atmosphere: "petals",
    story: "画家洗砚池边一棵老梅树，开出的花朵只沾着淡淡墨痕，不爱炫耀鲜艳颜色，只愿清香飘满天地。",
    layers: [
      [p("paintbrush"), 33, 56, 28, "sway", 1],
      [p("blossom"), 63, 45, 29, "glow", 1],
    ],
  },
  "p6a-k02": {
    group: "刮风和下雪",
    backdrop: "storm-plain",
    time: "mist",
    atmosphere: "rain",
    story: "乌云像打翻了黑墨水滚过山头，白花花的大雨点像珍珠一样跳进船里；忽然一阵大风把乌云吹散，湖面又和蓝天一样清亮！",
    layers: [
      [p("rain-cloud"), 48, 25, 27, "drift", 0, 12, 0],
      [p("water-drop"), 38, 48, 17, "fall", 1, 0, 12],
      ["art/play/boat.webp", 56, 63, 25, "sail", 1],
      ["art/play/sun.webp", 78, 22, 19, "glow", 3],
    ],
  },
  "p6b-s01": {
    group: "刮风和下雪",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    story: "当年离家时春天的杨柳随风摇摆，如今归来的路上大雪漫天飘飞，走得好慢好辛苦呀。",
    layers: [
      ["art/play/tree.webp", 27, 52, 34, "sway", 0],
      [p("snowflake"), 64, 30, 19, "fall", 2, 0, 14],
      [p("footprints"), 53, 69, 20, "idle", 4],
    ],
  },
  "p5a-j03": {
    group: "刮风和下雪",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    story: "西塞山前白鹭振翅飞翔，江里桃花流水、肥美的鳜鱼游来游去，穿戴青竹笠和绿蓑衣的老翁在细雨斜风中悠闲垂钓不愿回家。",
    layers: [
      ["art/play/bird.webp", 67, 29, 20, "fly", 0, 10, -4],
      ["art/fish.webp", 36, 66, 21, "swim", 1, 8, 0],
      ["art/play/boat.webp", 56, 58, 24, "sail", 3],
      [p("blossom"), 27, 41, 18, "fall", 1],
    ],
  },
  "p3b-j02": {
    group: "刮风和下雪",
    backdrop: "storm-plain",
    time: "mist",
    atmosphere: "rain",
    story: "寂静小河边长着绿青草，深树里有黄鹂清啼；傍晚急雨带着春潮涌来，空荡的渡口边小船自己横停在水面上。",
    layers: [
      ["art/play/boat.webp", 53, 62, 26, "sail", 3],
      ["art/play/bird.webp", 30, 35, 19, "hop", 1],
      [p("rain-cloud"), 65, 22, 20, "drift", 2],
    ],
  },

  // === 6. 小朋友玩耍 (15) ===
  "p1b-k04": {
    group: "小朋友玩耍",
    backdrop: "goose-pond",
    time: "day",
    atmosphere: "ripples",
    drama: "chi-shang",
    story: "一个小娃娃悄悄划着小木船进池塘采大白莲，以为没人知道，可船后面劈开一道长长的绿浮萍露出小秘密！",
    layers: [
      ["art/play/boat.webp", 52, 57, 29, "sail", 0, 14, 0],
      ["art/wordbook/child.webp", 49, 43, 25, "hop", 0, 14, 0],
      ["art/play/lily.webp", 75, 62, 20, "float", 1],
      [p("blossom"), 74, 52, 16, "glow", 1],
    ],
    verseNotes: [
      "小娃娃撑着竹竿，悄悄划着小木船驶进池塘深处。",
      "伸出小手采到了又白又香的莲蓬，高兴地往回划！",
      "小娃娃还以为自己偷偷出来谁也不会发现呢。",
      "嘻嘻，小船后面划开一道长长的绿色浮萍水路，露馅啦！",
    ],
  },
  "p2b-k02": {
    group: "小朋友玩耍",
    backdrop: "meadow",
    time: "day",
    atmosphere: "wind",
    drama: "cun-ju",
    story: "二月青草长高、黄莺飞舞、杨柳飘拂春烟；小朋友放学早早跑回草坪，乘着东风一起放高高的纸风筝！",
    layers: [
      ["art/wordbook/child.webp", 34, 63, 33, "hop", 2, 10, -2],
      [p("runner"), 54, 65, 31, "hop", 2, 10, -3],
      ["art/play/bird.webp", 26, 30, 18, "fly", 0, 10, -4],
      [p("balloon"), 74, 24, 22, "rise", 3, 6, -8],
    ],
    verseNotes: [
      "春天来了！二月青草长高，黄莺在天空快乐地飞舞。",
      "河堤上的嫩绿柳丝轻轻摆动，仿佛醉在软软春烟里。",
      "村里的小朋友早早放学回家，三五成群跑向大草地。",
      "拉起长长的风筝线趁着东风奔跑——风筝高高飞上天啦！",
    ],
  },
  "p2a-j02": {
    group: "小朋友玩耍",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "ripples",
    story: "头发乱蓬蓬的小娃娃侧坐在青苔草丛边专心学钓鱼，有人来问路赶紧摆摆小手——嘘，小声点，别吓跑小鱼！",
    layers: [
      ["art/wordbook/child.webp", 35, 61, 31, "idle", 0],
      ["art/fish.webp", 69, 69, 17, "swim", 3, -6, 0],
      [p("grass"), 24, 67, 21, "sway", 1],
    ],
  },
  "p3a-j01": {
    group: "小朋友玩耍",
    backdrop: "meadow",
    time: "day",
    atmosphere: "clouds",
    story: "小牧童骑在黄牛背上响亮地唱山歌，歌声传遍树林；忽然看见树上有一只叫个不停的蝉，马上闭住嘴屏住呼吸站住啦！",
    layers: [
      [p("cow"), 52, 60, 32, "idle", 0],
      ["art/wordbook/child.webp", 49, 44, 25, "idle", 2],
      ["art/play/tree.webp", 75, 48, 36, "idle", 1],
      [p("music"), 31, 30, 15, "pulse", 1],
    ],
  },
  "p3a-j04": {
    group: "小朋友玩耍",
    backdrop: "goose-pond",
    time: "day",
    atmosphere: "ripples",
    story: "穿绿色罗裙的姑娘采莲走进碧绿荷塘，裙摆和荷叶混成一片，直到听见歌声才知道荷花丛里有人来过。",
    layers: [
      [p("dancer"), 48, 56, 33, "sway", 0],
      ["art/play/lily.webp", 30, 65, 22, "float", 2],
      ["art/play/lily.webp", 72, 63, 21, "float", 2],
      [p("music"), 65, 29, 16, "rise", 3],
    ],
  },
  "p3a-k03": {
    group: "月亮和星星",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "fireflies",
    story: "秋天夜晚梧桐叶沙沙作响，诗人忽然看见远处篱笆角落一盏明亮小灯——原来有小朋友半夜还在拿小棍逗蟋蟀呢！",
    layers: [
      [p("lamp"), 67, 56, 24, "glow", 3],
      ["art/wordbook/child.webp", 52, 62, 28, "idle", 2],
      [p("dry-leaves"), 28, 39, 19, "fall", 0, 4, 12],
    ],
  },
  "p4b-k02": {
    group: "小朋友玩耍",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "petals",
    story: "春天新绿才刚冒头还没成阴凉，小朋友一路小跑追着一只亮黄色的蝴蝶，扑通一下，蝴蝶飞进黄灿灿的油菜花里找不着啦！",
    layers: [
      [p("runner"), 35, 62, 32, "hop", 2, 12, -2],
      [p("butterfly"), 66, 46, 22, "flutter", 2, 12, -6],
      [p("daisy"), 73, 63, 24, "sway", 3],
    ],
  },
  "p4b-k03": {
    group: "小朋友玩耍",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "clouds",
    story: "矮矮的茅屋门口青草绿绿，大哥哥在溪东锄豆苗，二哥哥编织鸡笼，最可爱的小弟弟趴在溪边偷剥莲蓬吃！",
    layers: [
      [p("house"), 26, 49, 30, "idle", 0],
      ["art/wordbook/child.webp", 67, 63, 29, "hop", 6],
      ["art/play/lily.webp", 52, 67, 19, "float", 7],
    ],
  },
  "p5b-k01": {
    group: "小朋友玩耍",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "clouds",
    story: "村里大人们忙着种田纺麻，还没学会耕地的小娃娃也不闲着，蹲在阴凉的大桑树下面认真地学着种小西瓜！",
    layers: [
      ["art/wordbook/child.webp", 39, 62, 31, "hop", 2],
      [p("watermelon"), 64, 65, 22, "grow", 3],
      ["art/play/tree.webp", 72, 46, 36, "sway", 2],
    ],
  },
  "p5b-k02": {
    group: "小朋友玩耍",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    story: "冬天大早小娃娃从铜盆里脱出一块亮圆冰，用彩线穿起来当小铜锣敲，当当声穿透树林，啪嚓一下碎在地上像玻璃！",
    layers: [
      [p("ice-cube"), 52, 52, 26, "pulse", 1],
      ["art/wordbook/child.webp", 31, 61, 32, "hop", 0],
      [p("snowflake"), 72, 28, 17, "fall", 0],
    ],
  },
  "p5b-k03": {
    group: "小朋友玩耍",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "ripples",
    story: "青草长满水边、落日衔在山头，小牧童天黑回家干脆横躺在老黄牛背上，拿着小短笛随心所欲呜哩哇啦地吹着玩。",
    layers: [
      [p("cow"), 52, 62, 31, "glide", 2, -8, 0],
      ["art/wordbook/child.webp", 52, 46, 24, "sway", 2, -8, 0],
      ["art/play/sun.webp", 24, 38, 22, "fall", 1],
      [p("music"), 68, 33, 16, "rise", 3],
    ],
  },
  "p1a-j03": {
    group: "小朋友玩耍",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "none",
    drama: "min-nong",
    story: "大中午太阳正火辣辣晒着，农民伯伯弯腰给禾苗松土，汗水一滴一滴落进土里；碗里的每一颗白米饭都来之不易呀！",
    layers: [
      ["art/play/sun.webp", 52, 20, 22, "glow", 0],
      [p("rice-stalks"), 32, 60, 28, "sway", 1],
      [p("water-drop"), 44, 52, 13, "fall", 1, 0, 12],
      [p("rice-bowl"), 71, 62, 26, "pulse", 2],
    ],
    verseNotes: [
      "正午火辣辣的太阳高挂天上，田里的庄稼正需要照料。",
      "一滴又一滴晶莹的汗水，顺着脸颊落进禾苗下的泥土里。",
      "低头看一看桌子上那碗白花花、香喷喷的米饭呀。",
      "每一粒米饭背后，都有农民伯伯流下的汗水与辛苦呢！",
    ],
  },
  "p2b-j02": {
    group: "小朋友玩耍",
    backdrop: "sunny-field",
    time: "dusk",
    atmosphere: "leaves",
    story: "春天种下一颗小小的谷子，秋天能收获千万粒粮食，可惜古时候农民辛苦一年还是吃不饱，更让人懂得珍惜每一粒粮。",
    layers: [
      ["art/play/seed.webp", 31, 60, 22, "hop", 0],
      [p("rice-stalks"), 62, 56, 33, "grow", 1],
    ],
  },
  "p5b-j05": {
    group: "小朋友玩耍",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    story: "四月的乡村绿遍山野、满河白水泛亮，细雨像白烟飘过，村里人刚刚收完蚕桑又忙着下田插秧。",
    layers: [
      [p("rice-stalks"), 38, 62, 28, "grow", 3],
      [p("seedling"), 63, 63, 24, "grow", 3],
      ["art/play/bird.webp", 72, 32, 18, "fly", 1],
    ],
  },
  "p6a-j04": {
    group: "小朋友玩耍",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "clouds",
    story: "老朋友准备好香喷喷的饭菜邀请诗人到农家做客，推开窗就是农田果园，相约重阳节再来赏满园菊花！",
    layers: [
      [p("house"), 32, 53, 33, "idle", 1],
      [p("daisy"), 67, 61, 24, "grow", 3],
      [p("tea-cup"), 52, 65, 18, "idle", 2],
    ],
  },

  // === 7. 小船和朋友 (20) ===
  "p1b-j03": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "petals",
    story: "李白刚登上小船准备远行，岸边忽然响起拍手踏脚唱歌的声音——好朋友汪伦一路唱着歌来送别他，情谊比桃花潭还深！",
    layers: [
      ["art/play/boat.webp", 56, 58, 30, "sail", 0, 8, 0],
      [p("blossom"), 26, 48, 22, "fall", 2, 4, 12],
      [p("music"), 28, 30, 17, "rise", 1],
    ],
  },
  "p3a-j03": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "dawn",
    atmosphere: "clouds",
    drama: "zao-fa-bai-di-cheng",
    archetype: "water-voyage",
    cast: ["skiff", "poet"],
    story: "早晨告别彩霞里的白帝城，两边的猿猴还在山崖叫不停呢，轻快的小木船早已嗖嗖穿过重重青山驶出老远！",
    layers: [
      ["art/play/boat.webp", 50, 58, 29, "sail", 3, 18, 0],
      ["art/play/mountain.webp", 25, 48, 30, "idle", 2],
      ["art/play/mountain.webp", 76, 48, 30, "idle", 2],
      [p("cloud"), 36, 22, 18, "drift", 0],
    ],
    verseNotes: [
      "早晨告别满天绚丽彩霞里的白帝城，轻舟启程啦。",
      "千里远的江陵路途，顺流而下一天就能快速到达！",
      "江岸两旁高崖上的猿猴还在不停地鸣叫，声音回荡在山谷。",
      "轻快的小木船早已乘风破浪，穿过一重又一重青山飞驰而出！",
    ],
  },
  "p5b-j04": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "petals",
    story: "三月春暖花开时节，李白站在黄鹤楼挥手送别孟浩然坐船去扬州，白帆越来越远消失在天边，只见滚滚长江水向东奔流。",
    layers: [
      ["art/play/boat.webp", 64, 54, 24, "sail", 2, 14, -4],
      [p("house"), 25, 49, 31, "idle", 0],
      [p("blossom"), 44, 34, 17, "fall", 1],
    ],
  },
  "p4a-j03": {
    group: "小船和朋友",
    backdrop: "snow-river",
    time: "snow",
    atmosphere: "snow",
    story: "北风吹着大雁大雪纷纷，不要为前面的路发愁没有好朋友，天下有谁不认识优秀的你呢！",
    layers: [
      ["art/play/bird.webp", 48, 31, 22, "fly", 1, 14, -4],
      [p("snowflake"), 28, 34, 17, "fall", 1],
      [p("snowflake"), 72, 40, 16, "fall", 1],
      [p("cloud"), 32, 22, 19, "drift", 0],
    ],
  },
  "p4b-k04": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "mist",
    atmosphere: "rain",
    story: "夜雨后天刚亮在江边送走朋友，若家乡亲友问起我过得怎样，就说我的心像装在玉壶里的一块晶莹透明冰！",
    layers: [
      [p("ice-cube"), 50, 52, 26, "glow", 3],
      ["art/play/mountain.webp", 73, 53, 28, "idle", 1],
      [p("rain-cloud"), 29, 23, 20, "drift", 0],
    ],
  },
  "p6a-j03": {
    group: "小船和朋友",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    shortHint: "送元二使安西",
    story: "早晨微雨把路面灰尘洗净，客栈旁边的青柳树显得清新翠绿，再干了这杯茶水，向西去可就难遇见老熟人啦。",
    layers: [
      [p("tea-cup"), 50, 61, 24, "pulse", 2],
      ["art/play/tree.webp", 26, 48, 35, "sway", 1],
      [p("rain-cloud"), 68, 22, 20, "drift", 0],
    ],
  },
  "p6b-s02": {
    group: "小船和朋友",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    shortHint: "渭城朝雨",
    story: "渭城的晨雨润湿春柳，举杯惜别即将西行远游的老朋友。",
    layers: [
      [p("tea-cup"), 52, 60, 24, "pulse", 2],
      ["art/play/tree.webp", 73, 49, 34, "sway", 1],
    ],
  },
  "p6b-s06": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "night",
    atmosphere: "wind",
    story: "小船停靠在瓜洲渡口，只隔一条江水就快看见故乡钟山了；春风再次吹绿江南岸，什么时候明月才照着我回家呢？",
    layers: [
      ["art/play/boat.webp", 50, 62, 28, "sail", 0],
      ["art/play/moon.webp", 75, 22, 22, "glow", 3],
      [p("green-leaf"), 29, 54, 19, "grow", 2],
    ],
  },
  "p6b-s08": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "petals",
    story: "山水像眼波眉峰一样清秀温柔，正送完春天又送老朋友去江南，如果你在江南赶上了春天，一定要和春天一起快乐住下呀！",
    layers: [
      ["art/play/boat.webp", 56, 59, 27, "sail", 5],
      ["art/play/mountain.webp", 26, 51, 29, "idle", 1],
      [p("blossom"), 74, 41, 20, "glow", 6],
    ],
  },
  "p2b-j03": {
    group: "小船和朋友",
    backdrop: "snow-river",
    time: "mist",
    atmosphere: "wind",
    shortHint: "江上渔者",
    story: "江边往来的人只顾着称赞鲈鱼鲜美可口，可你们看一看呀，那小小的一叶扁舟正顶着风浪在江心里摇摇晃晃呢！",
    layers: [
      ["art/play/boat.webp", 52, 57, 29, "sail", 2, 6, 0],
      ["art/fish.webp", 30, 68, 19, "swim", 1, 8, 0],
      [p("wave"), 69, 69, 20, "swim", 3],
    ],
  },
  "p6b-s05": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "mist",
    atmosphere: "wind",
    shortHint: "风波扁舟",
    story: "一叶小渔船在翻涌的江波里起伏打鱼，让人记住餐桌上每一道美食背后的辛劳。",
    layers: [
      ["art/play/boat.webp", 49, 58, 28, "sail", 2],
      ["art/fish.webp", 72, 67, 19, "swim", 1],
    ],
  },
  "p6a-k05": {
    group: "小船和朋友",
    backdrop: "autumn-river",
    time: "dawn",
    atmosphere: "stars",
    story: "九曲黄河卷着万里黄沙滚滚扑来，诗人豪迈地幻想顺着大浪一直飞上天上银河，去做牛郎织女家的客人！",
    layers: [
      [p("wave"), 46, 61, 26, "swim", 0, 12, 0],
      [p("star"), 69, 24, 21, "pulse", 2],
      ["art/play/boat.webp", 30, 56, 22, "sail", 2],
    ],
  },
  "p6a-j02": {
    group: "小船和朋友",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "ripples",
    story: "昨夜春江水涨高啦，平日推都推不动的巨大战船突然变得像一片羽毛那样轻，在水中央自由自在地飞驰前进！",
    layers: [
      ["art/play/boat.webp", 52, 56, 33, "sail", 3, 14, 0],
      [p("feather"), 27, 42, 20, "float", 1],
      [p("wave"), 67, 67, 19, "swim", 0],
    ],
  },
  "p1b-j02": {
    group: "小船和朋友",
    backdrop: "lushan-waterfall",
    time: "mist",
    atmosphere: "mist",
    story: "在大松树下遇到小徒弟，小徒弟指指大山深处说：师父出门采药去啦，山里云雾这么浓，连我也不知道他在哪座山峰呢！",
    layers: [
      ["art/wordbook/child.webp", 36, 62, 31, "idle", 0],
      ["art/play/tree.webp", 25, 49, 37, "idle", 0],
      [p("cloud"), 65, 34, 23, "drift", 3, 8, 0],
    ],
  },
  "p3b-k05": {
    group: "小船和朋友",
    backdrop: "spring-garden",
    time: "dawn",
    atmosphere: "sparks",
    story: "噼里啪啦的鞭炮声送走旧年迎来新年！太阳暖融融地照着千家万户，大家都喜气洋洋贴上崭新漂亮的春联桃符！",
    layers: [
      [p("house"), 50, 56, 36, "idle", 2],
      ["art/play/sun.webp", 78, 22, 22, "rise", 2],
      [p("gift"), 26, 63, 21, "hop", 0],
    ],
  },
  "p3b-k06": {
    group: "小船和朋友",
    backdrop: "spring-garden",
    time: "mist",
    atmosphere: "rain",
    story: "清明时节淅淅沥沥飘着春雨，赶路人正愁到哪休息，一个小牧童微笑着远远指向山谷里开满杏花的小村庄！",
    layers: [
      [p("rain-cloud"), 40, 23, 22, "drift", 0],
      ["art/wordbook/child.webp", 34, 62, 31, "idle", 3],
      [p("blossom"), 72, 46, 22, "glow", 3],
      [p("house"), 73, 59, 25, "idle", 3],
    ],
  },
  "p3b-k07": {
    group: "小船和朋友",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "leaves",
    story: "一个人出门在外过节时格外想家，远远想着故乡的哥哥弟弟一起登高戴着茱萸，就少了我一个人呀！",
    layers: [
      ["art/play/mountain.webp", 64, 52, 33, "idle", 2],
      [p("maple-leaf"), 29, 44, 20, "fall", 0],
      [p("green-leaf"), 66, 38, 17, "glow", 3],
    ],
  },
  "p6b-k01": {
    group: "小船和朋友",
    backdrop: "spring-garden",
    time: "dusk",
    atmosphere: "petals",
    story: "春天长安城到处飘飞着花瓣，柳枝斜斜轻拂春风，傍晚一盏盏温暖的蜡烛送往千家万户。",
    layers: [
      [p("blossom"), 34, 41, 22, "fall", 0, 8, 10],
      [p("lamp"), 66, 56, 24, "glow", 2],
      [p("steam"), 66, 39, 17, "rise", 3],
    ],
  },
  "p5a-j02": {
    group: "小船和朋友",
    backdrop: "clearing-lake",
    time: "dawn",
    atmosphere: "petals",
    shortHint: "游子吟",
    story: "慈爱的妈妈在灯下一针一线把孩子出门穿的衣服缝得密密实实，母爱就像春天里最暖和的阳光，照进孩子心窝里。",
    layers: [
      [p("mother"), 36, 57, 33, "idle", 0],
      [p("yarn"), 54, 63, 20, "pulse", 2],
      ["art/play/sun.webp", 76, 22, 23, "glow", 5],
      [p("grass"), 72, 68, 20, "grow", 4],
    ],
  },
  "p5b-j01": {
    group: "小船和朋友",
    backdrop: "clearing-lake",
    time: "dawn",
    atmosphere: "clouds",
    shortHint: "谁言寸草心",
    story: "妈妈一针一线缝着游子的衣裳，温暖的三春阳光守护着小小的青草。",
    layers: [
      [p("mother"), 37, 56, 33, "idle", 0],
      ["art/play/sun.webp", 75, 24, 22, "glow", 5],
      [p("seedling"), 69, 64, 22, "grow", 4],
    ],
  },

  // === 8. 大漠和英雄 (11) ===
  "p4a-k06": {
    group: "大漠和英雄",
    backdrop: "frontier-dusk",
    time: "dusk",
    atmosphere: "wind",
    story: "边塞月光下亮晶晶的夜光杯盛满葡萄酒，马上就要听着琵琶豪爽出发啦！",
    layers: [
      [p("tea-cup"), 50, 61, 24, "glow", 0],
      [p("grapes"), 30, 56, 22, "idle", 0],
      [p("horse"), 74, 57, 29, "hop", 1],
    ],
  },
  "p4a-k07": {
    group: "大漠和英雄",
    backdrop: "frontier-dusk",
    time: "night",
    atmosphere: "wind",
    story: "还是秦汉时期的明月照在古老的边塞关城上，守卫边疆的勇士日夜坚守，绝不让敌人跨过阴山一步！",
    layers: [
      ["art/play/moon.webp", 72, 22, 23, "glow", 0],
      [p("horse"), 39, 59, 32, "hop", 3, 10, 0],
      ["art/play/mountain.webp", 71, 53, 28, "idle", 3],
    ],
  },
  "p4a-k08": {
    group: "大漠和英雄",
    backdrop: "storm-plain",
    time: "dusk",
    atmosphere: "sparks",
    story: "活着要做顶天立地的大英雄，即使遇上困难也要有骨气、有担当，绝不随波逐流。",
    layers: [
      ["art/play/mountain.webp", 50, 53, 35, "idle", 0],
      [p("finish-flag"), 66, 36, 26, "sway", 0],
    ],
  },
  "p4b-k05": {
    group: "大漠和英雄",
    backdrop: "snow-river",
    time: "night",
    atmosphere: "snow",
    story: "月黑风高的夜晚，骑兵冒着鹅毛大雪追击逃走的敌军，漫天雪花落满了英雄手中的长弓和刀鞘！",
    layers: [
      [p("horse"), 48, 59, 34, "hop", 2, 12, 0],
      [p("snowflake"), 30, 30, 18, "fall", 3],
      [p("snowflake"), 72, 34, 18, "fall", 3],
    ],
  },
  "p5a-k01": {
    group: "大漠和英雄",
    backdrop: "frontier-dusk",
    time: "dusk",
    atmosphere: "clouds",
    story: "八十五岁老诗人陆游一辈子最盼望祖国南北团圆，写下诗句嘱咐孩子将来一定要把好消息告诉他。",
    layers: [
      [p("book"), 48, 60, 26, "idle", 0],
      [p("finish-flag"), 67, 46, 28, "sway", 2],
    ],
  },
  "p5a-k02": {
    group: "大漠和英雄",
    backdrop: "autumn-river",
    time: "dusk",
    atmosphere: "mist",
    story: "山外重重青山、楼外重重高楼，诗人在热闹的西湖边提醒大家不要忘记收复失地、居安思危。",
    layers: [
      ["art/play/mountain.webp", 33, 51, 31, "idle", 0],
      [p("house"), 67, 54, 30, "idle", 0],
    ],
  },
  "p5a-k03": {
    group: "大漠和英雄",
    backdrop: "storm-plain",
    time: "dusk",
    atmosphere: "wind",
    story: "沉闷的旧日子需要风雷唤醒生机！诗人呼唤天空降下不拘一格的聪明本领人才，让大地充满活力！",
    layers: [
      ["art/wordbook/thunder.webp", 50, 34, 34, "pulse", 0],
      [p("horse"), 52, 65, 29, "hop", 1, 10, 0],
    ],
  },
  "p5b-k04": {
    group: "大漠和英雄",
    backdrop: "frontier-dusk",
    time: "snow",
    atmosphere: "wind",
    story: "青海长长的乌云笼罩着大雪山，守城将军遥望玉门关，就算金铠甲磨穿了，不胜利也决不回家！",
    layers: [
      ["art/play/mountain.webp", 34, 51, 32, "idle", 0],
      [p("cloud"), 48, 23, 21, "drift", 0],
      [p("horse"), 70, 61, 29, "hop", 3],
    ],
  },
  "p5b-k05": {
    group: "大漠和英雄",
    backdrop: "lushan-waterfall",
    time: "dawn",
    atmosphere: "clouds",
    story: "奔腾三万里的黄河向东流入大海，五千仞的高山高高顶向蓝天，古老土地等着春天再次归来。",
    layers: [
      ["art/play/mountain.webp", 58, 49, 36, "rise", 1],
      [p("wave"), 31, 63, 23, "swim", 0, 10, 0],
    ],
  },
  "p5b-k06": {
    group: "大漠和英雄",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "petals",
    story: "杜甫听见收复家乡的大好消息高兴得眼泪直掉，胡乱收拾起书本就要带着家人坐船穿峡谷欢天喜地回家乡啦！",
    layers: [
      [p("book"), 31, 60, 23, "hop", 3],
      ["art/play/boat.webp", 64, 58, 28, "sail", 6, 12, 0],
      ["art/play/sun.webp", 50, 22, 21, "glow", 4],
    ],
  },
  "p5b-j03": {
    group: "大漠和英雄",
    backdrop: "frontier-dusk",
    time: "dusk",
    atmosphere: "wind",
    story: "远远看去黄河像一条飘带直挂在白云之间，孤单的小城依偎在万丈高山旁，连春风都难吹过遥远的玉门关。",
    layers: [
      ["art/play/mountain.webp", 64, 51, 34, "idle", 1],
      [p("cloud"), 36, 25, 22, "drift", 0, 10, 0],
      [p("wave"), 33, 62, 22, "swim", 0],
    ],
  },

  // === 9. 古代小故事 (15) ===
  "p3a-k07": {
    group: "古代小故事",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "none",
    story: "一群小朋友在院子里玩，一个孩子爬到大水缸上不小心掉进水里！别人都吓跑了，聪明的小司马光捡起大石头砸破水缸，救出了小伙伴！",
    layers: [
      ["art/wordbook/child.webp", 36, 61, 32, "hop", 1],
      [p("stone"), 44, 53, 15, "hop", 1, 10, 5],
      [p("water-drop"), 74, 70, 17, "fall", 1, 4, 6],
    ],
    verseNotes: [
      "好多孩子在院子水缸旁玩捉迷藏，呀！一个小娃娃滑进大水缸里啦！",
      "大家吓得跑去喊大人，小司马光冷静搬起石头砸破水缸，水全流出来，小伙伴得救啦！",
    ],
  },
  "p6a-k09": {
    group: "古代小故事",
    backdrop: "pond-sunrise",
    time: "day",
    atmosphere: "ripples",
    story: "大家正发愁怎么称出巨型大象有多重，五六岁的曹冲想出妙招：把大象牵上大船在水面画条线，再用石头装船对齐水线就能称出来啦！",
    layers: [
      [p("elephant"), 49, 49, 32, "idle", 2],
      ["art/play/boat.webp", 50, 66, 30, "sail", 2],
      [p("stone"), 74, 63, 18, "hop", 2],
    ],
  },
  "p3b-k04": {
    group: "古代小故事",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "clouds",
    story: "一只糊涂小兔子撞死在田边的树桩上，种田人高兴坏了，干脆放下农具整天蹲在树桩边等下一只兔子撞上来——结果庄稼荒了，再也没等到兔子。",
    layers: [
      [p("rabbit"), 34, 62, 26, "hop", 2, 16, 0],
      [p("log"), 63, 62, 25, "idle", 1],
      [p("shovel"), 26, 67, 21, "idle", 3],
    ],
  },
  "p4a-k04": {
    group: "古代小故事",
    backdrop: "pond-sunrise",
    time: "dusk",
    atmosphere: "wind",
    story: "炎帝的小女儿变成了一只叫作“精卫”的小鸟，天天从西山衔起小树枝和小石子，飞到大海上方丢进去，想要把大海填平！",
    layers: [
      ["art/play/bird.webp", 50, 35, 24, "fly", 1, 12, 4],
      [p("stone"), 52, 51, 14, "fall", 1, 0, 18],
      [p("wave"), 64, 69, 22, "swim", 1],
    ],
  },
  "p4a-k05": {
    group: "古代小故事",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "leaves",
    story: "七岁的王戎看见大路边的李子树果实累累却没人摘，立刻聪明地想到：路边大家天天路过都没摘，这李子一定是苦的！一尝果然是苦李！",
    layers: [
      ["art/play/tree.webp", 56, 51, 41, "idle", 1],
      ["art/wordbook/child.webp", 29, 63, 30, "idle", 1],
      [p("peach"), 57, 41, 16, "pulse", 2],
    ],
  },
  "p4b-k07": {
    group: "古代小故事",
    backdrop: "starry-night",
    time: "night",
    atmosphere: "fireflies",
    story: "爱读书的车胤家里穷买不起灯油，夏夜他用白纱袋装起几十只发亮的萤火虫当成小台灯，一直苦读到天亮。",
    layers: [
      [p("lamp"), 58, 49, 25, "glow", 1],
      [p("book"), 39, 62, 25, "glow", 1],
    ],
  },
  "p4b-k08": {
    group: "古代小故事",
    backdrop: "autumn-river",
    time: "day",
    atmosphere: "ripples",
    story: "小李白读书怕难想偷懒溜走，在溪边遇见一位白发老婆婆正认真在石头上磨粗粗的铁棒——“只要天天坚持磨，铁棒也能磨成绣花针！”",
    layers: [
      [p("grandmother"), 36, 59, 32, "idle", 2],
      [p("stone"), 58, 66, 22, "idle", 2],
      ["art/wordbook/child.webp", 73, 62, 29, "idle", 4],
    ],
  },
  "p5b-k07": {
    group: "古代小故事",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "clouds",
    story: "楚国商人吹牛说自己的盾什么都刺不破，又吹牛说自己的矛什么都能刺穿；路人一问“拿你的矛刺你的盾会怎样？”他瞬间呆住答不上来啦！",
    layers: [
      [p("talk"), 52, 34, 24, "pulse", 2],
      [p("laughing-child"), 32, 62, 30, "hop", 3],
      [p("calm-child"), 69, 62, 29, "idle", 3],
    ],
  },
  "p5b-k08": {
    group: "古代小故事",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "none",
    story: "客人开玩笑指着杨梅说“这是你杨家的果子吧？”九岁的杨氏小朋友机灵一转，立刻微笑回答：“没听说孔雀是您孔先生家的鸟呀！”",
    layers: [
      ["art/wordbook/child.webp", 37, 61, 31, "idle", 4],
      ["art/berry.webp", 56, 59, 19, "pulse", 2],
      ["art/play/bird.webp", 74, 42, 21, "fly", 4],
    ],
  },
  "p6a-k08": {
    group: "古代小故事",
    backdrop: "autumn-river",
    time: "dawn",
    atmosphere: "clouds",
    shortHint: "两小儿辩日·列子",
    story: "两个小孩辩论太阳什么时候离人近：早上的太阳大如车盖可凉飕飕，中午的太阳小如盘子却热呼呼，连大学问家孔子也笑了答不上来！",
    layers: [
      ["art/play/sun.webp", 28, 30, 24, "rise", 3],
      ["art/play/sun.webp", 72, 20, 17, "glow", 4],
      ["art/wordbook/child.webp", 34, 64, 29, "hop", 1],
      [p("laughing-child"), 68, 64, 29, "hop", 2],
    ],
  },
  "p6b-k08": {
    group: "古代小故事",
    backdrop: "sunny-field",
    time: "day",
    atmosphere: "clouds",
    shortHint: "两小儿辩日·列御寇",
    story: "早晨凉快大太阳、中午热呼呼小太阳，两个小娃娃认真辩论着为什么，启发我们多多观察大自然！",
    layers: [
      ["art/play/sun.webp", 50, 24, 24, "glow", 3],
      ["art/wordbook/child.webp", 34, 63, 29, "idle", 1],
      [p("laughing-child"), 66, 63, 29, "idle", 2],
    ],
  },
  "p6b-k07": {
    group: "古代小故事",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "none",
    story: "下棋高手同时教两个学生：一个人专心致志听讲，另一个人老想着天上有大鸟飞过，做任何事专心才能学得棒！",
    layers: [
      [p("calm-child"), 33, 62, 30, "idle", 1],
      ["art/play/bird.webp", 72, 28, 21, "fly", 2, 10, -4],
      [p("book"), 48, 64, 22, "idle", 1],
    ],
  },
  "p1b-k03": {
    group: "古代小故事",
    backdrop: "spring-garden",
    time: "day",
    atmosphere: "none",
    story: "《三字经》告诉小朋友：就像一块玉要细心雕琢才好看，小朋友从小专心学习，长大了才会明白许多好道理。",
    layers: [
      [p("school"), 33, 56, 33, "idle", 3],
      [p("book"), 66, 59, 25, "pulse", 3],
      [p("pencil"), 73, 45, 19, "sway", 6],
    ],
  },
  "p5a-k08": {
    group: "古代小故事",
    backdrop: "clearing-lake",
    time: "day",
    atmosphere: "none",
    story: "古人分享读书的三大宝贝：知道就是知道、不知要虚心请问；读书时更要让心、眼睛和嘴巴一齐专注到书本里。",
    layers: [
      [p("book"), 42, 57, 29, "pulse", 5],
      [p("eyes"), 66, 40, 17, "glow", 5],
      [p("heart"), 66, 62, 17, "pulse", 7],
    ],
  },
  "p5a-k04": {
    group: "古代小故事",
    backdrop: "autumn-river",
    time: "dawn",
    atmosphere: "clouds",
    story: "早晨红彤彤的大太阳升起来、潜龙跃起、雄鹰展翅——朝气蓬勃的小朋友正在一步步让未来变得光明又远大！",
    layers: [
      ["art/play/sun.webp", 50, 28, 28, "rise", 7, 0, -6],
      ["art/play/bird.webp", 73, 30, 21, "fly", 11, 10, -6],
      [p("finish-flag"), 26, 52, 27, "sway", 16],
    ],
  },
};

const POEM_ARCHETYPE_OVERRIDES: Readonly<Record<string, PoemArchetype>> = {
  // 小动物
  "p1a-k01": "water-voyage", // 江南
  "p2a-k04": "frontier-epic", // 敕勒歌
  "p2b-k03": "spring-blossom", // 绝句（两个黄鹂）
  "p3b-k01": "spring-blossom", // 绝句（迟日江山丽）
  "p3b-k02": "water-voyage", // 惠崇春江晚景
  "p4b-j03": "spring-blossom", // 蜂
  "p5b-j02": "night-moon", // 鸟鸣涧
  "p6b-k04": "frontier-epic", // 马诗
  // 看山水
  "p3a-k05": "water-voyage", // 望天门山
  "p3a-k01": "night-moon", // 望洞庭
  "p3a-k06": "water-voyage", // 饮湖上初晴后雨
  "p5a-k05": "night-moon", // 山居秋暝
  "p6a-k07": "pastoral-child", // 书湖阴先生壁
  // 花草和春天
  "p4a-j01": "mountain-mist", // 赠刘景文
  "p4b-k01": "pastoral-child", // 四时田园杂兴
  "p4b-j01": "winter-plum", // 卜算子·咏梅
  "p5a-j04": "water-voyage", // 观书有感·其一
  "p6b-s03": "night-moon", // 春夜喜雨
  "p6b-j01": "water-voyage", // 长歌行
  // 刮风和下雪
  "p5a-j03": "water-voyage", // 渔歌子
  "p6a-k02": "water-voyage", // 望湖楼醉书
  "p3b-j02": "water-voyage", // 滁州西涧
  // 小朋友玩耍
  "p2a-j02": "water-voyage", // 小儿垂钓
  "p3a-k04": "water-voyage", // 采莲曲
  "p4b-k02": "spring-blossom", // 宿新市徐公店
  "p5b-k02": "winter-plum", // 稚子弄冰
  // 小船和朋友
  "p1b-j02": "mountain-mist", // 寻隐者不遇
  "p4a-j03": "frontier-epic", // 别董大
  "p6a-j03": "spring-blossom", // 送元二使安西
  "p6b-s02": "spring-blossom", // 送元二使安西（重录）
  "p3b-k05": "pastoral-child", // 元日
  "p3b-k06": "spring-blossom", // 清明
  "p3b-k07": "mountain-mist", // 九月九日忆山东兄弟
  "p6b-k01": "spring-blossom", // 寒食
  "p5a-j02": "pastoral-child", // 游子吟
  "p5b-j01": "pastoral-child", // 游子吟（重录）
  // 大漠和英雄
  "p5a-k03": "spring-blossom", // 己亥杂诗
  "p5b-k06": "water-voyage", // 闻官军收河南河北
};

const POEM_CAST_OVERRIDES: Readonly<Record<string, readonly PoemCastTag[]>> = {
  // Bespoke + highlighted classics
  "p1a-j01": ["poet-bow"],
  "p2a-k02": ["poet"],
  "p1b-k01": ["poet-bow", "lantern"],
  "p1b-j01": ["pavilion", "willow"],
  "p2a-k03": ["fisherman", "skiff"],
  "p1b-k05": ["dragonfly", "lotus-bud"],
  "p1b-j04": ["rooster"],
  "p2a-j01": ["plum"],
  "p3a-j03": ["skiff", "poet"],
  "p2a-k01": ["pavilion", "poet"],
  // 水上行舟 / 泊船 / 垂钓 / 采莲
  "p1a-k01": ["lotus-bud", "skiff"],
  "p1b-j03": ["skiff", "poet", "poet-bow"],
  "p3a-j02": ["skiff", "lantern", "poet"],
  "p5a-k06": ["skiff", "lantern", "pavilion"],
  "p5b-j04": ["pavilion", "skiff", "poet"],
  "p6a-k01": ["skiff", "poet"],
  "p3a-k05": ["skiff", "poet"],
  "p3a-k06": ["skiff", "pavilion"],
  "p5a-j03": ["fisherman", "skiff", "plum"],
  "p2b-j03": ["fisherman", "skiff"],
  "p6b-s05": ["fisherman", "skiff"],
  "p2a-j02": ["child", "fisherman"],
  "p3a-k04": ["skiff", "lotus-bud"],
  "p4b-k04": ["pavilion", "skiff", "poet"],
  "p6b-s06": ["skiff", "poet"],
  "p6b-s08": ["skiff", "pavilion"],
  "p3b-j02": ["skiff", "willow"],
  "p6a-k02": ["pavilion", "skiff"],
  // 山水 / 登高 / 访隐
  "p3a-k02": ["poet", "pavilion"],
  "p4a-k02": ["poet"],
  "p4b-j04": ["poet-bow"],
  "p1b-j02": ["poet", "child"],
  "p2a-j03": ["pavilion", "poet"],
  "p3b-k07": ["poet"],
  "p6b-k06": ["willow"],
  // 春花 / 杨柳 / 风筝 / 梅雪
  "p2b-k01": ["willow"],
  "p2b-k02": ["kite", "willow", "child"],
  "p2b-k04": ["lotus-bud", "pavilion"],
  "p6b-s07": ["plum", "pavilion"],
  "p6a-j03": ["willow", "poet", "pavilion"],
  "p6b-s02": ["willow", "poet", "pavilion"],
  "p3b-k06": ["willow", "child"],
  "p6b-k01": ["willow", "pavilion"],
  "p4a-k03": ["plum"],
  "p4b-k06": ["plum", "scroll"],
  "p4b-j01": ["plum"],
  "p6b-s01": ["willow"],
  "p6b-s03": ["lantern", "plum"],
  "p4b-k02": ["child", "kite"],
  "p3b-k05": ["lantern", "child"],
  "p5a-j02": ["lantern", "child"],
  "p5b-j01": ["lantern", "child"],
  "p3a-k03": ["lantern", "child"],
  // 田园 / 牧童 / 农人
  "p1a-j03": ["farmer"],
  "p2b-j02": ["farmer"],
  "p5b-j05": ["farmer", "willow"],
  "p3a-j01": ["child", "willow"],
  "p5b-k03": ["child", "willow"],
  "p5b-k02": ["child"],
  "p4b-k03": ["child", "lotus-bud"],
  "p5b-k01": ["child"],
  "p6a-j04": ["pavilion", "poet"],
  "p6a-k07": ["pavilion", "willow"],
  // 边塞 / 英雄
  "p4a-k06": ["frontier"],
  "p4a-k07": ["frontier"],
  "p4a-k08": ["frontier", "poet"],
  "p4b-k05": ["frontier"],
  "p5b-k04": ["frontier"],
  "p5b-j03": ["frontier"],
  "p6a-k04": ["frontier"],
  "p4a-j03": ["frontier", "poet"],
  // 古代小故事
  "p3a-k07": ["jar", "child", "scroll"],
  "p6a-k09": ["skiff", "child", "scroll"],
  "p3b-k04": ["child", "scroll"],
  "p4a-k04": ["scroll"],
  "p4a-k05": ["child", "scroll"],
  "p4b-k07": ["lantern", "child", "scroll"],
  "p4b-k08": ["child", "scroll"],
  "p5b-k07": ["scroll"],
  "p5b-k08": ["child", "scroll"],
  "p6a-k08": ["child", "scroll"],
  "p6b-k08": ["child", "scroll"],
  "p6b-k07": ["child", "scroll"],
  "p1b-k03": ["scroll", "lantern"],
  "p5a-k08": ["scroll", "lantern"],
  "p5a-k04": ["frontier", "scroll"],
};

export function resolvePoemArchetype(
  poemId: string,
  scene: PoemScene,
): PoemArchetype {
  if (scene.archetype) return scene.archetype;
  const override = POEM_ARCHETYPE_OVERRIDES[poemId];
  if (override) return override;

  if (scene.time === "night" || scene.group === "月亮和星星") {
    return "night-moon";
  }
  if (scene.time === "snow" || scene.atmosphere === "snow") {
    return "winter-plum";
  }
  if (scene.group === "大漠和英雄" || scene.backdrop === "frontier-dusk") {
    return "frontier-epic";
  }
  if (scene.group === "古代小故事") {
    return "ancient-fable";
  }
  if (scene.group === "小船和朋友" || scene.atmosphere === "ripples") {
    return "water-voyage";
  }
  if (scene.group === "小朋友玩耍") {
    return "pastoral-child";
  }
  if (
    scene.group === "看山水" ||
    scene.backdrop === "lushan-waterfall" ||
    scene.backdrop === "autumn-river"
  ) {
    return "mountain-mist";
  }
  return "spring-blossom";
}

export function resolvePoemCast(
  poemId: string,
  scene: PoemScene,
): readonly PoemCastTag[] {
  if (scene.cast) return scene.cast;
  const override = POEM_CAST_OVERRIDES[poemId];
  if (override) return override;

  const archetype = resolvePoemArchetype(poemId, scene);
  switch (archetype) {
    case "water-voyage":
      return ["skiff", "poet"];
    case "mountain-mist":
      return ["pavilion", "poet"];
    case "night-moon":
      return ["poet-bow", "lantern"];
    case "spring-blossom":
      return scene.atmosphere === "ripples" ? ["lotus-bud", "willow"] : ["willow", "kite"];
    case "winter-plum":
      return ["plum"];
    case "frontier-epic":
      return ["frontier"];
    case "pastoral-child":
      return ["child", "willow"];
    case "ancient-fable":
      return ["scroll", "child"];
  }
}
