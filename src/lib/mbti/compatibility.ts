// src/lib/mbti/compatibility.ts
// MBTI 全136通り（16×16の対角線除く半分）の映画観賞ペア相性テーブル

export type MBTIType =
  | 'INFJ' | 'INFP' | 'INTJ' | 'INTP'
  | 'ENFJ' | 'ENFP' | 'ENTJ' | 'ENTP'
  | 'ISFJ' | 'ISFP' | 'ISTJ' | 'ISTP'
  | 'ESFJ' | 'ESFP' | 'ESTJ' | 'ESTP'

export type CompatibilityScore = 1 | 2 | 3 | 4 | 5

export type CompatibilityData = {
  score: CompatibilityScore
  label: string          // "伝説的ペア" | "相性良好" | "無難" | "要注意" | "難易度高"
  chemistry: string      // 関係性を一言で
  atmosphere: string     // 観る時の空気感
  afterTalk: string      // 観た後の会話パターン
  movieGenres: string[]  // 合うジャンル・テーマ
  exampleMovies: string[] // 具体的な映画例（未知の作品を優先）
  decisionHook: string   // 「今夜これを観よう」の決め台詞
}

// キーは常にアルファベット順でソート
// 取得時: [typeA, typeB].sort().join('-') で正規化すること
export const MBTI_COMPATIBILITY: Record<string, CompatibilityData> = {

  // ── スコア 5：伝説的ペア ─────────────────────────────

  'ENFP-ENTP': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '妄想が爆発する化学反応',
    atmosphere: '観ながら小声でツッコミが飛び交う。一番楽しんでいるのはこの2人',
    afterTalk: '「もしこうだったら？」が止まらない。翌日もLINEが来る',
    movieGenres: ['世界観が広いSF', '多層的な解釈ができる映画', 'カルト的名作'],
    exampleMovies: ['マルコヴィッチの穴', 'バードマン', 'サイン', 'コードネームU.N.C.L.E', 'ミスター・ノーバディ'],
    decisionHook: '正解のない映画。2人の解釈が全部違って全部正しい'
  },

  'ENTP-INTJ': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '知の火花が散る',
    atmosphere: 'どちらも頭が回転し続ける。観ながら分析が始まっている',
    afterTalk: 'ENTPが挑発的な解釈を提示し、INTJが論理で反論する。気づいたら夜明け',
    movieGenres: ['哲学的テーマ', '権力と知性', 'どんでん返し'],
    exampleMovies: ['ファイト・クラブ', 'イミテーション・ゲーム', '未来世紀ブラジル', 'ゲーム', 'オール・ザット・ジャズ'],
    decisionHook: 'どちらの解釈が正しいか永遠に議論できる映画'
  },

  'INFJ-ESTP': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '正反対が引き合う火花',
    atmosphere: 'INFJが静かに没入し、ESTPが体で反応する。全然違うのに不思議とフィットする',
    afterTalk: '「あのシーンの意味は〇〇」とINFJが言い、ESTPが「いや単純に〇〇だろ」と返す。深夜まで続く',
    movieGenres: ['心理スリラー', '道徳的ジレンマ', '予測不能な展開'],
    exampleMovies: ['ノーカントリー', '複製された男', 'ヘレディタリー', 'インセプション', 'パラサイト'],
    decisionHook: '観た後、2人の解釈が必ず真逆になる。その会話が今夜の本番'
  },

  'INFJ-INTJ': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '無言でも通じ合う深淵',
    atmosphere: '2人とも静かに集中する。頭の中は全開',
    afterTalk: '観終わって気づいたら2時間語り合っている。どちらも眠くならない',
    movieGenres: ['哲学的SF', '複雑な伏線', '実験的な映像表現'],
    exampleMovies: ['2001年宇宙の旅', 'TENET', 'エターナル・サンシャイン', 'ブレードランナー2049', 'メメント'],
    decisionHook: '全ての伏線を2人で回収できるか競い合う映画'
  },

  'ISFP-INFP': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '感性が溶け合う静けさ',
    atmosphere: '言葉なく同じシーンで泣ける。説明不要で感情が共鳴する',
    afterTalk: '「あのシーン、なんか刺さった」「わかる」だけで伝わる',
    movieGenres: ['映像美', '詩的なストーリー', '余韻のある結末'],
    exampleMovies: ['燃ゆる女の肖像', 'aftersun', 'ムーンライト', '花束みたいな恋をした', 'きみの鳥はうたえる'],
    decisionHook: '言葉にできない感情を、一緒に感じるための映画'
  },

  'INFJ-ENFP': {
    score: 5,
    label: '伝説的ペア',
    chemistry: '理想と情熱が共鳴する',
    atmosphere: 'INFJが深みを与え、ENFPが熱量を持ち込む。バランスが絶妙',
    afterTalk: 'キャラクターへの感情移入と哲学的考察が混ざり合う。話が尽きない',
    movieGenres: ['ヒューマンドラマ', '社会的テーマ', '個人の変革'],
    exampleMovies: ['ビューティフル・マインド', 'イントゥ・ザ・ワイルド', 'スポットライト', 'パターソン', 'はじまりのうた'],
    decisionHook: '観終わって世界が少し変わって見える映画。その感覚を2人で持ちたい'
  },

  // ── スコア 4：相性良好 ───────────────────────────────

  'ENFJ-ESFJ': {
    score: 4,
    label: '相性良好',
    chemistry: '共感の洪水',
    atmosphere: 'ティッシュを2人で分け合う。感情が増幅される',
    afterTalk: 'キャラクターの感情を代弁し合う。「あの子がかわいそうで」から始まる共感の連鎖',
    movieGenres: ['感動ドラマ', '家族映画', '実話ベース'],
    exampleMovies: ['最強のふたり', 'グリーンブック', 'ライフ・イズ・ビューティフル', 'チョコレートドーナツ', 'コーダ'],
    decisionHook: '泣きたい夜に。感情をフル開放できる相手がいる'
  },

  'ENFJ-ENFP': {
    score: 4,
    label: '相性良好',
    chemistry: '熱量が倍になる',
    atmosphere: '2人とも感情が豊かで空間が明るくなる。観る前からすでに盛り上がっている',
    afterTalk: '登場人物への感情移入と「もしこうだったら」の話が交互に続く',
    movieGenres: ['青春', 'ロードムービー', '夢と挑戦'],
    exampleMovies: ['ジョーカー', 'リトル・ミス・サンシャイン', 'ズートピア', 'ワンダー 君は太陽', 'ブルックリン'],
    decisionHook: '観た後に何かを始めたくなる映画。2人のエネルギーが重なる夜'
  },

  'ENFJ-INFJ': {
    score: 4,
    label: '相性良好',
    chemistry: '深い共感と理想の共有',
    atmosphere: 'どちらも静かに深く観る。でも感情は大きく動いている',
    afterTalk: '映画のテーマを人間社会の縮図として語り合う。抽象的な話になっても2人は迷子にならない',
    movieGenres: ['哲学的ドラマ', '道徳的葛藤', '人間の本質'],
    exampleMovies: ['ミスト', '存在の耐えられない軽さ', 'ブリュッセル1080', 'ツリー・オブ・ライフ', 'ハーモニー'],
    decisionHook: '観た後、人間であることについて語り合える映画'
  },

  'ENFJ-INFP': {
    score: 4,
    label: '相性良好',
    chemistry: '引き出し合う感情',
    atmosphere: 'ENFJがINFPの感性を引き出す。INFPが普段言えない感想を話せる',
    afterTalk: 'INFPが珍しく饒舌になる。ENFJが「そんな見方があったんだ」と驚く',
    movieGenres: ['人間ドラマ', 'アイデンティティの探求', '成長物語'],
    exampleMovies: ['グッド・ウィル・ハンティング', 'パターソン', 'ボーイズ・ドント・クライ', 'ワイルドライフ'],
    decisionHook: '普段話さないことを、映画を通じて話せる夜'
  },

  'ENFP-INFP': {
    score: 4,
    label: '相性良好',
    chemistry: '夢想家の共鳴',
    atmosphere: '現実を忘れて映画の世界に没入できる。感受性が高いので感情が増幅',
    afterTalk: 'キャラクターへの感情移入が深い。「自分があの立場だったら」の話が続く',
    movieGenres: ['ファンタジー', '青春', 'セルフディスカバリー'],
    exampleMovies: ['アメリ', 'はじまりのうた', 'her/世界でひとつの彼女', 'ソング・オブ・ザ・シー', 'ビッグ・フィッシュ'],
    decisionHook: '現実から少し離れたい夜。2人で別の世界に行ける'
  },

  'ENFP-ISFP': {
    score: 4,
    label: '相性良好',
    chemistry: '感性と直感が踊る',
    atmosphere: 'ISFPが映像美に没入し、ENFPがストーリーに熱狂する。違う楽しみ方が共存する',
    afterTalk: 'ISFPが「あのシーンの色使いが」と言い、ENFPが「でもあのセリフで全部変わった」と返す',
    movieGenres: ['アート映画', 'インディーズ', '音楽映画'],
    exampleMovies: ['グランド・ブダペスト・ホテル', 'ムーンライズ・キングダム', 'ビューティフル・ボーイ', 'ソウル', 'ミッドナイト・イン・パリ'],
    decisionHook: '見た目も物語も両方美しい映画。2人の「好き」がそれぞれ刺さる'
  },

  'ENFP-INTJ': {
    score: 4,
    label: '相性良好',
    chemistry: '夢と論理の刺激的衝突',
    atmosphere: 'ENFPの熱量とINTJの冷静さが不思議なバランスを生む',
    afterTalk: 'ENFPが感情的に興奮し、INTJが構造を静かに分析する。かみ合わないようで深まる',
    movieGenres: ['SF', '哲学', 'どんでん返し'],
    exampleMovies: ['エクス・マキナ', 'ブレードランナー', 'アライバル', 'コンタクト', 'ダーク'],
    decisionHook: '感情で観るか論理で観るか、答えが出ない映画'
  },

  'ENFP-ESFP': {
    score: 4,
    label: '相性良好',
    chemistry: 'テンションが爆発する',
    atmosphere: '観る前から盛り上がっている。笑いが多い上映になる',
    afterTalk: '映画の話よりそこから広がる雑談の方が長くなりがち',
    movieGenres: ['コメディ', 'ミュージカル', '痛快アクション'],
    exampleMovies: ['ブックスマート', 'ジュノ', 'スーパーバッド', 'タイタニック', 'ラ・ラ・ランド'],
    decisionHook: '笑って泣いて騒げる映画。今夜のエネルギーを全部使う'
  },

  'ENTJ-ENTP': {
    score: 4,
    label: '相性良好',
    chemistry: '支配者と討論者の頭脳戦',
    atmosphere: '観ながらすでに批評が始まっている。でもそれがお互い心地いい',
    afterTalk: '登場人物の戦略と判断を徹底的に分析する。映画がケーススタディになる',
    movieGenres: ['権力闘争', '政治スリラー', '企業ドラマ'],
    exampleMovies: ['ソーシャル・ネットワーク', 'スティーブ・ジョブズ', 'シカゴ7裁判', 'マネーショート', 'ウルフ・オブ・ウォールストリート'],
    decisionHook: 'あの人物の判断は正しかったか。2人の評決は必ず割れる'
  },

  'ENTJ-ESTJ': {
    score: 4,
    label: '相性良好',
    chemistry: '判断と批評の応酬',
    atmosphere: '主人公の決断を逐一評価している。「俺ならこうしない」が多発',
    afterTalk: '登場人物の能力・判断力・リーダーシップを採点し始める。映画が教材になる',
    movieGenres: ['政治・権力闘争', '企業ドラマ', '戦争・戦略'],
    exampleMovies: ['マネーボール', 'シビル・ウォー', 'リンカーン', 'ハドソン川の奇跡', 'ダーケスト・アワー'],
    decisionHook: 'あのキャラクターは正しかったか。2人の評決が一致することはない'
  },

  'ENTJ-ISTJ': {
    score: 4,
    label: '相性良好',
    chemistry: '秩序と実行力の共鳴',
    atmosphere: '2人とも静かに集中する。終わった後に冷静に議論できる',
    afterTalk: '事実関係の確認と判断の妥当性を検証する。感情論はほぼ出ない',
    movieGenres: ['歴史映画', '軍事・戦略', '実話ビジネス'],
    exampleMovies: ['ダンケルク', 'マスタング', 'フロスト/ニクソン', 'スポットライト', 'バイス'],
    decisionHook: '歴史の判断を2人で検証する。正解は出なくても議論が深い'
  },

  'ENTP-INFP': {
    score: 4,
    label: '相性良好',
    chemistry: '論理と感性の意外な融合',
    atmosphere: 'ENTPが議論を仕掛け、INFPが感情で返す。かみ合わないようで実は補い合っている',
    afterTalk: 'ENTPの「実はこれは〇〇の比喩」にINFPが「それは違う、私にはこう感じた」と返す',
    movieGenres: ['文学的映画', '実存主義', '詩的なSF'],
    exampleMovies: ['マリッジ・ストーリー', 'コールド・マウンテン', 'タル・ベーラの映画', 'ウィ・ニード・トゥ・トーク・アバウト・ケヴィン'],
    decisionHook: '感じるか考えるか、どちらが正しいか問い続ける映画'
  },

  'ENTP-INTP': {
    score: 4,
    label: '相性良好',
    chemistry: '理論の迷宮探索',
    atmosphere: '観ながら設定の論理矛盾を探している。でもそれが楽しい',
    afterTalk: '「あの設定は物理的にありえない」「でもこう解釈すれば成立する」の往復が続く',
    movieGenres: ['ハードSF', 'タイムパラドックス', '世界観構築が緻密な映画'],
    exampleMovies: ['プリマー', 'ロスト・ハイウェイ', 'バベル', 'キャビン', 'サニー 32歳'],
    decisionHook: '設定の整合性を2人で検証する。正解が出ないから面白い'
  },

  'ESFP-ESTP': {
    score: 4,
    label: '相性良好',
    chemistry: 'テンション直結型',
    atmosphere: 'リアクションが大きい。気づいたらポップコーンがなくなっている',
    afterTalk: '「やばかった」「あのシーン最高」の繰り返しだけど、それで完結している',
    movieGenres: ['アクション', 'コメディ', 'スポーツ'],
    exampleMovies: ['マッドマックス怒りのデスロード', 'ウルフ・オブ・ウォールストリート', 'バッドボーイズ', 'トップガン', 'キングスマン'],
    decisionHook: '難しいことは考えなくていい。今夜は純粋に盛り上がる'
  },

  'ISFJ-ESFJ': {
    score: 4,
    label: '相性良好',
    chemistry: '温かさが倍になる',
    atmosphere: '安心して感情を出せる。どちらも相手の気持ちを気にし合う優しい時間',
    afterTalk: '「あの場面は辛かったね」「でも最後よかった」という共感の応酬',
    movieGenres: ['ヒューマンドラマ', '家族映画', '実話の感動系'],
    exampleMovies: ['サウンド・オブ・ミュージック', 'フォレスト・ガンプ', '天使にラブ・ソングを', 'ワンダー 君は太陽', 'マイ・インターン'],
    decisionHook: '観た後に優しい気持ちになれる映画。今夜は心を温めたい'
  },

  'ISFJ-ISFP': {
    score: 4,
    label: '相性良好',
    chemistry: '静かな感性の共鳴',
    atmosphere: '2人ともそっと感情を動かしている。押しつけがなく居心地がいい',
    afterTalk: '「綺麗だった」「あの音楽が良かった」という感覚的な話が続く',
    movieGenres: ['映像美', '自然描写', '穏やかな物語'],
    exampleMovies: ['かもめ食堂', '山の郵便配達', 'めがね', 'ベルファスト', 'ノマドランド'],
    decisionHook: 'うるさくない映画。2人の静かな時間を豊かにする'
  },

  'INFJ-ENFJ': {
    score: 4,
    label: '相性良好',
    chemistry: '理想主義者の深い対話',
    atmosphere: 'ENFJがINFJを外の世界に引き出す。INFJがENFJに深みを与える',
    afterTalk: '映画のテーマを自分たちの価値観に照らし合わせて語り合う。結論より過程が豊か',
    movieGenres: ['社会派ドラマ', '人権・差別', '人間の尊厳'],
    exampleMovies: ['ショーシャンクの空に', 'ミルク', 'セルマ', 'スラムドッグ$ミリオネア', '最強のふたり'],
    decisionHook: '世界をどう変えるか、2人で語り合いたくなる映画'
  },

  'INFJ-INTP': {
    score: 4,
    label: '相性良好',
    chemistry: '直感と論理が静かに交差する',
    atmosphere: 'どちらも静かに観る。でも頭の中では全く違うことを考えている',
    afterTalk: 'INFJが「あの映画の本質は〇〇」と言い、INTPが「でも設定的には〇〇という解釈の方が整合する」と返す',
    movieGenres: ['叙述トリック', '哲学的ミステリー', '多層的な物語'],
    exampleMovies: ['シャッター・アイランド', 'ジェイコブス・ラダー', 'ドニー・ダーコ', 'コヒーレンス', '彼女が消えた浜辺'],
    decisionHook: '真実が1つではない映画。2人の読み解きが全く違う'
  },

  'INFJ-ISFP': {
    score: 3,
    label: '無難',
    chemistry: '感性の静かな共存',
    atmosphere: '言葉は少ないが空気が合う。お互いに邪魔しない',
    afterTalk: '感想は短いが深い。「よかった」の一言に含まれている感情が多い',
    movieGenres: ['映像美', '余韻のある映画', '静かな物語'],
    exampleMovies: ['グラン・トリノ', 'ネブラスカ ふたつの心をつなぐ旅', 'イントゥ・ザ・ワイルド', 'ストーリー・オブ・マイライフ'],
    decisionHook: '観た後、2人でしばらく黙っていたくなる映画'
  },

  'INFJ-ISFJ': {
    score: 3,
    label: '無難',
    chemistry: '穏やかな思いやりの共存',
    atmosphere: '安心感がある。どちらも相手への気遣いが自然',
    afterTalk: '感情的な話がメインになる。論理よりも「あのキャラが」が中心',
    movieGenres: ['ヒューマンドラマ', '家族', '感動系'],
    exampleMovies: ['八日目の蝉', '誰も知らない', 'そして父になる', '奇跡', 'ステップ'],
    decisionHook: '人の温かさを感じたい夜。静かに心が動く映画'
  },

  'INFJ-ISTJ': {
    score: 3,
    label: '無難',
    chemistry: '価値観の静かなすれ違い',
    atmosphere: 'ISTJが事実に集中し、INFJが意味を探す。平行線だが穏やか',
    afterTalk: 'ISTJが「あれは史実と違う」INFJが「でもテーマとして〇〇を描きたかったんだと思う」',
    movieGenres: ['歴史映画', '実話', '戦争'],
    exampleMovies: ['ハクソー・リッジ', '1917 命をかけた伝令', 'ミッドウェイ', 'イミテーション・ゲーム'],
    decisionHook: '事実と意味、どちらで観るかで全く違う映画になる'
  },

  'INFJ-ISTP': {
    score: 3,
    label: '無難',
    chemistry: '異なる集中の共存',
    atmosphere: 'ISTJが技術・アクションに集中し、INFJが心理に集中する。でも静かに共存できる',
    afterTalk: 'ISTJが「あのシーンの技術的なリアリティが」INFJが「主人公の動機が気になる」',
    movieGenres: ['アクションスリラー', 'クライムドラマ'],
    exampleMovies: ['ヒート', 'セブン', 'マンチェスター・バイ・ザ・シー', 'ノー・カントリー'],
    decisionHook: '2人が全く違うシーンに刺さる映画。感想の違いが面白い'
  },

  'INFP-INTJ': {
    score: 3,
    label: '無難',
    chemistry: '感性と論理の静かな摩擦',
    atmosphere: 'INFPが感情で受け取り、INTJが構造で分析する。違いが際立つ',
    afterTalk: 'INFPが「あのシーンで泣きそうになった」INTJが「その伏線は序盤にあった」と返す',
    movieGenres: ['感情と論理が両立する映画', '複雑なキャラクター描写'],
    exampleMovies: ['ビューティフル・マインド', 'レボリューショナリー・ロード', 'ワイルドライフ', 'ズーランダー'],
    decisionHook: '感情で観るか分析で観るか。どちらが正しいかは決まらない'
  },

  'INFP-INTP': {
    score: 3,
    label: '無難',
    chemistry: '内向きの2人が静かに共鳴',
    atmosphere: '2人とも集中して観る。映画中の会話はほぼない',
    afterTalk: 'INFPが感情を語り、INTPが設定の整合性を語る。かみ合わないが否定もしない',
    movieGenres: ['内省的な映画', '孤独をテーマにした作品'],
    exampleMovies: ['her/世界でひとつの彼女', 'エターナル・サンシャイン', 'リービング・ラスベガス', 'パターソン'],
    decisionHook: '1人で観てもいいけど、隣に誰かいた方がいい映画'
  },

  'INFP-ISTJ': {
    score: 2,
    label: '要注意',
    chemistry: '感性と現実のズレ',
    atmosphere: 'INFPが感情に流され、ISTJが事実確認をしている。空気が少しずれる',
    afterTalk: 'INFPの感想をISTJが「でも実際は〇〇だから」と修正しがち。INFPが萎縮することも',
    movieGenres: ['リアリズム映画', 'ドキュメンタリー'],
    exampleMovies: ['スポットライト', '記者たち 衝撃と畏怖の真実', 'ザ・プレイヤー'],
    decisionHook: '事実の重みを感じながら、感情でも受け取れる映画を選ぶこと'
  },

  'INFP-ISTP': {
    score: 2,
    label: '要注意',
    chemistry: '温度差が生まれやすい',
    atmosphere: 'INFPが感情的に揺れ、ISTPがクールに観ている。空気が合いにくい',
    afterTalk: 'INFPが「あのシーン辛かった」ISTJが「でも主人公の行動は合理的だった」。噛み合わない',
    movieGenres: ['テンポが速いアクション', '感情的な表現が少ない映画'],
    exampleMovies: ['ジョン・ウィック', 'ダイ・ハード', 'ミッション：インポッシブル'],
    decisionHook: '映画よりも映画の後の時間を大事にしたい夜'
  },

  'INFP-ESFJ': {
    score: 3,
    label: '無難',
    chemistry: '温かさの共有',
    atmosphere: 'ESFJがINFPを気遣ってくれる。INFPが安心して感情を出せる',
    afterTalk: 'ESFJが「どうだった？」と引き出してくれるのでINFPが珍しく話す',
    movieGenres: ['感動ドラマ', '家族映画'],
    exampleMovies: ['コーダ', 'ワンダー 君は太陽', 'フォレスト・ガンプ', '博士と彼女のセオリー'],
    decisionHook: '誰かに気遣ってもらいながら観たい映画。今夜はINFPが主役'
  },

  'INFP-ESFP': {
    score: 3,
    label: '無難',
    chemistry: '感性の温度差',
    atmosphere: 'ESFPが騒ぎ、INFPが没入する。お互いに気を使いながらも楽しめる',
    afterTalk: 'ESFPが「面白かった！」で終わろうとするとINFPが「でも実は〇〇が気になって」と続ける',
    movieGenres: ['コメディ寄りのドラマ', 'ライトな感動系'],
    exampleMovies: ['はちみつ色のユン', 'ブリジット・ジョーンズ', 'プラダを着た悪魔'],
    decisionHook: '重すぎず軽すぎない映画。2人がそれぞれに楽しめる'
  },

  'INFP-ENFP': {
    score: 4,
    label: '相性良好',
    chemistry: '夢想家の共鳴',
    atmosphere: '感受性が高いので感情が増幅。現実を忘れて没入できる',
    afterTalk: 'キャラクターへの感情移入が深い。「自分があの立場だったら」の話が続く',
    movieGenres: ['ファンタジー', '青春', 'セルフディスカバリー'],
    exampleMovies: ['アメリ', 'はじまりのうた', 'her/世界でひとつの彼女', 'ソング・オブ・ザ・シー', 'ビッグ・フィッシュ'],
    decisionHook: '現実から少し離れたい夜。2人で別の世界に行ける'
  },

  'INTJ-ISFJ': {
    score: 2,
    label: '要注意',
    chemistry: '論理と感情の摩擦',
    atmosphere: 'INTJが分析し、ISFJが感情で受け取る。お互いの感想が全く違う',
    afterTalk: 'ISFJが「悲しかった」INTJが「感情的すぎる脚本だった」と返す。ISFJが傷つくことも',
    movieGenres: ['感情に訴えすぎない映画', '知性的なドラマ'],
    exampleMovies: ['エクス・マキナ', 'ブレードランナー', 'A.I.'],
    decisionHook: '映画の選択が成功の鍵。ISFJが疲れない映画を優先して選ぶ'
  },

  'INTJ-ISTP': {
    score: 3,
    label: '無難',
    chemistry: '無口な知性の共存',
    atmosphere: '2人とも静かに集中する。映画中の会話はゼロに近い',
    afterTalk: 'INTJが構造を語り、ISTPが技術や仕掛けを語る。重ならないが補い合う',
    movieGenres: ['クライムスリラー', 'ハードSF', 'アクション'],
    exampleMovies: ['ヒート', 'プリズナーズ', 'ローグ・ワン', 'セブン', 'コラテラル'],
    decisionHook: '細部まで緻密な映画。2人で見落としを補い合う'
  },

  'INTJ-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序の同盟',
    atmosphere: '2人とも論理的に観る。感情的な反応は少ない',
    afterTalk: '映画の構成・脚本の完成度・キャラクターの合理性を評価し合う',
    movieGenres: ['政治ドラマ', 'リーダーシップ', '組織と個人'],
    exampleMovies: ['チャーチル', 'フロスト/ニクソン', 'キャロル', 'ゾディアック'],
    decisionHook: '完成度の高い映画を観て、静かに批評し合う夜'
  },

  'INTJ-ESFJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESFJが感情的に楽しみ、INTJが冷静に分析する。映画の見方が全く違う',
    afterTalk: 'ESFJが「感動した！」INTJが「設定に無理がある」と言ってしまう。ESFJが傷つく可能性',
    movieGenres: ['どちらにも刺さる中間地点を探すことが大事'],
    exampleMovies: ['グラン・トリノ', 'ショーシャンクの空に'],
    decisionHook: '映画選びに時間をかけること。それ自体が今夜の楽しみ'
  },

  'INTJ-ESTP': {
    score: 3,
    label: '無難',
    chemistry: '頭脳と直感の不思議な相性',
    atmosphere: 'INTJが全体を俯瞰し、ESTPが瞬間瞬間に反応する。スピードが違うが邪魔しない',
    afterTalk: 'ESTPが「あのシーンのアクション最高」INTJが「あの展開は序盤の〇〇の伏線だった」',
    movieGenres: ['スリラー', 'クライム', '心理戦'],
    exampleMovies: ['インセプション', 'カジノ', 'ゴーン・ガール', 'マイノリティ・レポート'],
    decisionHook: '頭と体で違う楽しみ方ができる映画。2人の感想が補い合う'
  },

  'INTP-ISFJ': {
    score: 2,
    label: '要注意',
    chemistry: '論理と感情の温度差',
    atmosphere: 'ISFJが感情的に楽しもうとするとINTPが設定の矛盾を言い始める',
    afterTalk: 'ISFJの感動にINTPが「でも〇〇は論理的におかしい」と水を差しがち',
    movieGenres: ['感情的すぎない映画', 'ロジックが明快なもの'],
    exampleMovies: ['ショーシャンクの空に', 'マイ・インターン'],
    decisionHook: 'ISFJが感動できる映画を優先する。INTPは分析を後回しにする夜'
  },

  'INTP-ISFP': {
    score: 3,
    label: '無難',
    chemistry: '静かな異世界の共存',
    atmosphere: 'ISFPが感性で受け取り、INTPが論理で分析する。お互いを邪魔しない',
    afterTalk: 'ISFPが「あの映像が好きだった」INTPが「でも設定の〇〇が」。かみ合わないが否定しない',
    movieGenres: ['ビジュアルと論理が両立する映画'],
    exampleMovies: ['2001年宇宙の旅', 'ブレードランナー2049', 'アライバル'],
    decisionHook: '映像で感じるか論理で考えるか。どちらの楽しみ方も正しい映画'
  },

  'INTP-ISTJ': {
    score: 3,
    label: '無難',
    chemistry: '静かな知性の共存',
    atmosphere: '2人とも静かに集中して観る。感情的な反応は少なく落ち着いている',
    afterTalk: 'ISTJが事実の正確さを、INTPが論理構造を確認し合う。感情の話はほぼない',
    movieGenres: ['ハードSF', '歴史映画', 'ドキュメンタリー'],
    exampleMovies: ['オッペンハイマー', 'ファースト・マン', 'アポロ13', 'スポットライト'],
    decisionHook: '事実と論理が緻密な映画。2人が違う視点で検証できる'
  },

  'INTP-ISTP': {
    score: 4,
    label: '相性良好',
    chemistry: '無口な分析者同士',
    atmosphere: '映画中は静寂。でも頭の中は別々の方向でフル回転している',
    afterTalk: 'INTPが理論で、ISTPが仕組みで映画を解析する。言葉は少ないが深い',
    movieGenres: ['メカニズムが緻密なSF', 'クライムスリラー', 'ハードボイルド'],
    exampleMovies: ['プリマー', 'ロボコップ', 'ウォーリー', 'ムーン', 'コア'],
    decisionHook: '仕組みを理解すると面白さが倍になる映画。2人で補い合う'
  },

  'INTP-ESFJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESFJが感情的に楽しもうとするとINTPが論理的な矛盾を指摘してしまう',
    afterTalk: 'ESFJが感動し、INTPが「でも〇〇は成立しない」と言う。ESFJが白ける',
    movieGenres: ['感情的に分かりやすい映画'],
    exampleMovies: ['グリーンブック', 'ライフ・イズ・ビューティフル'],
    decisionHook: 'INTPが「今夜は分析しない」と決めれば楽しい夜になる'
  },

  'INTP-ESFP': {
    score: 2,
    label: '要注意',
    chemistry: '観る目的が違いすぎる',
    atmosphere: 'ESFPが盛り上がり、INTPが設定を検証している。並行宇宙のような2人',
    afterTalk: 'ESFPが「超面白かった！」INTPが「あの部分の設定が気になって」。かみ合わない',
    movieGenres: ['テンポが速くて考える暇のない映画'],
    exampleMovies: ['スパイダーマン', 'アベンジャーズ'],
    decisionHook: 'INTPが今夜だけは設定検証をやめる映画。それだけで大丈夫'
  },

  'INTP-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '論理同士の静かな対話',
    atmosphere: '2人とも感情より論理で映画を観る。感情的なシーンには少し冷たい',
    afterTalk: 'ESTJが「あの判断は間違いだ」INTPが「でも〇〇という条件下では合理的かも」',
    movieGenres: ['法廷ドラマ', '組織と個人', 'ビジネス映画'],
    exampleMovies: ['12人の怒れる男', 'A Few Good Men', 'ニュースルーム'],
    decisionHook: '判断の妥当性を議論できる映画。2人の論理が食い合う'
  },

  'INTP-ESTP': {
    score: 3,
    label: '無難',
    chemistry: '頭脳と行動の組み合わせ',
    atmosphere: 'ESTPが反応し、INTPが分析する。テンポは違うが補い合える',
    afterTalk: 'ESTPが「あのアクションシーン」INTPが「実はあれは序盤の設定の応用で」',
    movieGenres: ['アクションと知性が両立する映画'],
    exampleMovies: ['ミッション：インポッシブル', 'キック・アス', 'アントマン'],
    decisionHook: '体で楽しんで頭でも楽しめる映画。2人の得意が活きる'
  },

  'ISFJ-ISTJ': {
    score: 3,
    label: '無難',
    chemistry: '安定した静けさ',
    atmosphere: '静かに集中して観る。お互いに邪魔しない安心感',
    afterTalk: '感想は控えめ。「よかったね」「うん」くらいだが、それが心地いい',
    movieGenres: ['歴史映画', '王道ドラマ', 'ヒューマンドキュメンタリー'],
    exampleMovies: ['ダンケルク', 'シンドラーのリスト', 'マイ・インターン', 'ショーシャンクの空に'],
    decisionHook: '静かに、確実に良い映画を観たい夜'
  },

  'ISFJ-ISTP': {
    score: 3,
    label: '無難',
    chemistry: '静かな共存',
    atmosphere: 'ISFJが感情を抑えてISTPに合わせようとする。ISTPはあまり気にしない',
    afterTalk: 'ISFJが感想を言いにくい雰囲気になることも。映画を選ぶことが大事',
    movieGenres: ['アクション寄りのドラマ', 'テンポが良いもの'],
    exampleMovies: ['ボーン・アイデンティティ', 'エスケープ・ルーム', 'ブレイキング・バッド'],
    decisionHook: 'ISFJが安心して感情を出せる映画を選べば、意外と良い夜になる'
  },

  'ISFJ-ESFP': {
    score: 3,
    label: '無難',
    chemistry: '温かさと賑やかさのバランス',
    atmosphere: 'ESFPが盛り上げ、ISFJが安心してついていく。嫌いじゃない組み合わせ',
    afterTalk: 'ESFPが「最高だった！」ISFJが「そうだね〜」で終わることが多い',
    movieGenres: ['コメディ', 'ハッピーエンドのドラマ'],
    exampleMovies: ['プリティ・ウーマン', 'ノッティングヒルの恋人', 'ブリジット・ジョーンズ'],
    decisionHook: '後味が確実に良い映画。ESFJが暴走しなければ楽しい夜'
  },

  'ISFJ-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序と安定の組み合わせ',
    atmosphere: 'ESTJが映画を選ぶ。ISFJはそれに従う。トラブルなく観られる',
    afterTalk: 'ESTJが批評し、ISFJが共感する。一方通行になりがち',
    movieGenres: ['明確なストーリーの映画', '感情的に明解なもの'],
    exampleMovies: ['フォレスト・ガンプ', 'タイタニック', '最高の人生の見つけ方'],
    decisionHook: 'ESTJがISFJの好みを尊重する映画を選べば完璧な夜になる'
  },

  'ISFJ-ESTP': {
    score: 2,
    label: '要注意',
    chemistry: '温度差が生まれやすい',
    atmosphere: 'ESTPがリアクションし、ISFJが少し引いている。ESTPがうるさく感じることも',
    afterTalk: 'ESTPが「最高だった！」ISFJが内心「もう少し静かに観たかった」と思っている',
    movieGenres: ['ISFJが安心できる範囲の映画'],
    exampleMovies: ['スパイダーマン', 'ジュラシック・パーク'],
    decisionHook: 'ESTPがISFJのペースに合わせる覚悟をした夜だけうまくいく'
  },

  'ISFP-ISTJ': {
    score: 2,
    label: '要注意',
    chemistry: '感性と事実のずれ',
    atmosphere: 'ISFPが感性で観て、ISTJが事実確認をしている。平行線になりがち',
    afterTalk: 'ISFPが「映像が美しかった」ISTJが「でも史実とは違う部分がある」',
    movieGenres: ['映像美と史実が両立する映画'],
    exampleMovies: ['1917 命をかけた伝令', 'ダンケルク'],
    decisionHook: '映像に集中できる映画を選べば、会話しなくても満足できる夜'
  },

  'ISFP-ESFJ': {
    score: 3,
    label: '無難',
    chemistry: '感性と共感の共存',
    atmosphere: 'ESFJがISFPを気遣い、ISFPが自分のペースで感じる。圧力がない',
    afterTalk: 'ESFJが「どうだった？」と聞いてくれるのでISFPが少し話す',
    movieGenres: ['感動系', '人間ドラマ', '自然描写が美しいもの'],
    exampleMovies: ['リトル・フォレスト', 'ノマドランド', 'かもめ食堂'],
    decisionHook: 'ESFJが話しかけすぎなければ、ISFPが一番くつろげるペア'
  },

  'ISFP-ESFP': {
    score: 3,
    label: '無難',
    chemistry: '感性の温度差',
    atmosphere: 'ESFPが騒ぎ、ISFPが少し引いている。でも嫌いじゃない',
    afterTalk: 'ESFPが感想を大声で言い、ISFPが小さく頷く。内心は深く感じている',
    movieGenres: ['コメディと美しさが共存する映画'],
    exampleMovies: ['グランド・ブダペスト・ホテル', 'ラ・ラ・ランド', 'ムーンライズ・キングダム'],
    decisionHook: 'ESFPが少し静かにできれば、ISFPが最も美しく感じる夜になる'
  },

  'ISFP-ENTP': {
    score: 3,
    label: '無難',
    chemistry: '感性と論理のぶつかり合い',
    atmosphere: 'ENTPが分析を仕掛け、ISFPが感性で返す。かみ合わないようで実は面白い',
    afterTalk: 'ENTPが「実はこれは〇〇の比喩」ISFPが「私にはただ美しく感じた」',
    movieGenres: ['解釈が多様な映画', '美しい映像の哲学映画'],
    exampleMovies: ['ツリー・オブ・ライフ', 'ファウンテン', '燃ゆる女の肖像'],
    decisionHook: '分析しなくても感じるだけで満足できる映画。ENTPも今夜は感性を使う'
  },

  'ISFP-ESTJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESTJが結末と判断を重視し、ISFPが感性と映像を重視する。別の映画を観ている感覚',
    afterTalk: 'ESTJが「あの選択は間違いだ」ISFPが「でも美しかった」。かみ合わない',
    movieGenres: ['ESTJが選んだ映画にISFPが付き合う場合が多い'],
    exampleMovies: ['フォレスト・ガンプ', 'ショーシャンクの空に'],
    decisionHook: '映画よりも一緒にいる時間に意味がある夜。映画は何でもいい'
  },

  'ISTJ-ISTP': {
    score: 3,
    label: '無難',
    chemistry: '無口な職人同士',
    atmosphere: '2人とも集中して静かに観る。映画中の会話はゼロ',
    afterTalk: '感想は短くて具体的。「あのシーンのリアリティが高かった」くらい',
    movieGenres: ['リアリズム', '職人技が光る映画', '緻密なクライム'],
    exampleMovies: ['ヒート', 'シシリアン', 'アメリカン・ギャングスター', 'ゾディアック'],
    decisionHook: '細部のリアリティを2人で確認し合う。それが今夜の楽しさ'
  },

  'ISTJ-ESFJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序と温かさの共存',
    atmosphere: 'ESFJが雰囲気を作り、ISTJが静かに従う。悪くない組み合わせ',
    afterTalk: 'ESFJが感動し、ISTJが「確かに良い映画だった」と短く認める',
    movieGenres: ['感動系', '家族映画', '実話'],
    exampleMovies: ['フォレスト・ガンプ', 'タイタニック', 'コーダ'],
    decisionHook: 'ESFJが選んだ映画にISTJが乗る夜。それで意外と良い時間になる'
  },

  'ISTJ-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序者同士の共鳴',
    atmosphere: '2人とも論理的に静かに観る。感情的な乱れはほぼない',
    afterTalk: '映画の構成・整合性・キャラクターの判断を客観的に評価し合う',
    movieGenres: ['歴史映画', '政治ドラマ', '実話ビジネス'],
    exampleMovies: ['リンカーン', 'スポットライト', 'マネーボール', 'ダーケスト・アワー'],
    decisionHook: '完成度の高い映画を静かに鑑賞し、冷静に批評し合う夜'
  },

  'ISTJ-ESTP': {
    score: 2,
    label: '要注意',
    chemistry: '秩序とカオスの摩擦',
    atmosphere: 'ESTPが騒ぎ、ISTJが集中できなくなる。映画選びが鍵',
    afterTalk: 'ESTPが「やばかった！」ISTJが「うん…でも史実と違う部分が」',
    movieGenres: ['テンポが速くてESTPが静かにできる映画'],
    exampleMovies: ['ボーン・アイデンティティ', 'ジャック・リーチャー'],
    decisionHook: 'ESTPが静かに観る覚悟をした映画だけ成功する'
  },

  'ISTP-ISFJ': {
    score: 2,
    label: '要注意',
    chemistry: '温度差が埋まりにくい',
    atmosphere: 'ISFJが感情的に観て、ISTPがクールに分析する。雰囲気が合いにくい',
    afterTalk: 'ISFJが「かわいそうだった」ISTPが「でも主人公の行動は効率的だった」',
    movieGenres: ['ISFJが重すぎない映画'],
    exampleMovies: ['プリティ・ウーマン', 'ノッティングヒルの恋人'],
    decisionHook: 'ISFJが選んだ映画にISTPが合わせる。その心遣いが今夜の鍵'
  },

  'ISTP-ISFP': {
    score: 3,
    label: '無難',
    chemistry: '静かな個人主義の共存',
    atmosphere: '2人とも静かに自分の世界で観る。お互いに邪魔しない',
    afterTalk: 'ISTPが技術・仕組み、ISFPが映像・感情を語る。重ならないが否定しない',
    movieGenres: ['映像と技術が両立する映画'],
    exampleMovies: ['マッドマックス怒りのデスロード', 'ブレードランナー2049', 'レオン'],
    decisionHook: '映像でも仕組みでも楽しめる映画。2人の得意が活きる'
  },

  'ISTP-INTP': {
    score: 4,
    label: '相性良好',
    chemistry: '無口な分析者同士',
    atmosphere: '映画中は静寂。頭の中でそれぞれが緻密に分析している',
    afterTalk: 'INTPが理論で、ISTPが仕組みで映画を解析する。言葉は少ないが深い',
    movieGenres: ['メカニズムが緻密なSF', 'クライムスリラー'],
    exampleMovies: ['プリマー', 'ムーン', 'ゼロ・グラビティ', 'エクス・マキナ'],
    decisionHook: '仕組みを理解するほど面白くなる映画。2人で補い合う'
  },

  'ISTP-ENTJ': {
    score: 3,
    label: '無難',
    chemistry: '実行力の共鳴',
    atmosphere: 'ENTJが全体戦略を、ISTPが技術的詳細を観る。視点が違うが補い合う',
    afterTalk: 'ENTJが「あのリーダーシップは」ISTPが「でもあの仕掛けの方が面白かった」',
    movieGenres: ['戦略とアクションが共存する映画'],
    exampleMovies: ['オーシャンズ11', 'ミッション：インポッシブル', 'アルゴ'],
    decisionHook: '頭と体の両方が活きる映画。2人の視点が補い合う夜'
  },

  'ISTP-ENTP': {
    score: 3,
    label: '無難',
    chemistry: '実践と理論の交差',
    atmosphere: 'ENTPが哲学的解釈を展開し、ISTPが「でも実際の仕組みとして」と返す',
    afterTalk: '表面上はかみ合わないが、お互いに刺激を受けている',
    movieGenres: ['技術と哲学が共存するSF', 'クライムスリラー'],
    exampleMovies: ['エクス・マキナ', 'プリマー', 'コヒーレンス'],
    decisionHook: '理屈と仕組み、どちらで観ても面白い映画'
  },

  'ISTP-ESFJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESFJが感情を盛り上げ、ISTPがクールに観ている。空気が合いにくい',
    afterTalk: 'ESFJが「感動した！」ISTPが「まあ、悪くなかった」で終わる',
    movieGenres: ['どちらも楽しめる中間地点'],
    exampleMovies: ['グランド・ブダペスト・ホテル', 'ジュラシック・パーク'],
    decisionHook: 'お互いに歩み寄る映画を選ぶこと。その選択過程が今夜の楽しさ'
  },

  'ISTP-ESFP': {
    score: 3,
    label: '無難',
    chemistry: '行動派の共鳴',
    atmosphere: 'ESFPが盛り上がり、ISTPが静かに楽しむ。ESFPが少し引っ張る形',
    afterTalk: 'ESFPが「最高！」ISTPが「まあな」。短いが満足している',
    movieGenres: ['アクション', 'スポーツ映画', 'アドベンチャー'],
    exampleMovies: ['マッドマックス', 'トップガン', 'クリード'],
    decisionHook: 'とにかくスカッとする映画。難しいことは考えない夜'
  },

  'ISTP-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '実用主義の共鳴',
    atmosphere: '2人とも論理的に観る。感情的なシーンには少し距離を置く',
    afterTalk: 'ESTJが全体評価し、ISTPが技術的な詳細を補足する',
    movieGenres: ['リアリズム', '実話', 'アクション'],
    exampleMovies: ['ハドソン川の奇跡', 'フライト', 'キャスト・アウェイ'],
    decisionHook: 'リアリティが高くスカッとする映画。2人の実用主義が一致する夜'
  },

  'ISTP-ESTP': {
    score: 4,
    label: '相性良好',
    chemistry: '行動力の共鳴',
    atmosphere: '2人ともリアクションが体で出る。スピード感のある映画が最高',
    afterTalk: '感想はシンプルだが熱い。「あのシーン」「わかる」で十分通じ合う',
    movieGenres: ['アクション', 'スポーツ', 'サバイバル'],
    exampleMovies: ['マッドマックス怒りのデスロード', 'ジョン・ウィック', 'クリード', 'バーニング'],
    decisionHook: '体が熱くなる映画。観た後に走りたくなるやつ'
  },

  'ESFJ-ESFP': {
    score: 4,
    label: '相性良好',
    chemistry: '社交性と楽しさが全開',
    atmosphere: '観る前から盛り上がっている。笑いと感動が交互に来る映画が最高',
    afterTalk: '「最高だった！」「あのシーン！」の応酬。会話のテンポが速い',
    movieGenres: ['コメディ', 'ロマンス', '家族映画'],
    exampleMovies: ['プリティ・ウーマン', 'ノッティングヒルの恋人', 'ブリジット・ジョーンズ', 'マダム・イン・ニューヨーク'],
    decisionHook: '笑って泣いてハッピーになれる映画。今夜は最高の夜にする'
  },

  'ESFJ-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序と温かさの共存',
    atmosphere: 'ESTJが判断し、ESFJが感情で補足する。分担が自然',
    afterTalk: 'ESTJが批評し、ESFJが「でも感動したじゃない」と和らげる',
    movieGenres: ['ハッピーエンドの明確なドラマ', '実話感動系'],
    exampleMovies: ['フォレスト・ガンプ', 'コーダ', 'グリーンブック'],
    decisionHook: '後味が良くて明確なメッセージのある映画。2人の価値観が一致する'
  },

  'ESFJ-ESTP': {
    score: 3,
    label: '無難',
    chemistry: '社交性の共鳴',
    atmosphere: 'どちらも外向きでエネルギーが高い。映画の前後が楽しい',
    afterTalk: 'ESTPが感想を言い、ESFJが共感する。会話のテンポが合う',
    movieGenres: ['エンタメ系', 'アクションコメディ'],
    exampleMovies: ['バッドボーイズ', 'キングスマン', 'オーシャンズ11'],
    decisionHook: '映画をきっかけに盛り上がる夜。映画よりも雰囲気が大事'
  },

  'ESFJ-INTJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESFJが感情的に楽しもうとするとINTJが冷静に分析し始める',
    afterTalk: 'ESFJが感動し、INTJが「設定に無理がある」と言ってしまう',
    movieGenres: ['INTJが感情的に否定しにくい映画'],
    exampleMovies: ['グラン・トリノ', 'ショーシャンクの空に'],
    decisionHook: 'INTJが今夜だけは分析を控える覚悟。それが2人の夜を救う'
  },

  'ESFJ-INTP': {
    score: 2,
    label: '要注意',
    chemistry: '感情と論理の根本的な違い',
    atmosphere: 'ESFJが感情的に楽しもうとするとINTPが論理的な矛盾を指摘し始める',
    afterTalk: 'ESFJが感動し、INTPが「でも〇〇は成立しない」と水を差す',
    movieGenres: ['感情的に分かりやすい映画'],
    exampleMovies: ['グリーンブック', 'ライフ・イズ・ビューティフル'],
    decisionHook: 'INTPが今夜は分析しないと決めれば楽しい夜になる'
  },

  'ESFJ-ENFP': {
    score: 3,
    label: '無難',
    chemistry: '感情と想像力の共鳴',
    atmosphere: 'ENFPが話を広げ、ESFJが感情的に共鳴する。テンポが合う',
    afterTalk: '「もしこうだったら？」にESFJが「そうなったら〇〇が悲しいね」と続ける',
    movieGenres: ['感動系コメディ', 'ハートウォーミング'],
    exampleMovies: ['ズートピア', 'インサイド・ヘッド', 'ソウル'],
    decisionHook: '感情で楽しんで想像も広がる映画。2人の長所が活きる夜'
  },

  'ESFJ-ENTP': {
    score: 2,
    label: '要注意',
    chemistry: '感情と議論のすれ違い',
    atmosphere: 'ESFJが感情的に楽しもうとするとENTPが逆張り解釈を始める',
    afterTalk: 'ESFJが感動し、ENTPが「実はこの映画は〇〇への批判では？」と話をひっくり返す',
    movieGenres: ['ESFJが感情的に否定されにくい映画'],
    exampleMovies: ['グリーンブック', '最強のふたり'],
    decisionHook: 'ENTPが今夜だけは逆張りをしない映画を一緒に選ぶ過程が大事'
  },

  'ESFJ-ISFJ': {
    score: 4,
    label: '相性良好',
    chemistry: '温かさが倍になる',
    atmosphere: '安心して感情を出せる。どちらも相手の気持ちを気にし合う優しい時間',
    afterTalk: '「あの場面は辛かったね」「でも最後よかった」という共感の応酬',
    movieGenres: ['ヒューマンドラマ', '家族映画', '実話の感動系'],
    exampleMovies: ['サウンド・オブ・ミュージック', 'フォレスト・ガンプ', '天使にラブ・ソングを', 'コーダ'],
    decisionHook: '泣きたい夜に。感情をフル開放できる相手がいる'
  },

  'ESFP-ISFJ': {
    score: 3,
    label: '無難',
    chemistry: '温かさと賑やかさのバランス',
    atmosphere: 'ESFPが盛り上げ、ISFJが安心してついていく',
    afterTalk: 'ESFPが「最高だった！」ISFJが「そうだね〜」で終わることが多い',
    movieGenres: ['コメディ', 'ハッピーエンドのドラマ'],
    exampleMovies: ['プリティ・ウーマン', 'ノッティングヒルの恋人'],
    decisionHook: '後味が確実に良い映画。ESFPが暴走しなければ楽しい夜'
  },

  'ESFP-INTJ': {
    score: 2,
    label: '要注意',
    chemistry: '価値観の根本的な違い',
    atmosphere: 'ESFPが盛り上がろうとするとINTJが冷静に分析し始める',
    afterTalk: 'ESFPが「最高だった！」INTJが「設定に無理がある」。ESFPがしらける',
    movieGenres: ['ESFPが騒ぎすぎずINTJが分析しすぎない映画'],
    exampleMovies: ['グランド・ブダペスト・ホテル', 'ジュラシック・パーク'],
    decisionHook: 'どちらも少し歩み寄る映画。その選択過程を楽しむ夜'
  },

  'ESFP-INFJ': {
    score: 1,
    label: '難易度高',
    chemistry: '正反対すぎる感受性',
    atmosphere: 'ESFPの騒がしさがINFJの没入を妨げる。INFJが消耗しやすい',
    afterTalk: 'ESFPが「楽しかった！」INFJが「少し賑やかすぎた」と思っている',
    movieGenres: ['静かで美しい映像作品はNG', 'ESFPが自然に静かになれる映画'],
    exampleMovies: ['アバター', 'ジュラシック・ワールド'],
    decisionHook: 'ESFPが今夜だけは静かに観る。INFJにとって最高の贈り物になる'
  },

  'ESFP-ENTP': {
    score: 3,
    label: '無難',
    chemistry: '外向きのエネルギーの共鳴',
    atmosphere: '2人ともエネルギーが高く、映画の前後が賑やか',
    afterTalk: 'ESFPが感情で楽しみ、ENTPが解釈を展開する。かみ合わないが否定しない',
    movieGenres: ['エンタメ系', '会話が弾む映画'],
    exampleMovies: ['オーシャンズ11', 'バードマン', 'ジュノ'],
    decisionHook: '観た後も話が続く映画。今夜は映画が会話のきっかけ'
  },

  'ESFP-ISFP': {
    score: 3,
    label: '無難',
    chemistry: '感性の温度差',
    atmosphere: 'ESFPが騒ぎ、ISFPが少し引いている。でも嫌いじゃない',
    afterTalk: 'ESFPが感想を大声で言い、ISFPが小さく頷く',
    movieGenres: ['コメディと美しさが共存する映画'],
    exampleMovies: ['グランド・ブダペスト・ホテル', 'ラ・ラ・ランド'],
    decisionHook: 'ESFPが少し静かにできれば、ISFPが最も美しく感じる夜になる'
  },

  'ESFP-ISTJ': {
    score: 2,
    label: '要注意',
    chemistry: '賑やかさと静粛さの摩擦',
    atmosphere: 'ESFPが騒ぎ、ISTJが集中できなくなる',
    afterTalk: 'ESFPが「最高だった！」ISTJが「うん…でも史実と違う部分が」',
    movieGenres: ['テンポが速くてESFPが静かにできる映画'],
    exampleMovies: ['ボーン・アイデンティティ', 'ジャック・リーチャー'],
    decisionHook: 'ESFPが静かに観る覚悟をした映画だけ成功する'
  },

  'ESFP-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '外向きの共鳴',
    atmosphere: 'どちらも外向きでエネルギーが高い。映画の前後が楽しい',
    afterTalk: 'ESFPが感想を言い、ESTJが評価する。テンポが合う',
    movieGenres: ['エンタメ系', 'アクションコメディ'],
    exampleMovies: ['バッドボーイズ', 'キングスマン', 'オーシャンズ11'],
    decisionHook: '映画をきっかけに盛り上がる夜。映画よりも雰囲気が大事'
  },

  'ESTJ-ISTJ': {
    score: 3,
    label: '無難',
    chemistry: '秩序者同士の共鳴',
    atmosphere: '2人とも論理的に静かに観る',
    afterTalk: '映画の構成・整合性を客観的に評価し合う',
    movieGenres: ['歴史映画', '政治ドラマ'],
    exampleMovies: ['リンカーン', 'スポットライト', 'マネーボール'],
    decisionHook: '完成度の高い映画を静かに鑑賞し、冷静に批評し合う夜'
  },

  'ESTJ-ISFP': {
    score: 2,
    label: '要注意',
    chemistry: '価値観のずれ',
    atmosphere: 'ESTJが結末重視、ISFPが感性重視。別の映画を観ている感覚',
    afterTalk: 'ESTJが「あの選択は間違いだ」ISFPが「でも美しかった」',
    movieGenres: ['どちらも納得できる映画を慎重に選ぶこと'],
    exampleMovies: ['ショーシャンクの空に', 'フォレスト・ガンプ'],
    decisionHook: '映画より一緒にいることに意味がある夜。映画は何でもいい'
  },

  'ESTJ-INTP': {
    score: 3,
    label: '無難',
    chemistry: '論理同士の静かな対話',
    atmosphere: '2人とも感情より論理で映画を観る',
    afterTalk: 'ESTJが「あの判断は間違いだ」INTPが「でも〇〇という条件下では合理的かも」',
    movieGenres: ['法廷ドラマ', '組織と個人'],
    exampleMovies: ['12人の怒れる男', 'ニュースルーム', 'A Few Good Men'],
    decisionHook: '判断の妥当性を議論できる映画。2人の論理が食い合う'
  },

  'ESTJ-INFJ': {
    score: 2,
    label: '要注意',
    chemistry: '現実と理想のぶつかり合い',
    atmosphere: 'ESTJが現実的に観て、INFJが意味を探す。かみ合いにくい',
    afterTalk: 'ESTJが「あの判断は非効率だ」INFJが「でもテーマとして〇〇を描いている」',
    movieGenres: ['どちらも納得できる社会派映画'],
    exampleMovies: ['スポットライト', 'スラムドッグ$ミリオネア'],
    decisionHook: '事実と意味が両立する映画を選べば、それぞれが深く楽しめる'
  },

  'ESTJ-ENFP': {
    score: 2,
    label: '要注意',
    chemistry: '秩序と自由のぶつかり合い',
    atmosphere: 'ENFPの妄想が広がり、ESTJが現実に引き戻す。テンポが合いにくい',
    afterTalk: 'ENFPが「もしこうだったら？」ESTJが「実際はこうだから関係ない」と返す',
    movieGenres: ['ENFPの発想をESTJも受け入れられる映画'],
    exampleMovies: ['インターステラー', 'コンタクト'],
    decisionHook: 'ENFPが自由に解釈して、ESTJが面白がれる映画を探す過程が今夜の楽しさ'
  },

  'ESTJ-INFP': {
    score: 2,
    label: '要注意',
    chemistry: '現実と感性の根本的なズレ',
    atmosphere: 'INFPが感性で観て、ESTJが判断を下す。空気が合いにくい',
    afterTalk: 'INFPが感情を語ると、ESTJが「でも実際は〇〇」と修正し始める',
    movieGenres: ['ESTJが感情を否定しにくい映画'],
    exampleMovies: ['ショーシャンクの空に', 'フォレスト・ガンプ'],
    decisionHook: 'ESTJが今夜だけは判断を控える。それだけでINFPが心を開く'
  },

  'ESTJ-ESTP': {
    score: 3,
    label: '無難',
    chemistry: '行動力の共鳴',
    atmosphere: 'どちらも外向きで判断が速い。映画の前後が賑やか',
    afterTalk: 'ESTJが全体評価し、ESTPが細かいシーンを振り返る',
    movieGenres: ['アクション', 'スポーツ', 'ビジネス映画'],
    exampleMovies: ['マネーボール', 'ウルフ・オブ・ウォールストリート', 'フューリー'],
    decisionHook: '勝負・逆転・判断が光る映画。2人の熱量が一致する夜'
  },

  'ENFJ-ISTJ': {
    score: 3,
    label: '無難',
    chemistry: '理想と現実の補完',
    atmosphere: 'ENFJが感情的に引っ張り、ISTJが事実で補足する。バランスが生まれる',
    afterTalk: 'ENFJが「あのキャラの選択に感動した」ISTJが「歴史的背景を考えると〇〇」',
    movieGenres: ['歴史×人間ドラマ', '実話感動系'],
    exampleMovies: ['セルマ', 'スポットライト', 'ダンケルク'],
    decisionHook: '事実の重みと人間の感情が両立する映画。2人の視点が補い合う'
  },

  'ENFJ-ISTP': {
    score: 2,
    label: '要注意',
    chemistry: '感情と無関心のぶつかり合い',
    atmosphere: 'ENFJが感情的に引きこもうとするが、ISTPが反応しない',
    afterTalk: 'ENFJが「あのシーン、感動しなかった？」ISTPが「まあ、よかった」',
    movieGenres: ['ISTPが自然に反応できる映画'],
    exampleMovies: ['ヒート', 'ボーン・アイデンティティ'],
    decisionHook: 'ENFJが押しつけない映画を選べば、ISTPが珍しく感想を言う夜になる'
  },

  'ENFJ-ISFP': {
    score: 4,
    label: '相性良好',
    chemistry: '感情の引き出し合い',
    atmosphere: 'ENFJがISFPの感性を丁寧に引き出す。ISFPが普段より話す',
    afterTalk: 'ISFPが「あの映像が」と言い始め、ENFJが「それって〇〇を感じた？」と深める',
    movieGenres: ['映像美×感情', '詩的なドラマ'],
    exampleMovies: ['燃ゆる女の肖像', 'ムーンライト', 'かもめ食堂', 'ノマドランド'],
    decisionHook: 'ISFPが普段言えない感想を話せる夜。ENFJがその言葉を引き出す'
  },

  'ENFJ-ESFP': {
    score: 4,
    label: '相性良好',
    chemistry: '感情の爆発',
    atmosphere: '2人ともエネルギーが高く、感情が増幅する。映画前から盛り上がっている',
    afterTalk: '感想が止まらない。会話のテンポが速くて楽しい',
    movieGenres: ['感動系エンタメ', 'ミュージカル', 'コメディ'],
    exampleMovies: ['ラ・ラ・ランド', 'グレイテスト・ショーマン', 'アリー/スター誕生'],
    decisionHook: '感情を全開にできる映画。今夜はこの2人が一番楽しい'
  },

  'ENFJ-ENTJ': {
    score: 4,
    label: '相性良好',
    chemistry: 'リーダー同士の建設的な議論',
    atmosphere: 'どちらもパワフルで映画への反応が大きい。お互いに刺激し合う',
    afterTalk: 'ENFJがキャラクターへの共感を語り、ENTJが戦略的判断を評価する。補い合う',
    movieGenres: ['リーダーシップ', '社会変革', '権力と倫理'],
    exampleMovies: ['セルマ', 'リンカーン', 'シカゴ7裁判', 'ミルク'],
    decisionHook: '世界を変えようとした人間の映画。2人の熱量が最も重なる'
  },

  'ENFJ-ESTJ': {
    score: 3,
    label: '無難',
    chemistry: '感情と判断の補完',
    atmosphere: 'ENFJが感情的に盛り上げ、ESTJが冷静に評価する',
    afterTalk: 'ENFJが「感動した！」ESTJが「でも判断としては〇〇だった」。共存できる',
    movieGenres: ['社会派ドラマ', '実話'],
    exampleMovies: ['グリーンブック', 'スポットライト', 'ブラックハット'],
    decisionHook: '感情と論理が両立する映画。2人の見方が補い合う'
  },

  'ENFJ-ENTP': {
    score: 4,
    label: '相性良好',
    chemistry: '理想と挑発の化学反応',
    atmosphere: 'ENFJが感情的に語り、ENTPが逆張りで議論を仕掛ける。白熱する',
    afterTalk: 'ENFJが「あのキャラは正しかった」ENTPが「実は間違ってて、だからこそ面白い」',
    movieGenres: ['道徳的ジレンマ', '社会批評', '複雑なキャラクター'],
    exampleMovies: ['ジョーカー', '教育', 'ハンナ・アーレント', 'シリアスマン'],
    decisionHook: '正しいか間違いかを議論したくなる映画。ENFJの感情とENTPの論理が戦う'
  },

  'ENFP-ENTJ': {
    score: 4,
    label: '相性良好',
    chemistry: '夢と実行力の火花',
    atmosphere: 'ENFPが可能性を語り、ENTJが実現方法を考える。お互いに刺激し合う',
    afterTalk: 'ENFPが「あの映画みたいにできたら最高」ENTJが「実際にやるとしたら〇〇だ」',
    movieGenres: ['夢と挑戦', '社会変革', 'イノベーション'],
    exampleMovies: ['ソーシャル・ネットワーク', 'スティーブ・ジョブズ', 'ドリーム', 'ビッグ・アイズ'],
    decisionHook: '観た後に何かを変えたくなる映画。今夜の2人が一番エネルギッシュ'
  },

  'ENFP-ISFJ': {
    score: 3,
    label: '無難',
    chemistry: '夢と安定の補完',
    atmosphere: 'ENFPが引っ張り、ISFJが安心してついていく',
    afterTalk: 'ENFPが「もしこうだったら？」ISFJが「そうなったら〇〇が大変だね」と共感する',
    movieGenres: ['ハートウォーミング', '夢と現実のバランスが良い映画'],
    exampleMovies: ['ズートピア', 'インサイド・ヘッド', 'ソウル', 'ベイマックス'],
    decisionHook: '夢があって温かい映画。ENFPが選んでISFJが安心できる夜'
  },

  'ENFP-ISTJ': {
    score: 2,
    label: '要注意',
    chemistry: '自由と秩序の衝突',
    atmosphere: 'ENFPが妄想を広げ、ISTJが現実に引き戻す。テンポが合いにくい',
    afterTalk: 'ENFPが「もしこうだったら？」ISTJが「実際には〇〇だから」と毎回返す',
    movieGenres: ['ISTJも受け入れられる現実ベースの映画'],
    exampleMovies: ['インターステラー', 'コンタクト', 'オデッセイ'],
    decisionHook: 'ENFPが現実ベースの映画に興味を持てるかが鍵。ISTJの世界を少し覗く夜'
  },

  'ENFP-ISTP': {
    score: 2,
    label: '要注意',
    chemistry: '妄想と実践のすれ違い',
    atmosphere: 'ENFPが解釈を広げ、ISTPがそれに乗ってこない。空気が合いにくい',
    afterTalk: 'ENFPが「もしこうだったら？」ISTPが「別に、映画として面白かった」で終わる',
    movieGenres: ['ISTPが自然に反応できる映画'],
    exampleMovies: ['マッドマックス', 'ジョン・ウィック'],
    decisionHook: 'ISTPの好みに合わせる夜。ENFPが新しいジャンルを発見する機会'
  },

  'ENFP-ESTJ': {
    score: 2,
    label: '要注意',
    chemistry: '自由と秩序の衝突',
    atmosphere: 'ENFPの妄想が広がり、ESTJが現実に引き戻す',
    afterTalk: 'ENFPが「もしこうだったら？」ESTJが「実際はこうだから関係ない」',
    movieGenres: ['ENFPの発想をESTJも受け入れられる映画'],
    exampleMovies: ['インターステラー', 'コンタクト'],
    decisionHook: 'ENFPが自由に解釈して、ESTJが面白がれる映画を一緒に探す過程が今夜の楽しさ'
  },

  'ENFP-ESTP': {
    score: 3,
    label: '無難',
    chemistry: '外向きのエネルギーの共鳴',
    atmosphere: 'どちらもエネルギーが高い。映画の前後が賑やか',
    afterTalk: 'ENFPが解釈を語り、ESTPが「でもあのアクションシーン最高だった」と返す',
    movieGenres: ['テンポが速いエンタメ', 'アクションコメディ'],
    exampleMovies: ['キングスマン', 'バッドボーイズ', 'オーシャンズ11'],
    decisionHook: '頭も体も楽しめる映画。観た後の会話が自然と弾む夜'
  },

}

// ── ユーティリティ関数 ──────────────────────────────────

/**
 * 2つのMBTIタイプから相性データを取得する
 * キーの順序は問わない
 */
export function getCompatibility(
  typeA: MBTIType,
  typeB: MBTIType
): CompatibilityData {
  if (typeA === typeB) {
    return getSameTypeCompatibility(typeA)
  }
  const key = [typeA, typeB].sort().join('-')
  return MBTI_COMPATIBILITY[key] ?? getDefaultCompatibility()
}

/**
 * 同じタイプ同士の相性（自己投影ペア）
 */
function getSameTypeCompatibility(type: MBTIType): CompatibilityData {
  const sameTypeData: Record<MBTIType, CompatibilityData> = {
    INFJ: { score: 4, label: '相性良好', chemistry: '静かな共鳴', atmosphere: '2人とも無言でも通じ合う。言葉より沈黙が豊かな観賞', afterTalk: '「わかる」だけで全部伝わる。でも感想が同じすぎて物足りないことも', movieGenres: ['哲学的映画', '詩的な映像'], exampleMovies: ['ツリー・オブ・ライフ', 'ノスタルジア', '鏡'], decisionHook: '2人の世界が完全に一致する映画。でも違う解釈があると更に面白い' },
    INFP: { score: 4, label: '相性良好', chemistry: '感性の完全共鳴', atmosphere: '同じシーンで泣く。同じキャラクターが好き。完璧な共感', afterTalk: '感想が同じすぎて議論にならない。でもそれが心地いい', movieGenres: ['詩的なドラマ', '感動系'], exampleMovies: ['花束みたいな恋をした', 'アメリ', '燃ゆる女の肖像'], decisionHook: '完全に共感できる映画。今夜は同じ涙を流す' },
    INTJ: { score: 5, label: '伝説的ペア', chemistry: '頭脳の完全共鳴', atmosphere: '映画中は完全な静寂。でも頭の中は全開。観終わってから深夜まで続く議論', afterTalk: '伏線の回収競争が始まる。どちらも見落としがない', movieGenres: ['複雑な構成の映画', '哲学的SF'], exampleMovies: ['2001年宇宙の旅', 'TENET', 'プリマー'], decisionHook: '全ての伏線を2人で解析する。これは最高の頭脳戦' },
    INTP: { score: 4, label: '相性良好', chemistry: '論理の迷宮', atmosphere: '映画中から矛盾探しが始まる。お互いに発見を共有したがる', afterTalk: '設定の矛盾と整合性の議論が深夜まで続く', movieGenres: ['ハードSF', 'タイムパラドックス'], exampleMovies: ['プリマー', 'コヒーレンス', 'ロスト・ハイウェイ'], decisionHook: '設定の完璧さを2人で検証する。どちらが先に矛盾を見つけるか' },
    ENFJ: { score: 4, label: '相性良好', chemistry: '感情の爆発', atmosphere: '2人とも感情が大きく動く。泣いたり笑ったりが同期する', afterTalk: 'キャラクターへの感情移入が深すぎて、感想が収まらない', movieGenres: ['感動ドラマ', '人間の尊厳'], exampleMovies: ['最強のふたり', 'ショーシャンクの空に', 'セルマ'], decisionHook: '感情を全開にできる映画。今夜は2人で思いっきり泣く' },
    ENFP: { score: 3, label: '無難', chemistry: '妄想の無限ループ', atmosphere: '観ながら妄想が広がりすぎて映画に集中できないことも', afterTalk: '「もしこうだったら？」が無限に続く。結論が出ない', movieGenres: ['世界観が広い映画'], exampleMovies: ['マルコヴィッチの穴', 'バードマン'], decisionHook: '妄想が許される映画。今夜は2人の想像力が暴走する' },
    ENTJ: { score: 4, label: '相性良好', chemistry: '支配者同士の覇権争い', atmosphere: 'どちらが先に「あの判断は間違い」と言うか競い合っている', afterTalk: '登場人物の意思決定を徹底的に批評する。映画がケーススタディ', movieGenres: ['権力闘争', 'リーダーシップ'], exampleMovies: ['マネーボール', 'リンカーン', 'ダーケスト・アワー'], decisionHook: 'あの判断は正しかったか。2人の評決が分かれる映画' },
    ENTP: { score: 5, label: '伝説的ペア', chemistry: '議論が終わらない', atmosphere: '観ながらすでに逆張りの解釈を準備している。映画が戦場になる', afterTalk: 'どちらの解釈が正しいか永遠に決まらない。それが楽しい', movieGenres: ['解釈が多様な映画', 'カルト的作品'], exampleMovies: ['ファイト・クラブ', '未来世紀ブラジル', 'バードマン'], decisionHook: '正解のない映画。2人の解釈が全部違って全部面白い' },
    ISFJ: { score: 4, label: '相性良好', chemistry: '温かさの共鳴', atmosphere: '安心して感情を出せる。お互いを気遣い合う優しい時間', afterTalk: '「よかったね」の共感が深い。感想が短くても心は通じている', movieGenres: ['家族映画', 'ハートウォーミング'], exampleMovies: ['フォレスト・ガンプ', 'サウンド・オブ・ミュージック', 'コーダ'], decisionHook: '温かい気持ちになれる映画。今夜は2人で心を温める' },
    ISFP: { score: 5, label: '伝説的ペア', chemistry: '感性の完全共鳴', atmosphere: '同じシーンで息をのむ。言葉なく感動が伝わる', afterTalk: '「あの映像」「わかる」だけで通じる。深く言語化しなくていい', movieGenres: ['映像美', '詩的な映画'], exampleMovies: ['燃ゆる女の肖像', 'aftersun', 'ムーンライト'], decisionHook: '言葉にできない感動を共有する。それだけでいい夜' },
    ISTJ: { score: 3, label: '無難', chemistry: '静かな秩序の共鳴', atmosphere: '2人とも静かに集中する。邪魔し合わない', afterTalk: '感想は短くて事実確認が中心。でもそれが心地いい', movieGenres: ['歴史映画', 'リアリズム'], exampleMovies: ['ダンケルク', 'スポットライト', 'シンドラーのリスト'], decisionHook: '事実の重みを静かに感じる映画。今夜は2人でその重さを受け取る' },
    ISTP: { score: 4, label: '相性良好', chemistry: '無口な共鳴', atmosphere: '映画中は完全に静か。でもお互いに何かを感じている', afterTalk: '感想は短いが具体的。「あの仕組みが」「あのシーンの技術が」', movieGenres: ['技術・メカニズムが緻密な映画'], exampleMovies: ['ヒート', 'プリマー', 'ゼロ・グラビティ'], decisionHook: '細部のリアリティを2人で確認する。言葉少なく分かり合える夜' },
    ESFJ: { score: 4, label: '相性良好', chemistry: '共感の洪水', atmosphere: 'ティッシュを2人で分け合う。感情が増幅する', afterTalk: 'キャラクターへの共感が深すぎて感想が終わらない', movieGenres: ['感動ドラマ', '家族映画'], exampleMovies: ['最強のふたり', 'グリーンブック', 'コーダ'], decisionHook: '泣きたい夜に。感情をフル開放できる最高のペア' },
    ESFP: { score: 4, label: '相性良好', chemistry: 'テンションが爆発', atmosphere: '観る前から盛り上がっている。映画が始まる前が一番楽しいかも', afterTalk: '「最高だった！」の応酬。感想より盛り上がりが大事', movieGenres: ['コメディ', 'アクション', 'ミュージカル'], exampleMovies: ['マッドマックス', 'ラ・ラ・ランド', 'グレイテスト・ショーマン'], decisionHook: '笑って騒いで盛り上がれる映画。今夜のエネルギーを全部使う' },
    ESTJ: { score: 3, label: '無難', chemistry: '判断の共鳴', atmosphere: '2人とも論理的に観る。感情的な反応は少ない', afterTalk: '映画の判断・構成・完成度を採点し合う。評価が一致しやすい', movieGenres: ['政治ドラマ', 'ビジネス映画'], exampleMovies: ['マネーボール', 'リンカーン', 'ハドソン川の奇跡'], decisionHook: '完成度の高い映画を静かに鑑賞し、冷静に批評し合う夜' },
    ESTP: { score: 4, label: '相性良好', chemistry: '行動力の爆発', atmosphere: '2人ともリアクションが体で出る。スピード感のある映画が最高', afterTalk: '「あのシーン」「やばかった」の応酬。熱量が同じ', movieGenres: ['アクション', 'スポーツ', 'サバイバル'], exampleMovies: ['マッドマックス怒りのデスロード', 'ジョン・ウィック', 'クリード'], decisionHook: '体が熱くなる映画。観た後に走りたくなるやつ' },
  }
  return sameTypeData[type]
}

/**
 * 未定義の組み合わせ用デフォルト値
 */
function getDefaultCompatibility(): CompatibilityData {
  return {
    score: 3,
    label: '無難',
    chemistry: 'それぞれの個性が交差する',
    atmosphere: 'お互いのペースで映画を楽しめる組み合わせ',
    afterTalk: '感想をそれぞれに語り合える。意見の違いが発見になる',
    movieGenres: ['王道ドラマ', '普遍的なテーマの映画'],
    exampleMovies: ['ショーシャンクの空に', 'グリーンブック', 'フォレスト・ガンプ'],
    decisionHook: '2人が初めて一緒に観る映画。どんな映画でも今夜は特別になる'
  }
}

/**
 * グループ（3人以上）の相性スコアを算出する
 * 全ペアのスコアの平均と最低スコアを返す
 */
export function getGroupCompatibility(types: MBTIType[]): {
  avgScore: number
  minScore: number
  pairs: Array<{ typeA: MBTIType; typeB: MBTIType; score: number }>
  recommendation: string
} {
  const pairs: Array<{ typeA: MBTIType; typeB: MBTIType; score: number }> = []

  for (let i = 0; i < types.length; i++) {
    for (let j = i + 1; j < types.length; j++) {
      const data = getCompatibility(types[i], types[j])
      pairs.push({ typeA: types[i], typeB: types[j], score: data.score })
    }
  }

  const avgScore = pairs.reduce((s, p) => s + p.score, 0) / pairs.length
  const minScore = Math.min(...pairs.map(p => p.score))

  let recommendation: string
  if (avgScore >= 4.5) {
    recommendation = '伝説的なグループ。どんな映画を選んでも最高の夜になる'
  } else if (avgScore >= 3.5) {
    recommendation = '相性の良いグループ。映画選びで少し工夫すればさらに盛り上がる'
  } else if (minScore >= 3) {
    recommendation = '無難に楽しめるグループ。全員が知っているジャンルの映画が無難'
  } else {
    recommendation = '多様なグループ。全員が初めて観るジャンルに挑戦すると化学反応が起きやすい'
  }

  return { avgScore, minScore, pairs, recommendation }
}

// ── 追加分（残り52ペア）─────────────────────────────────

const MBTI_COMPATIBILITY_EXTRA: Record<string, CompatibilityData> = {

  'INFJ-INFP': { score: 5, label: '伝説的ペア', chemistry: '魂が共鳴する静けさ', atmosphere: '言葉なく同じシーンで感動する。説明しなくても伝わる', afterTalk: '「あのシーン、なんか刺さった」「わかる」だけで2時間語れる', movieGenres: ['詩的なドラマ', '余韻の深い映画', '人間の本質'], exampleMovies: ['ムーンライト', 'パターソン', 'aftersun', '存在の耐えられない軽さ', 'ストーリー・オブ・マイライフ'], decisionHook: '言葉にならない感情を2人で感じる映画。それだけで今夜は完璧' },

  'ENFP-INFJ': { score: 4, label: '相性良好', chemistry: '理想と情熱が共鳴する', atmosphere: 'INFJが深みを与え、ENFPが熱量を持ち込む。バランスが絶妙', afterTalk: 'キャラクターへの感情移入と哲学的考察が混ざり合う。話が尽きない', movieGenres: ['社会変革', '個人の覚醒', 'ヒューマンドラマ'], exampleMovies: ['イントゥ・ザ・ワイルド', 'スポットライト', 'ビューティフル・マインド', 'はじまりのうた'], decisionHook: '観終わって世界が少し変わって見える映画。その感覚を2人で持ちたい' },

  'ENTJ-INFJ': { score: 3, label: '無難', chemistry: '理想と実行のすれ違い', atmosphere: 'INFJが意味を探し、ENTJが判断を下す。視点が違うが否定はしない', afterTalk: 'INFJが「テーマとして〇〇」ENTJが「あの判断は間違いだ」。補い合う', movieGenres: ['社会派ドラマ', '権力と倫理'], exampleMovies: ['シカゴ7裁判', 'スポットライト', 'ミルク'], decisionHook: '意味と判断の両方が問われる映画。2人の視点が補い合う' },

  'ENTP-INFJ': { score: 4, label: '相性良好', chemistry: '直感と論理の知的刺激', atmosphere: 'ENTPが挑発的な解釈を仕掛け、INFJが深い直感で返す', afterTalk: 'ENTPの逆張りにINFJが「でも本質的には〇〇」と返す。かみ合うようで合わないが面白い', movieGenres: ['哲学的テーマ', '解釈が多様な映画'], exampleMovies: ['ファイト・クラブ', 'ドニー・ダーコ', 'バードマン', 'コヒーレンス'], decisionHook: '観た後の解釈が真逆になる映画。そのぶつかり合いが今夜の本番' },

  'ESFJ-INFJ': { score: 3, label: '無難', chemistry: '感情と深みの共存', atmosphere: 'ESFJが感情的に楽しみ、INFJが意味を探す。お互いを否定しない', afterTalk: 'ESFJが「感動した」INFJが「あのテーマが〇〇を表していて」。温かく続く', movieGenres: ['感動ドラマ', '人間の尊厳'], exampleMovies: ['最強のふたり', 'グリーンブック', 'ショーシャンクの空に'], decisionHook: '感動と意味が両立する映画。2人それぞれの楽しみ方で満足できる' },

  'ESTP-INFJ': { score: 5, label: '伝説的ペア', chemistry: '正反対が引き合う火花', atmosphere: 'INFJが静かに没入し、ESTPが体で反応する。全然違うのに不思議とフィットする', afterTalk: '「あのシーンの意味は〇〇」とINFJが言い、ESTPが「いや単純に〇〇だろ」と返す。深夜まで続く', movieGenres: ['心理スリラー', '道徳的ジレンマ', '予測不能な展開'], exampleMovies: ['ノーカントリー', '複製された男', 'ヘレディタリー', 'インセプション', 'パラサイト'], decisionHook: '観た後、2人の解釈が必ず真逆になる。その会話が今夜の本番' },

  'ENTJ-INFP': { score: 2, label: '要注意', chemistry: '現実と感性の根本的なズレ', atmosphere: 'INFPが感性で観て、ENTJが判断を下す。空気が合いにくい', afterTalk: 'INFPが感情を語ると、ENTJが「でも実際は〇〇」と修正し始める', movieGenres: ['ENTJが感情を否定しにくい映画'], exampleMovies: ['ショーシャンクの空に', 'フォレスト・ガンプ'], decisionHook: 'ENTJが今夜だけは判断を控える。それだけでINFPが心を開く' },

  'INFP-ISFJ': { score: 3, label: '無難', chemistry: '温かさの静かな共鳴', atmosphere: 'ISFJがINFPを気遣ってくれる。INFPが安心して感情を出せる', afterTalk: 'ISFJが「どうだった？」と引き出してくれるのでINFPが珍しく話す', movieGenres: ['感動ドラマ', '家族映画'], exampleMovies: ['コーダ', 'ワンダー 君は太陽', '博士と彼女のセオリー', 'かもめ食堂'], decisionHook: '誰かに気遣ってもらいながら観たい映画。今夜はINFPが主役' },

  'INFP-ISFP': { score: 4, label: '相性良好', chemistry: '感性の静かな共鳴', atmosphere: '2人とも感性が豊かで言葉なく感動が伝わる。押しつけがない', afterTalk: '「あのシーン、刺さった」「わかる」だけで通じる。深く言語化しなくていい', movieGenres: ['詩的なドラマ', '映像美', '余韻のある映画'], exampleMovies: ['燃ゆる女の肖像', 'aftersun', 'きみの鳥はうたえる', 'ムーンライト'], decisionHook: '感性だけで楽しめる映画。今夜は言葉が少なくてもいい' },

  'ESFJ-INFP': { score: 3, label: '無難', chemistry: '温かさの共有', atmosphere: 'ESFJがINFPを気遣ってくれる。INFPが安心して感情を出せる', afterTalk: 'ESFJが「どうだった？」と引き出してくれるのでINFPが珍しく話す', movieGenres: ['感動ドラマ', '家族映画'], exampleMovies: ['コーダ', 'ワンダー 君は太陽', 'フォレスト・ガンプ', '博士と彼女のセオリー'], decisionHook: '誰かに気遣ってもらいながら観たい映画。今夜はINFPが主役' },

  'ESFP-INFP': { score: 3, label: '無難', chemistry: '感性の温度差', atmosphere: 'ESFPが騒ぎ、INFPが没入する。お互いに気を使いながらも楽しめる', afterTalk: 'ESFPが「面白かった！」で終わろうとするとINFPが「でも実は〇〇が気になって」と続ける', movieGenres: ['コメディ寄りのドラマ', 'ライトな感動系'], exampleMovies: ['はちみつ色のユン', 'ブリジット・ジョーンズ', 'プラダを着た悪魔'], decisionHook: '重すぎず軽すぎない映画。2人がそれぞれに楽しめる' },

  'ESTP-INFP': { score: 2, label: '要注意', chemistry: '行動と感性のズレ', atmosphere: 'ESTPが盛り上がり、INFPが静かに没入している。お互いに少し遠慮', afterTalk: 'ESTPが「最高だった！」INFPが「あのシーンの意味が気になって…」。かみ合わない', movieGenres: ['テンポが速すぎない映画'], exampleMovies: ['グラン・トリノ', 'イントゥ・ザ・ワイルド'], decisionHook: 'ESTPが今夜だけ静かに観る。INFPの世界を少し覗く夜' },

  'INTJ-INTP': { score: 4, label: '相性良好', chemistry: '論理の深海探査', atmosphere: '観ながら設定の矛盾を探している。でもそれが楽しい', afterTalk: '「あのシーンは物理的にありえない」「でも世界観上は〇〇という解釈ができる」の往復', movieGenres: ['ハードSF', 'タイムパラドックス', '叙述トリック'], exampleMovies: ['プリマー', 'イニシェリン島の精霊', 'オッペンハイマー', 'エクス・マキナ'], decisionHook: '設定の整合性を2人で検証する映画。正解はない' },

  'ENFJ-INTJ': { score: 4, label: '相性良好', chemistry: '感情と論理の建設的な衝突', atmosphere: 'ENFJが感情的に語り、INTJが論理で深める。補い合う', afterTalk: 'ENFJが「あのキャラの気持ちが」INTJが「でもその行動の論理的な理由は〇〇」', movieGenres: ['複雑なキャラクター描写', '哲学的ドラマ'], exampleMovies: ['存在の耐えられない軽さ', 'ブレードランナー2049', 'アライバル', 'ツリー・オブ・ライフ'], decisionHook: '感情でも論理でも読み解ける映画。2人の見方が補い合う' },

  'ENTJ-INTJ': { score: 4, label: '相性良好', chemistry: '戦略的思考者の頭脳戦', atmosphere: '2人とも静かに全体を俯瞰している。映画が終わった後が本番', afterTalk: '登場人物の戦略と判断を徹底的に分析する。どちらが正しいか競い合う', movieGenres: ['権力闘争', '政治スリラー', '組織と個人'], exampleMovies: ['ソーシャル・ネットワーク', 'シカゴ7裁判', 'バイス', 'ゲーム'], decisionHook: '戦略の優劣を2人で判定する映画。どちらの読みが鋭いか' },

  'INTJ-ISFP': { score: 3, label: '無難', chemistry: '論理と感性の静かな共存', atmosphere: 'INTJが構造を分析し、ISFPが感性で受け取る。お互いを邪魔しない', afterTalk: 'INTJが「伏線として〇〇が」ISFPが「あの映像が美しくて」。重ならないが否定しない', movieGenres: ['映像美と論理が両立する映画'], exampleMovies: ['ブレードランナー2049', 'アライバル', '2001年宇宙の旅'], decisionHook: '映像で感じるか論理で考えるか。どちらも正しい映画' },

  'INTJ-ISTJ': { score: 3, label: '無難', chemistry: '秩序と戦略の共鳴', atmosphere: '2人とも静かに集中する。感情的な反応は少ない', afterTalk: 'ISTJが事実の正確さを、INTJが論理構造を確認し合う', movieGenres: ['歴史映画', 'ハードSF', '実話ビジネス'], exampleMovies: ['オッペンハイマー', 'スポットライト', 'ゾディアック', 'イミテーション・ゲーム'], decisionHook: '事実と論理が緻密な映画。2人が違う視点で検証できる' },

  'ESTJ-INTJ': { score: 3, label: '無難', chemistry: '秩序者同士の静かな批評', atmosphere: '2人とも論理的に観る。感情的な乱れはほぼない', afterTalk: 'ESTJが全体評価し、INTJが構造的な詳細を補足する', movieGenres: ['政治ドラマ', 'リーダーシップ', '組織映画'], exampleMovies: ['リンカーン', 'チャーチル', 'フロスト/ニクソン'], decisionHook: '完成度の高い映画を静かに鑑賞し、冷静に批評し合う夜' },

  'ESTP-INTJ': { score: 3, label: '無難', chemistry: '頭脳と直感の組み合わせ', atmosphere: 'INTJが全体を俯瞰し、ESTPが瞬間瞬間に反応する。スピードが違うが邪魔しない', afterTalk: 'ESTPが「あのシーンのアクション最高」INTJが「あの展開は序盤の〇〇の伏線だった」', movieGenres: ['スリラー', 'クライム', '心理戦'], exampleMovies: ['インセプション', 'カジノ', 'ゴーン・ガール', 'マイノリティ・レポート'], decisionHook: '頭と体で違う楽しみ方ができる映画。2人の感想が補い合う' },

  'ENFJ-INTP': { score: 3, label: '無難', chemistry: '感情と論理の補完', atmosphere: 'ENFJが感情的に引きこもうとするが、INTPが設定の話を始める', afterTalk: 'ENFJが「あのキャラが」INTPが「でも設定的には〇〇が成立するか」。かみ合わないが深まる', movieGenres: ['感情と論理が両立する映画'], exampleMovies: ['her/世界でひとつの彼女', 'エクス・マキナ', 'アライバル'], decisionHook: '感情でも論理でも語れる映画。2人の違いが補い合う夜' },

  'ENFP-INTP': { score: 4, label: '相性良好', chemistry: '妄想と論理の化学反応', atmosphere: 'ENFPが可能性を広げ、INTPが論理で検証する。お互いに刺激し合う', afterTalk: 'ENFPが「もしこうだったら？」INTPが「それは〇〇という条件が成立する場合のみ」と返す', movieGenres: ['SF', '世界観構築が緻密な映画', '哲学的テーマ'], exampleMovies: ['コンタクト', 'インターステラー', 'ループ', 'サンシャイン2057'], decisionHook: '可能性と論理が両立する映画。ENFPが広げてINTPが検証する' },

  'ENTJ-INTP': { score: 4, label: '相性良好', chemistry: '戦略と理論の融合', atmosphere: 'ENTJが判断し、INTPが理論で補足する。効率的な頭脳戦', afterTalk: 'ENTJが「あの判断の問題点は」INTPが「論理的には〇〇という条件が」と深める', movieGenres: ['権力と知性', 'ビジネスドラマ', '戦略映画'], exampleMovies: ['ソーシャル・ネットワーク', 'マネーショート', '12人の怒れる男', 'ゲーム'], decisionHook: '戦略と論理が問われる映画。2人の頭脳が最もよく機能する夜' },

  'ESFP-INTP': { score: 2, label: '要注意', chemistry: '観る目的が違いすぎる', atmosphere: 'ESFPが盛り上がり、INTPが設定を検証している。並行宇宙のような2人', afterTalk: 'ESFPが「超面白かった！」INTPが「あの部分の設定が気になって」。かみ合わない', movieGenres: ['テンポが速くて考える暇のない映画'], exampleMovies: ['スパイダーマン', 'アベンジャーズ'], decisionHook: 'INTPが今夜は設定検証をやめる映画。それだけで大丈夫' },

  'ESTP-INTP': { score: 3, label: '無難', chemistry: '頭脳と行動の組み合わせ', atmosphere: 'ESTPが反応し、INTPが分析する。テンポは違うが補い合える', afterTalk: 'ESTPが「あのアクションシーン」INTPが「実はあれは序盤の設定の応用で」', movieGenres: ['アクションと知性が両立する映画'], exampleMovies: ['ミッション：インポッシブル', 'キック・アス', 'アントマン'], decisionHook: '体で楽しんで頭でも楽しめる映画。2人の得意が活きる' },

  'ENFJ-ISFJ': { score: 4, label: '相性良好', chemistry: '共感の最強タッグ', atmosphere: 'どちらも感受性が高く、安心して感情を出せる空間が生まれる', afterTalk: '感動のシーンをそれぞれに語り合う。どちらも相手の感想を大切にする', movieGenres: ['感動系', '家族映画', '人間の絆'], exampleMovies: ['コーダ', 'ライフ・イズ・ビューティフル', '最強のふたり', 'グリーンブック'], decisionHook: '心が温かくなる映画。今夜は2人で確実に感動できる' },

  'ENFJ-ESTP': { score: 3, label: '無難', chemistry: '情熱と行動の共鳴', atmosphere: 'ENFJが感情的に引っ張り、ESTPが行動力で応答する', afterTalk: 'ENFJが「あのキャラの選択に感動した」ESTPが「でもあのアクションシーンが最高だった」', movieGenres: ['感情とアクションが両立する映画'], exampleMovies: ['クリード', 'セルマ', 'ウォーリアー'], decisionHook: '心に刺さりながらも熱い映画。2人の感動ポイントが違って面白い' },

  'ENFP-ESFJ': { score: 3, label: '無難', chemistry: '感情と想像力の共鳴', atmosphere: 'ENFPが話を広げ、ESFJが感情的に共鳴する', afterTalk: '「もしこうだったら？」にESFJが「そうなったら〇〇が悲しいね」と続ける', movieGenres: ['感動系コメディ', 'ハートウォーミング'], exampleMovies: ['ズートピア', 'インサイド・ヘッド', 'ソウル', 'コーダ'], decisionHook: '感情で楽しんで想像も広がる映画。2人の長所が活きる夜' },

  'ENTJ-ISFJ': { score: 2, label: '要注意', chemistry: '論理と感情の摩擦', atmosphere: 'ISFJが感情的に楽しもうとするとENTJが批評し始める', afterTalk: 'ISFJが「感動した」ENTJが「でもあの判断は間違いだ」。ISFJが少し傷つくことも', movieGenres: ['ISFJが安心できる感動系映画'], exampleMovies: ['グリーンブック', 'コーダ'], decisionHook: 'ENTJが今夜だけは批評を控える。それがISFJへの最高のプレゼント' },

  'ENTJ-ISFP': { score: 1, label: '難易度高', chemistry: '価値観の根本的な断絶', atmosphere: 'ENTJの批評的な姿勢がISFPの感性を委縮させる。難しい組み合わせ', afterTalk: 'ISFPが感想を言えない雰囲気になりがち。ENTJが気づかずに評価し続ける', movieGenres: ['ENTJが感情的に批判しにくい映画を慎重に選ぶこと'], exampleMovies: ['グランド・ブダペスト・ホテル'], decisionHook: 'ENTJがISFPの感性を尊重する覚悟をした夜。映画選びより心構えが大事' },

  'ENTJ-ISTP': { score: 3, label: '無難', chemistry: '実行力の共鳴', atmosphere: 'ENTJが全体戦略を、ISTPが技術的詳細を観る。視点が違うが補い合う', afterTalk: 'ENTJが「あのリーダーシップは」ISTPが「でもあの仕掛けの方が面白かった」', movieGenres: ['戦略とアクションが共存する映画'], exampleMovies: ['オーシャンズ11', 'ミッション：インポッシブル', 'アルゴ'], decisionHook: '頭と体の両方が活きる映画。2人の視点が補い合う夜' },

  'ENTJ-ESFJ': { score: 2, label: '要注意', chemistry: '価値観の根本的な違い', atmosphere: 'ESFJが感情的に楽しもうとするとENTJが批評し始める', afterTalk: 'ESFJが感動し、ENTJが「あの判断は非効率だ」と言ってしまう', movieGenres: ['どちらにも刺さる中間地点を探すことが大事'], exampleMovies: ['グラン・トリノ', 'ショーシャンクの空に'], decisionHook: 'ENTJが今夜だけは批評を控える覚悟。それだけで楽しい夜になる' },

  'ENTJ-ESFP': { score: 2, label: '要注意', chemistry: '目的の違いが生む温度差', atmosphere: 'ESFPが楽しもうとするとENTJが批評し始める。テンポが合わない', afterTalk: 'ESFPが「最高だった！」ENTJが「設定に無理がある」。ESFPがしらける', movieGenres: ['ESFPが騒ぎすぎずENTJが批評しすぎない映画'], exampleMovies: ['グランド・ブダペスト・ホテル', 'ジュラシック・パーク'], decisionHook: 'どちらも少し歩み寄る映画。その選択過程を楽しむ夜' },

  'ENTJ-ESTP': { score: 3, label: '無難', chemistry: '行動力の共鳴', atmosphere: 'どちらも外向きで判断が速い。テンポが合う', afterTalk: 'ENTJが全体評価し、ESTPが細かいシーンを振り返る', movieGenres: ['アクション', 'ビジネス映画', '権力闘争'], exampleMovies: ['ウルフ・オブ・ウォールストリート', 'マネーボール', 'フューリー'], decisionHook: '勝負・逆転・判断が光る映画。2人の熱量が一致する夜' },

  'ENTP-ISFJ': { score: 2, label: '要注意', chemistry: '挑発と温かさのすれ違い', atmosphere: 'ISFJが感情的に楽しもうとするとENTPが逆張り解釈を始める', afterTalk: 'ISFJが感動し、ENTPが「実はこの映画は〇〇への批判では？」と話をひっくり返す', movieGenres: ['ESFJが感情的に否定されにくい映画'], exampleMovies: ['グリーンブック', '最強のふたり'], decisionHook: 'ENTPが今夜だけは逆張りをしない映画を一緒に選ぶ過程が大事' },

  'ENTP-ISFP': { score: 3, label: '無難', chemistry: '論理と感性の意外な融合', atmosphere: 'ENTPが議論を仕掛け、ISFPが感性で静かに返す', afterTalk: 'ENTPの「実はこれは〇〇の比喩」にISFPが「私にはただ美しく感じた」と返す', movieGenres: ['解釈が多様な映画', '美しい映像の哲学映画'], exampleMovies: ['ツリー・オブ・ライフ', 'ファウンテン', '燃ゆる女の肖像'], decisionHook: '分析しなくても感じるだけで満足できる映画。ENTPも今夜は感性を使う' },

  'ENTP-ISTJ': { score: 2, label: '要注意', chemistry: '議論と秩序の衝突', atmosphere: 'ENTPが逆張りを展開し、ISTJが事実で否定し始める。お互いにフラストレーション', afterTalk: 'ENTPが「実はこれは〇〇の比喩」ISTJが「でも史実的には〇〇だから成立しない」', movieGenres: ['どちらも認められる中間地点'], exampleMovies: ['ゾディアック', 'スポットライト'], decisionHook: '事実ベースで解釈も広がる映画。2人が珍しく同意できるポイントを探す夜' },

  'ENTP-ISTP': { score: 3, label: '無難', chemistry: '実践と理論の交差', atmosphere: 'ENTPが哲学的解釈を展開し、ISTPが「でも実際の仕組みとして」と返す', afterTalk: '表面上はかみ合わないが、お互いに刺激を受けている', movieGenres: ['技術と哲学が共存するSF'], exampleMovies: ['エクス・マキナ', 'プリマー', 'コヒーレンス'], decisionHook: '理屈と仕組み、どちらで観ても面白い映画' },

  'ENTP-ESFJ': { score: 2, label: '要注意', chemistry: '感情と議論のすれ違い', atmosphere: 'ESFJが感情的に楽しもうとするとENTPが逆張り解釈を始める', afterTalk: 'ESFJが感動し、ENTPが「実はこの映画は〇〇への批判では？」と話をひっくり返す', movieGenres: ['ESFJが感情的に否定されにくい映画'], exampleMovies: ['グリーンブック', '最強のふたり'], decisionHook: 'ENTPが今夜だけは逆張りをしない映画を選ぶ過程が大事' },

  'ENTP-ESFP': { score: 3, label: '無難', chemistry: '外向きのエネルギーの共鳴', atmosphere: '2人ともエネルギーが高く、映画の前後が賑やか', afterTalk: 'ESFPが感情で楽しみ、ENTPが解釈を展開する。かみ合わないが否定しない', movieGenres: ['エンタメ系', '会話が弾む映画'], exampleMovies: ['オーシャンズ11', 'バードマン', 'ジュノ'], decisionHook: '観た後も話が続く映画。今夜は映画が会話のきっかけ' },

  'ENTP-ESTJ': { score: 3, label: '無難', chemistry: '論理と秩序の摩擦', atmosphere: 'ENTPが逆張りを展開し、ESTJが正論で返す。お互いにフラストレーションもあるが刺激的', afterTalk: 'ENTPが「実はこれは〇〇の批判」ESTJが「でも判断として間違い」。議論になる', movieGenres: ['法廷ドラマ', '組織と個人'], exampleMovies: ['12人の怒れる男', 'シカゴ7裁判', 'ニュースルーム'], decisionHook: '議論になる映画。お互いに譲らない夜が最高になる' },

  'ENTP-ESTP': { score: 3, label: '無難', chemistry: '議論と行動のエネルギー', atmosphere: '2人ともエネルギーが高い。ESTPが反応し、ENTPが解釈を加える', afterTalk: 'ESTPが「あのシーン最高」ENTPが「でも実はあれは〇〇の伏線で」', movieGenres: ['スリラー', 'アクションと知性が両立する映画'], exampleMovies: ['キック・アス', 'キングスマン', 'ゴーン・ガール'], decisionHook: '体でも頭でも楽しめる映画。2人のエネルギーが爆発する夜' },

  'ESTJ-ISFJ': { score: 3, label: '無難', chemistry: '秩序と温かさの共存', atmosphere: 'ESTJが判断し、ISFJが感情で補足する。分担が自然', afterTalk: 'ESTJが批評し、ISFJが「でも感動したじゃない」と和らげる', movieGenres: ['ハッピーエンドの明確なドラマ', '実話感動系'], exampleMovies: ['フォレスト・ガンプ', 'コーダ', 'グリーンブック'], decisionHook: '後味が良くて明確なメッセージのある映画。2人の価値観が一致する' },

  'ESTP-ISFJ': { score: 2, label: '要注意', chemistry: '温度差が生まれやすい', atmosphere: 'ESTPがリアクションし、ISFJが少し引いている', afterTalk: 'ESTPが「最高だった！」ISFJが内心「もう少し静かに観たかった」と思っている', movieGenres: ['ISFJが安心できる範囲の映画'], exampleMovies: ['スパイダーマン', 'ジュラシック・パーク'], decisionHook: 'ESTPがISFJのペースに合わせる覚悟をした夜だけうまくいく' },

  'ISFP-ISTP': { score: 3, label: '無難', chemistry: '静かな個人主義の共存', atmosphere: '2人とも静かに自分の世界で観る。お互いに邪魔しない', afterTalk: 'ISTPが技術・仕組み、ISFPが映像・感情を語る。重ならないが否定しない', movieGenres: ['映像と技術が両立する映画'], exampleMovies: ['マッドマックス怒りのデスロード', 'ブレードランナー2049', 'レオン'], decisionHook: '映像でも仕組みでも楽しめる映画。2人の得意が活きる' },

  'ESFJ-ISFP': { score: 3, label: '無難', chemistry: '感性と共感の共存', atmosphere: 'ESFJがISFPを気遣い、ISFPが自分のペースで感じる', afterTalk: 'ESFJが「どうだった？」と聞いてくれるのでISFPが少し話す', movieGenres: ['感動系', '人間ドラマ', '自然描写が美しいもの'], exampleMovies: ['リトル・フォレスト', 'ノマドランド', 'かもめ食堂'], decisionHook: 'ESFJが話しかけすぎなければ、ISFPが一番くつろげるペア' },

  'ESTP-ISFP': { score: 2, label: '要注意', chemistry: '行動と感性のズレ', atmosphere: 'ESTPが盛り上がり、ISFPが少し引いている', afterTalk: 'ESTPが「最高だった！」ISFPが「あの映像は美しかったけど…少し騒がしかった」', movieGenres: ['テンポは速いが映像美もある映画'], exampleMovies: ['マッドマックス怒りのデスロード', 'ブレードランナー2049'], decisionHook: 'ESTPが映像の美しさも楽しめる映画を選ぶ。ISFPが新鮮に感じる夜' },

  'ESFJ-ISTJ': { score: 3, label: '無難', chemistry: '秩序と温かさの共存', atmosphere: 'ISTJが静かに観て、ESFJが雰囲気を作る。悪くない組み合わせ', afterTalk: 'ESFJが感動し、ISTJが「確かに良い映画だった」と短く認める', movieGenres: ['感動系', '家族映画', '実話'], exampleMovies: ['フォレスト・ガンプ', 'タイタニック', 'コーダ'], decisionHook: 'ESFJが選んだ映画にISTJが乗る夜。それで意外と良い時間になる' },

  'ESTP-ISTJ': { score: 2, label: '要注意', chemistry: '秩序とカオスの摩擦', atmosphere: 'ESTPが騒ぎ、ISTJが集中できなくなる', afterTalk: 'ESTPが「やばかった！」ISTJが「うん…でも史実と違う部分が」', movieGenres: ['テンポが速くてESTPが静かにできる映画'], exampleMovies: ['ボーン・アイデンティティ', 'ジャック・リーチャー'], decisionHook: 'ESTPが静かに観る覚悟をした映画だけ成功する' },

  'ESFJ-ISTP': { score: 2, label: '要注意', chemistry: '感情と無関心のズレ', atmosphere: 'ESFJが感情的に引きこもうとするが、ISTPが反応しない', afterTalk: 'ESFJが「あのシーン、感動しなかった？」ISTPが「まあ、よかった」', movieGenres: ['ISTPが自然に反応できる映画'], exampleMovies: ['ヒート', 'ボーン・アイデンティティ'], decisionHook: 'ESFJが押しつけない映画を選べば、ISTPが珍しく感想を言う夜になる' },

  'ESFP-ISTP': { score: 3, label: '無難', chemistry: '行動派の共鳴', atmosphere: 'ESFPが盛り上がり、ISTPが静かに楽しむ', afterTalk: 'ESFPが「最高！」ISTPが「まあな」。短いが満足している', movieGenres: ['アクション', 'スポーツ映画'], exampleMovies: ['マッドマックス', 'トップガン', 'クリード'], decisionHook: 'とにかくスカッとする映画。難しいことは考えない夜' },

  'ESTJ-ISTP': { score: 3, label: '無難', chemistry: '実用主義の共鳴', atmosphere: '2人とも論理的に観る。感情的なシーンには少し距離を置く', afterTalk: 'ESTJが全体評価し、ISTPが技術的な詳細を補足する', movieGenres: ['リアリズム', '実話', 'アクション'], exampleMovies: ['ハドソン川の奇跡', 'フライト', 'キャスト・アウェイ'], decisionHook: 'リアリティが高くスカッとする映画。2人の実用主義が一致する夜' },

  'ESTP-ISTP': { score: 4, label: '相性良好', chemistry: '行動力の共鳴', atmosphere: '2人ともリアクションが体で出る。スピード感のある映画が最高', afterTalk: '感想はシンプルだが熱い。「あのシーン」「わかる」で十分通じ合う', movieGenres: ['アクション', 'サバイバル', 'スポーツ'], exampleMovies: ['マッドマックス怒りのデスロード', 'ジョン・ウィック', 'クリード', 'バーニング'], decisionHook: '体が熱くなる映画。観た後に走りたくなるやつ' },

}

// 追加分をメインオブジェクトにマージ
Object.assign(MBTI_COMPATIBILITY, MBTI_COMPATIBILITY_EXTRA)
