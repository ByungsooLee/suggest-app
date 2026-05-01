// ─────────────────────────────────────────────
// taxonomy.ts  — 語彙の単一ソース
// ─────────────────────────────────────────────

// ── 基本タグ ─────────────────────────────────

export const MOOD_TAGS = [
  "calm",
  "emotional",
  "stylish",
  "dark",
  "funny",
  "tense",
  "uplifting",
  "melancholic",
] as const;

export const WATCH_CONTEXTS = [
  "solo_watch",
  "date_friendly",
  "friends_hangout",
  "family_time",
  "late_night_fit",
] as const;

export const CONTENT_WARNING_TAGS = [
  "gore",
  "sad_ending",
  "violence",
  "disturbing",
] as const;

export const STYLE_TAGS = [
  "easy_to_watch",
  "slow_burn",
  "complex_plot",
  "visual_masterpiece",
] as const;

export const FEEDBACK_REACTIONS = [
  "liked",
  "too_dark",
  "too_long",
  "not_now",
  "mismatch",
] as const;

// ── ストリーミング / レビュー ──────────────────

export const STREAMING_PROVIDERS = [
  "netflix",
  "amazon_prime",
  "disney_plus",
  "apple_tv",
  "hulu",
] as const;

export const REVIEW_SOURCES = [
  "internal_editorial",
  "tmdb",
  "imdb",
  "rottentomatoes",
] as const;

// ── MBTI ─────────────────────────────────────

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

// ── 映画ジャンル（VOD汎用）────────────────────
// DB の genrePrimary / genreSecondary に使われる値。
// MOVIE_GENRE_AXIS とは別物。マッピングは GENRE_AXIS_TO_GENRES を参照。

export const MOVIE_GENRES = [
  "action",
  "adventure",
  "animation",
  "comedy",
  "crime",
  "drama",
  "family",
  "fantasy",
  "horror",
  "mystery",
  "musical",
  "romance",
  "sci-fi",
  "thriller",
] as const;

// ── プロ映画批評軸ジャンル ────────────────────
// 映画批評家・シネマテーク的な分類。マイページの好みチューニングに使う。
// DB には movie.moodTags / movie.metadata.axes で保持。

/** トーン / 空気感 軸 */
export const GENRE_TONE = [
  "neo_noir",           // ネオ・ノワール
  "psychological_thriller", // 心理スリラー
  "dark_comedy",        // ダーク・コメディ
  "black_comedy",       // ブラック・コメディ
  "suspense",           // サスペンス
  "slow_cinema",        // 遅い映画（スロー・シネマ）
  "absurdist",          // 不条理劇
  "mockumentary",       // ドキュメンタリー風
  "melodrama",          // メロドラマ
] as const;

/** 物語構造 軸 */
export const GENRE_NARRATIVE = [
  "nonlinear_narrative",    // 非線形ナラティブ
  "antihero_driven",        // アンチ・ヒーロー主導
  "ensemble_cast",          // 群像劇
  "road_movie",             // ロードムービー
  "coming_of_age",          // 成長物語（ビルドゥングスロマン）
  "revenge_story",          // リベンジ譚
  "chamber_drama",          // 密室劇
  "antiwar_drama",          // 反戦・戦争ドラマ
] as const;

/** 世界観 軸 */
export const GENRE_WORLD = [
  "dystopian_sci_fi",       // ディストピア SF
  "cyberpunk",              // サイバーパンク
  "space_opera",            // スペース・オペラ
  "post_apocalyptic",       // ポスト・アポカリプス
  "existential_sci_fi",     // 実存主義 SF
  "splatter_gore",          // スプラッター／ゴア
  "folk_horror",            // 民俗ホラー（フォーク・ホラー）
  "spaghetti_western",      // スパゲッティ・ウエスタン
] as const;

/** 映画史的 軸 */
export const GENRE_CINEMATIC = [
  "film_noir_classic",      // フィルム・ノワール（クラシック）
  "nouvelle_vague",         // ヌーヴェル・ヴァーグ
  "italian_neorealism",     // イタリアン・ネオリアリズム
  "german_expressionism",   // ジャーマン・エクスプレッショニズム
  "american_new_cinema",    // アメリカン・ニューシネマ
  "arthouse",               // アート・ハウス
  "bollywood",              // ムンバイ映画（ボリウッド）
  "korean_new_wave",        // 韓国ニューウェーブ
] as const;

/** 全軸を結合したユニオン型 */
export const MOVIE_GENRE_AXES = [
  ...GENRE_TONE,
  ...GENRE_NARRATIVE,
  ...GENRE_WORLD,
  ...GENRE_CINEMATIC,
] as const;

/** 軸ごとのグループ定義（UI タブ構成に使う） */
export const GENRE_AXIS_GROUPS = {
  tone:      GENRE_TONE,
  narrative: GENRE_NARRATIVE,
  world:     GENRE_WORLD,
  cinematic: GENRE_CINEMATIC,
} as const;

export type GenreAxisGroup = keyof typeof GENRE_AXIS_GROUPS;

/**
 * プロ軸ジャンル → DB genrePrimary へのマッピング（推薦エンジン用）
 * 複数の DB ジャンルが対応する場合は OR 検索に使う。
 */
export const GENRE_AXIS_TO_GENRES: Record<
  (typeof MOVIE_GENRE_AXES)[number],
  (typeof MOVIE_GENRES)[number][]
> = {
  neo_noir:               ["crime", "thriller"],
  psychological_thriller: ["thriller", "mystery"],
  dark_comedy:            ["comedy", "drama"],
  black_comedy:           ["comedy"],
  suspense:               ["thriller", "mystery"],
  slow_cinema:            ["drama"],
  absurdist:              ["drama", "comedy"],
  mockumentary:           ["comedy", "drama"],
  melodrama:              ["drama", "romance"],
  nonlinear_narrative:    ["drama", "thriller", "mystery"],
  antihero_driven:        ["crime", "drama", "thriller"],
  ensemble_cast:          ["drama", "comedy", "crime"],
  road_movie:             ["drama", "adventure"],
  coming_of_age:          ["drama"],
  revenge_story:          ["thriller", "crime", "action"],
  chamber_drama:          ["drama"],
  antiwar_drama:          ["drama", "action"],
  dystopian_sci_fi:       ["sci-fi"],
  cyberpunk:              ["sci-fi"],
  space_opera:            ["sci-fi", "adventure"],
  post_apocalyptic:       ["sci-fi", "action"],
  existential_sci_fi:     ["sci-fi", "drama"],
  splatter_gore:          ["horror"],
  folk_horror:            ["horror"],
  spaghetti_western:      ["action", "drama"],
  film_noir_classic:      ["crime", "thriller"],
  nouvelle_vague:         ["drama"],
  italian_neorealism:     ["drama"],
  german_expressionism:   ["drama", "horror"],
  american_new_cinema:    ["drama", "crime"],
  arthouse:               ["drama"],
  bollywood:              ["musical", "romance", "action"],
  korean_new_wave:        ["drama", "thriller", "crime"],
};

// ── 日本語ラベル ──────────────────────────────

export const GENRE_AXIS_LABELS: Record<
  (typeof MOVIE_GENRE_AXES)[number],
  string
> = {
  neo_noir:               "ネオ・ノワール",
  psychological_thriller: "心理スリラー",
  dark_comedy:            "ダーク・コメディ",
  black_comedy:           "ブラック・コメディ",
  suspense:               "サスペンス",
  slow_cinema:            "遅い映画（スロー・シネマ）",
  absurdist:              "不条理劇",
  mockumentary:           "ドキュメンタリー風",
  melodrama:              "メロドラマ",
  nonlinear_narrative:    "非線形ナラティブ",
  antihero_driven:        "アンチ・ヒーロー主導",
  ensemble_cast:          "群像劇",
  road_movie:             "ロードムービー",
  coming_of_age:          "成長物語",
  revenge_story:          "リベンジ譚",
  chamber_drama:          "密室劇",
  antiwar_drama:          "反戦・戦争ドラマ",
  dystopian_sci_fi:       "ディストピア SF",
  cyberpunk:              "サイバーパンク",
  space_opera:            "スペース・オペラ",
  post_apocalyptic:       "ポスト・アポカリプス",
  existential_sci_fi:     "実存主義 SF",
  splatter_gore:          "スプラッター／ゴア",
  folk_horror:            "民俗ホラー",
  spaghetti_western:      "スパゲッティ・ウエスタン",
  film_noir_classic:      "フィルム・ノワール（クラシック）",
  nouvelle_vague:         "ヌーヴェル・ヴァーグ",
  italian_neorealism:     "イタリアン・ネオリアリズム",
  german_expressionism:   "ジャーマン・エクスプレッショニズム",
  american_new_cinema:    "アメリカン・ニューシネマ",
  arthouse:               "アート・ハウス",
  bollywood:              "ボリウッド",
  korean_new_wave:        "韓国ニューウェーブ",
};

export const GENRE_AXIS_GROUP_LABELS: Record<GenreAxisGroup, string> = {
  tone:      "トーン / 空気感",
  narrative: "物語構造",
  world:     "世界観",
  cinematic: "映画史的",
};

export const GENRE_AXIS_EXAMPLES: Partial<
  Record<(typeof MOVIE_GENRE_AXES)[number], string>
> = {
  neo_noir:            "パルプ・フィクション、チャイナタウン",
  slow_cinema:         "ストーカー（タルコフスキー）、ニーチェの馬",
  nouvelle_vague:      "勝手にしやがれ、大人は判ってくれない",
  korean_new_wave:     "パラサイト、オールド・ボーイ",
  arthouse:            "マルコヴィッチの穴、エターナル・サンシャイン",
  folk_horror:         "ウィッカーマン、ミッドサマー",
};

// ── その他ラベル ───────────────────────────────

export const MOOD_LABELS: Record<(typeof MOOD_TAGS)[number], string> = {
  calm:       "穏やか",
  emotional:  "感情的",
  stylish:    "スタイリッシュ",
  dark:       "ダーク",
  funny:      "笑える",
  tense:      "緊張感",
  uplifting:  "前向き",
  melancholic: "切ない",
};

export const CONTEXT_LABELS: Record<(typeof WATCH_CONTEXTS)[number], string> = {
  solo_watch:      "ひとりで",
  date_friendly:   "恋人と",
  friends_hangout: "友人と",
  family_time:     "家族と",
  late_night_fit:  "深夜に",
};

export const FEEDBACK_LABELS: Record<(typeof FEEDBACK_REACTIONS)[number], string> = {
  liked:     "観た 👍",
  too_dark:  "暗すぎた",
  too_long:  "長すぎた",
  not_now:   "今じゃない",
  mismatch:  "好みと違う",
};

export const GENRE_LABELS: Record<(typeof MOVIE_GENRES)[number], string> = {
  action:    "アクション",
  adventure: "冒険",
  animation: "アニメ",
  comedy:    "コメディ",
  crime:     "犯罪",
  drama:     "ドラマ",
  family:    "ファミリー",
  fantasy:   "ファンタジー",
  horror:    "ホラー",
  mystery:   "ミステリー",
  musical:   "ミュージカル",
  romance:   "ロマンス",
  "sci-fi":  "SF",
  thriller:  "スリラー",
};

export const RANK_LABELS: Record<number, string> = {
  1: "今夜の本命",
  2: "バックアップ 1",
  3: "バックアップ 2",
};

// ── 型エクスポート ────────────────────────────

export type MoodTag           = (typeof MOOD_TAGS)[number];
export type WatchContext      = (typeof WATCH_CONTEXTS)[number];
export type ContentWarningTag = (typeof CONTENT_WARNING_TAGS)[number];
export type StyleTag          = (typeof STYLE_TAGS)[number];
export type FeedbackReaction  = (typeof FEEDBACK_REACTIONS)[number];
export type MovieGenre        = (typeof MOVIE_GENRES)[number];
export type MovieGenreAxis    = (typeof MOVIE_GENRE_AXES)[number];
export type StreamingProvider = (typeof STREAMING_PROVIDERS)[number];
export type ReviewSource      = (typeof REVIEW_SOURCES)[number];
export type MbtiType          = (typeof MBTI_TYPES)[number];
