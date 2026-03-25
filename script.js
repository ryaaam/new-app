const caseCountSelect = document.getElementById("case-count-select");
const layoutSelect = document.getElementById("layout-select");
const categorySelect = document.getElementById("category-select");
const styleSelect = document.getElementById("style-select");
const focusSelect = document.getElementById("focus-select");
const themeToggleButton = document.getElementById("theme-toggle-button");
const generateButton = document.getElementById("generate-button");
const angleVariantButton = document.getElementById("angle-variant-button");
const copyButton = document.getElementById("copy-button");
const promptOutput = document.getElementById("prompt-output");
const promptOutputJa = document.getElementById("prompt-output-ja");
const editScene = document.getElementById("edit-scene");
const editLight = document.getElementById("edit-light");
const editAngle = document.getElementById("edit-angle");
const editProps = document.getElementById("edit-props");
const editMood = document.getElementById("edit-mood");
const editDetails = document.getElementById("edit-details");

const metaCategory = document.getElementById("meta-category");
const metaCaseCount = document.getElementById("meta-case-count");
const metaLayout = document.getElementById("meta-layout");
const metaLocation = document.getElementById("meta-location");
const metaLight = document.getElementById("meta-light");
const metaAngle = document.getElementById("meta-angle");
const metaProps = document.getElementById("meta-props");

let currentPromptState = null;
const themeStorageKey = "prompt-generator-theme";
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = resolvedTheme;
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
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return prefersDarkScheme.matches ? "dark" : "light";
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  window.localStorage.setItem(themeStorageKey, nextTheme);
}

function syncThemeWithSystem(event) {
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "light" || storedTheme === "dark") {
    return;
  }

  applyTheme(event.matches ? "dark" : "light");
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

const scenarios = [
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
];

const anglePool = [...new Set(scenarios.map((scenario) => scenario.angle))];

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
};

function sample(array, count = 1) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getScenarioCategories(scenario) {
  const haystack = `${scenario.location} ${scenario.mood}`.toLowerCase();
  return Object.entries(categoryRules)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword)))
    .map(([category]) => category);
}

function getFilteredScenarios() {
  if (categorySelect.value === "all") {
    return scenarios;
  }

  return scenarios.filter((scenario) =>
    getScenarioCategories(scenario).includes(categorySelect.value),
  );
}

function generatePrompt() {
  const selectedStyle = styles[styleSelect.value];
  const focus = focusModes[focusSelect.value];
  const caseCount = Number(caseCountSelect.value);
  const selectedLayout = layoutModes[layoutSelect.value];
  const availableScenarios = getFilteredScenarios();
  const scenario = sample(availableScenarios.length > 0 ? availableScenarios : scenarios)[0];
  const props = sample(scenario.props, selectedStyle.propsCount);
  const extraDetails = sample(detailOptions, 3);
  const scenarioCategories = getScenarioCategories(scenario);
  const categoryText =
    categorySelect.value === "all"
      ? scenarioCategories.map((category) => categoryLabels[category]).join(", ") || categoryLabels.all
      : categoryLabels[categorySelect.value];

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
    scene: translateLocation(scenario.location, scenario.locationJa),
    light: translateLight(scenario.light, scenario.lightJa),
    angle: translateAngle(scenario.angle, scenario.angleJa),
    props: translateProps(props, scenario).join("、"),
    mood: translateMood(scenario.mood, scenario.moodJa),
    details: translateDetails(extraDetails).join("、"),
    originalSceneJa: translateLocation(scenario.location, scenario.locationJa),
    originalLightJa: translateLight(scenario.light, scenario.lightJa),
    originalAngleJa: translateAngle(scenario.angle, scenario.angleJa),
    originalPropsJa: translateProps(props, scenario).join("、"),
    originalMoodJa: translateMood(scenario.mood, scenario.moodJa),
    originalDetailsJa: translateDetails(extraDetails).join("、"),
    originalSceneEn: scenario.location,
    originalLightEn: scenario.light,
    originalAngleEn: scenario.angle,
    originalPropsEn: props.join(", "),
    originalMoodEn: scenario.mood,
    originalDetailsEn: extraDetails.join(", "),
    toneEn: selectedStyle.tone,
    focusEn: focus,
  };

  fillJapaneseEditors(currentPromptState);
  syncPromptFromJapaneseEditors();
  metaCategory.textContent = categoryText;
  metaCaseCount.textContent = `${caseCount}個`;
  metaLayout.textContent = selectedLayout.label;
  metaLocation.textContent = scenario.location;
  metaLight.textContent = scenario.light;
  metaAngle.textContent = scenario.angle;
  metaProps.textContent = props.join(", ");
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

  const edited = {
    scene: editScene.value.trim(),
    light: editLight.value.trim(),
    angle: editAngle.value.trim(),
    props: editProps.value.trim(),
    mood: editMood.value.trim(),
    details: editDetails.value.trim(),
  };

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
    editedEn.angle ? `- Camera angle: ${editedEn.angle}.` : "",
    "",
    "Scene direction:",
    editedEn.scene ? `- Scene: ${editedEn.scene}.` : "",
    editedEn.light ? `- Lighting: ${editedEn.light}.` : "",
    editedEn.props ? `- Props: ${editedEn.props}.` : "",
    editedEn.mood ? `- Mood: ${editedEn.mood}.` : "",
    `${editedEn.details ? `- Additional direction: ${editedEn.details}.` : ""}`,
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
    edited.scene ? `シーン: ${edited.scene}。` : "",
    edited.light ? `光: ${edited.light}。` : "",
    edited.angle ? `構図: ${edited.angle}。` : "",
    edited.props ? `小物: ${edited.props}。` : "",
    edited.mood ? `雰囲気: ${edited.mood}。` : "",
    `見せ方: ${currentPromptState.focusText}。`,
    edited.details ? `追加条件: ${edited.details}。` : "",
  ].filter(Boolean);

  promptOutput.value = promptLines.join("\n");
  promptOutputJa.innerHTML = renderJapanesePrompt(promptJaLines);
}

function createAngleVariant() {
  if (!currentPromptState) {
    return;
  }

  const nextAngleEn = sample(
    anglePool.filter((angle) => angle !== currentPromptState.originalAngleEn),
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
copyButton.addEventListener("click", copyPrompt);
themeToggleButton.addEventListener("click", toggleTheme);
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
prefersDarkScheme.addEventListener("change", syncThemeWithSystem);
generatePrompt();
