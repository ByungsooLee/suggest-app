import compatibilityData from "@/data/mbti-compatibility.json";

export type MBTIType =
  | "INFJ" | "INFP" | "INTJ" | "INTP"
  | "ENFJ" | "ENFP" | "ENTJ" | "ENTP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type CompatibilityScore = 1 | 2 | 3 | 4 | 5;

export type CompatibilityData = {
  score: CompatibilityScore;
  label: string;
  chemistry: string;
  atmosphere: string;
  afterTalk: string;
  movieGenres: string[];
  exampleMovies: string[];
  decisionHook: string;
};

const MBTI_COMPATIBILITY = compatibilityData as Record<string, CompatibilityData>;

const SAME_TYPE_COMPATIBILITY: Record<MBTIType, CompatibilityData> = {
  INFJ: { score: 4, label: "相性良好", chemistry: "静かな共鳴", atmosphere: "2人とも無言でも通じ合う。言葉より沈黙が豊かな観賞", afterTalk: "「わかる」だけで全部伝わる。でも感想が同じすぎて物足りないことも", movieGenres: ["哲学的映画", "詩的な映像"], exampleMovies: ["ツリー・オブ・ライフ", "ノスタルジア", "鏡"], decisionHook: "2人の世界が完全に一致する映画。でも違う解釈があると更に面白い" },
  INFP: { score: 4, label: "相性良好", chemistry: "感性の完全共鳴", atmosphere: "同じシーンで泣く。同じキャラクターが好き。完璧な共感", afterTalk: "感想が同じすぎて議論にならない。でもそれが心地いい", movieGenres: ["詩的なドラマ", "感動系"], exampleMovies: ["花束みたいな恋をした", "アメリ", "燃ゆる女の肖像"], decisionHook: "完全に共感できる映画。今夜は同じ涙を流す" },
  INTJ: { score: 5, label: "伝説的ペア", chemistry: "頭脳の完全共鳴", atmosphere: "映画中は完全な静寂。でも頭の中は全開。観終わってから深夜まで続く議論", afterTalk: "伏線の回収競争が始まる。どちらも見落としがない", movieGenres: ["複雑な構成の映画", "哲学的SF"], exampleMovies: ["2001年宇宙の旅", "TENET", "プリマー"], decisionHook: "全ての伏線を2人で解析する。これは最高の頭脳戦" },
  INTP: { score: 4, label: "相性良好", chemistry: "論理の迷宮", atmosphere: "映画中から矛盾探しが始まる。お互いに発見を共有したがる", afterTalk: "設定の矛盾と整合性の議論が深夜まで続く", movieGenres: ["ハードSF", "タイムパラドックス"], exampleMovies: ["プリマー", "コヒーレンス", "ロスト・ハイウェイ"], decisionHook: "設定の完璧さを2人で検証する。どちらが先に矛盾を見つけるか" },
  ENFJ: { score: 4, label: "相性良好", chemistry: "感情の爆発", atmosphere: "2人とも感情が大きく動く。泣いたり笑ったりが同期する", afterTalk: "キャラクターへの感情移入が深すぎて、感想が収まらない", movieGenres: ["感動ドラマ", "人間の尊厳"], exampleMovies: ["最強のふたり", "ショーシャンクの空に", "セルマ"], decisionHook: "感情を全開にできる映画。今夜は2人で思いっきり泣く" },
  ENFP: { score: 3, label: "無難", chemistry: "妄想の無限ループ", atmosphere: "観ながら妄想が広がりすぎて映画に集中できないことも", afterTalk: "「もしこうだったら？」が無限に続く。結論が出ない", movieGenres: ["世界観が広い映画"], exampleMovies: ["マルコヴィッチの穴", "バードマン"], decisionHook: "妄想が許される映画。今夜は2人の想像力が暴走する" },
  ENTJ: { score: 4, label: "相性良好", chemistry: "支配者同士の覇権争い", atmosphere: "どちらが先に「あの判断は間違い」と言うか競い合っている", afterTalk: "登場人物の意思決定を徹底的に批評する。映画がケーススタディ", movieGenres: ["権力闘争", "リーダーシップ"], exampleMovies: ["マネーボール", "リンカーン", "ダーケスト・アワー"], decisionHook: "あの判断は正しかったか。2人の評決が分かれる映画" },
  ENTP: { score: 5, label: "伝説的ペア", chemistry: "議論が終わらない", atmosphere: "観ながらすでに逆張りの解釈を準備している。映画が戦場になる", afterTalk: "どちらの解釈が正しいか永遠に決まらない。それが楽しい", movieGenres: ["解釈が多様な映画", "カルト的作品"], exampleMovies: ["ファイト・クラブ", "未来世紀ブラジル", "バードマン"], decisionHook: "正解のない映画。2人の解釈が全部違って全部面白い" },
  ISFJ: { score: 4, label: "相性良好", chemistry: "温かさの共鳴", atmosphere: "安心して感情を出せる。お互いを気遣い合う優しい時間", afterTalk: "「よかったね」の共感が深い。感想が短くても心は通じている", movieGenres: ["家族映画", "ハートウォーミング"], exampleMovies: ["フォレスト・ガンプ", "サウンド・オブ・ミュージック", "コーダ"], decisionHook: "温かい気持ちになれる映画。今夜は2人で心を温める" },
  ISFP: { score: 5, label: "伝説的ペア", chemistry: "感性の完全共鳴", atmosphere: "同じシーンで息をのむ。言葉なく感動が伝わる", afterTalk: "「あの映像」「わかる」だけで通じる。深く言語化しなくていい", movieGenres: ["映像美", "詩的な映画"], exampleMovies: ["燃ゆる女の肖像", "aftersun", "ムーンライト"], decisionHook: "言葉にできない感動を共有する。それだけでいい夜" },
  ISTJ: { score: 3, label: "無難", chemistry: "静かな秩序の共鳴", atmosphere: "2人とも静かに集中する。邪魔し合わない", afterTalk: "感想は短くて事実確認が中心。でもそれが心地いい", movieGenres: ["歴史映画", "リアリズム"], exampleMovies: ["ダンケルク", "スポットライト", "シンドラーのリスト"], decisionHook: "事実の重みを静かに感じる映画。今夜は2人でその重さを受け取る" },
  ISTP: { score: 4, label: "相性良好", chemistry: "無口な共鳴", atmosphere: "映画中は完全に静か。でもお互いに何かを感じている", afterTalk: "感想は短いが具体的。「あの仕組みが」「あのシーンの技術が」", movieGenres: ["技術・メカニズムが緻密な映画"], exampleMovies: ["ヒート", "プリマー", "ゼロ・グラビティ"], decisionHook: "細部のリアリティを2人で確認する。言葉少なく分かり合える夜" },
  ESFJ: { score: 4, label: "相性良好", chemistry: "共感の洪水", atmosphere: "ティッシュを2人で分け合う。感情が増幅する", afterTalk: "キャラクターへの共感が深すぎて感想が終わらない", movieGenres: ["感動ドラマ", "家族映画"], exampleMovies: ["最強のふたり", "グリーンブック", "コーダ"], decisionHook: "泣きたい夜に。感情をフル開放できる最高のペア" },
  ESFP: { score: 4, label: "相性良好", chemistry: "テンションが爆発", atmosphere: "観る前から盛り上がっている。映画が始まる前が一番楽しいかも", afterTalk: "「最高だった！」の応酬。感想より盛り上がりが大事", movieGenres: ["コメディ", "アクション", "ミュージカル"], exampleMovies: ["マッドマックス", "ラ・ラ・ランド", "グレイテスト・ショーマン"], decisionHook: "笑って騒いで盛り上がれる映画。今夜のエネルギーを全部使う" },
  ESTJ: { score: 3, label: "無難", chemistry: "判断の共鳴", atmosphere: "2人とも論理的に観る。感情的な反応は少ない", afterTalk: "映画の判断・構成・完成度を採点し合う。評価が一致しやすい", movieGenres: ["政治ドラマ", "ビジネス映画"], exampleMovies: ["マネーボール", "リンカーン", "ハドソン川の奇跡"], decisionHook: "完成度の高い映画を静かに鑑賞し、冷静に批評し合う夜" },
  ESTP: { score: 4, label: "相性良好", chemistry: "行動力の爆発", atmosphere: "2人ともリアクションが体で出る。スピード感のある映画が最高", afterTalk: "「あのシーン」「やばかった」の応酬。熱量が同じ", movieGenres: ["アクション", "スポーツ", "サバイバル"], exampleMovies: ["マッドマックス怒りのデスロード", "ジョン・ウィック", "クリード"], decisionHook: "体が熱くなる映画。観た後に走りたくなるやつ" },
};

function getDefaultCompatibility(): CompatibilityData {
  return {
    score: 3,
    label: "無難",
    chemistry: "それぞれの個性が交差する",
    atmosphere: "お互いのペースで映画を楽しめる組み合わせ",
    afterTalk: "感想をそれぞれに語り合える。意見の違いが発見になる",
    movieGenres: ["王道ドラマ", "普遍的なテーマの映画"],
    exampleMovies: ["ショーシャンクの空に", "グリーンブック", "フォレスト・ガンプ"],
    decisionHook: "2人が初めて一緒に観る映画。どんな映画でも今夜は特別になる",
  };
}

export function getCompatibility(typeA: MBTIType, typeB: MBTIType): CompatibilityData {
  if (typeA === typeB) {
    return SAME_TYPE_COMPATIBILITY[typeA];
  }
  const key = [typeA, typeB].sort().join("-");
  return MBTI_COMPATIBILITY[key] ?? getDefaultCompatibility();
}

export function getGroupCompatibility(types: MBTIType[]): {
  avgScore: number;
  minScore: number;
  pairs: Array<{ typeA: MBTIType; typeB: MBTIType; score: number }>;
  recommendation: string;
} {
  const pairs: Array<{ typeA: MBTIType; typeB: MBTIType; score: number }> = [];

  for (let i = 0; i < types.length; i++) {
    for (let j = i + 1; j < types.length; j++) {
      const data = getCompatibility(types[i], types[j]);
      pairs.push({ typeA: types[i], typeB: types[j], score: data.score });
    }
  }

  const avgScore = pairs.reduce((sum, pair) => sum + pair.score, 0) / pairs.length;
  const minScore = Math.min(...pairs.map((pair) => pair.score));

  let recommendation: string;
  if (avgScore >= 4.5) {
    recommendation = "伝説的なグループ。どんな映画を選んでも最高の夜になる";
  } else if (avgScore >= 3.5) {
    recommendation = "相性の良いグループ。映画選びで少し工夫すればさらに盛り上がる";
  } else if (minScore >= 3) {
    recommendation = "無難に楽しめるグループ。全員が知っているジャンルの映画が無難";
  } else {
    recommendation = "多様なグループ。全員が初めて観るジャンルに挑戦すると化学反応が起きやすい";
  }

  return { avgScore, minScore, pairs, recommendation };
}
