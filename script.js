const caseCountSelect = document.getElementById("case-count-select");
const layoutSelect = document.getElementById("layout-select");
const categorySelect = document.getElementById("category-select");
const deviceTargetSelect = document.getElementById("device-target-select");
const styleSelect = document.getElementById("style-select");
const focusSelect = document.getElementById("focus-select");
const characterSelect = document.getElementById("character-select");
const propsModeSelect = document.getElementById("props-mode-select");
const themeToggleButton = document.getElementById("theme-toggle-button");
const generateButton = document.getElementById("generate-button");
const angleVariantButton = document.getElementById("angle-variant-button");
const saveSceneButton = document.getElementById("save-scene-button");
const favoriteButton = document.getElementById("favorite-button");
const copyButton = document.getElementById("copy-button");
const promptOutput = document.getElementById("prompt-output");
const promptOutputJa = document.getElementById("prompt-output-ja");
const editScene = document.getElementById("edit-scene");
const editLight = document.getElementById("edit-light");
const editAngle = document.getElementById("edit-angle");
const editProps = document.getElementById("edit-props");
const editMood = document.getElementById("edit-mood");
const editDetails = document.getElementById("edit-details");
const ngPresetInputs = Array.from(
  document.querySelectorAll('.preset-option input[type="checkbox"]'),
);
const saveFeedback = document.getElementById("save-feedback");
const favoritesList = document.getElementById("favorites-list");
const historyList = document.getElementById("history-list");
const customScenesList = document.getElementById("custom-scenes-list");
const favoritesEmpty = document.getElementById("favorites-empty");
const historyEmpty = document.getElementById("history-empty");
const customScenesEmpty = document.getElementById("custom-scenes-empty");
const customScenesCount = document.getElementById("custom-scenes-count");

const metaCategory = document.getElementById("meta-category");
const metaCaseCount = document.getElementById("meta-case-count");
const metaDeviceTarget = document.getElementById("meta-device-target");
const metaCharacter = document.getElementById("meta-character");
const metaLayout = document.getElementById("meta-layout");
const metaLocation = document.getElementById("meta-location");
const metaLight = document.getElementById("meta-light");
const metaAngle = document.getElementById("meta-angle");
const metaProps = document.getElementById("meta-props");

let currentPromptState = null;
const themeStorageKey = "prompt-generator-theme";
const historyStorageKey = "prompt-generator-history";
const favoritesStorageKey = "prompt-generator-favorites";
const customSceneStorageKey = "prompt-generator-custom-scenes";
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const maxHistoryEntries = 12;
const maxFavoriteEntries = 20;
let promptHistory = [];
let favoritePrompts = [];
let customScenarios = [];

function readStoredTheme() {
  try {
    return window.localStorage.getItem(themeStorageKey);
  } catch (error) {
    return null;
  }
}

function writeStoredTheme(theme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    // Ignore storage failures in restricted browsing contexts.
  }
}

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = resolvedTheme;

  if (!themeToggleButton) {
    return;
  }

  themeToggleButton.textContent = resolvedTheme === "dark" ? "Light" : "Dark";
  themeToggleButton.setAttribute(
    "aria-label",
    resolvedTheme === "dark"
      ? "ライトモードに切り替え"
      : "ダークモードに切り替え",
  );
  themeToggleButton.setAttribute(
    "aria-pressed",
    String(resolvedTheme === "dark"),
  );
}

function getPreferredTheme() {
  const storedTheme = readStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return prefersDarkScheme.matches ? "dark" : "light";
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  writeStoredTheme(nextTheme);
}

function syncThemeWithSystem(event) {
  const storedTheme = readStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") {
    return;
  }

  applyTheme(event.matches ? "dark" : "light");
}

const ngPresetOptions = {
  "no-people": {
    label: "人物や手を入れない",
    en: "Do not add hands, people, or body parts anywhere in the frame.",
    ja: "人物、手、体の一部は画面に入れない。",
  },
  "preserve-print": {
    label: "柄・文字・ロゴを崩さない",
    en: "Do not distort, rewrite, replace, or blur any printed artwork, text, or logo on the case.",
    ja: "ケース上の柄、文字、ロゴは崩さず、書き換えず、ぼかさない。",
  },
  "no-extra-objects": {
    label: "余計な物を増やさない",
    en: "Do not introduce extra objects beyond a minimal set of realistic supporting props.",
    ja: "必要最小限の小物以外は増やさず、余計な物を入れない。",
  },
  "clean-background": {
    label: "背景を主張させすぎない",
    en: "Keep the background understated so it never overpowers the smartphone case.",
    ja: "背景は控えめにして、スマホケースより目立たせない。",
  },
  "realistic-materials": {
    label: "素材感を不自然に変えない",
    en: "Keep the original surface finish and material impression realistic without artificial texture changes.",
    ja: "元の表面仕上げや素材感は不自然に変えず、現実的に保つ。",
  },
  "no-harsh-effects": {
    label: "過度な反射や演出を避ける",
    en: "Avoid excessive glare, dramatic reflections, heavy bokeh, or overdone visual effects.",
    ja: "強すぎる反射、派手すぎる演出、過度なボケ表現は避ける。",
  },
};

function readJsonStorage(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage failures in restricted browsing contexts.
  }
}

const styles = {
  clean: {
    tone: "clean product photography, tidy composition, modern commercial visual",
    propsCount: 1,
  },
  lifestyle: {
    tone: "warm lifestyle product photography, natural daily scene, believable environment",
    propsCount: 2,
  },
  premium: {
    tone: "premium commercial product photography, elegant styling, refined material feeling",
    propsCount: 2,
  },
  casual: {
    tone: "casual social media product photography, relaxed mood, friendly styling",
    propsCount: 2,
  },
};

const focusModes = {
  product:
    "the smartphone case is clearly the main subject, background elements are subtle and secondary",
  scene:
    "the environment is visible but realistic, while the smartphone case still remains the visual anchor",
  balanced:
    "balanced emphasis between the smartphone case and the surrounding scene",
  "camera-closeup":
    "focus closely on the camera cutout area of the smartphone case while keeping the original design unchanged and clearly visible",
};

const characterThemes = {
  none: {
    label: "なし",
  },
  "disney-classic": {
    label: "ディズニー全体",
    sceneJa: "物語の始まりを感じる、上品で夢見心地な空間にする",
    sceneEn:
      "build a polished storybook-inspired setting with elegant decorative details, soft sparkle-like highlights, and a welcoming sense of wonder",
    props: [
      {
        ja: "リボンを思わせる上品な装飾小物",
        en: "refined decorative accents with ribbon-like curves",
      },
      {
        ja: "きらめきを感じるガラス小物",
        en: "small glass accents that catch the light with a subtle magical shimmer",
      },
    ],
    moodJa: "華やかで希望があり、ロマンチックでやさしい",
    moodEn: "graceful, uplifting, romantic, and softly whimsical",
    detailsJa:
      "絵本のような高揚感を出しつつ、現実の商用写真として成立する上品さを保つ",
    detailsEn:
      "create a story-rich sense of wonder while keeping the image grounded, elegant, and commercially realistic",
  },
  "disney-mickey": {
    label: "ディズニー / ミッキー",
    sceneJa: "クラシックで軽快なリズム感がある、赤と黄をほのかに感じる明るい空間にする",
    sceneEn:
      "create a classic upbeat setting with subtle red and golden accents, cheerful rhythm, and clean graphic energy",
    props: [
      {
        ja: "丸みのあるレトロポップな小物",
        en: "rounded retro-pop accents with clean playful curves",
      },
      {
        ja: "明快な色差しを感じる整った雑貨",
        en: "neatly arranged accessories with bright accent color contrast",
      },
    ],
    moodJa: "陽気で親しみやすく、クラシックで元気",
    moodEn: "cheerful, iconic, approachable, and upbeat",
    detailsJa:
      "軽やかなショータイム感をにじませつつ、商用写真としてすっきり見せる",
    detailsEn:
      "suggest lively showtime energy while keeping the image crisp, polished, and commercially usable",
  },
  "disney-minnie": {
    label: "ディズニー / ミニー",
    sceneJa: "可憐で華やかな、リボンやドットを連想する上品な空間にする",
    sceneEn:
      "build a graceful playful setting with ribbon-like styling, delicate dot-inspired accents, and polished feminine charm",
    props: [
      {
        ja: "リボンを思わせる曲線的な小物",
        en: "curved decorative accents that suggest ribbon motifs",
      },
      {
        ja: "上品なドット感のある可愛らしい雑貨",
        en: "cute polished props with subtle dotted styling",
      },
    ],
    moodJa: "可愛らしく上品で、華やかでやさしい",
    moodEn: "sweet, elegant, charming, and polished",
    detailsJa:
      "愛らしさを出しつつ、子どもっぽくしすぎない洗練感を保つ",
    detailsEn:
      "keep the scene charming and feminine while avoiding an overly childish finish",
  },
  "disney-donald": {
    label: "ディズニー / ドナルド",
    sceneJa: "海辺の風を感じる、爽快でにぎやかなマリン寄りの空間にする",
    sceneEn:
      "shape the scene with breezy coastal cues, crisp blue accents, and lively nautical-inspired energy",
    props: [
      {
        ja: "マリンテイストの軽快な小物",
        en: "light nautical-inspired props with brisk coastal character",
      },
      {
        ja: "白と青を思わせる清潔感のある雑貨",
        en: "clean accessories that hint at white-and-blue contrast",
      },
    ],
    moodJa: "爽やかで元気があり、少しコミカルで快活",
    moodEn: "fresh, spirited, lively, and lightly comedic",
    detailsJa:
      "にぎやかさを出しつつ、雑然とせず清潔で抜けのよい画にする",
    detailsEn:
      "bring in lively motion and humor while keeping the frame open, clean, and well organized",
  },
  "disney-daisy": {
    label: "ディズニー / デイジー",
    sceneJa: "都会的でおしゃれな、ラベンダーや白を思わせる洗練空間にする",
    sceneEn:
      "compose a stylish urban-chic setting with soft lavender-like accents, refined glamour, and fashion-forward polish",
    props: [
      {
        ja: "ファッション小物を思わせる洗練アクセント",
        en: "refined fashion-like accents with a boutique feel",
      },
      {
        ja: "やわらかな色差しの上質な雑貨",
        en: "elegant accessories with gentle color accents and a glossy finish",
      },
    ],
    moodJa: "上品で都会的、華やかで自信がある",
    moodEn: "stylish, elegant, glamorous, and confident",
    detailsJa:
      "きらびやかさを出しつつ、商品が埋もれない整った高級感を保つ",
    detailsEn:
      "add polished glamour while keeping the hero product clear and visually dominant",
  },
  "disney-pooh": {
    label: "ディズニー / プー",
    sceneJa: "木漏れ日と木のぬくもりを感じる、素朴でのんびりした空間にする",
    sceneEn:
      "create a warm rustic setting with honey-toned wood, gentle daylight, and relaxed countryside comfort",
    props: [
      {
        ja: "木や布の素朴な小物",
        en: "simple wooden and fabric accents with rustic warmth",
      },
      {
        ja: "やさしい甘さを思わせる自然素材の雑貨",
        en: "natural-material props that hint at mellow sweetness",
      },
    ],
    moodJa: "のんびりしてやさしく、あたたかく安心感がある",
    moodEn: "cozy, gentle, comforting, and unhurried",
    detailsJa:
      "ぬくもりを強めつつ、甘くなりすぎない自然体のライフスタイル写真にする",
    detailsEn:
      "emphasize warmth and comfort while keeping the scene natural and not overly sugary",
  },
  "disney-ariel": {
    label: "ディズニー / アリエル",
    sceneJa: "海の透明感ときらめきを感じる、瑞々しく夢のある空間にする",
    sceneEn:
      "build a luminous aquatic-inspired setting with iridescent highlights, sea-glass tones, and graceful flowing elegance",
    props: [
      {
        ja: "水面の反射を思わせる透け感のある小物",
        en: "translucent accents that suggest water reflections",
      },
      {
        ja: "貝殻や海ガラスを連想する上品な雑貨",
        en: "elegant props inspired by shells and sea-glass textures",
      },
    ],
    moodJa: "みずみずしく幻想的で、自由で華やか",
    moodEn: "fresh, luminous, dreamy, and free-spirited",
    detailsJa:
      "海辺のロマンを感じさせつつ、ファンタジーに寄りすぎない透明感で整える",
    detailsEn:
      "evoke seaside romance and shimmer without pushing the image into overt fantasy",
  },
  "disney-belle": {
    label: "ディズニー / ベル",
    sceneJa: "読書とクラシックな室内装飾を感じる、温かな知的空間にする",
    sceneEn:
      "build a warm literary setting with classic interior touches, golden light, and refined intellectual charm",
    props: [
      {
        ja: "洋書や真鍮を思わせる上品な小物",
        en: "elegant props inspired by old books and subtle brass details",
      },
      {
        ja: "クラシックな室内を思わせる温かみのある雑貨",
        en: "warm decorative accents with a timeless interior feel",
      },
    ],
    moodJa: "知的で上品、温かく落ち着いている",
    moodEn: "intelligent, graceful, warm, and composed",
    detailsJa:
      "物語性を出しつつ、重たくなりすぎない明るい上質感に整える",
    detailsEn:
      "introduce storybook sophistication while keeping the scene bright and commercially refined",
  },
  "disney-elsa": {
    label: "ディズニー / エルサ",
    sceneJa: "氷の透明感と静けさを感じる、クールで澄んだ空間にする",
    sceneEn:
      "shape a crystalline setting with cool luminosity, icy clarity, and elegant restrained drama",
    props: [
      {
        ja: "ガラスや氷面を思わせる透明感のある小物",
        en: "clear reflective accents that suggest glass and frozen surfaces",
      },
      {
        ja: "寒色寄りのミニマルな雑貨",
        en: "minimal accessories with cool-toned polished styling",
      },
    ],
    moodJa: "澄んでいて静か、気高く洗練されている",
    moodEn: "crisp, serene, poised, and refined",
    detailsJa:
      "冷たさを表現しつつ、無機質すぎず高級感のある画に保つ",
    detailsEn:
      "convey cool elegance while avoiding a sterile look and preserving premium appeal",
  },
  "disney-anna": {
    label: "ディズニー / アナ",
    sceneJa: "ぬくもりと行動力を感じる、明るく親しみやすい北国の空間にする",
    sceneEn:
      "create a lively cozy setting with nordic warmth, bright color accents, and approachable adventurous spirit",
    props: [
      {
        ja: "温かな布小物や手仕事感のある雑貨",
        en: "warm textile accents and handmade-style accessories",
      },
      {
        ja: "親しみやすい色差しのカジュアル小物",
        en: "casual props with friendly vivid color touches",
      },
    ],
    moodJa: "朗らかで行動的、温かく親しみやすい",
    moodEn: "optimistic, active, warm, and approachable",
    detailsJa:
      "元気さを出しつつ、生活感を整えた清潔な商品写真にする",
    detailsEn:
      "bring in cheerful energy while keeping the scene tidy, bright, and commercially clean",
  },
  "disney-cinderella": {
    label: "ディズニー / シンデレラ",
    sceneJa: "ガラスの透明感と夜の上品さを感じる、静かなドレスアップ空間にする",
    sceneEn:
      "compose an elegant evening-inspired setting with glass-like highlights, soft silver-blue tones, and refined transformation glamour",
    props: [
      {
        ja: "ガラス細工を思わせる繊細な小物",
        en: "delicate accents inspired by cut glass and polished crystal",
      },
      {
        ja: "夜会を思わせる上品で軽い雑貨",
        en: "light refined accessories that hint at formal evening styling",
      },
    ],
    moodJa: "上品で静か、きらめきがあり夢見心地",
    moodEn: "elegant, quiet, sparkling, and dreamy",
    detailsJa:
      "華やかさを保ちつつ、過度に豪華にせず現実的な高級感に抑える",
    detailsEn:
      "preserve glamour while keeping the image believable and controlled rather than overly ornate",
  },
  "disney-alice": {
    label: "ディズニー / アリス",
    sceneJa: "ティーパーティーの遊び心と不思議な整然さがある空間にする",
    sceneEn:
      "build a whimsical tea-party-inspired setting with curious detail, playful scale cues, and neatly controlled eccentricity",
    props: [
      {
        ja: "ティータイムを思わせる遊び心のある小物",
        en: "playful tea-time accents with a curated whimsical feel",
      },
      {
        ja: "不思議さを感じる整った装飾雑貨",
        en: "tidy decorative props that suggest curious surreal charm",
      },
    ],
    moodJa: "不思議で軽快、上品な遊び心がある",
    moodEn: "curious, whimsical, lively, and neatly imaginative",
    detailsJa:
      "奇妙さを入れつつ、商用写真として破綻しない範囲で整える",
    detailsEn:
      "introduce playful oddity while keeping the composition coherent and commercially usable",
  },
  "disney-tinkerbell": {
    label: "ディズニー / ティンカーベル",
    sceneJa: "小さな光の粒と草花の気配がある、軽やかでいたずらっぽい空間にする",
    sceneEn:
      "create a delicate botanical setting with tiny glowing accents, airy green tones, and playful nimble energy",
    props: [
      {
        ja: "草花や羽の軽さを思わせる小物",
        en: "light botanical accents that suggest petals and feather-like delicacy",
      },
      {
        ja: "きらめきの余韻を感じる小さな雑貨",
        en: "small sparkling accessories with a subtle glowing finish",
      },
    ],
    moodJa: "軽やかでいたずらっぽく、可憐で明るい",
    moodEn: "airy, mischievous, delicate, and bright",
    detailsJa:
      "妖精らしいきらめきをにじませつつ、現実のテーブルトップ写真として成立させる",
    detailsEn:
      "suggest fairy-like sparkle while keeping the scene grounded as a realistic tabletop image",
  },
  "disney-rapunzel": {
    label: "ディズニー / ラプンツェル",
    sceneJa: "夕方の金色の光と花の彩りを感じる、柔らかく創造的な空間にする",
    sceneEn:
      "shape a glowing creative setting with golden-hour warmth, floral color accents, and an artistic handcrafted mood",
    props: [
      {
        ja: "花やクラフト感を思わせるやわらかな小物",
        en: "soft creative props inspired by florals and handmade crafts",
      },
      {
        ja: "筆記具やアトリエ感のある上品な雑貨",
        en: "tasteful studio-like accessories with an artistic feel",
      },
    ],
    moodJa: "朗らかで創造的、あたたかく夢見心地",
    moodEn: "radiant, creative, warm, and dreamlike",
    detailsJa:
      "黄金色の高揚感を入れつつ、商品ディテールが見える自然な露出を保つ",
    detailsEn:
      "bring in glowing optimism while preserving natural exposure and clear product detail",
  },
  "disney-stitch": {
    label: "ディズニー / スティッチ",
    sceneJa: "南国の空気と自由な遊び心を感じる、青の抜け感がある空間にする",
    sceneEn:
      "create a tropical playful setting with airy blue tones, casual island energy, and mischievous charm",
    props: [
      {
        ja: "南国の雑貨を思わせる軽い小物",
        en: "light island-inspired props with relaxed tropical character",
      },
      {
        ja: "青の抜け感があるカジュアル小物",
        en: "casual accessories with airy blue-accent styling",
      },
    ],
    moodJa: "自由でやんちゃ、明るく開放的で親しみやすい",
    moodEn: "free-spirited, mischievous, sunny, and approachable",
    detailsJa:
      "アクティブさを出しつつ、騒がしすぎない抜け感のある商品写真にする",
    detailsEn:
      "capture energetic personality while keeping the composition breezy, controlled, and product-focused",
  },
  "disney-baymax": {
    label: "ディズニー / ベイマックス",
    sceneJa: "白を基調にした近未来のやさしさを感じる、清潔で安心感のある空間にする",
    sceneEn:
      "create a clean near-future setting with soft white surfaces, gentle technology cues, and reassuring minimal warmth",
    props: [
      {
        ja: "白くやわらかなフォルムのミニマル小物",
        en: "minimal rounded props with soft white sculptural forms",
      },
      {
        ja: "医療やテックを思わせる清潔感のある雑貨",
        en: "clean accessories that hint at healthcare and gentle technology",
      },
    ],
    moodJa: "安心感があり、清潔で未来的、やさしい",
    moodEn: "comforting, clean, futuristic, and gentle",
    detailsJa:
      "テック感を入れつつ、冷たすぎないヒューマンな商品写真にする",
    detailsEn:
      "introduce futuristic clarity while preserving warmth and human-friendly softness",
  },
  "disney-marie": {
    label: "ディズニー / マリー",
    sceneJa: "パリの子猫のような可憐さが漂う、白とピンクの上品な空間にする",
    sceneEn:
      "shape a chic feline-inspired setting with white and blush tones, parisian sweetness, and refined softness",
    props: [
      {
        ja: "やわらかな白布やリボンを思わせる小物",
        en: "soft white fabric accents and ribbon-inspired decorative props",
      },
      {
        ja: "可憐で上品な小さな雑貨",
        en: "small elegant accessories with delicate sweet styling",
      },
    ],
    moodJa: "可憐でおしゃれ、やわらかく上品",
    moodEn: "dainty, stylish, soft, and elegant",
    detailsJa:
      "甘さを出しつつ、上質で洗練されたトーンにまとめる",
    detailsEn:
      "bring in sweetness while keeping the overall styling polished and upscale",
  },
  "disney-chipdale": {
    label: "ディズニー / チップとデール",
    sceneJa: "木の実や森のいたずらを感じる、軽快でナチュラルな空間にする",
    sceneEn:
      "build a playful woodland setting with nutty natural textures, quick energy, and cheerful rustic charm",
    props: [
      {
        ja: "木の実や木肌を思わせる自然小物",
        en: "natural props inspired by nuts, bark, and woodland textures",
      },
      {
        ja: "ふたりの掛け合いを思わせる軽快な雑貨",
        en: "lively paired accents that suggest back-and-forth playful energy",
      },
    ],
    moodJa: "いたずらっぽく、明るく、自然で親しみやすい",
    moodEn: "playful, bright, natural, and friendly",
    detailsJa:
      "森の楽しさを入れつつ、雑多にせず商品を主役に保つ",
    detailsEn:
      "bring in woodland fun while keeping the styling controlled and product-led",
  },
  "disney-jasmine": {
    label: "ディズニー / ジャスミン",
    sceneJa: "夜の宮殿と異国の風を感じる、青緑系の気品ある空間にする",
    sceneEn:
      "compose an exotic evening setting with jewel-toned blue-green accents, airy luxury, and poised confidence",
    props: [
      {
        ja: "オリエンタルな幾何感を思わせる小物",
        en: "decorative accents inspired by elegant geometric patterns",
      },
      {
        ja: "宝石色を感じる上質な雑貨",
        en: "refined accessories with jewel-toned color depth",
      },
    ],
    moodJa: "気高く自由で、華やかで洗練されている",
    moodEn: "regal, independent, glamorous, and refined",
    detailsJa:
      "異国感を入れつつ、装飾過多にせず上品な余白を保つ",
    detailsEn:
      "suggest exotic richness while preserving clean space and tasteful restraint",
  },
  "disney-maleficent": {
    label: "ディズニー / マレフィセント",
    sceneJa: "深い緑と黒のコントラストがある、静かな緊張感の空間にする",
    sceneEn:
      "shape a dramatic setting with deep green-black contrast, sculptural shadows, and controlled ominous elegance",
    props: [
      {
        ja: "尖りのあるシルエットを思わせる装飾小物",
        en: "decorative accents with sharp sculptural silhouettes",
      },
      {
        ja: "ダークトーンでまとめた上質な雑貨",
        en: "premium dark-toned accessories with a dramatic finish",
      },
    ],
    moodJa: "気高くミステリアスで、静かな迫力がある",
    moodEn: "majestic, mysterious, dramatic, and controlled",
    detailsJa:
      "ダークさを強めつつ、商品が沈まない露出とコントラストに整える",
    detailsEn:
      "push the dramatic mood while keeping the hero product visible and cleanly separated",
  },
  "tom-and-jerry": {
    label: "トムアンドジェリー",
    sceneJa: "追いかけっこの気配が残る、軽快で遊び心のある生活空間にする",
    sceneEn:
      "shape the setting as a lively lived-in space with playful motion cues, slightly mischievous energy, and tidy comedic tension",
    props: [
      {
        ja: "動きの余韻を感じる軽いテーブル小物",
        en: "light tabletop props arranged to suggest playful movement",
      },
      {
        ja: "朝食まわりを思わせる親しみやすい小物",
        en: "friendly breakfast-style accents that make the scene feel active and familiar",
      },
    ],
    moodJa: "軽快でいたずらっぽく、親しみやすく元気",
    moodEn: "playful, mischievous, approachable, and energetic",
    detailsJa:
      "ドタバタ感をほのめかしつつも、商品写真として散らかりすぎない清潔感を保つ",
    detailsEn:
      "hint at brisk comedic action while keeping the composition clean, balanced, and suitable for product photography",
  },
  moomin: {
    label: "ムーミン",
    sceneJa: "北欧の物語を思わせる、自然に囲まれた静かでやさしい空間にする",
    sceneEn:
      "create a serene nordic-inspired setting with gentle nature presence, handcrafted warmth, and a quiet storybook atmosphere",
    props: [
      {
        ja: "素朴な陶器や木の小物",
        en: "simple ceramic and wooden accents with a handmade feel",
      },
      {
        ja: "草花や自然素材を感じる控えめな小物",
        en: "subtle botanical touches and natural-material props",
      },
    ],
    moodJa: "静かでやさしく、素朴であたたかい",
    moodEn: "calm, gentle, rustic, and warmly comforting",
    detailsJa:
      "童話の余韻を感じさせつつ、自然体で落ち着いた商品写真に仕上げる",
    detailsEn:
      "evoke a gentle fable-like atmosphere while preserving a natural, grounded commercial photo finish",
  },
  miffy: {
    label: "ミッフィー",
    sceneJa: "余白を大切にした、明るく素朴で清潔感のある空間にする",
    sceneEn:
      "compose a bright minimalist setting with clean negative space, simple forms, soft primary-color accents, and a childlike sense of clarity",
    props: [
      {
        ja: "丸みのあるミニマルな小物",
        en: "rounded minimalist props with simple silhouettes",
      },
      {
        ja: "やさしい差し色のあるシンプルな雑貨",
        en: "simple accessories with soft accent colors and a clean finish",
      },
    ],
    moodJa: "無垢で明るく、やさしく整っている",
    moodEn: "innocent, bright, gentle, and neatly composed",
    detailsJa:
      "素朴な可愛らしさを出しつつ、余白と清潔感を保ったミニマルな商品写真にする",
    detailsEn:
      "capture understated charm while preserving generous negative space and a clean minimalist commercial look",
  },
};

const baseScenarios = [
  {
    location: "a bright wooden desk near a window in a home office",
    light: "soft morning natural light",
    angle: "top-down flat lay shot",
    props: [
      "a closed notebook",
      "a ceramic coffee mug",
      "a slim pen",
      "a folded linen cloth",
    ],
    mood: "calm, productive, minimal",
  },
  {
    location: "a cafe table with a clean stone surface",
    light: "gentle afternoon window light",
    angle: "three-quarter product shot from slightly above",
    props: [
      "a small cup of coffee",
      "a menu card",
      "a pair of sunglasses",
      "a paperback book",
    ],
    mood: "urban, relaxed, stylish",
  },
  {
    location: "a neatly made bed with neutral fabric textures",
    light: "soft diffused daylight",
    angle: "angled close-up shot",
    props: [
      "a cotton pillow edge",
      "a folded magazine",
      "a soft knit blanket",
      "a small tray",
    ],
    mood: "cozy, quiet, premium",
  },
  {
    location: "a clean kitchen counter with subtle stone texture",
    light: "clear side light from a nearby window",
    angle: "eye-level product shot with shallow depth of field",
    props: [
      "a glass of water",
      "a small fruit bowl",
      "a wooden tray",
      "a neutral hand towel",
    ],
    mood: "fresh, modern, lived-in",
  },
  {
    location: "an outdoor cafe terrace table on a mild day",
    light: "natural daylight with soft shadows",
    angle: "lifestyle shot from a seated perspective",
    props: [
      "an iced drink",
      "a folded tote bag",
      "a small notebook",
      "a pair of wireless earbuds",
    ],
    mood: "casual, realistic, contemporary",
  },
  {
    location: "a studio tabletop with matte paper backdrop",
    light: "controlled softbox lighting",
    angle: "front-facing commercial product shot",
    props: [
      "a simple acrylic block",
      "a shadow card",
      "a neutral textured paper",
      "a small geometric object",
    ],
    mood: "clean, precise, editorial",
  },
  {
    location: "a shaded riverside bench with calm water in the background",
    light: "soft late afternoon daylight",
    angle: "three-quarter lifestyle shot",
    props: [
      "a canvas tote bag",
      "a paperback book",
      "a stainless water bottle",
      "a folded cotton scarf",
    ],
    mood: "fresh, calm, outdoorsy",
  },
  {
    location: "a smooth riverside stone ledge near a quiet walking path",
    light: "bright natural daylight with gentle reflections",
    angle: "angled close-up product shot",
    props: [
      "a pair of sunglasses",
      "a compact notebook",
      "a simple key ring",
      "a light jacket sleeve",
    ],
    mood: "active, airy, realistic",
  },
  {
    location: "a clean desert picnic table at a scenic rest stop",
    light: "warm golden hour sunlight",
    angle: "front-side commercial lifestyle shot",
    props: [
      "a straw hat",
      "a chilled water bottle",
      "a folded map",
      "a linen pouch",
    ],
    mood: "warm, adventurous, sunlit",
  },
  {
    location: "a desert lodge terrace with sandy hills in the distance",
    light: "soft sunset light",
    angle: "eye-level product shot",
    props: [
      "a ceramic cup",
      "a travel journal",
      "a woven coaster",
      "a light canvas bag",
    ],
    mood: "earthy, relaxed, premium",
  },
  {
    location: "a bench beside a quiet public tennis court",
    light: "clean morning daylight",
    angle: "seated perspective lifestyle shot",
    props: [
      "a tennis ball can",
      "a white sports towel",
      "a reusable bottle",
      "a small duffel bag",
    ],
    mood: "sporty, bright, energetic",
  },
  {
    location: "a shaded table near a tennis club lounge",
    light: "soft midday daylight",
    angle: "three-quarter commercial shot from above",
    props: [
      "a visor",
      "a cold drink",
      "a score notebook",
      "a clean wristband",
    ],
    mood: "active, clean, social",
  },
  {
    location: "a lakeside wooden deck with still water and distant trees",
    light: "clear morning light",
    angle: "flat lay shot with natural depth",
    props: [
      "a folded light sweater",
      "a glass bottle",
      "a small field notebook",
      "a woven mat edge",
    ],
    mood: "peaceful, natural, crisp",
  },
  {
    location: "a forest campsite table arranged neatly in daylight",
    light: "filtered sunlight through trees",
    angle: "top-down outdoor product shot",
    props: [
      "a metal mug",
      "a folded map",
      "a compact lantern",
      "a neutral backpack strap",
    ],
    mood: "outdoor, grounded, practical",
  },
  {
    location: "a mountain cabin porch railing with a scenic valley view",
    light: "soft early morning mountain light",
    angle: "angled hero shot",
    props: [
      "a wool blanket edge",
      "a travel mug",
      "a small binocular case",
      "a wooden tray",
    ],
    mood: "crisp, elevated, cozy",
  },
  {
    location: "a beachside cafe table under light shade",
    light: "bright coastal daylight softened by shade",
    angle: "casual seated viewpoint",
    props: [
      "an iced tea",
      "a pair of sunglasses",
      "a paperback novel",
      "a woven beach tote",
    ],
    mood: "light, summery, relaxed",
  },
  {
    location: "a clean boardwalk bench near the beach",
    light: "warm late afternoon sun",
    angle: "close lifestyle shot",
    props: [
      "a sun hat",
      "a folded towel",
      "a small sunscreen bottle",
      "a canvas pouch",
    ],
    mood: "casual, sunny, natural",
  },
  {
    location: "a greenhouse cafe corner with plants and a simple table",
    light: "soft diffused daylight through glass",
    angle: "three-quarter close-up shot",
    props: [
      "a ceramic planter",
      "a notebook",
      "a glass of sparkling water",
      "a linen napkin",
    ],
    mood: "fresh, botanical, calm",
  },
  {
    location: "a flower market wrapping counter with muted tones",
    light: "gentle natural storefront light",
    angle: "styled product shot from above",
    props: [
      "kraft paper",
      "a bundle of eucalyptus",
      "cotton string",
      "a small pair of scissors",
    ],
    mood: "soft, creative, natural",
  },
  {
    location: "a museum cafe table with a minimal stone surface",
    light: "soft indoor daylight from large windows",
    angle: "premium product shot from slightly above",
    props: [
      "an exhibition brochure",
      "a coffee cup",
      "a sleek pen",
      "a folded coat sleeve",
    ],
    mood: "cultured, polished, modern",
  },
  {
    location: "a hotel lobby side table with refined neutral decor",
    light: "warm ambient lobby lighting",
    angle: "front-side hero product shot",
    props: [
      "a room key card holder",
      "a leather notebook",
      "a glass of water",
      "a structured handbag",
    ],
    mood: "premium, composed, urban",
  },
  {
    location: "an airport lounge table near a large window",
    light: "bright diffused daytime light",
    angle: "travel lifestyle shot",
    props: [
      "a boarding pass",
      "wireless earbuds",
      "a passport cover",
      "a coffee cup",
    ],
    mood: "mobile, sleek, contemporary",
  },
  {
    location: "a train window table on a daytime journey",
    light: "natural side light from the window",
    angle: "angled documentary-style product shot",
    props: [
      "a paper ticket",
      "a compact snack pack",
      "a folded magazine",
      "a light cardigan",
    ],
    mood: "quiet, practical, travel-ready",
  },
  {
    location: "a bookstore reading table with warm wood texture",
    light: "soft overhead and window light",
    angle: "top-down styled shot",
    props: [
      "an open book",
      "a bookmark",
      "a ceramic mug",
      "a fabric pencil case",
    ],
    mood: "thoughtful, cozy, literary",
  },
  {
    location: "a university courtyard bench on a clear day",
    light: "bright natural daylight",
    angle: "casual everyday product shot",
    props: [
      "a spiral notebook",
      "a pen pouch",
      "a reusable bottle",
      "a canvas backpack",
    ],
    mood: "youthful, practical, real-life",
  },
  {
    location: "a craft table in a bright studio workshop",
    light: "clean overhead daylight",
    angle: "top-down creative product shot",
    props: [
      "color swatches",
      "a metal ruler",
      "a pencil",
      "a folded fabric sample",
    ],
    mood: "creative, tidy, hands-on",
  },
  {
    location: "a ceramics studio shelf table with neutral handmade textures",
    light: "soft side daylight",
    angle: "close-up product portrait",
    props: [
      "a small clay dish",
      "a linen cloth",
      "a ceramic cup",
      "a wooden tool",
    ],
    mood: "artisan, warm, tactile",
  },
  {
    location: "a rooftop cafe table at sunset",
    light: "warm evening golden light",
    angle: "urban lifestyle shot",
    props: [
      "a mocktail glass",
      "a pair of sunglasses",
      "a small plate",
      "a lightweight jacket",
    ],
    mood: "stylish, social, sunset-lit",
  },
  {
    location: "a balcony breakfast table with city rooftops in the background",
    light: "soft morning sunlight",
    angle: "angled tabletop shot",
    props: [
      "a croissant plate",
      "a coffee cup",
      "a folded newspaper",
      "a linen placemat",
    ],
    mood: "light, aspirational, everyday",
  },
  {
    location: "a picnic blanket in a grassy park with open shade",
    light: "gentle daylight under tree cover",
    angle: "flat lay outdoor lifestyle shot",
    props: [
      "a picnic basket edge",
      "a lemonade bottle",
      "a paperback book",
      "a cotton napkin",
    ],
    mood: "casual, friendly, fresh",
  },
  {
    location: "a riverside cafe counter overlooking a walking trail",
    light: "clear natural morning light",
    angle: "countertop product shot",
    props: [
      "a pastry plate",
      "a small menu card",
      "a glass water tumbler",
      "a neutral tote strap",
    ],
    mood: "clean, open, scenic",
  },
  {
    location: "a marina cafe table with subtle harbor details in the distance",
    light: "bright daylight with soft reflections",
    angle: "premium lifestyle shot",
    props: [
      "a chilled drink",
      "a deck chair fabric edge",
      "a small notebook",
      "a pair of sunglasses",
    ],
    mood: "breezy, polished, coastal",
  },
  {
    location: "a poolside lounge table in a hotel setting",
    light: "controlled bright daylight under shade",
    angle: "high-end leisure product shot",
    props: [
      "a rolled white towel",
      "a citrus drink",
      "a magazine",
      "a woven bag",
    ],
    mood: "resort-like, clean, summery",
  },
  {
    location: "a ski lodge window seat table with snowy scenery outside",
    light: "cool diffused daylight through large windows",
    angle: "cozy winter lifestyle shot",
    props: [
      "a knitted glove",
      "a hot drink mug",
      "a folded trail map",
      "a wool scarf",
    ],
    mood: "seasonal, cozy, travel-inspired",
  },
  {
    location: "a minimalist spa waiting lounge side table",
    light: "soft warm ambient lighting",
    angle: "calm premium product shot",
    props: [
      "a rolled hand towel",
      "a glass bottle",
      "a small brochure",
      "a stone tray",
    ],
    mood: "serene, refined, minimal",
  },
  {
    location: "a yoga studio bench near a sunlit wall",
    light: "gentle natural morning light",
    angle: "wellness lifestyle shot",
    props: [
      "a rolled yoga mat",
      "a water bottle",
      "a small towel",
      "a canvas pouch",
    ],
    mood: "balanced, healthy, calm",
  },
  {
    location: "a countryside cafe patio table with garden surroundings",
    light: "soft overcast daylight",
    angle: "natural eye-level product shot",
    props: [
      "a teacup",
      "a flower vase",
      "a folded napkin",
      "a small dessert plate",
    ],
    mood: "gentle, charming, airy",
  },
  {
    location: "a vineyard tasting table with a neutral wood surface",
    light: "warm late afternoon light",
    angle: "refined lifestyle close-up",
    props: [
      "a wine glass",
      "a tasting notes card",
      "a cork coaster",
      "a linen napkin",
    ],
    mood: "mature, elegant, warm",
  },
  {
    location: "a farmer's market rest table with simple natural materials",
    light: "bright outdoor daylight",
    angle: "casual market-style product shot",
    props: [
      "a paper bag",
      "a bunch of herbs",
      "a reusable bottle",
      "a folded cloth",
    ],
    mood: "earthy, local, approachable",
  },
  {
    location: "a garden bench beside a small pond",
    light: "soft dappled afternoon light",
    angle: "close lifestyle shot from above",
    props: [
      "a gardening glove",
      "a ceramic cup",
      "a folded magazine",
      "a woven hat",
    ],
    mood: "quiet, natural, relaxed",
  },
  {
    location: "a quiet library window desk with a clean wooden surface",
    locationJa: "静かな図書館の窓際にある、整った木製デスク",
    light: "soft library daylight",
    lightJa: "図書館のやわらかな自然光",
    angle: "studied tabletop shot from above",
    angleJa: "やや上からの落ち着いたテーブルトップカット",
    props: [
      "a hardcover book",
      "a reading lamp base",
      "a slim notebook",
      "a pencil",
    ],
    propsJa: ["ハードカバー本", "読書灯の土台", "細身のノート", "鉛筆"],
    mood: "quiet, focused, academic",
    moodJa: "静かで、集中感があり、知的",
  },
  {
    location: "a record store listening counter with warm wood finishes",
    locationJa: "温かみのある木仕上げのレコードショップ試聴カウンター",
    light: "warm diffused store lighting",
    lightJa: "暖かく拡散した店内照明",
    angle: "close editorial product shot",
    angleJa: "エディトリアル調の近距離商品カット",
    props: [
      "a vinyl sleeve",
      "a pair of headphones",
      "a paper receipt",
      "a canvas tote",
    ],
    propsJa: ["レコードスリーブ", "ヘッドホン", "紙のレシート", "キャンバストート"],
    mood: "retro, stylish, tactile",
    moodJa: "レトロで、スタイリッシュで、質感がある",
  },
  {
    location: "a bakery cafe counter with neatly arranged pastries in the background",
    locationJa: "背景に整然と並んだ焼き菓子が見えるベーカリーカフェのカウンター",
    light: "gentle morning storefront light",
    lightJa: "穏やかな朝の店先の光",
    angle: "front-leaning lifestyle shot",
    angleJa: "前方寄りのライフスタイルカット",
    props: [
      "a pastry plate",
      "a paper bag",
      "a coffee cup",
      "a napkin",
    ],
    propsJa: ["ペストリープレート", "紙袋", "コーヒーカップ", "ナプキン"],
    mood: "friendly, fresh, everyday",
    moodJa: "親しみやすく、フレッシュで、日常的",
  },
  {
    location: "a quiet hotel breakfast table by a large window",
    locationJa: "大きな窓際にある静かなホテル朝食テーブル",
    light: "soft breakfast daylight",
    lightJa: "朝食時間のやわらかな自然光",
    angle: "elevated tabletop product shot",
    angleJa: "少し高めのテーブルトップ商品カット",
    props: [
      "a juice glass",
      "a small plate",
      "a folded napkin",
      "a breakfast menu",
    ],
    propsJa: ["ジュースグラス", "小皿", "折りたたんだナプキン", "朝食メニュー"],
    mood: "clean, restful, polished",
    moodJa: "クリーンで、落ち着きがあり、整っている",
  },
  {
    location: "a gallery bench facing a bright minimalist wall",
    locationJa: "明るいミニマルな壁に向いたギャラリーのベンチ",
    light: "bright indirect gallery light",
    lightJa: "明るい間接的なギャラリー照明",
    angle: "refined side-angle product shot",
    angleJa: "洗練された斜め横からの商品カット",
    props: [
      "an exhibition leaflet",
      "a clean tote bag",
      "a pair of glasses",
      "a slim catalog",
    ],
    propsJa: ["展示リーフレット", "クリーンなトートバッグ", "眼鏡", "薄いカタログ"],
    mood: "minimal, cultural, elegant",
    moodJa: "ミニマルで、文化的で、上品",
  },
  {
    location: "a sunroom side table with soft woven textures",
    locationJa: "柔らかな編み素材があるサンルームのサイドテーブル",
    light: "warm filtered daylight",
    lightJa: "暖かくやわらかな透過光",
    angle: "soft close-up tabletop shot",
    angleJa: "やわらかな近距離テーブルトップカット",
    props: [
      "a woven basket edge",
      "a tea cup",
      "a folded throw",
      "a paperback book",
    ],
    propsJa: ["編みかごの端", "ティーカップ", "折りたたんだスロー", "文庫本"],
    mood: "sunny, cozy, airy",
    moodJa: "日だまり感があり、居心地がよく、軽やか",
  },
  {
    location: "a botanical garden cafe table near large leafy plants",
    locationJa: "大きな葉の植物の近くにある植物園カフェのテーブル",
    light: "humid bright daylight softened by foliage",
    lightJa: "葉に和らげられた明るい自然光",
    angle: "lush lifestyle shot from above",
    angleJa: "やや上からの豊かなライフスタイルカット",
    props: [
      "a glass bottle",
      "a plant tag",
      "a linen napkin",
      "a simple notebook",
    ],
    propsJa: ["ガラスボトル", "植物タグ", "リネンナプキン", "シンプルなノート"],
    mood: "green, fresh, calm",
    moodJa: "グリーン感があり、爽やかで、落ち着いている",
  },
  {
    location: "a skate park seating ledge on a clear afternoon",
    locationJa: "晴れた午後のスケートパークの腰掛けレッジ",
    light: "clear open-air afternoon light",
    lightJa: "開放感のある午後の自然光",
    angle: "casual street-style product shot",
    angleJa: "ストリート感のあるカジュアル商品カット",
    props: [
      "a cap",
      "a skateboard wheel",
      "a drink can",
      "a hoodie sleeve",
    ],
    propsJa: ["キャップ", "スケートボードのウィール", "ドリンク缶", "フーディの袖"],
    mood: "urban, youthful, relaxed",
    moodJa: "都会的で、若々しく、リラックスしている",
  },
  {
    location: "a running track bench beside a quiet athletics field",
    locationJa: "静かな陸上フィールド脇のランニングトラックベンチ",
    light: "bright morning sports light",
    lightJa: "明るい朝のスポーツ向きの光",
    angle: "active product shot from seated height",
    angleJa: "座った高さからのアクティブな商品カット",
    props: [
      "running shoes",
      "a sports bottle",
      "a stopwatch",
      "a towel",
    ],
    propsJa: ["ランニングシューズ", "スポーツボトル", "ストップウォッチ", "タオル"],
    mood: "athletic, clean, motivated",
    moodJa: "運動感があり、クリーンで、前向き",
  },
  {
    location: "a golf club terrace table overlooking a fairway",
    locationJa: "フェアウェイを見渡すゴルフクラブのテラステーブル",
    light: "soft premium morning daylight",
    lightJa: "上質感のあるやわらかな朝の自然光",
    angle: "premium leisure product shot",
    angleJa: "上質なレジャー商品カット",
    props: [
      "a golf glove",
      "a scorecard",
      "a cold drink",
      "a cap",
    ],
    propsJa: ["ゴルフグローブ", "スコアカード", "冷たいドリンク", "キャップ"],
    mood: "leisurely, upscale, clean",
    moodJa: "ゆったりしていて、上品で、クリーン",
  },
  {
    location: "a surf shop bench with waxed boards in soft background blur",
    locationJa: "背景にぼかしたサーフボードが見えるサーフショップのベンチ",
    light: "bright beach-town daylight",
    lightJa: "海辺の街らしい明るい自然光",
    angle: "coastal casual product shot",
    angleJa: "海辺らしいカジュアル商品カット",
    props: [
      "surf wax",
      "a beach towel",
      "a canvas pouch",
      "a water bottle",
    ],
    propsJa: ["サーフワックス", "ビーチタオル", "キャンバスポーチ", "ウォーターボトル"],
    mood: "coastal, active, youthful",
    moodJa: "海辺感があり、アクティブで、若々しい",
  },
  {
    location: "a mountain trail rest table near a scenic lookout",
    locationJa: "景色の良い展望地点近くの山道の休憩テーブル",
    light: "crisp high-altitude daylight",
    lightJa: "高地らしい澄んだ自然光",
    angle: "outdoor hero shot from above",
    angleJa: "やや上からの屋外ヒーローカット",
    props: [
      "a trail map",
      "a metal bottle",
      "a windbreaker",
      "a small snack pack",
    ],
    propsJa: ["登山地図", "金属ボトル", "ウィンドブレーカー", "小さなスナックパック"],
    mood: "adventurous, crisp, practical",
    moodJa: "冒険感があり、澄んでいて、実用的",
  },
  {
    location: "a lakeside rental cabin table with pine textures",
    locationJa: "松の質感がある湖畔レンタルキャビンのテーブル",
    light: "cool morning cabin light",
    lightJa: "キャビンらしい涼やかな朝の光",
    angle: "cozy travel product shot",
    angleJa: "居心地のよい旅行向け商品カット",
    props: [
      "a thermos",
      "a folded cardigan",
      "a local guidebook",
      "a wooden coaster",
    ],
    propsJa: ["サーモス", "折りたたんだカーディガン", "現地ガイドブック", "木製コースター"],
    mood: "quiet, rustic, getaway",
    moodJa: "静かで、素朴で、旅先らしい",
  },
  {
    location: "a campsite folding chair side table at sunset",
    locationJa: "夕暮れ時のキャンプ用フォールディングチェア横のサイドテーブル",
    light: "warm camp sunset light",
    lightJa: "暖かなキャンプの夕暮れ光",
    angle: "relaxed outdoor lifestyle shot",
    angleJa: "リラックスした屋外ライフスタイルカット",
    props: [
      "a lantern",
      "a metal mug",
      "a camp towel",
      "a soft bag",
    ],
    propsJa: ["ランタン", "金属マグ", "キャンプタオル", "やわらかなバッグ"],
    mood: "relaxed, outdoorsy, warm",
    moodJa: "リラックスしていて、アウトドア感があり、暖かい",
  },
  {
    location: "a ferry lounge table with ocean visible through the window",
    locationJa: "窓越しに海が見えるフェリーラウンジのテーブル",
    light: "bright marine daylight",
    lightJa: "海上らしい明るい自然光",
    angle: "travel documentary product shot",
    angleJa: "旅の記録感がある商品カット",
    props: [
      "a ticket stub",
      "a cup lid",
      "a light jacket",
      "a tote strap",
    ],
    propsJa: ["半券", "カップのふた", "軽いジャケット", "トートのストラップ"],
    mood: "mobile, breezy, practical",
    moodJa: "移動感があり、風通しがよく、実用的",
  },
  {
    location: "a station cafe counter during a calm weekday afternoon",
    locationJa: "平日の穏やかな午後にある駅カフェのカウンター",
    light: "soft transit-area daylight",
    lightJa: "移動空間らしいやわらかな自然光",
    angle: "compact everyday product shot",
    angleJa: "コンパクトな日常商品カット",
    props: [
      "a train ticket",
      "a coffee cup",
      "a slim bag",
      "a folded newspaper",
    ],
    propsJa: ["列車の切符", "コーヒーカップ", "細身のバッグ", "折りたたんだ新聞"],
    mood: "urban, mobile, simple",
    moodJa: "都会的で、移動感があり、シンプル",
  },
  {
    location: "a co-working lounge table with modern neutral furniture",
    locationJa: "モダンでニュートラルな家具があるコワーキングラウンジのテーブル",
    light: "balanced office daylight",
    lightJa: "バランスの取れたオフィスの自然光",
    angle: "modern workspace product shot",
    angleJa: "モダンなワークスペースの商品カット",
    props: [
      "a laptop corner",
      "a notebook",
      "a glass tumbler",
      "a pen",
    ],
    propsJa: ["ノートPCの端", "ノート", "ガラスタンブラー", "ペン"],
    mood: "professional, calm, modern",
    moodJa: "プロフェッショナルで、落ち着きがあり、モダン",
  },
  {
    location: "a design studio material table with swatches and samples",
    locationJa: "スウォッチやサンプルが並ぶデザインスタジオのマテリアルテーブル",
    light: "clean studio daylight",
    lightJa: "クリーンなスタジオ自然光",
    angle: "creative flat lay shot",
    angleJa: "クリエイティブなフラットレイ",
    props: [
      "fabric swatches",
      "a metal ruler",
      "a color card",
      "a sharp pencil",
    ],
    propsJa: ["布スウォッチ", "金属定規", "カラーカード", "よく削られた鉛筆"],
    mood: "creative, precise, contemporary",
    moodJa: "クリエイティブで、正確で、現代的",
  },
  {
    location: "a print studio workbench with paper stacks and tools",
    locationJa: "紙の束と道具があるプリントスタジオの作業台",
    light: "even workshop daylight",
    lightJa: "均一な工房の自然光",
    angle: "hands-on tabletop product shot",
    angleJa: "手仕事感のあるテーブルトップ商品カット",
    props: [
      "paper samples",
      "a cutting mat",
      "a ruler",
      "a fabric apron edge",
    ],
    propsJa: ["紙サンプル", "カッティングマット", "定規", "布エプロンの端"],
    mood: "crafted, practical, tactile",
    moodJa: "クラフト感があり、実用的で、質感がある",
  },
  {
    location: "a perfume boutique display table with soft reflective accents",
    locationJa: "やわらかな反射がある香水ブティックのディスプレイテーブル",
    light: "controlled luxury retail lighting",
    lightJa: "コントロールされた高級店舗照明",
    angle: "luxury close-up product shot",
    angleJa: "ラグジュアリーな近距離商品カット",
    props: [
      "a perfume blotter card",
      "a velvet tray",
      "a shopping bag handle",
      "a glass bottle",
    ],
    propsJa: ["香水試香紙", "ベルベットトレー", "ショッピングバッグの持ち手", "ガラスボトル"],
    mood: "luxurious, glossy, refined",
    moodJa: "ラグジュアリーで、つややかで、洗練されている",
  },
  {
    location: "a jewelry store consultation table with a soft stone surface",
    locationJa: "やわらかな石天板のジュエリーショップ接客テーブル",
    light: "focused boutique lighting",
    lightJa: "集中的なブティック照明",
    angle: "premium tabletop hero shot",
    angleJa: "上質なテーブルトップのヒーローカット",
    props: [
      "a ring box",
      "a polishing cloth",
      "a receipt holder",
      "a neutral tray",
    ],
    propsJa: ["リングボックス", "磨き用クロス", "レシートホルダー", "ニュートラルトレー"],
    mood: "elegant, premium, intimate",
    moodJa: "上品で、上質で、親密感がある",
  },
  {
    location: "a rooftop pool cabana table with city skyline blur",
    locationJa: "街のスカイラインがぼけて見えるルーフトッププールカバナのテーブル",
    light: "bright resort daylight",
    lightJa: "リゾート感のある明るい自然光",
    angle: "luxury leisure lifestyle shot",
    angleJa: "ラグジュアリーなレジャーライフスタイルカット",
    props: [
      "a rolled towel",
      "a citrus drink",
      "a pair of sunglasses",
      "a woven bag",
    ],
    propsJa: ["丸めたタオル", "シトラスドリンク", "サングラス", "編みバッグ"],
    mood: "resort, upscale, sunny",
    moodJa: "リゾート感があり、上質で、晴れやか",
  },
  {
    location: "a winery patio barrel table in late afternoon light",
    locationJa: "午後遅めの光が差すワイナリーのパティオ樽テーブル",
    light: "rich golden vineyard light",
    lightJa: "ぶどう園らしい深みのある黄金光",
    angle: "warm premium lifestyle shot",
    angleJa: "暖かみのある上質なライフスタイルカット",
    props: [
      "a tasting glass",
      "a tasting card",
      "a linen napkin",
      "a cork",
    ],
    propsJa: ["テイスティンググラス", "テイスティングカード", "リネンナプキン", "コルク"],
    mood: "warm, mature, elegant",
    moodJa: "暖かく、落ち着きがあり、上品",
  },
  {
    location: "a tea house veranda table with garden view",
    locationJa: "庭が見える茶屋の縁側テーブル",
    light: "soft serene daylight",
    lightJa: "穏やかでやわらかな自然光",
    angle: "calm contemplative product shot",
    angleJa: "静かな余韻のある商品カット",
    props: [
      "a tea cup",
      "a small tray",
      "a folded cloth",
      "a simple book",
    ],
    propsJa: ["ティーカップ", "小さなトレー", "折りたたんだ布", "シンプルな本"],
    mood: "serene, minimal, balanced",
    moodJa: "穏やかで、ミニマルで、整っている",
  },
  {
    location: "a ryokan room low table near a shoji window",
    locationJa: "障子窓の近くにある旅館のローテーブル",
    light: "diffused paper-window light",
    lightJa: "障子越しのやわらかな拡散光",
    angle: "quiet indoor tabletop shot",
    angleJa: "静かな室内のテーブルトップカット",
    props: [
      "a tea set",
      "a folded yukata sash",
      "a room key",
      "a wooden tray",
    ],
    propsJa: ["茶器セット", "折りたたんだ浴衣帯", "部屋鍵", "木製トレー"],
    mood: "tranquil, refined, hospitality-focused",
    moodJa: "静穏で、洗練されていて、おもてなし感がある",
  },
  {
    location: "a stationery shop sample desk with colorful paper goods nearby",
    locationJa: "近くに色とりどりの紙ものがある文具店のサンプルデスク",
    light: "bright playful store light",
    lightJa: "明るく軽やかな店内光",
    angle: "playful product flat lay",
    angleJa: "遊び心のある商品フラットレイ",
    props: [
      "washi tape",
      "paper clips",
      "a notebook",
      "a fountain pen",
    ],
    propsJa: ["マスキングテープ", "ペーパークリップ", "ノート", "万年筆"],
    mood: "playful, creative, neat",
    moodJa: "遊び心があり、クリエイティブで、整っている",
  },
  {
    location: "a florist workshop table with fresh stems and wrapping paper",
    locationJa: "生花の茎と包装紙があるフローリスト工房の作業テーブル",
    light: "cool fresh morning light",
    lightJa: "涼やかで新鮮な朝の光",
    angle: "fresh market-style tabletop shot",
    angleJa: "新鮮さのあるマーケット調テーブルトップカット",
    props: [
      "wrapping paper",
      "garden scissors",
      "green stems",
      "twine",
    ],
    propsJa: ["包装紙", "園芸用はさみ", "緑の茎", "ひも"],
    mood: "fresh, handmade, organic",
    moodJa: "フレッシュで、手仕事感があり、ナチュラル",
  },
  {
    location: "a farmers market cafe stand counter with seasonal produce nearby",
    locationJa: "季節の野菜や果物が近くにあるファーマーズマーケット併設カフェのカウンター",
    light: "open-air market daylight",
    lightJa: "開放的なマーケットの自然光",
    angle: "casual produce-side product shot",
    angleJa: "青果のそばにあるカジュアル商品カット",
    props: [
      "a paper coffee cup",
      "a produce bag",
      "a receipt",
      "a folded cloth",
    ],
    propsJa: ["紙のコーヒーカップ", "青果用バッグ", "レシート", "折りたたんだ布"],
    mood: "local, earthy, friendly",
    moodJa: "ローカル感があり、土っぽさがあり、親しみやすい",
  },
  {
    location: "a city park cafe chair table during spring bloom",
    locationJa: "春の花が咲く時期の街中公園カフェのチェアテーブル",
    light: "soft spring daylight",
    lightJa: "やわらかな春の日差し",
    angle: "seasonal lifestyle shot",
    angleJa: "季節感のあるライフスタイルカット",
    props: [
      "a flower stem",
      "a cold drink",
      "a magazine",
      "a woven bag",
    ],
    propsJa: ["花の茎", "冷たいドリンク", "雑誌", "編みバッグ"],
    mood: "seasonal, light, cheerful",
    moodJa: "季節感があり、軽やかで、明るい",
  },
  {
    location: "a rainy day cafe windowsill table with soft reflections",
    locationJa: "やわらかな反射がある雨の日のカフェ窓際テーブル",
    light: "muted rainy daylight",
    lightJa: "落ち着いた雨の日の自然光",
    angle: "moody close tabletop shot",
    angleJa: "ムードのある近距離テーブルトップカット",
    props: [
      "a warm mug",
      "a folded umbrella strap",
      "a notebook",
      "a spoon",
    ],
    propsJa: ["温かいマグ", "折りたたみ傘のストラップ", "ノート", "スプーン"],
    mood: "quiet, atmospheric, cozy",
    moodJa: "静かで、雰囲気があり、居心地がよい",
  },
  {
    location: "a laundromat folding table with clean pastel surroundings",
    locationJa: "清潔なパステル調の周囲にあるコインランドリーのたたみ台",
    light: "bright practical indoor light",
    lightJa: "明るく実用的な室内光",
    angle: "everyday utility product shot",
    angleJa: "日常の実用感がある商品カット",
    props: [
      "a folded towel",
      "a mesh laundry bag",
      "a detergent bottle",
      "a magazine",
    ],
    propsJa: ["折りたたんだタオル", "メッシュのランドリーバッグ", "洗剤ボトル", "雑誌"],
    mood: "everyday, clean, realistic",
    moodJa: "日常的で、清潔で、現実的",
  },
  {
    location: "a convenience store eat-in counter by the window",
    locationJa: "窓際にあるコンビニのイートインカウンター",
    light: "mixed urban daylight",
    lightJa: "都市的な混ざり合った自然光",
    angle: "compact urban product shot",
    angleJa: "コンパクトな都会的商品カット",
    props: [
      "a canned drink",
      "a small snack pack",
      "a receipt",
      "a shopping bag",
    ],
    propsJa: ["缶ドリンク", "小さなスナックパック", "レシート", "買い物袋"],
    mood: "urban, practical, current",
    moodJa: "都会的で、実用的で、今っぽい",
  },
  {
    location: "a home balcony plant shelf table in the early evening",
    locationJa: "夕方前の自宅バルコニーにある植物棚テーブル",
    light: "soft evening balcony light",
    lightJa: "やわらかな夕方のバルコニー光",
    angle: "home lifestyle side shot",
    angleJa: "自宅ライフスタイルの斜め横カット",
    props: [
      "a watering can",
      "a terracotta pot",
      "a gardening glove",
      "a small spray bottle",
    ],
    propsJa: ["じょうろ", "テラコッタ鉢", "園芸用手袋", "小さなスプレーボトル"],
    mood: "homey, green, peaceful",
    moodJa: "家庭的で、グリーン感があり、穏やか",
  },
  {
    location: "a craft fair stall counter with handmade ceramics nearby",
    locationJa: "手作り陶器が近くにあるクラフトフェア屋台のカウンター",
    light: "soft outdoor fair light",
    lightJa: "やわらかな屋外フェアの光",
    angle: "artisan market product shot",
    angleJa: "作家市のような商品カット",
    props: [
      "a ceramic cup",
      "a kraft bag",
      "a display card",
      "a folded cloth",
    ],
    propsJa: ["陶器カップ", "クラフト紙の袋", "ディスプレイカード", "折りたたんだ布"],
    mood: "artisan, local, warm",
    moodJa: "クラフト感があり、ローカルで、暖かい",
  },
  {
    location: "a seaside hotel room desk with a balcony view",
    locationJa: "バルコニーの景色が見える海辺ホテル客室のデスク",
    light: "bright vacation daylight",
    lightJa: "休暇らしい明るい自然光",
    angle: "travel-room product shot",
    angleJa: "旅先の客室感がある商品カット",
    props: [
      "a room key card",
      "a brochure",
      "a sunglasses case",
      "a bottle of water",
    ],
    propsJa: ["ルームキーカード", "案内パンフレット", "サングラスケース", "ウォーターボトル"],
    mood: "vacation, airy, polished",
    moodJa: "休暇感があり、軽やかで、整っている",
  },
  {
    location: "a winter cafe counter with a snowy street outside",
    locationJa: "外に雪の積もる通りが見える冬のカフェカウンター",
    light: "cool winter window light",
    lightJa: "冬らしい冷たさのある窓光",
    angle: "seasonal cafe product shot",
    angleJa: "季節感のあるカフェ商品カット",
    props: [
      "a knit glove",
      "a hot drink",
      "a scarf edge",
      "a small pastry plate",
    ],
    propsJa: ["ニット手袋", "温かい飲み物", "スカーフの端", "小さなペストリープレート"],
    mood: "wintery, cozy, urban",
    moodJa: "冬らしく、居心地がよく、都会的",
  },
  {
    location: "a summer festival rest table with understated seasonal details",
    locationJa: "控えめな季節感のある夏祭りの休憩テーブル",
    light: "soft evening festival light",
    lightJa: "やわらかな夕方の祭りの光",
    angle: "casual seasonal lifestyle shot",
    angleJa: "季節感のあるカジュアルライフスタイルカット",
    props: [
      "a paper fan",
      "a cold bottle",
      "a small towel",
      "a drawstring pouch",
    ],
    propsJa: ["うちわ", "冷たいボトル", "小さなタオル", "巾着ポーチ"],
    mood: "seasonal, relaxed, lively",
    moodJa: "季節感があり、リラックスしていて、ほどよく活気がある",
  },
  {
    location: "a retro arcade side counter with colorful machines softly blurred in the background",
    locationJa: "背景にカラフルなゲーム筐体がやわらかくぼけて見えるレトロゲームセンターのサイドカウンター",
    light: "mixed neon and indoor ambient light kept soft and realistic",
    lightJa: "やわらかく現実的に整えたネオンと室内照明のミックス光",
    angle: "playful editorial product shot from slightly above",
    angleJa: "少し上から見た遊び心のあるエディトリアル商品カット",
    props: [
      "a token tray",
      "a clear soda cup",
      "a folded score ticket",
      "a small keychain charm",
    ],
    propsJa: ["トークン用トレー", "透明なソーダカップ", "折りたたんだスコアチケット", "小さなキーチャーム"],
    mood: "playful, stylish, believable",
    moodJa: "遊び心があり、スタイリッシュで、ちゃんと成立している",
  },
  {
    location: "a karaoke room side table with subtle colored lights and a tidy snack setup",
    locationJa: "控えめな色照明と整った軽食セットがあるカラオケルームのサイドテーブル",
    light: "soft tinted room lighting balanced with clean exposure",
    lightJa: "きれいな露出に整えた、やわらかな色付き室内照明",
    angle: "casual fun product shot at seated height",
    angleJa: "座った目線のカジュアルで楽しい商品カット",
    props: [
      "a tambourine",
      "a melon soda glass",
      "a songbook corner",
      "a paper napkin",
    ],
    propsJa: ["タンバリン", "メロンソーダのグラス", "曲本の端", "紙ナプキン"],
    mood: "fun, candid, realistic",
    moodJa: "楽しく、自然体で、現実的",
  },
  {
    location: "a capsule toy shop display counter with neatly arranged acrylic cases",
    locationJa: "整然と並んだアクリルケースがあるカプセルトイショップのディスプレイカウンター",
    light: "bright retail lighting with soft reflections",
    lightJa: "やわらかな反射を含む明るい店舗照明",
    angle: "front-facing playful retail product shot",
    angleJa: "正面寄りの遊び心あるリテール商品カット",
    props: [
      "a few empty capsules",
      "a coin tray",
      "a mini display card",
      "a clear acrylic riser",
    ],
    propsJa: ["いくつかの空カプセル", "コイントレー", "小さなディスプレイカード", "透明アクリル台"],
    mood: "quirky, clean, commercial",
    moodJa: "少しユニークで、クリーンで、商用感がある",
  },
  {
    location: "an amusement park cafe terrace table with a carousel softly visible in the distance",
    locationJa: "遠景にメリーゴーラウンドがやわらかく見える遊園地カフェテラスのテーブル",
    light: "bright afternoon daylight with cheerful but natural color",
    lightJa: "明るい午後の自然光に、楽しげだが自然な色味をのせた光",
    angle: "lifestyle product shot with a lightly whimsical backdrop",
    angleJa: "少しだけ浮かれた背景を入れたライフスタイル商品カット",
    props: [
      "a striped paper cup",
      "a park map",
      "a sunglasses case",
      "a compact snack box",
    ],
    propsJa: ["ストライプ柄の紙カップ", "パークマップ", "サングラスケース", "コンパクトなスナックボックス"],
    mood: "cheerful, polished, plausible",
    moodJa: "楽しく、整っていて、十分ありえそう",
  },
  {
    location: "a bowling alley lane-side table with scoreboard lights softly glowing overhead",
    locationJa: "頭上のスコア表示がやわらかく光るボウリング場レーン脇のテーブル",
    light: "balanced recreational indoor light with subtle neon accents",
    lightJa: "控えめなネオンアクセントを含む、整ったレジャー施設の室内光",
    angle: "playful lifestyle product shot from standing height",
    angleJa: "立ち位置から見た遊び心あるライフスタイル商品カット",
    props: [
      "a bowling score slip",
      "a soda cup",
      "a rental shoe tag",
      "a small towel",
    ],
    propsJa: ["ボウリングのスコア用紙", "ソーダカップ", "レンタルシューズのタグ", "小さなタオル"],
    mood: "fun, bright, plausible",
    moodJa: "楽しく、明るく、十分ありえそう",
  },
  {
    location: "a themed dessert cafe counter with whimsical menu cards and polished chrome details",
    locationJa: "遊び心のあるメニューカードと磨かれたクローム装飾があるテーマ系デザートカフェのカウンター",
    light: "bright cafe lighting with cheerful color contrast kept controlled",
    lightJa: "楽しげな色コントラストを抑えて整えた明るいカフェ照明",
    angle: "styled sweet-shop product shot from above",
    angleJa: "やや上からのスイーツショップ風スタイリング商品カット",
    props: [
      "a dessert fork",
      "a milkshake glass",
      "a menu card",
      "a striped napkin",
    ],
    propsJa: ["デザートフォーク", "ミルクシェイクグラス", "メニューカード", "ストライプナプキン"],
    mood: "whimsical, polished, commercial",
    moodJa: "少しファンシーで、整っていて、商用感がある",
  },
  {
    location: "a photo booth waiting counter with printed strips and glossy curtain reflections nearby",
    locationJa: "プリント写真の短冊と光沢カーテンの反射が近くにあるプリクラ待機カウンター",
    light: "soft mall lighting mixed with playful booth glow",
    lightJa: "やわらかな商業施設の光にブースの遊び心ある光を混ぜた照明",
    angle: "compact youth-culture product shot",
    angleJa: "コンパクトなユースカルチャー感のある商品カット",
    props: [
      "a printed photo strip",
      "a coin purse",
      "a lip balm",
      "a clear pouch",
    ],
    propsJa: ["プリント写真の短冊", "コインケース", "リップバーム", "クリアポーチ"],
    mood: "youthful, quirky, real",
    moodJa: "若々しく、少しユニークで、ちゃんと現実的",
  },
  {
    location: "a comic convention rest lounge table with tote bags and badge lanyards nearby",
    locationJa: "トートバッグや参加証ストラップが近くにあるコミックイベント休憩ラウンジのテーブル",
    light: "even event hall lighting with natural skin-tone balance",
    lightJa: "肌色が破綻しないよう整えた均一なイベントホール照明",
    angle: "event lifestyle product shot from slightly above",
    angleJa: "少し上から見たイベント系ライフスタイル商品カット",
    props: [
      "a badge holder",
      "a folded event map",
      "a bottled tea",
      "a tote strap",
    ],
    propsJa: ["参加証ホルダー", "折りたたんだイベントマップ", "ボトル入りのお茶", "トートのストラップ"],
    mood: "energetic, niche, believable",
    moodJa: "活気があり、少しニッチで、十分成立している",
  },
  {
    location: "a vintage toy store display desk with tin robots softly arranged in the background",
    locationJa: "背景にブリキ玩具がやわらかく並ぶヴィンテージトイショップのディスプレイデスク",
    light: "warm collector-shop lighting with gentle reflections",
    lightJa: "やわらかな反射を含む暖色寄りのコレクターショップ照明",
    angle: "retro display product portrait",
    angleJa: "レトロ展示らしい商品ポートレートカット",
    props: [
      "a price tag card",
      "a tiny robot figure",
      "a red box edge",
      "a cleaning cloth",
    ],
    propsJa: ["値札カード", "小さなロボットフィギュア", "赤い箱の端", "クリーニングクロス"],
    mood: "retro, playful, curated",
    moodJa: "レトロで、遊び心があり、きちんとキュレーションされている",
  },
  {
    location: "a mini golf clubhouse table with score pencils and bright turf visible outside",
    locationJa: "スコア用鉛筆と外の鮮やかな人工芝が見えるミニゴルフ場クラブハウスのテーブル",
    light: "clean daylight with recreational color accents",
    lightJa: "レジャー感のある色アクセントを含むクリーンな自然光",
    angle: "casual sports-fun product shot",
    angleJa: "カジュアルなスポーツ遊び感のある商品カット",
    props: [
      "a scorecard",
      "a short pencil",
      "a visor clip",
      "a cold lemonade",
    ],
    propsJa: ["スコアカード", "短い鉛筆", "バイザークリップ", "冷たいレモネード"],
    mood: "cheerful, active, realistic",
    moodJa: "楽しく、アクティブで、現実的",
  },
  {
    location: "a retro diner booth table with checker tiles and a jukebox glow in the background",
    locationJa: "背景にチェッカータイルとジュークボックスの光が見えるレトロダイナーのブーステーブル",
    light: "warm diner light with a controlled pop of color",
    lightJa: "色の遊びを抑えて整えた暖色ダイナー照明",
    angle: "cinematic playful product shot from booth height",
    angleJa: "ボックス席の高さから見たシネマティックで遊び心のある商品カット",
    props: [
      "a cherry soda",
      "a paper placemat",
      "a mini menu stand",
      "a chrome napkin holder",
    ],
    propsJa: ["チェリーソーダ", "紙のプレースマット", "小さなメニュースタンド", "クロームのナプキンホルダー"],
    mood: "nostalgic, bold, usable",
    moodJa: "ノスタルジックで、少し強めだが、十分使える",
  },
  {
    location: "a rooftop cinema snack table with foldable chairs and a projection glow nearby",
    locationJa: "折りたたみチェアと映写の光が近くにあるルーフトップシネマのスナックテーブル",
    light: "soft evening ambient light mixed with projected highlights",
    lightJa: "映写のハイライトを含む、やわらかな夕方の環境光",
    angle: "evening leisure product shot",
    angleJa: "夕方のレジャー感がある商品カット",
    props: [
      "a popcorn box",
      "a canned drink",
      "a ticket stub",
      "a light blanket edge",
    ],
    propsJa: ["ポップコーンボックス", "缶ドリンク", "半券", "薄手ブランケットの端"],
    mood: "atmospheric, playful, credible",
    moodJa: "雰囲気があり、遊び心があり、十分信じられる",
  },
  {
    location: "a themed bookstore feature table with zodiac journals and novelty stationery",
    locationJa: "星座モチーフのノートや個性的な文具が並ぶテーマ書店の特集テーブル",
    light: "soft bookstore lighting with clean tabletop highlights",
    lightJa: "テーブルトップのハイライトをきれいに出したやわらかな書店照明",
    angle: "editorial curiosity-driven product shot",
    angleJa: "好奇心を感じるエディトリアル商品カット",
    props: [
      "a foil-stamped notebook",
      "a novelty pen",
      "a small display sign",
      "a bookmark ribbon",
    ],
    propsJa: ["箔押しノート", "個性的なペン", "小さなディスプレイサイン", "しおりリボン"],
    mood: "curious, niche, polished",
    moodJa: "好奇心があり、少しニッチで、整っている",
  },
  {
    location: "a board game cafe shelf table with colorful boxes softly stacked behind",
    locationJa: "背景にカラフルな箱がやわらかく積まれたボードゲームカフェのシェルフテーブル",
    light: "comfortable cafe light with lively but balanced color",
    lightJa: "にぎやかさを保ちつつバランスを取った居心地のよいカフェ照明",
    angle: "tabletop social-fun product shot",
    angleJa: "テーブルトップ中心の社交的で楽しい商品カット",
    props: [
      "a score pad",
      "wooden game tokens",
      "an iced latte",
      "a rulebook corner",
    ],
    propsJa: ["スコアパッド", "木製ゲームトークン", "アイスラテ", "ルールブックの端"],
    mood: "social, colorful, believable",
    moodJa: "社交的で、カラフルで、ちゃんと成立している",
  },
  {
    location: "a planetarium cafe counter with star charts and deep blue ambient lighting",
    locationJa: "星図と深い青の環境光があるプラネタリウム併設カフェのカウンター",
    light: "moody blue ambient light balanced to keep product detail visible",
    lightJa: "商品ディテールが消えないよう整えたムーディな青系環境光",
    angle: "moody playful product shot from slightly above",
    angleJa: "少し上から見たムーディで遊び心のある商品カット",
    props: [
      "a star chart leaflet",
      "a dark coaster",
      "a glass bottle",
      "a silver pen",
    ],
    propsJa: ["星図リーフレット", "ダークカラーのコースター", "ガラスボトル", "シルバーペン"],
    mood: "dreamy, niche, grounded",
    moodJa: "少し夢があり、ニッチだが、地に足がついている",
  },
  {
    location: "a simple white desk in a bright room",
    locationJa: "明るい部屋にあるシンプルな白いデスク",
    light: "soft natural daylight",
    lightJa: "やわらかな自然光",
    angle: "clean product shot from slightly above",
    angleJa: "やや上からのクリーンな商品カット",
    props: ["a notebook", "a glass of water", "a pen", "a folded cloth"],
    propsJa: ["ノート", "グラスの水", "ペン", "折りたたんだ布"],
    mood: "clean, simple, bright",
    moodJa: "クリーンで、シンプルで、明るい",
  },
  {
    location: "a wooden dining table by a window",
    locationJa: "窓際にある木製ダイニングテーブル",
    light: "gentle window light",
    lightJa: "穏やかな窓光",
    angle: "natural tabletop shot",
    angleJa: "自然なテーブルトップカット",
    props: ["a mug", "a small plate", "a napkin", "a slim book"],
    propsJa: ["マグ", "小皿", "ナプキン", "薄い本"],
    mood: "natural, everyday, calm",
    moodJa: "自然で、日常的で、落ち着いている",
  },
  {
    location: "a neat office desk with minimal stationery",
    locationJa: "最小限の文具がある整ったオフィスデスク",
    light: "bright indoor daylight",
    lightJa: "明るい室内の自然光",
    angle: "front-side product shot",
    angleJa: "前方寄りの商品カット",
    props: ["a memo pad", "a pen", "a keyboard edge", "a coffee cup"],
    propsJa: ["メモパッド", "ペン", "キーボードの端", "コーヒーカップ"],
    mood: "tidy, practical, modern",
    moodJa: "整っていて、実用的で、モダン",
  },
  {
    location: "a plain cafe counter with a clean surface",
    locationJa: "すっきりした天板のシンプルなカフェカウンター",
    light: "soft cafe daylight",
    lightJa: "やわらかなカフェの自然光",
    angle: "casual product shot",
    angleJa: "カジュアルな商品カット",
    props: ["a coffee cup", "a menu card", "a napkin", "a small tray"],
    propsJa: ["コーヒーカップ", "メニューカード", "ナプキン", "小さなトレー"],
    mood: "casual, clean, friendly",
    moodJa: "カジュアルで、クリーンで、親しみやすい",
  },
  {
    location: "a hotel room side table with neutral decor",
    locationJa: "ニュートラルな内装のホテル客室サイドテーブル",
    light: "soft room light",
    lightJa: "やわらかな客室光",
    angle: "calm close product shot",
    angleJa: "落ち着いた近距離商品カット",
    props: ["a room card", "a brochure", "a glass bottle", "a folded fabric"],
    propsJa: ["ルームカード", "案内パンフレット", "ガラスボトル", "折りたたんだ布"],
    mood: "quiet, clean, premium",
    moodJa: "静かで、クリーンで、上質",
  },
  {
    location: "a simple park bench on a clear day",
    locationJa: "晴れた日にあるシンプルな公園のベンチ",
    light: "clear outdoor daylight",
    lightJa: "澄んだ屋外の自然光",
    angle: "light outdoor product shot",
    angleJa: "軽やかな屋外商品カット",
    props: ["a tote bag", "a water bottle", "a book", "a cap"],
    propsJa: ["トートバッグ", "ウォーターボトル", "本", "キャップ"],
    mood: "fresh, open, casual",
    moodJa: "爽やかで、開放感があり、カジュアル",
  },
  {
    location: "a kitchen table with a clean white surface",
    locationJa: "清潔な白い天板のキッチンテーブル",
    light: "soft morning light",
    lightJa: "やわらかな朝の光",
    angle: "simple overhead product shot",
    angleJa: "シンプルな真上からの商品カット",
    props: ["a glass", "a linen cloth", "a spoon", "a small bowl"],
    propsJa: ["グラス", "リネンクロス", "スプーン", "小鉢"],
    mood: "fresh, simple, homey",
    moodJa: "フレッシュで、シンプルで、家庭的",
  },
  {
    location: "a bookstore counter with a quiet atmosphere",
    locationJa: "静かな空気がある書店のカウンター",
    light: "soft indoor light",
    lightJa: "やわらかな室内光",
    angle: "editorial tabletop shot",
    angleJa: "エディトリアル調のテーブルトップカット",
    props: ["a book", "a bookmark", "a receipt", "a pen"],
    propsJa: ["本", "しおり", "レシート", "ペン"],
    mood: "quiet, thoughtful, neat",
    moodJa: "静かで、思慮深く、整っている",
  },
  {
    location: "a balcony table with open sky in the background",
    locationJa: "背景に空が広がるバルコニーテーブル",
    light: "bright open daylight",
    lightJa: "明るく開放的な自然光",
    angle: "airy lifestyle product shot",
    angleJa: "軽やかなライフスタイル商品カット",
    props: ["a drink glass", "a folded newspaper", "a plate", "a cloth"],
    propsJa: ["ドリンクグラス", "折りたたんだ新聞", "皿", "クロス"],
    mood: "airy, light, relaxed",
    moodJa: "軽やかで、明るく、リラックスしている",
  },
  {
    location: "a studio table with a plain paper backdrop",
    locationJa: "無地のペーパー背景を使ったスタジオテーブル",
    light: "controlled studio light",
    lightJa: "コントロールされたスタジオ光",
    angle: "simple commercial product shot",
    angleJa: "シンプルな商用商品カット",
    props: ["an acrylic block", "a paper card", "a small object", "a shadow board"],
    propsJa: ["アクリルブロック", "ペーパーカード", "小さなオブジェ", "シャドーボード"],
    mood: "clean, direct, commercial",
    moodJa: "クリーンで、直線的で、商用感がある",
  },
];

const generatedSceneBases = [
  {
    spotEn: "desk",
    spotJa: "デスク",
    categories: ["indoor", "daily", "work"],
  },
  {
    spotEn: "table",
    spotJa: "テーブル",
    categories: ["indoor", "daily"],
  },
  {
    spotEn: "cafe table",
    spotJa: "カフェテーブル",
    categories: ["cafe", "indoor", "daily"],
  },
  {
    spotEn: "counter",
    spotJa: "カウンター",
    categories: ["indoor", "urban"],
  },
  {
    spotEn: "side table",
    spotJa: "サイドテーブル",
    categories: ["indoor", "luxury"],
  },
  {
    spotEn: "bench",
    spotJa: "ベンチ",
    categories: ["outdoor", "daily"],
  },
  {
    spotEn: "balcony table",
    spotJa: "バルコニーテーブル",
    categories: ["daily", "outdoor", "travel"],
  },
  {
    spotEn: "studio table",
    spotJa: "スタジオテーブル",
    categories: ["indoor", "work"],
  },
  {
    spotEn: "window seat table",
    spotJa: "窓際テーブル",
    categories: ["indoor", "travel"],
  },
  {
    spotEn: "shelf table",
    spotJa: "シェルフテーブル",
    categories: ["indoor", "daily"],
  },
  {
    spotEn: "work table",
    spotJa: "作業テーブル",
    categories: ["indoor", "work"],
  },
  {
    spotEn: "breakfast table",
    spotJa: "朝食テーブル",
    categories: ["daily", "indoor"],
  },
  {
    spotEn: "lounge table",
    spotJa: "ラウンジテーブル",
    categories: ["indoor", "luxury", "travel"],
  },
  {
    spotEn: "garden table",
    spotJa: "ガーデンテーブル",
    categories: ["outdoor", "nature", "daily"],
  },
  {
    spotEn: "patio table",
    spotJa: "パティオテーブル",
    categories: ["outdoor", "travel", "daily"],
  },
  {
    spotEn: "display table",
    spotJa: "ディスプレイテーブル",
    categories: ["indoor", "work", "urban"],
  },
  {
    spotEn: "reading table",
    spotJa: "読書テーブル",
    categories: ["indoor", "daily"],
  },
  {
    spotEn: "kitchen counter",
    spotJa: "キッチンカウンター",
    categories: ["indoor", "daily"],
  },
  {
    spotEn: "window counter",
    spotJa: "窓際カウンター",
    categories: ["indoor", "urban", "travel"],
  },
  {
    spotEn: "terrace table",
    spotJa: "テラステーブル",
    categories: ["outdoor", "travel", "cafe"],
  },
];

const generatedSceneSurfaces = [
  { en: "white", ja: "白い" },
  { en: "wooden", ja: "木製の" },
  { en: "light beige", ja: "ライトベージュの" },
  { en: "stone-top", ja: "石天板の" },
  { en: "glass-top", ja: "ガラス天板の" },
  { en: "linen-covered", ja: "リネンクロスを敷いた" },
  { en: "compact", ja: "コンパクトな" },
  { en: "neat", ja: "整った" },
  { en: "plain", ja: "無地の" },
  { en: "minimal", ja: "ミニマルな" },
  { en: "soft gray", ja: "ソフトグレーの" },
  { en: "warm beige", ja: "ウォームベージュの" },
  { en: "matte black", ja: "マットブラックの" },
  { en: "cream-colored", ja: "クリーム色の" },
  { en: "oak", ja: "オーク材の" },
  { en: "clean-lined", ja: "直線的な" },
  { en: "smooth-top", ja: "なめらかな天板の" },
  { en: "soft-toned", ja: "やわらかな色味の" },
  { en: "light wood", ja: "ライトウッドの" },
  { en: "calm-toned", ja: "落ち着いた色味の" },
];

const generatedSceneBackdrops = [
  { en: "near a window", ja: "窓際にある" },
  { en: "by a plain wall", ja: "無地の壁際にある" },
  { en: "in a bright room", ja: "明るい部屋にある" },
  { en: "with neutral decor", ja: "ニュートラルな内装の中にある" },
  { en: "with soft greenery nearby", ja: "近くにやわらかなグリーンがある" },
  { en: "with open space around it", ja: "周囲に余白がある" },
  { en: "in a quiet corner", ja: "静かな一角にある" },
  { en: "with a simple background", ja: "シンプルな背景の前にある" },
  { en: "by a shelf", ja: "棚のそばにある" },
  { en: "with a calm city view", ja: "落ち着いた街並みを背景にした" },
  { en: "beside a soft curtain", ja: "やわらかなカーテンのそばにある" },
  { en: "with open sky nearby", ja: "近くに空の抜けがある" },
  { en: "with gentle shadows around it", ja: "周囲にやわらかな影がある" },
  { en: "in a tidy space", ja: "整った空間にある" },
  { en: "with natural depth behind it", ja: "奥に自然な奥行きがある" },
  { en: "with soft morning air", ja: "朝のやわらかな空気感がある" },
  { en: "with subtle indoor greenery", ja: "控えめな室内グリーンがある" },
  { en: "in a calm private room", ja: "落ち着いた個室空間にある" },
  { en: "with a bright backdrop", ja: "明るい背景を背にした" },
  { en: "beside a clean wall", ja: "クリーンな壁のそばにある" },
];

const generatedLightPresets = [
  { en: "soft natural daylight", ja: "やわらかな自然光" },
  { en: "gentle window light", ja: "穏やかな窓光" },
  { en: "bright indoor daylight", ja: "明るい室内の自然光" },
  { en: "clear morning light", ja: "澄んだ朝の光" },
  { en: "soft afternoon light", ja: "やわらかな午後の光" },
  { en: "clean daylight", ja: "クリーンな自然光" },
  { en: "soft side light", ja: "やわらかなサイド光" },
  { en: "bright window daylight", ja: "明るい窓辺の自然光" },
  { en: "light ambient daylight", ja: "軽やかな環境光" },
  { en: "calm indoor daylight", ja: "落ち着いた室内自然光" },
];

const generatedAnglePresets = [
  { en: "clean product shot from slightly above", ja: "やや上からのクリーンな商品カット" },
  { en: "natural tabletop shot", ja: "自然なテーブルトップカット" },
  { en: "simple overhead product shot", ja: "シンプルな真上からの商品カット" },
  { en: "front-side product shot", ja: "前方寄りの商品カット" },
  { en: "casual product shot", ja: "カジュアルな商品カット" },
  { en: "simple close product shot", ja: "シンプルな近距離商品カット" },
  { en: "balanced tabletop product shot", ja: "バランスのよいテーブルトップ商品カット" },
  { en: "light lifestyle product shot", ja: "軽やかなライフスタイル商品カット" },
  { en: "straightforward product shot", ja: "素直な商品カット" },
  { en: "soft overhead tabletop shot", ja: "やわらかな俯瞰テーブルトップカット" },
];

const generatedMoodPresets = [
  { en: "clean, simple, bright", ja: "クリーンで、シンプルで、明るい" },
  { en: "natural, calm, everyday", ja: "自然で、落ち着いていて、日常的" },
  { en: "tidy, practical, modern", ja: "整っていて、実用的で、モダン" },
  { en: "quiet, neat, friendly", ja: "静かで、整っていて、親しみやすい" },
  { en: "light, relaxed, clean", ja: "軽やかで、リラックスしていて、クリーン" },
  { en: "simple, calm, modern", ja: "シンプルで、落ち着いていて、モダン" },
  { en: "bright, tidy, natural", ja: "明るく、整っていて、自然" },
  { en: "soft, clean, casual", ja: "やわらかく、クリーンで、カジュアル" },
  { en: "minimal, quiet, polished", ja: "ミニマルで、静かで、整っている" },
  { en: "fresh, simple, friendly", ja: "フレッシュで、シンプルで、親しみやすい" },
];

const generatedPropsPresets = [
  {
    en: ["a notebook", "a pen", "a glass of water", "a folded cloth"],
    ja: ["ノート", "ペン", "グラスの水", "折りたたんだ布"],
  },
  {
    en: ["a mug", "a small plate", "a napkin", "a slim book"],
    ja: ["マグ", "小皿", "ナプキン", "薄い本"],
  },
  {
    en: ["a memo pad", "a pen", "a keyboard edge", "a coffee cup"],
    ja: ["メモパッド", "ペン", "キーボードの端", "コーヒーカップ"],
  },
  {
    en: ["a glass bottle", "a brochure", "a card", "a folded fabric"],
    ja: ["ガラスボトル", "パンフレット", "カード", "折りたたんだ布"],
  },
  {
    en: ["a tote bag", "a water bottle", "a book", "a cap"],
    ja: ["トートバッグ", "ウォーターボトル", "本", "キャップ"],
  },
  {
    en: ["a spoon", "a small bowl", "a glass", "a linen cloth"],
    ja: ["スプーン", "小鉢", "グラス", "リネンクロス"],
  },
  {
    en: ["a menu card", "a tray", "a cup", "a napkin"],
    ja: ["メニューカード", "トレー", "カップ", "ナプキン"],
  },
  {
    en: ["an acrylic block", "a paper card", "a small object", "a shadow board"],
    ja: ["アクリルブロック", "ペーパーカード", "小さなオブジェ", "シャドーボード"],
  },
  {
    en: ["a bookmark", "a receipt", "a pen", "a book"],
    ja: ["しおり", "レシート", "ペン", "本"],
  },
  {
    en: ["a drink glass", "a plate", "a cloth", "a folded paper"],
    ja: ["ドリンクグラス", "皿", "クロス", "折りたたんだ紙"],
  },
  {
    en: ["a tray", "a card", "a cup", "a notebook"],
    ja: ["トレー", "カード", "カップ", "ノート"],
  },
  {
    en: ["a small vase", "a book", "a glass", "a pen"],
    ja: ["小さな花瓶", "本", "グラス", "ペン"],
  },
  {
    en: ["a folded towel", "a bottle", "a brochure", "a dish"],
    ja: ["折りたたんだタオル", "ボトル", "パンフレット", "小皿"],
  },
  {
    en: ["a menu card", "a spoon", "a cup", "a cloth"],
    ja: ["メニューカード", "スプーン", "カップ", "クロス"],
  },
  {
    en: ["a slim magazine", "a mug", "a note card", "a pen"],
    ja: ["薄い雑誌", "マグ", "メモカード", "ペン"],
  },
  {
    en: ["a coaster", "a bottle", "a folded paper", "a tray"],
    ja: ["コースター", "ボトル", "折りたたんだ紙", "トレー"],
  },
  {
    en: ["a cloth", "a small plate", "a glass", "a card"],
    ja: ["クロス", "小皿", "グラス", "カード"],
  },
  {
    en: ["a paperback", "a bookmark", "a cup", "a receipt"],
    ja: ["文庫本", "しおり", "カップ", "レシート"],
  },
  {
    en: ["a compact tray", "a note", "a mug", "a folded cloth"],
    ja: ["コンパクトなトレー", "メモ", "マグ", "折りたたんだ布"],
  },
  {
    en: ["a small bowl", "a spoon", "a glass bottle", "a napkin"],
    ja: ["小鉢", "スプーン", "ガラスボトル", "ナプキン"],
  },
];

function createGeneratedScenarios(limit = 20000) {
  const scenarios = [];

  for (const base of generatedSceneBases) {
    for (const surface of generatedSceneSurfaces) {
      for (const backdrop of generatedSceneBackdrops) {
        const index = scenarios.length;
        const light = generatedLightPresets[index % generatedLightPresets.length];
        const angle = generatedAnglePresets[index % generatedAnglePresets.length];
        const mood = generatedMoodPresets[index % generatedMoodPresets.length];
        const props = generatedPropsPresets[index % generatedPropsPresets.length];

        scenarios.push({
          location: `a ${surface.en} ${base.spotEn} ${backdrop.en}`,
          locationJa: `${backdrop.ja}${surface.ja}${base.spotJa}`,
          light: light.en,
          lightJa: light.ja,
          angle: angle.en,
          angleJa: angle.ja,
          props: props.en,
          propsJa: props.ja,
          mood: mood.en,
          moodJa: mood.ja,
          categories: base.categories,
        });

        if (scenarios.length >= limit) {
          return scenarios;
        }
      }
    }
  }

  return scenarios;
}

const generatedScenarios = createGeneratedScenarios(20000);

const detailOptions = [
  "high detail product texture",
  "sharp focus on the case design",
  "natural realistic shadows",
  "commercial quality composition",
  "no fantasy elements",
  "no floating objects",
  "no exaggerated surreal styling",
  "do not change the smartphone case shape",
  "do not change the smartphone case color",
  "preserve the original camera cutout and button layout",
];

const categoryLabels = {
  all: "すべて",
  nature: "自然",
  sports: "スポーツ",
  travel: "旅行",
  indoor: "屋内",
  luxury: "高級感",
  cafe: "カフェ",
  daily: "日常",
  urban: "都会",
  work: "仕事・作業",
  outdoor: "アウトドア",
  seasonal: "季節感",
  playful: "遊びごころ",
};

const deviceTargetLabels = {
  all: "指定なし",
  iphone: "iPhone",
  galaxy: "Galaxy",
  pixel: "Pixel",
  xperia: "Xperia",
  aquos: "AQUOS",
  arrows: "arrows",
  oppo: "OPPO",
  xiaomi: "Xiaomi",
};

const deviceTargetPromptText = {
  all: { ja: "", en: "" },
  iphone: {
    ja: "iPhoneユーザーに自然に響く見せ方にする",
    en: "Make the presentation feel naturally appealing to iPhone users",
  },
  galaxy: {
    ja: "Galaxyユーザー向けに、モダンでシャープな印象にする",
    en: "Make the presentation feel modern and sharp for Galaxy users",
  },
  pixel: {
    ja: "Pixelユーザー向けに、クリーンで知的な雰囲気にする",
    en: "Make the presentation feel clean and thoughtful for Pixel users",
  },
  xperia: {
    ja: "Xperiaユーザー向けに、ミニマルで少し感度の高い印象にする",
    en: "Make the presentation feel minimal and design-conscious for Xperia users",
  },
  aquos: {
    ja: "AQUOSユーザー向けに、親しみやすく実用的でクリーンな印象にする",
    en: "Make the presentation feel clean, practical, and approachable for AQUOS users",
  },
  arrows: {
    ja: "arrowsユーザー向けに、安心感があり日常に馴染む見せ方にする",
    en: "Make the presentation feel reliable and naturally suited to everyday use for arrows users",
  },
  oppo: {
    ja: "OPPOユーザー向けに、軽やかでモダンな印象にする",
    en: "Make the presentation feel light, modern, and stylish for OPPO users",
  },
  xiaomi: {
    ja: "Xiaomiユーザー向けに、スマートでコスト感度の高い印象にする",
    en: "Make the presentation feel smart, modern, and value-conscious for Xiaomi users",
  },
};

const layoutModes = {
  auto: {
    en: "arrange the cases in a natural composition that suits the scene",
    ja: "シーンに合う自然な構成でケースを配置する",
    label: "自動",
  },
  row: {
    en: "arrange the cases side by side in a clean row",
    ja: "ケースをすっきりと横並びに配置する",
    label: "横並び",
  },
  fan: {
    en: "arrange the cases with slight offsets in a gentle fan-like composition",
    ja: "ケースを少しずつずらしながら扇状気味に配置する",
    label: "少しずらして並べる",
  },
  stack: {
    en: "arrange the cases with partial overlap while keeping each design visible",
    ja: "各デザインが見えるように一部を重ねて配置する",
    label: "重なりをつける",
  },
  spread: {
    en: "arrange the cases with clear spacing between them",
    ja: "ケース同士の間隔をしっかり空けて配置する",
    label: "間隔をあけて配置",
  },
};

const categoryRules = {
  nature: [
    "river",
    "riverside",
    "desert",
    "lake",
    "forest",
    "mountain",
    "beach",
    "garden",
    "park",
    "pond",
    "greenhouse",
    "vineyard",
    "farmer",
    "marina",
    "outdoor",
  ],
  sports: ["tennis", "yoga", "ski", "poolside"],
  travel: [
    "airport",
    "train",
    "hotel",
    "lodge",
    "terrace",
    "boardwalk",
    "travel",
    "marina",
    "beachside",
    "rooftop",
    "balcony",
  ],
  indoor: [
    "home office",
    "cafe",
    "bed",
    "kitchen",
    "studio",
    "museum",
    "bookstore",
    "workshop",
    "ceramics",
    "spa",
    "lobby",
    "lounge",
    "window seat",
  ],
  luxury: [
    "premium",
    "refined",
    "hotel",
    "spa",
    "museum",
    "lobby",
    "vineyard",
    "resort",
    "elegant",
  ],
  cafe: [
    "cafe",
    "coffee",
    "pastry",
    "tea",
    "bakery",
    "terrace",
    "counter",
  ],
  daily: [
    "home",
    "bed",
    "kitchen",
    "balcony",
    "laundromat",
    "convenience store",
    "everyday",
    "daily",
    "friendly",
    "real-life",
  ],
  urban: [
    "urban",
    "city",
    "station",
    "airport",
    "rooftop",
    "hotel",
    "lobby",
    "museum",
    "gallery",
    "skate",
  ],
  work: [
    "home office",
    "workspace",
    "library",
    "co-working",
    "design studio",
    "print studio",
    "workshop",
    "desk",
    "notebook",
    "productive",
  ],
  outdoor: [
    "outdoor",
    "camp",
    "campsite",
    "beach",
    "river",
    "riverside",
    "mountain",
    "park",
    "garden",
    "trail",
    "marina",
    "desert",
  ],
  seasonal: [
    "spring",
    "summer",
    "winter",
    "festival",
    "snowy",
    "seasonal",
    "sunset",
    "bloom",
    "rainy",
    "summer",
  ],
  playful: [
    "arcade",
    "karaoke",
    "capsule",
    "carousel",
    "amusement park",
    "playful",
    "quirky",
    "fun",
    "cheerful",
  ],
};

function sample(array, count = 1) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function uniqueStrings(items) {
  return [...new Set(items.filter(Boolean))];
}

function getAllScenarios() {
  return [...baseScenarios, ...generatedScenarios, ...customScenarios];
}

function getAnglePool() {
  return [...new Set(getAllScenarios().map((scenario) => scenario.angle).filter(Boolean))];
}

function getScenarioCategories(scenario) {
  if (Array.isArray(scenario.categories) && scenario.categories.length > 0) {
    return scenario.categories;
  }

  const haystack = [
    scenario.location,
    scenario.light,
    scenario.angle,
    scenario.mood,
    ...(scenario.props || []),
  ]
    .join(" ")
    .toLowerCase();
  return Object.entries(categoryRules)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([category]) => category);
}

function getFilteredScenarios() {
  const scenarios = getAllScenarios();
  if (categorySelect.value === "all") {
    return scenarios;
  }

  return scenarios.filter((scenario) =>
    getScenarioCategories(scenario).includes(categorySelect.value),
  );
}

function appendUniqueText(base, addition, separator) {
  if (!addition) {
    return base;
  }

  if (!base) {
    return addition;
  }

  return normalizeText(base).includes(normalizeText(addition))
    ? base
    : `${base}${separator}${addition}`;
}

function mergeThemeProps(baseProps, themeProps, preferredCount) {
  const merged = [...baseProps];
  const limit = Math.max(
    preferredCount,
    baseProps.length + Math.min(themeProps.length, 1),
    themeProps.length,
  );

  themeProps.forEach((prop) => {
    if (merged.length >= limit) {
      return;
    }

    if (!merged.some((item) => item.en === prop.en)) {
      merged.push(prop);
    }
  });

  return merged;
}

function getSelectedNgPresets() {
  return ngPresetInputs
    .filter((input) => input.checked)
    .map((input) => ({
      id: input.value,
      ...ngPresetOptions[input.value],
    }))
    .filter((preset) => preset.label);
}

function getEditedFields() {
  return {
    scene: editScene.value.trim(),
    light: editLight.value.trim(),
    angle: editAngle.value.trim(),
    props: editProps.value.trim(),
    mood: editMood.value.trim(),
    details: editDetails.value.trim(),
  };
}

function getControlValues() {
  return {
    caseCount: caseCountSelect.value,
    layout: layoutSelect.value,
    category: categorySelect.value,
    deviceTarget: deviceTargetSelect.value,
    style: styleSelect.value,
    focus: focusSelect.value,
    character: characterSelect.value,
    propsMode: propsModeSelect.value,
  };
}

function getMetaValues() {
  return {
    category: metaCategory.textContent,
    caseCount: metaCaseCount.textContent,
    deviceTarget: metaDeviceTarget.textContent,
    character: metaCharacter.textContent,
    layout: metaLayout.textContent,
    location: metaLocation.textContent,
    light: metaLight.textContent,
    angle: metaAngle.textContent,
    props: metaProps.textContent,
  };
}

function createSnapshot() {
  if (!currentPromptState) {
    return null;
  }

  const edited = getEditedFields();
  const summaryScene = edited.scene || currentPromptState.originalSceneJa || "未設定";

  return {
    id: createRecordId(),
    savedAt: new Date().toISOString(),
    title: `${metaCategory.textContent} / ${metaCharacter.textContent}`,
    summary: summaryScene,
    controls: getControlValues(),
    ngPresets: getSelectedNgPresets().map((preset) => preset.id),
    editors: edited,
    state: JSON.parse(JSON.stringify(currentPromptState)),
    meta: getMetaValues(),
    prompt: promptOutput.value,
  };
}

function createRecordId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function setFeedback(message) {
  if (!saveFeedback) {
    return;
  }

  saveFeedback.textContent = message;
}

function formatSavedDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCategoryNames(categories) {
  return (categories || [])
    .map((category) => categoryLabels[category] || category)
    .filter(Boolean)
    .join(", ");
}

function renderSavedCards(container, emptyNode, items, type) {
  if (!container || !emptyNode) {
    return;
  }

  emptyNode.hidden = items.length > 0;
  container.innerHTML = items
    .map(
      (item) => `
        <article class="saved-card">
          <div class="saved-card-header">
            <div>
              <h3>${escapeHtml(item.title || "保存済みプロンプト")}</h3>
              <time datetime="${escapeHtml(item.savedAt || "")}">${escapeHtml(formatSavedDate(item.savedAt))}</time>
            </div>
            <div class="saved-card-actions">
              <button type="button" class="secondary" data-action="restore" data-kind="${type}" data-id="${escapeHtml(item.id)}">復元</button>
              <button type="button" class="secondary" data-action="delete" data-kind="${type}" data-id="${escapeHtml(item.id)}">削除</button>
            </div>
          </div>
          <p>${escapeHtml(item.summary || "")}</p>
        </article>
      `,
    )
    .join("");
}

function renderCustomScenes() {
  if (!customScenesList || !customScenesEmpty || !customScenesCount) {
    return;
  }

  customScenesEmpty.hidden = customScenarios.length > 0;
  customScenesCount.textContent = `${customScenarios.length}件`;
  customScenesList.innerHTML = customScenarios
    .map(
      (item) => `
        <article class="saved-card">
          <div class="saved-card-header">
            <div>
              <h3>${escapeHtml(item.locationJa || item.location || "追加シーン")}</h3>
              <time datetime="${escapeHtml(item.savedAt || "")}">${escapeHtml(formatSavedDate(item.savedAt))}</time>
            </div>
            <div class="saved-card-actions">
              <button type="button" class="secondary" data-action="delete-custom-scene" data-id="${escapeHtml(item.id)}">削除</button>
            </div>
          </div>
          <p>${escapeHtml(item.lightJa || "")}</p>
          <div class="saved-card-meta">${escapeHtml(formatCategoryNames(item.categories) || "カテゴリ未指定")}</div>
        </article>
      `,
    )
    .join("");
}

function renderSavedPanels() {
  renderSavedCards(favoritesList, favoritesEmpty, favoritePrompts, "favorite");
  renderSavedCards(historyList, historyEmpty, promptHistory, "history");
  renderCustomScenes();
}

function loadSavedData() {
  promptHistory = readJsonStorage(historyStorageKey, []);
  favoritePrompts = readJsonStorage(favoritesStorageKey, []);
  customScenarios = readJsonStorage(customSceneStorageKey, []);
  renderSavedPanels();
}

function persistHistory() {
  writeJsonStorage(historyStorageKey, promptHistory);
  renderSavedPanels();
}

function persistFavorites() {
  writeJsonStorage(favoritesStorageKey, favoritePrompts);
  renderSavedPanels();
}

function persistCustomScenarios() {
  writeJsonStorage(customSceneStorageKey, customScenarios);
  renderSavedPanels();
}

function saveCurrentToHistory() {
  const snapshot = createSnapshot();
  if (!snapshot || !snapshot.prompt) {
    return;
  }

  const lastEntry = promptHistory[0];
  if (lastEntry && lastEntry.prompt === snapshot.prompt) {
    return;
  }

  promptHistory = [snapshot, ...promptHistory].slice(0, maxHistoryEntries);
  persistHistory();
}

function saveCurrentToFavorites() {
  const snapshot = createSnapshot();
  if (!snapshot || !snapshot.prompt) {
    setFeedback("保存できるプロンプトがありません。");
    return;
  }

  const exists = favoritePrompts.some((item) => item.prompt === snapshot.prompt);
  if (exists) {
    setFeedback("同じ内容はすでにお気に入りにあります。");
    return;
  }

  favoritePrompts = [snapshot, ...favoritePrompts].slice(0, maxFavoriteEntries);
  persistFavorites();
  setFeedback("お気に入りに保存しました。");
}

function splitListText(text) {
  return text
    .split(/[、,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createCustomScenarioFromCurrentState() {
  if (!currentPromptState) {
    return null;
  }

  const edited = getEditedFields();
  const sceneJa = edited.scene || currentPromptState.originalSceneJa;
  const lightJa = edited.light || currentPromptState.originalLightJa;
  const angleJa = edited.angle || currentPromptState.originalAngleJa;
  const propsJaText = edited.props || currentPromptState.originalPropsJa;
  const moodJa = edited.mood || currentPromptState.originalMoodJa;

  if (!sceneJa || !lightJa || !angleJa) {
    return null;
  }

  const categories =
    categorySelect.value === "all"
      ? [...(currentPromptState.categories || [])]
      : [categorySelect.value];

  const sceneEn = translateEditedJapaneseToEnglish("scene", sceneJa, currentPromptState);
  const lightEn = translateEditedJapaneseToEnglish("light", lightJa, currentPromptState);
  const angleEn = translateEditedJapaneseToEnglish("angle", angleJa, currentPromptState);
  const propsEn = translateEditedJapaneseToEnglish("props", propsJaText, currentPromptState);
  const moodEn = translateEditedJapaneseToEnglish("mood", moodJa, currentPromptState);

  return {
    id: createRecordId(),
    savedAt: new Date().toISOString(),
    location: sceneEn,
    locationJa: sceneJa,
    light: lightEn,
    lightJa,
    angle: angleEn,
    angleJa,
    props: splitListText(propsEn),
    propsJa: splitListText(propsJaText),
    mood: moodEn,
    moodJa,
    categories,
  };
}

function saveCurrentAsCustomScenario() {
  const scenario = createCustomScenarioFromCurrentState();
  if (!scenario) {
    setFeedback("追加できるシーン情報が不足しています。");
    return;
  }

  const exists = customScenarios.some(
    (item) =>
      normalizeText(item.locationJa || "") === normalizeText(scenario.locationJa || "") &&
      normalizeText(item.lightJa || "") === normalizeText(scenario.lightJa || "") &&
      normalizeText(item.angleJa || "") === normalizeText(scenario.angleJa || ""),
  );

  if (exists) {
    setFeedback("同じシーン候補はすでに追加されています。");
    return;
  }

  customScenarios = [scenario, ...customScenarios];
  persistCustomScenarios();
  setFeedback("シーン候補に追加しました。");
}

function deleteSavedItem(kind, id) {
  if (kind === "favorite") {
    favoritePrompts = favoritePrompts.filter((item) => item.id !== id);
    persistFavorites();
    return;
  }

  promptHistory = promptHistory.filter((item) => item.id !== id);
  persistHistory();
}

function deleteCustomScene(id) {
  customScenarios = customScenarios.filter((item) => item.id !== id);
  persistCustomScenarios();
}

function applySnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  const controls = snapshot.controls || {};
  caseCountSelect.value = controls.caseCount || caseCountSelect.value;
  layoutSelect.value = controls.layout || layoutSelect.value;
  categorySelect.value = controls.category || categorySelect.value;
  deviceTargetSelect.value = controls.deviceTarget || deviceTargetSelect.value;
  styleSelect.value = controls.style || styleSelect.value;
  focusSelect.value = controls.focus || focusSelect.value;
  characterSelect.value = controls.character || characterSelect.value;
  propsModeSelect.value = controls.propsMode || "none";

  ngPresetInputs.forEach((input) => {
    input.checked = Array.isArray(snapshot.ngPresets)
      ? snapshot.ngPresets.includes(input.value)
      : false;
  });

  currentPromptState = JSON.parse(JSON.stringify(snapshot.state || {}));

  const editors = snapshot.editors || {};
  editScene.value = editors.scene || "";
  editLight.value = editors.light || "";
  editAngle.value = editors.angle || "";
  editProps.value = editors.props || "";
  editMood.value = editors.mood || "";
  editDetails.value = editors.details || "";

  const meta = snapshot.meta || {};
  metaCategory.textContent = meta.category || "-";
  metaCaseCount.textContent = meta.caseCount || "-";
  metaDeviceTarget.textContent = meta.deviceTarget || "-";
  metaCharacter.textContent = meta.character || "-";
  metaLayout.textContent = meta.layout || "-";
  metaLocation.textContent = meta.location || "-";
  metaLight.textContent = meta.light || "-";
  metaAngle.textContent = meta.angle || "-";
  metaProps.textContent = meta.props || "-";

  syncPromptFromJapaneseEditors();
  setFeedback("保存済みの内容を復元しました。");
}

function handleSavedListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, kind, id } = button.dataset;
  const collection = kind === "favorite" ? favoritePrompts : promptHistory;
  const target = collection.find((item) => item.id === id);

  if (action === "restore") {
    applySnapshot(target);
    return;
  }

  if (action === "delete") {
    deleteSavedItem(kind, id);
    setFeedback(kind === "favorite" ? "お気に入りを削除しました。" : "履歴を削除しました。");
  }
}

function handleCustomSceneListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || button.dataset.action !== "delete-custom-scene" || !button.dataset.id) {
    return;
  }

  deleteCustomScene(button.dataset.id);
  setFeedback("追加シーンを削除しました。");
}

function generatePrompt() {
  setFeedback("");
  const selectedStyle = styles[styleSelect.value];
  const focus = focusModes[focusSelect.value];
  const caseCount = Number(caseCountSelect.value);
  const selectedLayout = layoutModes[layoutSelect.value];
  const availableScenarios = getFilteredScenarios();
  const scenario = sample(
    availableScenarios.length > 0 ? availableScenarios : getAllScenarios(),
  )[0];
  const selectedCharacter = characterThemes[characterSelect.value] || characterThemes.none;
  const propsMode = propsModeSelect.value || "none";
  const baseProps =
    propsMode === "with"
      ? sample(scenario.props || [], selectedStyle.propsCount).map((item) => ({
          en: item,
          ja: translateProps([item], scenario)[0],
        }))
      : [];
  const props =
    propsMode === "with"
      ? mergeThemeProps(
          baseProps,
          selectedCharacter.props || [],
          selectedStyle.propsCount,
        )
      : [];
  const extraDetails = sample(detailOptions, 3);
  const scenarioCategories = getScenarioCategories(scenario);
  const deviceTarget = deviceTargetSelect.value;
  const deviceTargetLabel = deviceTargetLabels[deviceTarget] || deviceTargetLabels.all;
  const deviceTargetText =
    deviceTargetPromptText[deviceTarget] || deviceTargetPromptText.all;
  const categoryText =
    categorySelect.value === "all"
      ? scenarioCategories.map((category) => categoryLabels[category]).join(", ") || categoryLabels.all
      : categoryLabels[categorySelect.value];
  const sceneJa = appendUniqueText(
    translateLocation(scenario.location, scenario.locationJa),
    selectedCharacter.sceneJa,
    "。",
  );
  const sceneEn = appendUniqueText(
    scenario.location,
    selectedCharacter.sceneEn,
    ", while ",
  );
  const moodJa = appendUniqueText(
    translateMood(scenario.mood, scenario.moodJa),
    selectedCharacter.moodJa,
    "、",
  );
  const moodEn = appendUniqueText(scenario.mood, selectedCharacter.moodEn, ", ");
  const detailTextsEn = [...extraDetails, selectedCharacter.detailsEn].filter(Boolean);
  const detailTextsJa = [
    ...translateDetails(extraDetails),
    selectedCharacter.detailsJa,
  ].filter(Boolean);

  currentPromptState = {
    caseCount,
    styleText: translateStyle(styleSelect.value),
    focusText: translateFocus(focusSelect.value),
    layoutTextJa: selectedLayout.ja,
    layoutTextEn: selectedLayout.en,
    visibilityTextJa:
      caseCount === 1
        ? "ケース本体がはっきり見えるようにする"
        : "各ケースが区別でき、それぞれのデザインが見えるようにする",
    visibilityTextEn:
      caseCount === 1
        ? "Make sure the visible area of the case remains clear."
        : "Make sure all cases remain clearly distinguishable and each design stays visible.",
    introTextJa: `既存の参考画像をもとにした、${caseCount}個のスマホケースの商品イメージをリアルに生成する。`,
    introTextEn: `Create a realistic product image using ${caseCount === 1 ? "the provided reference image of one smartphone case" : `the provided reference images of ${caseCount} smartphone cases`}.`,
    deviceTargetJa: deviceTargetText.ja,
    deviceTargetEn: deviceTargetText.en,
    deviceTargetLabel,
    characterLabel: selectedCharacter.label,
    propsMode,
    scene: sceneJa,
    light: translateLight(scenario.light, scenario.lightJa),
    angle: translateAngle(scenario.angle, scenario.angleJa),
    props: props.map((item) => item.ja).join("、"),
    mood: moodJa,
    details: detailTextsJa.join("、"),
    originalSceneJa: sceneJa,
    originalLightJa: translateLight(scenario.light, scenario.lightJa),
    originalAngleJa: translateAngle(scenario.angle, scenario.angleJa),
    originalPropsJa: props.map((item) => item.ja).join("、"),
    originalMoodJa: moodJa,
    originalDetailsJa: detailTextsJa.join("、"),
    originalSceneEn: sceneEn,
    originalLightEn: scenario.light,
    originalAngleEn: scenario.angle,
    originalPropsEn: props.map((item) => item.en).join(", "),
    originalMoodEn: moodEn,
    originalDetailsEn: detailTextsEn.join(", "),
    toneEn: selectedStyle.tone,
    focusEn: focus,
    categories: scenarioCategories,
  };

  fillJapaneseEditors(currentPromptState);
  metaCategory.textContent = categoryText;
  metaCaseCount.textContent = `${caseCount}個`;
  metaDeviceTarget.textContent = deviceTargetLabel;
  metaCharacter.textContent = selectedCharacter.label;
  metaLayout.textContent = selectedLayout.label;
  metaLocation.textContent = scenario.location;
  metaLight.textContent = scenario.light;
  metaAngle.textContent = scenario.angle;
  metaProps.textContent = props.length > 0 ? props.map((item) => item.en).join(", ") : "なし";
  syncPromptFromJapaneseEditors();
  saveCurrentToHistory();
}

function fillJapaneseEditors(state) {
  editScene.value = state.scene;
  editLight.value = state.light;
  editAngle.value = state.angle;
  editProps.value = state.props;
  editMood.value = state.mood;
  editDetails.value = state.details;
}

function syncPromptFromJapaneseEditors() {
  if (!currentPromptState) {
    return;
  }

  const edited = getEditedFields();
  const selectedNgPresets = getSelectedNgPresets();

  const editedEn = {
    scene: translateEditedJapaneseToEnglish("scene", edited.scene, currentPromptState),
    light: translateEditedJapaneseToEnglish("light", edited.light, currentPromptState),
    angle: translateEditedJapaneseToEnglish("angle", edited.angle, currentPromptState),
    props: translateEditedJapaneseToEnglish("props", edited.props, currentPromptState),
    mood: translateEditedJapaneseToEnglish("mood", edited.mood, currentPromptState),
    details: translateEditedJapaneseToEnglish("details", edited.details, currentPromptState),
  };

  const promptLines = [
    "Task:",
    currentPromptState.introTextEn,
    "",
    "Reference preservation requirements:",
    `- Keep the original smartphone case design${currentPromptState.caseCount === 1 ? "" : "s"} unchanged.`,
    `- Do not alter ${currentPromptState.caseCount === 1 ? "the case" : "any case"} shape, color, proportions, camera opening, button positions, material impression, or printed design.`,
    `- Use only the existing smartphone ${currentPromptState.caseCount === 1 ? "case" : "cases"} from the reference image${currentPromptState.caseCount === 1 ? "" : "s"}.`,
    `- ${currentPromptState.visibilityTextEn}`,
    "",
    "Composition requirements:",
    `- ${currentPromptState.layoutTextEn}.`,
    `- ${currentPromptState.focusEn}.`,
    currentPromptState.deviceTargetEn
      ? `- Target device audience: ${currentPromptState.deviceTargetEn}.`
      : "",
    editedEn.angle ? `- Camera angle: ${editedEn.angle}.` : "",
    "",
    "Scene direction:",
    editedEn.scene ? `- Scene: ${editedEn.scene}.` : "",
    editedEn.light ? `- Lighting: ${editedEn.light}.` : "",
    editedEn.props ? `- Props: ${editedEn.props}.` : "",
    editedEn.mood ? `- Mood: ${editedEn.mood}.` : "",
    `${editedEn.details ? `- Additional direction: ${editedEn.details}.` : ""}`,
    ...selectedNgPresets.map((preset) => `- ${preset.en}`),
    "",
    "Style:",
    `- ${currentPromptState.toneEn}.`,
    "",
    "Output goal:",
    "- Produce a natural, commercially usable product image for Gemini image generation.",
    "- Avoid fantasy elements, surreal distortion, floating objects, and unrealistic object changes.",
  ].filter(Boolean);

  const promptJaLines = [
    currentPromptState.introTextJa,
    `全体のテイストは「${currentPromptState.styleText}」。`,
    "元のスマホケースのデザインは変更しない。",
    "各ケースの形状、色、比率、カメラ開口部、ボタン位置、印刷デザインは変更しない。",
    "既存のスマホケースだけを、指定した情景の中に自然に配置する。",
    `配置ルール: ${currentPromptState.layoutTextJa}。`,
    `見え方: ${currentPromptState.visibilityTextJa}。`,
    currentPromptState.deviceTargetJa
      ? `端末: ${currentPromptState.deviceTargetJa}。`
      : "",
    edited.scene ? `シーン: ${edited.scene}。` : "",
    edited.light ? `光: ${edited.light}。` : "",
    edited.angle ? `構図: ${edited.angle}。` : "",
    edited.props ? `小物: ${edited.props}。` : "",
    edited.mood ? `雰囲気: ${edited.mood}。` : "",
    `見せ方: ${currentPromptState.focusText}。`,
    edited.details ? `追加条件: ${edited.details}。` : "",
    ...selectedNgPresets.map((preset) => `NG条件: ${preset.ja}`),
  ].filter(Boolean);

  promptOutput.value = promptLines.join("\n");
  promptOutputJa.innerHTML = renderJapanesePrompt(promptJaLines);
}

function createAngleVariant() {
  if (!currentPromptState) {
    return;
  }

  setFeedback("");

  const nextAngleEn = sample(
    getAnglePool().filter((angle) => angle !== currentPromptState.originalAngleEn),
  )[0];

  if (!nextAngleEn) {
    return;
  }

  currentPromptState.originalAngleEn = nextAngleEn;
  currentPromptState.originalAngleJa = translateAngle(nextAngleEn);
  currentPromptState.angle = currentPromptState.originalAngleJa;

  editAngle.value = currentPromptState.originalAngleJa;
  syncPromptFromJapaneseEditors();
  metaAngle.textContent = nextAngleEn;
  saveCurrentToHistory();
  angleVariantButton.textContent = "変更済み";
  window.setTimeout(() => {
    angleVariantButton.textContent = "構図違い";
  }, 1200);
}

function translateEditedJapaneseToEnglish(field, editedText, state) {
  const defaults = {
    scene: { ja: state.originalSceneJa, en: state.originalSceneEn },
    light: { ja: state.originalLightJa, en: state.originalLightEn },
    angle: { ja: state.originalAngleJa, en: state.originalAngleEn },
    props: { ja: state.originalPropsJa, en: state.originalPropsEn },
    mood: { ja: state.originalMoodJa, en: state.originalMoodEn },
    details: { ja: state.originalDetailsJa, en: state.originalDetailsEn },
  };

  if (!editedText) {
    return "";
  }

  if (normalizeText(editedText) === normalizeText(defaults[field].ja)) {
    return defaults[field].en;
  }

  const translated = heuristicJapaneseToEnglish(editedText, field);
  const normalizedTranslated = normalizeText(translated);
  const normalizedDefaultEn = normalizeText(defaults[field].en);

  if (normalizedTranslated === normalizedDefaultEn) {
    return `${translated}, customized from the edited Japanese direction`;
  }

  return translated;
}

function heuristicJapaneseToEnglish(text, field) {
  const replacements = [
    ["自宅ワークスペース", "home workspace"],
    ["ワークスペース", "workspace"],
    ["窓際にある", "placed near a window on"],
    ["窓際", "window-side"],
    ["明るい木製デスク", "a bright wooden desk"],
    ["清潔感のある", "clean"],
    ["石天板", "stone tabletop"],
    ["ニュートラルな布地", "neutral fabric textures"],
    ["整えられた", "neatly arranged"],
    ["控えめな石目", "subtle stone texture"],
    ["屋外カフェテラス", "outdoor cafe terrace"],
    ["マット紙の背景", "matte paper backdrop"],
    ["穏やかな川", "calm river"],
    ["遊歩道", "walking path"],
    ["景色の良い休憩所", "scenic rest stop"],
    ["砂丘", "sandy hills"],
    ["公共テニスコート", "public tennis court"],
    ["クラブラウンジ", "club lounge"],
    ["湖畔", "lakeside"],
    ["森林キャンプサイト", "forest campsite"],
    ["山小屋", "mountain cabin"],
    ["ビーチサイド", "beachside"],
    ["温室カフェ", "greenhouse cafe"],
    ["フラワーマーケット", "flower market"],
    ["ミュージアムカフェ", "museum cafe"],
    ["ホテルロビー", "hotel lobby"],
    ["空港ラウンジ", "airport lounge"],
    ["列車の窓側テーブル", "train window table"],
    ["書店閲覧テーブル", "bookstore reading table"],
    ["大学中庭", "university courtyard"],
    ["クラフトテーブル", "craft table"],
    ["陶芸スタジオ", "ceramics studio"],
    ["ルーフトップカフェ", "rooftop cafe"],
    ["バルコニーの朝食テーブル", "balcony breakfast table"],
    ["ピクニックブランケット", "picnic blanket"],
    ["マリーナカフェ", "marina cafe"],
    ["プールサイドラウンジテーブル", "poolside lounge table"],
    ["スキーロッジ", "ski lodge"],
    ["待合ラウンジ", "waiting lounge"],
    ["ヨガスタジオ", "yoga studio"],
    ["田舎カフェ", "countryside cafe"],
    ["ぶどう園", "vineyard"],
    ["ファーマーズマーケット", "farmers market"],
    ["ガーデンベンチ", "garden bench"],
    ["静かな", "quiet"],
    ["穏やかな", "gentle"],
    ["やわらかな", "soft"],
    ["柔らかな", "soft"],
    ["落ち着いた", "muted"],
    ["澄んだ", "clear"],
    ["拡散した", "diffused"],
    ["自然な", "natural"],
    ["自然光", "natural light"],
    ["窓光", "window light"],
    ["サイド光", "side light"],
    ["朝の自然光", "morning natural light"],
    ["午後の窓光", "afternoon window light"],
    ["夕方の自然光", "late afternoon daylight"],
    ["夕暮れの光", "sunset light"],
    ["日中の自然光", "midday daylight"],
    ["木漏れ日", "filtered sunlight through trees"],
    ["曇天光", "overcast daylight"],
    ["環境光", "ambient light"],
    ["真上からのフラットレイ", "top-down flat lay shot"],
    ["やや上からの3/4アングル商品カット", "three-quarter product shot from slightly above"],
    ["角度をつけたクローズアップ", "angled close-up shot"],
    ["浅い被写界深度のアイレベル商品カット", "eye-level product shot with shallow depth of field"],
    ["座った目線のライフスタイルカット", "lifestyle shot from a seated perspective"],
    ["正面寄りの商用商品カット", "front-facing commercial product shot"],
    ["3/4アングルのライフスタイルカット", "three-quarter lifestyle shot"],
    ["角度をつけた商品クローズアップ", "angled close-up product shot"],
    ["前方寄りの商用ライフスタイルカット", "front-side commercial lifestyle shot"],
    ["アイレベルの商品カット", "eye-level product shot"],
    ["着席視点のライフスタイルカット", "seated perspective lifestyle shot"],
    ["やや上からの3/4商用カット", "three-quarter commercial shot from above"],
    ["自然な奥行きのあるフラットレイ", "flat lay shot with natural depth"],
    ["屋外の真上からの商品カット", "top-down outdoor product shot"],
    ["角度をつけたヒーローカット", "angled hero shot"],
    ["気軽な着席視点", "casual seated viewpoint"],
    ["近距離のライフスタイルカット", "close lifestyle shot"],
    ["3/4アングルのクローズアップ", "three-quarter close-up shot"],
    ["上からのスタイリング商品カット", "styled product shot from above"],
    ["やや上からの上質な商品カット", "premium product shot from slightly above"],
    ["前方寄りのヒーロー商品カット", "front-side hero product shot"],
    ["旅行シーンのライフスタイルカット", "travel lifestyle shot"],
    ["ドキュメンタリー調の角度付き商品カット", "angled documentary-style product shot"],
    ["真上からのスタイリングカット", "top-down styled shot"],
    ["日常感のあるカジュアル商品カット", "casual everyday product shot"],
    ["真上からのクリエイティブ商品カット", "top-down creative product shot"],
    ["商品を主体にしたクローズアップポートレート", "close-up product portrait"],
    ["都会的なライフスタイルカット", "urban lifestyle shot"],
    ["角度をつけたテーブルトップカット", "angled tabletop shot"],
    ["屋外のフラットレイライフスタイルカット", "flat lay outdoor lifestyle shot"],
    ["カウンタートップの商品カット", "countertop product shot"],
    ["上質なライフスタイルカット", "premium lifestyle shot"],
    ["高級感のあるレジャー商品カット", "high-end leisure product shot"],
    ["冬らしい温かみのあるライフスタイルカット", "cozy winter lifestyle shot"],
    ["落ち着いた上質感のある商品カット", "calm premium product shot"],
    ["ウェルネス系ライフスタイルカット", "wellness lifestyle shot"],
    ["自然なアイレベル商品カット", "natural eye-level product shot"],
    ["洗練されたライフスタイルのクローズアップ", "refined lifestyle close-up"],
    ["マーケット風のカジュアル商品カット", "casual market-style product shot"],
    ["やや上からの近距離ライフスタイルカット", "close lifestyle shot from above"],
    ["スマホケース", "smartphone case"],
    ["ケース", "case"],
    ["商品", "product"],
    ["画像", "image"],
    ["写真", "photo"],
    ["シーン", "scene"],
    ["情景", "scene"],
    ["背景", "background"],
    ["光", "light"],
    ["自然光", "natural light"],
    ["朝", "morning"],
    ["昼", "daytime"],
    ["午後", "afternoon"],
    ["夕方", "late afternoon"],
    ["夕暮れ", "sunset"],
    ["夜", "night"],
    ["やわらか", "soft"],
    ["柔らか", "soft"],
    ["明るい", "bright"],
    ["暗め", "dim"],
    ["暖かい", "warm"],
    ["暖か", "warm"],
    ["冷たい", "cool"],
    ["窓", "window"],
    ["窓際", "near a window"],
    ["屋外", "outdoor"],
    ["屋内", "indoor"],
    ["カフェ", "cafe"],
    ["テーブル", "table"],
    ["デスク", "desk"],
    ["ベンチ", "bench"],
    ["川辺", "riverside"],
    ["川沿い", "riverside"],
    ["湖畔", "lakeside"],
    ["海辺", "seaside"],
    ["ビーチ", "beach"],
    ["砂漠", "desert"],
    ["山", "mountain"],
    ["公園", "park"],
    ["庭", "garden"],
    ["ホテル", "hotel"],
    ["旅館", "ryokan"],
    ["ラウンジ", "lounge"],
    ["空港", "airport"],
    ["駅", "station"],
    ["図書館", "library"],
    ["美術館", "museum"],
    ["スタジオ", "studio"],
    ["工房", "workshop"],
    ["構図", "composition"],
    ["真上", "top-down"],
    ["正面", "front-facing"],
    ["斜め", "angled"],
    ["クローズアップ", "close-up"],
    ["俯瞰", "top-down"],
    ["小物", "props"],
    ["ノート", "notebook"],
    ["本", "book"],
    ["マグ", "mug"],
    ["カップ", "cup"],
    ["グラス", "glass"],
    ["バッグ", "bag"],
    ["トート", "tote bag"],
    ["タオル", "towel"],
    ["帽子", "hat"],
    ["サングラス", "sunglasses"],
    ["植物", "plants"],
    ["花", "flowers"],
    ["雰囲気", "mood"],
    ["高級感", "premium feel"],
    ["上品", "elegant"],
    ["自然", "natural"],
    ["落ち着", "calm"],
    ["爽やか", "fresh"],
    ["都会的", "urban"],
    ["親しみやす", "friendly"],
    ["追加条件", "additional direction"],
    ["〜", "-"],
    ["、", ", "],
    ["。", "."],
    ["・", ", "],
  ];

  let translated = text.trim();
  replacements.forEach(([ja, en]) => {
    translated = translated.replaceAll(ja, en);
  });

  translated = translated
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,+/g, ",")
    .replace(/,\./g, ".")
    .replace(/\s+\./g, ".")
    .replace(/\.+/g, ".")
    .trim();

  const phraseFallbacks = {
    scene: "custom scene arrangement matching the edited Japanese direction",
    light: "custom lighting setup matching the edited Japanese direction",
    angle: "custom camera composition matching the edited Japanese direction",
    props: "carefully selected supporting props matching the edited Japanese direction",
    mood: "a mood matching the edited Japanese direction",
    details: "follow the additional direction described in the edited Japanese text",
  };

  if (containsJapanese(translated)) {
    return phraseFallbacks[field];
  }

  if (!translated) {
    return phraseFallbacks[field];
  }

  return translated.endsWith(".") ? translated.slice(0, -1) : translated;
}

function containsJapanese(text) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").replace(/[。．.]/g, "").replace(/[、,]/g, ",").trim();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderJapanesePrompt(lines) {
  return lines
    .map((line) => {
      const className = line.startsWith("シーン:") ? "scene-line" : "";
      return `<p class="${className}">${escapeHtml(line)}</p>`;
    })
    .join("");
}

function translateStyle(style) {
  const map = {
    clean: "クリーンで整った商品写真",
    lifestyle: "自然な日常感のあるライフスタイル写真",
    premium: "上質で洗練されたプレミアム商品写真",
    casual: "親しみやすく気軽なカジュアル写真",
  };
  return map[style];
}

function translateFocus(focus) {
  const map = {
    product: "スマホケースを主役にし、背景要素は控えめにする",
    scene: "情景も見せつつ、スマホケースが視覚の中心に残るようにする",
    balanced: "スマホケースと周囲の情景をバランスよく見せる",
    "camera-closeup":
      "スマホケースのカメラ開口部まわりを寄りで見せつつ、元のデザインが分かるようにする",
  };
  return map[focus];
}

function translateLocation(text, directTranslation) {
  if (directTranslation) {
    return directTranslation;
  }

  return text
    .replace("a bright wooden desk near a window in a home office", "自宅ワークスペースの窓際にある明るい木製デスク")
    .replace("a cafe table with a clean stone surface", "清潔感のある石天板のカフェテーブル")
    .replace("a neatly made bed with neutral fabric textures", "ニュートラルな布地で整えられたベッドの上")
    .replace("a clean kitchen counter with subtle stone texture", "控えめな石目のある清潔なキッチンカウンター")
    .replace("an outdoor cafe terrace table on a mild day", "穏やかな日にある屋外カフェテラスのテーブル")
    .replace("a studio tabletop with matte paper backdrop", "マット紙の背景を使ったスタジオ天板")
    .replace("a shaded riverside bench with calm water in the background", "穏やかな川を背景にした日陰の川辺ベンチ")
    .replace("a smooth riverside stone ledge near a quiet walking path", "静かな遊歩道沿いにある滑らかな川辺の石の縁")
    .replace("a clean desert picnic table at a scenic rest stop", "景色の良い休憩所にある清潔な砂漠のピクニックテーブル")
    .replace("a desert lodge terrace with sandy hills in the distance", "遠くに砂丘が見える砂漠のロッジテラス")
    .replace("a bench beside a quiet public tennis court", "静かな公共テニスコート脇のベンチ")
    .replace("a shaded table near a tennis club lounge", "テニスクラブラウンジ近くの日陰のテーブル")
    .replace("a lakeside wooden deck with still water and distant trees", "静かな湖面と遠くの木々が見える湖畔のウッドデッキ")
    .replace("a forest campsite table arranged neatly in daylight", "日中の光の中で整えられた森林キャンプサイトのテーブル")
    .replace("a mountain cabin porch railing with a scenic valley view", "谷の景色が見える山小屋のポーチ手すり")
    .replace("a beachside cafe table under light shade", "やわらかな日陰にあるビーチサイドカフェのテーブル")
    .replace("a clean boardwalk bench near the beach", "海辺近くの清潔なボードウォークのベンチ")
    .replace("a greenhouse cafe corner with plants and a simple table", "植物とシンプルなテーブルがある温室カフェの一角")
    .replace("a flower market wrapping counter with muted tones", "落ち着いた色調のフラワーマーケット包装カウンター")
    .replace("a museum cafe table with a minimal stone surface", "ミニマルな石天板のミュージアムカフェテーブル")
    .replace("a hotel lobby side table with refined neutral decor", "洗練されたニュートラル装飾のホテルロビーのサイドテーブル")
    .replace("an airport lounge table near a large window", "大きな窓の近くにある空港ラウンジのテーブル")
    .replace("a train window table on a daytime journey", "日中の移動中にある列車の窓側テーブル")
    .replace("a bookstore reading table with warm wood texture", "温かみのある木目の書店閲覧テーブル")
    .replace("a university courtyard bench on a clear day", "晴れた日の大学中庭のベンチ")
    .replace("a craft table in a bright studio workshop", "明るいスタジオ工房のクラフトテーブル")
    .replace("a ceramics studio shelf table with neutral handmade textures", "手仕事感のあるニュートラルな質感の陶芸スタジオ棚テーブル")
    .replace("a rooftop cafe table at sunset", "夕景のルーフトップカフェテーブル")
    .replace("a balcony breakfast table with city rooftops in the background", "街の屋根並みを背景にしたバルコニーの朝食テーブル")
    .replace("a picnic blanket in a grassy park with open shade", "木陰のある芝生公園のピクニックブランケット")
    .replace("a riverside cafe counter overlooking a walking trail", "遊歩道を見渡せる川沿いカフェのカウンター")
    .replace("a marina cafe table with subtle harbor details in the distance", "遠くに港の気配が見えるマリーナカフェのテーブル")
    .replace("a poolside lounge table in a hotel setting", "ホテルのプールサイドラウンジテーブル")
    .replace("a ski lodge window seat table with snowy scenery outside", "雪景色が見えるスキーロッジの窓際席テーブル")
    .replace("a minimalist spa waiting lounge side table", "ミニマルなスパ待合ラウンジのサイドテーブル")
    .replace("a yoga studio bench near a sunlit wall", "日差しの入る壁際にあるヨガスタジオのベンチ")
    .replace("a countryside cafe patio table with garden surroundings", "庭に囲まれた田舎カフェのパティオテーブル")
    .replace("a vineyard tasting table with a neutral wood surface", "ニュートラルな木天板のぶどう園テイスティングテーブル")
    .replace("a farmer's market rest table with simple natural materials", "素朴な自然素材で整えられたファーマーズマーケットの休憩テーブル")
    .replace("a garden bench beside a small pond", "小さな池のそばにあるガーデンベンチ");
}

function translateLight(text, directTranslation) {
  if (directTranslation) {
    return directTranslation;
  }

  const map = {
    "soft morning natural light": "やわらかな朝の自然光",
    "gentle afternoon window light": "穏やかな午後の窓光",
    "soft diffused daylight": "やわらかく拡散した自然光",
    "clear side light from a nearby window": "近くの窓から入るはっきりしたサイド光",
    "natural daylight with soft shadows": "やわらかな影を伴う自然光",
    "controlled softbox lighting": "コントロールされたソフトボックス照明",
    "soft late afternoon daylight": "やわらかな夕方の自然光",
    "bright natural daylight with gentle reflections": "穏やかな反射を含む明るい自然光",
    "warm golden hour sunlight": "暖かいゴールデンアワーの光",
    "soft sunset light": "やわらかな夕暮れの光",
    "clean morning daylight": "澄んだ朝の自然光",
    "soft midday daylight": "やわらかな日中の自然光",
    "clear morning light": "澄んだ朝の光",
    "filtered sunlight through trees": "木漏れ日",
    "soft early morning mountain light": "山のやわらかな早朝光",
    "bright coastal daylight softened by shade": "日陰で和らいだ明るい海辺の自然光",
    "warm late afternoon sun": "暖かい夕方の陽光",
    "soft diffused daylight through glass": "ガラス越しのやわらかな拡散光",
    "gentle natural storefront light": "店先から入る穏やかな自然光",
    "soft indoor daylight from large windows": "大きな窓から入るやわらかな室内自然光",
    "warm ambient lobby lighting": "暖かいロビーの環境光",
    "bright diffused daytime light": "明るく拡散した昼光",
    "natural side light from the window": "窓からの自然なサイド光",
    "soft overhead and window light": "やわらかな上部照明と窓光",
    "bright natural daylight": "明るい自然光",
    "clean overhead daylight": "クリアな上方の自然光",
    "soft side daylight": "やわらかなサイド光",
    "warm evening golden light": "暖かな夕方の黄金色の光",
    "soft morning sunlight": "やわらかな朝日",
    "gentle daylight under tree cover": "木陰の穏やかな自然光",
    "clear natural morning light": "澄んだ朝の自然光",
    "bright daylight with soft reflections": "やわらかな反射を伴う明るい昼光",
    "controlled bright daylight under shade": "日陰でコントロールされた明るい自然光",
    "cool diffused daylight through large windows": "大きな窓越しの冷たさのある拡散光",
    "soft warm ambient lighting": "やわらかく暖かい環境光",
    "gentle natural morning light": "穏やかな朝の自然光",
    "soft overcast daylight": "やわらかな曇天光",
    "soft dappled afternoon light": "まだらに差し込む午後の光",
  };
  return map[text] || text;
}

function translateAngle(text, directTranslation) {
  if (directTranslation) {
    return directTranslation;
  }

  const map = {
    "top-down flat lay shot": "真上からのフラットレイ",
    "three-quarter product shot from slightly above": "やや上からの3/4アングル商品カット",
    "angled close-up shot": "角度をつけたクローズアップ",
    "eye-level product shot with shallow depth of field": "浅い被写界深度のアイレベル商品カット",
    "lifestyle shot from a seated perspective": "座った目線のライフスタイルカット",
    "front-facing commercial product shot": "正面寄りの商用商品カット",
    "three-quarter lifestyle shot": "3/4アングルのライフスタイルカット",
    "angled close-up product shot": "角度をつけた商品クローズアップ",
    "front-side commercial lifestyle shot": "前方寄りの商用ライフスタイルカット",
    "eye-level product shot": "アイレベルの商品カット",
    "seated perspective lifestyle shot": "着席視点のライフスタイルカット",
    "three-quarter commercial shot from above": "やや上からの3/4商用カット",
    "flat lay shot with natural depth": "自然な奥行きのあるフラットレイ",
    "top-down outdoor product shot": "屋外の真上からの商品カット",
    "angled hero shot": "角度をつけたヒーローカット",
    "casual seated viewpoint": "気軽な着席視点",
    "close lifestyle shot": "近距離のライフスタイルカット",
    "three-quarter close-up shot": "3/4アングルのクローズアップ",
    "styled product shot from above": "上からのスタイリング商品カット",
    "premium product shot from slightly above": "やや上からの上質な商品カット",
    "front-side hero product shot": "前方寄りのヒーロー商品カット",
    "travel lifestyle shot": "旅行シーンのライフスタイルカット",
    "angled documentary-style product shot": "ドキュメンタリー調の角度付き商品カット",
    "top-down styled shot": "真上からのスタイリングカット",
    "casual everyday product shot": "日常感のあるカジュアル商品カット",
    "top-down creative product shot": "真上からのクリエイティブ商品カット",
    "close-up product portrait": "商品を主体にしたクローズアップポートレート",
    "urban lifestyle shot": "都会的なライフスタイルカット",
    "angled tabletop shot": "角度をつけたテーブルトップカット",
    "flat lay outdoor lifestyle shot": "屋外のフラットレイライフスタイルカット",
    "countertop product shot": "カウンタートップの商品カット",
    "premium lifestyle shot": "上質なライフスタイルカット",
    "high-end leisure product shot": "高級感のあるレジャー商品カット",
    "cozy winter lifestyle shot": "冬らしい温かみのあるライフスタイルカット",
    "calm premium product shot": "落ち着いた上質感のある商品カット",
    "wellness lifestyle shot": "ウェルネス系ライフスタイルカット",
    "natural eye-level product shot": "自然なアイレベル商品カット",
    "refined lifestyle close-up": "洗練されたライフスタイルのクローズアップ",
    "casual market-style product shot": "マーケット風のカジュアル商品カット",
    "close lifestyle shot from above": "やや上からの近距離ライフスタイルカット",
  };
  return map[text] || text;
}

function translateProps(items, scenario) {
  if (scenario.propsJa) {
    return items.map((item) => {
      const index = scenario.props.indexOf(item);
      return index >= 0 ? scenario.propsJa[index] : item;
    });
  }

  const map = {
    "a closed notebook": "閉じたノート",
    "a ceramic coffee mug": "陶器のコーヒーマグ",
    "a slim pen": "細身のペン",
    "a folded linen cloth": "折りたたんだリネンクロス",
    "a small cup of coffee": "小さなコーヒーカップ",
    "a menu card": "メニューカード",
    "a pair of sunglasses": "サングラス",
    "a paperback book": "文庫本",
    "a cotton pillow edge": "コットンの枕の端",
    "a folded magazine": "折りたたんだ雑誌",
    "a soft knit blanket": "柔らかなニットブランケット",
    "a small tray": "小さなトレー",
    "a glass of water": "水の入ったグラス",
    "a small fruit bowl": "小さなフルーツボウル",
    "a wooden tray": "木製トレー",
    "a neutral hand towel": "ニュートラルカラーのハンドタオル",
    "an iced drink": "アイスドリンク",
    "a folded tote bag": "折りたたんだトートバッグ",
    "a small notebook": "小さなノート",
    "a pair of wireless earbuds": "ワイヤレスイヤホン",
    "a simple acrylic block": "シンプルなアクリルブロック",
    "a shadow card": "シャドウカード",
    "a neutral textured paper": "ニュートラルな質感紙",
    "a small geometric object": "小さな幾何学オブジェ",
    "a canvas tote bag": "キャンバストートバッグ",
    "a stainless water bottle": "ステンレスボトル",
    "a folded cotton scarf": "折りたたんだコットンスカーフ",
    "a compact notebook": "コンパクトなノート",
    "a simple key ring": "シンプルなキーリング",
    "a light jacket sleeve": "軽いジャケットの袖",
    "a straw hat": "麦わら帽子",
    "a chilled water bottle": "冷えたウォーターボトル",
    "a folded map": "折りたたんだ地図",
    "a linen pouch": "リネンポーチ",
    "a ceramic cup": "陶器のカップ",
    "a travel journal": "トラベルジャーナル",
    "a woven coaster": "編みコースター",
    "a light canvas bag": "軽いキャンバスバッグ",
    "a tennis ball can": "テニスボール缶",
    "a white sports towel": "白いスポーツタオル",
    "a reusable bottle": "再利用ボトル",
    "a small duffel bag": "小さなダッフルバッグ",
    "a visor": "サンバイザー",
    "a cold drink": "冷たいドリンク",
    "a score notebook": "スコアノート",
    "a clean wristband": "清潔なリストバンド",
    "a folded light sweater": "折りたたんだ薄手のセーター",
    "a glass bottle": "ガラスボトル",
    "a small field notebook": "小さなフィールドノート",
    "a woven mat edge": "編みマットの端",
    "a metal mug": "金属マグ",
    "a compact lantern": "コンパクトなランタン",
    "a neutral backpack strap": "ニュートラルカラーのバックパックストラップ",
    "a wool blanket edge": "ウールブランケットの端",
    "a travel mug": "トラベルマグ",
    "a small binocular case": "小さな双眼鏡ケース",
    "an iced tea": "アイスティー",
    "a paperback novel": "ペーパーバック小説",
    "a woven beach tote": "編み込みのビーチトート",
    "a sun hat": "日よけ帽子",
    "a folded towel": "折りたたんだタオル",
    "a small sunscreen bottle": "小さな日焼け止めボトル",
    "a canvas pouch": "キャンバスポーチ",
    "a ceramic planter": "陶器のプランター",
    "a notebook": "ノート",
    "a glass of sparkling water": "スパークリングウォーターのグラス",
    "a linen napkin": "リネンナプキン",
    "kraft paper": "クラフト紙",
    "a bundle of eucalyptus": "ユーカリの束",
    "cotton string": "コットンひも",
    "a small pair of scissors": "小さなはさみ",
    "an exhibition brochure": "展示会のパンフレット",
    "a coffee cup": "コーヒーカップ",
    "a sleek pen": "すっきりしたペン",
    "a folded coat sleeve": "折りたたまれたコートの袖",
    "a room key card holder": "ルームキーカードホルダー",
    "a leather notebook": "レザーノート",
    "a structured handbag": "形の整ったハンドバッグ",
    "a boarding pass": "搭乗券",
    "wireless earbuds": "ワイヤレスイヤホン",
    "a passport cover": "パスポートカバー",
    "a paper ticket": "紙のチケット",
    "a compact snack pack": "コンパクトなスナックパック",
    "a light cardigan": "薄手のカーディガン",
    "an open book": "開いた本",
    "a bookmark": "しおり",
    "a ceramic mug": "陶器のマグ",
    "a fabric pencil case": "布製ペンケース",
    "a spiral notebook": "リングノート",
    "a pen pouch": "ペンポーチ",
    "a canvas backpack": "キャンバスバックパック",
    "color swatches": "カラースウォッチ",
    "a metal ruler": "金属定規",
    "a pencil": "鉛筆",
    "a folded fabric sample": "折りたたんだ布サンプル",
    "a small clay dish": "小さな陶器皿",
    "a linen cloth": "リネンクロス",
    "a wooden tool": "木製ツール",
    "a mocktail glass": "モクテルグラス",
    "a small plate": "小皿",
    "a lightweight jacket": "軽量ジャケット",
    "a croissant plate": "クロワッサンの皿",
    "a folded newspaper": "折りたたんだ新聞",
    "a linen placemat": "リネンのランチョンマット",
    "a picnic basket edge": "ピクニックバスケットの端",
    "a lemonade bottle": "レモネードボトル",
    "a cotton napkin": "コットンナプキン",
    "a small menu card": "小さなメニューカード",
    "a glass water tumbler": "ガラスのウォータータンブラー",
    "a neutral tote strap": "ニュートラルカラーのトートストラップ",
    "a chilled drink": "冷えたドリンク",
    "a deck chair fabric edge": "デッキチェア生地の端",
    "a rolled white towel": "丸めた白いタオル",
    "a citrus drink": "シトラスドリンク",
    "a magazine": "雑誌",
    "a woven bag": "編みバッグ",
    "a knitted glove": "ニット手袋",
    "a hot drink mug": "温かい飲み物のマグ",
    "a folded trail map": "折りたたんだトレイルマップ",
    "a wool scarf": "ウールスカーフ",
    "a rolled hand towel": "丸めたハンドタオル",
    "a small brochure": "小さなパンフレット",
    "a stone tray": "石のトレー",
    "a rolled yoga mat": "丸めたヨガマット",
    "a water bottle": "ウォーターボトル",
    "a small towel": "小さなタオル",
    "a teacup": "ティーカップ",
    "a flower vase": "花瓶",
    "a folded napkin": "折りたたんだナプキン",
    "a small dessert plate": "小さなデザート皿",
    "a wine glass": "ワイングラス",
    "a tasting notes card": "テイスティングノートカード",
    "a cork coaster": "コルクコースター",
    "a paper bag": "紙袋",
    "a bunch of herbs": "ハーブの束",
    "a folded cloth": "折りたたんだ布",
    "a gardening glove": "園芸用手袋",
    "a woven hat": "編み帽子",
  };
  return items.map((item) => map[item] || item);
}

function translateMood(text, directTranslation) {
  if (directTranslation) {
    return directTranslation;
  }

  return text
    .replace("calm, productive, minimal", "落ち着きがあり、作業感があり、ミニマル")
    .replace("urban, relaxed, stylish", "都会的で、リラックス感があり、スタイリッシュ")
    .replace("cozy, quiet, premium", "居心地がよく、静かで、上質")
    .replace("fresh, modern, lived-in", "フレッシュで、モダンで、生活感がある")
    .replace("casual, realistic, contemporary", "カジュアルで、現実的で、今っぽい")
    .replace("clean, precise, editorial", "クリーンで、正確で、エディトリアル感がある")
    .replace("fresh, calm, outdoorsy", "爽やかで、落ち着きがあり、アウトドア感がある")
    .replace("active, airy, realistic", "アクティブで、軽やかで、現実的")
    .replace("warm, adventurous, sunlit", "暖かく、冒険感があり、陽光に包まれている")
    .replace("earthy, relaxed, premium", "アーシーで、リラックス感があり、上質")
    .replace("sporty, bright, energetic", "スポーティで、明るく、エネルギッシュ")
    .replace("active, clean, social", "アクティブで、クリーンで、社交的")
    .replace("peaceful, natural, crisp", "穏やかで、自然で、澄んでいる")
    .replace("outdoor, grounded, practical", "屋外感があり、地に足がついていて、実用的")
    .replace("crisp, elevated, cozy", "澄んでいて、上質感があり、居心地がよい")
    .replace("light, summery, relaxed", "軽やかで、夏らしく、リラックスしている")
    .replace("casual, sunny, natural", "カジュアルで、日差しがあり、自然")
    .replace("fresh, botanical, calm", "爽やかで、植物感があり、落ち着いている")
    .replace("soft, creative, natural", "やわらかく、クリエイティブで、自然")
    .replace("cultured, polished, modern", "文化的で、洗練されていて、モダン")
    .replace("premium, composed, urban", "上質で、整っていて、都会的")
    .replace("mobile, sleek, contemporary", "移動感があり、すっきりしていて、現代的")
    .replace("quiet, practical, travel-ready", "静かで、実用的で、旅向き")
    .replace("thoughtful, cozy, literary", "思慮深く、居心地がよく、文学的")
    .replace("youthful, practical, real-life", "若々しく、実用的で、日常感がある")
    .replace("creative, tidy, hands-on", "クリエイティブで、整っていて、手仕事感がある")
    .replace("artisan, warm, tactile", "職人的で、暖かく、質感がある")
    .replace("stylish, social, sunset-lit", "スタイリッシュで、社交的で、夕景に照らされている")
    .replace("light, aspirational, everyday", "軽やかで、憧れ感があり、日常的")
    .replace("casual, friendly, fresh", "カジュアルで、親しみやすく、爽やか")
    .replace("clean, open, scenic", "クリーンで、開放感があり、景色がよい")
    .replace("breezy, polished, coastal", "風通しがよく、整っていて、海辺らしい")
    .replace("resort-like, clean, summery", "リゾート感があり、クリーンで、夏らしい")
    .replace("seasonal, cozy, travel-inspired", "季節感があり、居心地がよく、旅らしさがある")
    .replace("serene, refined, minimal", "穏やかで、洗練されていて、ミニマル")
    .replace("balanced, healthy, calm", "バランスがよく、健やかで、落ち着いている")
    .replace("gentle, charming, airy", "やさしく、魅力があり、軽やか")
    .replace("mature, elegant, warm", "落ち着きがあり、上品で、暖かい")
    .replace("earthy, local, approachable", "土っぽさがあり、ローカル感があり、親しみやすい")
    .replace("quiet, natural, relaxed", "静かで、自然で、リラックスしている");
}

function translateDetails(items) {
  const map = {
    "high detail product texture": "素材の質感を高精細に見せる",
    "sharp focus on the case design": "ケースのデザインにしっかりピントを合わせる",
    "natural realistic shadows": "自然でリアルな影にする",
    "commercial quality composition": "商用クオリティの構図にする",
    "no fantasy elements": "ファンタジー要素は入れない",
    "no floating objects": "物体を浮かせない",
    "no exaggerated surreal styling": "誇張したシュール表現は避ける",
    "do not change the smartphone case shape": "スマホケースの形状は変えない",
    "do not change the smartphone case color": "スマホケースの色は変えない",
    "preserve the original camera cutout and button layout": "元のカメラ開口部とボタン配置を維持する",
  };
  return items.map((item) => map[item] || item);
}

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(promptOutput.value);
    copyButton.textContent = "コピー済み";
    window.setTimeout(() => {
      copyButton.textContent = "コピー";
    }, 1200);
  } catch (error) {
    copyButton.textContent = "失敗";
    window.setTimeout(() => {
      copyButton.textContent = "コピー";
    }, 1200);
  }
}

generateButton.addEventListener("click", generatePrompt);
angleVariantButton.addEventListener("click", createAngleVariant);
if (saveSceneButton) {
  saveSceneButton.addEventListener("click", saveCurrentAsCustomScenario);
}
if (favoriteButton) {
  favoriteButton.addEventListener("click", saveCurrentToFavorites);
}
copyButton.addEventListener("click", copyPrompt);
if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}
if (favoritesList) {
  favoritesList.addEventListener("click", handleSavedListClick);
}
if (historyList) {
  historyList.addEventListener("click", handleSavedListClick);
}
if (customScenesList) {
  customScenesList.addEventListener("click", handleCustomSceneListClick);
}
ngPresetInputs.forEach((input) => {
  input.addEventListener("input", syncPromptFromJapaneseEditors);
  input.addEventListener("change", syncPromptFromJapaneseEditors);
});
deviceTargetSelect.addEventListener("input", generatePrompt);
deviceTargetSelect.addEventListener("change", generatePrompt);
characterSelect.addEventListener("input", generatePrompt);
characterSelect.addEventListener("change", generatePrompt);
propsModeSelect.addEventListener("input", generatePrompt);
propsModeSelect.addEventListener("change", generatePrompt);
editScene.addEventListener("input", syncPromptFromJapaneseEditors);
editScene.addEventListener("change", syncPromptFromJapaneseEditors);
editLight.addEventListener("input", syncPromptFromJapaneseEditors);
editLight.addEventListener("change", syncPromptFromJapaneseEditors);
editAngle.addEventListener("input", syncPromptFromJapaneseEditors);
editAngle.addEventListener("change", syncPromptFromJapaneseEditors);
editProps.addEventListener("input", syncPromptFromJapaneseEditors);
editProps.addEventListener("change", syncPromptFromJapaneseEditors);
editMood.addEventListener("input", syncPromptFromJapaneseEditors);
editMood.addEventListener("change", syncPromptFromJapaneseEditors);
editDetails.addEventListener("input", syncPromptFromJapaneseEditors);
editDetails.addEventListener("change", syncPromptFromJapaneseEditors);

applyTheme(getPreferredTheme());
if (typeof prefersDarkScheme.addEventListener === "function") {
  prefersDarkScheme.addEventListener("change", syncThemeWithSystem);
} else if (typeof prefersDarkScheme.addListener === "function") {
  prefersDarkScheme.addListener(syncThemeWithSystem);
}
loadSavedData();
generatePrompt();
