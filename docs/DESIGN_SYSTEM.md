# Suggest App — Design System Skill

最終更新: 2026-04-22（v3: 現状監査ログ・修正仕様・Cursorプロンプト集追加）
対象リポジトリ: `suggest-app`
目的: このファイルをCursor / ChatGPT / Claudeに渡すことで、全UIが一貫したビジュアルトーンで実装される。新機能・画面追加の際は**必ずこのファイルを最初に読み込む**こと。

---

## 0. このSkillの使い方

```
AIへの指示テンプレート:
「まず DESIGN_SYSTEM.md を読み込み、
 そのトーン・コンポーネントルールに従って [画面名/機能名] を実装してください。」
```

### /recommend ページ実装時のCursorプロンプト例

```
DESIGN_SYSTEM.md を読み込んでください。

src/app/recommend/page.tsx を実装してください。
セクション「6. 画面別ガイドライン > /recommend」の仕様に完全に従うこと。

要件:
- 4ステップのウィザード形式（Step1:尺 → Step2:文脈 → Step3:除外 → Step4:気分）
- ステップ構成・入力型・選択肢の値はDESIGN_SYSTEM.mdのStep構成表に従う
- Step2はシングル選択・タップ後260ms自動進行
- ボトムバーは position:fixed、CTAラベルはStep4でのみ「今夜の1本を見つける」に変化
- 送信時は POST /api/recommendations を呼び出す
- TypeScript + Tailwind CSS で実装（tailwind.config.js はDESIGN_SYSTEM.mdのセクション9に従う）
- フォントは Google Fonts の DM Serif Display / DM Sans を layout.tsx で読み込む
```

新画面や新コンポーネントを作る際は:
1. このファイルのセクション1〜5を必ず参照
2. セクション6の既存コンポーネントから流用できるものを探す
3. 新しいパターンが生まれたらセクション6に追記する

---

## 1. デザイン哲学

### コアコンセプト: "Dark Cinema"
映画館の暗闇の中でスクリーンが光る体験を再現する。
ユーザーは「今夜何を観るか」を決める数分間、このアプリの世界に没入する。

### 3原則
| 原則 | 意味 | アンチパターン |
|------|------|--------------|
| **Poster First** | ビジュアルが主役。テキストは補佐。 | 文字で埋め尽くされた推薦カード |
| **Signal Not Noise** | 推薦理由は3つまで、端的に。 | スコア数値の羅列、長い説明文 |
| **Frictionless Choice** | タップ数を最小化。迷わせない。 | 選択肢が多すぎる入力フォーム |

---

## 2. カラーパレット

```css
:root {
  /* ─── ベース ─── */
  --color-bg-void:        #080808;   /* 最深部の黒。画面全体の背景 */
  --color-bg-surface:     #111111;   /* カード・モーダルの背景 */
  --color-bg-elevated:    #1A1A1A;   /* ホバー・選択状態の背景 */
  --color-bg-overlay:     rgba(8,8,8,0.85); /* ポスター上テキストの背景 */

  /* ─── テキスト ─── */
  --color-text-primary:   #F0EDE8;   /* メイン文字。純白より少し温かく */
  --color-text-secondary: #8A8680;   /* 補助情報・ラベル */
  --color-text-muted:     #4A4845;   /* disabled・プレースホルダー */

  /* ─── アクセント（映写機の光） ─── */
  --color-accent:         #E8C97A;   /* ゴールド。CTAボタン・評価・ハイライト */
  --color-accent-dim:     rgba(232,201,122,0.15); /* アクセントの薄い背景 */
  --color-accent-glow:    rgba(232,201,122,0.08); /* ホバー時のグロー */

  /* ─── セマンティック ─── */
  --color-match-high:     #6EBF8B;   /* マッチ度高（緑） */
  --color-match-mid:      #E8C97A;   /* マッチ度中（ゴールド） */
  --color-match-low:      #8A8680;   /* マッチ度低（グレー） */
  --color-streaming:      #E87A7A;   /* 配信中バッジ */
  --color-border:         rgba(240,237,232,0.08); /* 細いセパレーター */
  --color-border-accent:  rgba(232,201,122,0.3);  /* アクセント枠線 */
}
```

### カラー使用ルール
- **背景の重ね順**: void → surface → elevated（暗い方が下）
- **アクセントは使いすぎない**: 1画面に3箇所以内
- **テキストのコントラスト**: primary on surface は 7:1 以上確保
- **グラデーション禁止**: ポスター画像のオーバーレイ以外は単色のみ

---

## 3. タイポグラフィ

```css
/* Google Fonts インポート */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --font-display: 'DM Serif Display', Georgia, serif; /* タイトル・映画名 */
  --font-body:    'DM Sans', system-ui, sans-serif;   /* UI・説明文 */
}
```

### タイポグラフィスケール
```css
/* 映画タイトル（ヒーロー） */
.text-movie-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--color-text-primary);
}

/* セクション見出し */
.text-heading {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/* 本文・説明 */
.text-body {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

/* ラベル・バッジ */
.text-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}
```

### タイポグラフィルール
- 映画タイトルは必ず `DM Serif Display`（イタリック体も効果的）
- UI要素は `DM Sans` の weight 300 or 500（中間の400は使わない）
- 文字サイズは `clamp()` でレスポンシブ対応
- `letter-spacing: 0.12em` の ALL CAPS はセクションラベルのみ

---

## 4. スペーシング・レイアウト

```css
:root {
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;

  --radius-sm:   6px;   /* タグ・バッジ */
  --radius-md:   12px;  /* ボタン・入力欄 */
  --radius-lg:   16px;  /* カード */
  --radius-xl:   24px;  /* ポスターカード */
  --radius-full: 9999px; /* ピル型 */
}
```

### グリッド
```css
/* 推薦結果（本命1枚 + バックアップ2枚）*/
.recommend-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
}

/* タブレット以上: 3カラム */
@media (min-width: 768px) {
  .recommend-grid {
    grid-template-columns: 2fr 1fr 1fr; /* 本命を大きく */
    align-items: start;
  }
}
```

---

## 5. コンポーネント設計原則

### 5.1 映画推薦カード（MovieRecommendCard）— 最重要

```
┌────────────────────────────┐
│  [ポスター画像 - 全面]       │  ← aspect-ratio: 2/3
│                             │
│  ┌─ RANK 1 ────────────┐   │  ← 左上バッジ
│  └─────────────────────┘   │
│                             │
│  ████████████████████████  │  ← グラデーション overlay
│  映画タイトル               │  ← DM Serif Display
│  2019 · 2h 12m · Drama     │  ← text-secondary
│                             │
│  ✓ 今の気分にぴったり        │  ← 推薦理由タグ (最大3個)
│  ✓ 監督の作風が好みと一致   │
│                             │
│  [Netflix]  [観る ↗]        │  ← CTA
└────────────────────────────┘
```

**実装ポイント**:
- ポスターは `object-fit: cover` で常に比率維持
- 下部オーバーレイ: `background: linear-gradient(transparent, var(--color-bg-void) 90%)`
  ※グラデーション禁止例外 — ポスター上のテキスト可読性確保のため許可
- 推薦理由は `✓` プレフィックスのタグ形式。スコア数値は**表示しない**
- ホバー時: ポスターが `scale(1.03)` + `brightness(1.1)` でほんの少し明るく
- ランク1（本命）のみ `--color-accent` の枠線を付与

### 5.2 推薦理由タグ（ReasonTag）

```css
.reason-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 5px var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-text-primary);
}

/* ハイライト（マッチ度高） */
.reason-tag--highlight {
  background: var(--color-accent-dim);
  border-color: var(--color-border-accent);
  color: var(--color-accent);
}
```

ルール: 最大3タグ / 1カード。文言は「〜にぴったり」「〜が一致」など体言止め。

### 5.3 CTAボタン

```css
/* プライマリ（観る） */
.btn-primary {
  padding: 12px var(--space-xl);
  background: var(--color-accent);
  color: #080808;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.btn-primary:hover { opacity: 0.85; }

/* セカンダリ（詳細を見る） */
.btn-secondary {
  padding: 11px var(--space-xl);
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-secondary:hover {
  background: var(--color-bg-elevated);
  border-color: rgba(240,237,232,0.2);
}
```

### 5.4 気分入力タグ（MoodChip）

```css
.mood-chip {
  padding: 8px var(--space-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 300;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.mood-chip:hover {
  border-color: rgba(240,237,232,0.25);
  color: var(--color-text-primary);
}
.mood-chip--selected {
  background: var(--color-accent-dim);
  border-color: var(--color-border-accent);
  color: var(--color-accent);
}
```

### 5.5 ロード・トランジション

**推薦生成中（観客が暗転を待つ感）**:
```css
/* スケルトン */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-surface) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-lg);
}
```

**推薦結果の出現**:
```css
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.movie-card {
  animation: reveal-up 0.5s ease forwards;
}
/* バックアップカードは遅延 */
.movie-card:nth-child(2) { animation-delay: 0.1s; }
.movie-card:nth-child(3) { animation-delay: 0.2s; }
```

---

## 6. 画面別ガイドライン

### /recommend（推薦条件入力）

#### 概要
4ステップのウィザード形式。**1ステップ = 1質問**を徹底し、認知負荷を最小化する。

#### ステップ構成（順番厳守）

| Step | 質問 | 入力型 | 必須 |
|------|------|--------|------|
| 1 | 今夜、何分くらい観たい？ | プリセットピル + スライダー | 任意（スキップ可） |
| 2 | 今夜は誰と観る？ | シングル選択チップ（自動進行） | 任意（スキップ可） |
| 3 | 今夜は避けたいものは？ | マルチ選択チップ | 任意（スキップ可） |
| 4 | 今夜の気分は？ | マルチ選択チップ | 任意（おまかせ可） |

**順番の根拠**: 尺・文脈は即答できる具体的な質問 → 先に置くことで「答えられた」体験を作り、Step4の気分（あいまいで迷う）まで自然に到達させる。

#### レイアウト構造

```
┌──────────────────────────────┐
│  ████░░░░  プログレスバー     │  ← 上部固定。accent色で進捗表示
├──────────────────────────────┤
│                               │
│  Step X / 4                   │  ← text-muted, uppercase
│  [質問文]                     │  ← DM Serif Display, clamp(1.4rem〜1.8rem)
│  [補足テキスト]               │  ← DM Sans 300, text-secondary
│                               │
│  [入力UI（チップ/スライダー）] │
│                               │
│  [スキップリンク]             │  ← text-muted色、目立たせない
│                               │
│  ─────────────────────────── │
│  （Step4のみ）選んだ条件サマリ│
│                               │
└──────────────────────────────┘
│  [次へ → ] または [今夜の1本を見つける →]  ← 画面下部fixed
└──────────────────────────────┘
```

#### 各入力UIの実装仕様

**Step1: 尺スライダー**

```tsx
// プリセットピル（スライダー上部に配置）
const RUNTIME_PRESETS = [
  { label: '〜90分',     min: 60,  max: 90  },
  { label: '90〜120分',  min: 90,  max: 120 },
  { label: '120分+',     min: 120, max: 210 },
  { label: '気にしない', min: 0,   max: 999 },
];

// プリセット選択 → スライダー連動
// スライダー操作 → プリセット選択解除
// max=999（気にしない）のとき表示は「制限なし」
// API送信値: { desiredRuntimeMin: number, desiredRuntimeMax: number }
//   気にしない → min/max を省略またはnull
```

- スライダー range: min=60, max=210, step=10
- `210` を超えたら「制限なし」表示に切り替え
- スライダーのつまみ色: `--color-accent`
- トラック fill: `--color-accent`、未fill: `--color-bg-elevated`

**Step2: 視聴文脈チップ（シングル選択・自動進行）**

```tsx
const CONTEXT_OPTIONS = [
  { value: 'solo',    label: 'ひとりで集中して',    emoji: '🧍' },
  { value: 'partner', label: '恋人・パートナーと',  emoji: '👫' },
  { value: 'friends', label: '友人と',              emoji: '👥' },
  { value: 'family',  label: '家族と',              emoji: '🏠' },
  { value: 'bg',      label: 'ながら見・作業BGM',   emoji: '📱' },
];

// 選択後 260ms 待って自動で次ステップへ遷移
// API送信値: { watchingContext: string }
```

- タップ → 選択状態（accent色）になってから 260ms 後に `goNext()` 自動呼び出し
- 「次へ」ボタンは選択完了まで disabled

**Step3: 除外チップ（マルチ選択）**

```tsx
const EXCLUDE_OPTIONS = [
  { value: 'horror',   label: 'ホラー',           emoji: '👻' },
  { value: 'violence', label: '激しい暴力描写',   emoji: '⚠️' },
  { value: 'sad',      label: '悲しすぎる結末',   emoji: '😢' },
  { value: 'complex',  label: '複雑なストーリー', emoji: '🔀' },
  { value: 'sub',      label: '字幕（疲れてる）', emoji: '🗣' },
  { value: 'long',     label: '3時間超',          emoji: '⏱' },
  { value: 'sexual',   label: '性的な描写',       emoji: '🔞' },
];

// API送信値: { contentWarningExcludes: string[] }
// 0件選択でも「次へ」は押せる（スキップと同義）
```

**Step4: 気分チップ（マルチ選択）**

```tsx
const MOOD_OPTIONS = [
  { value: 'excited', label: 'ワクワクしたい',          emoji: '⚡' },
  { value: 'calm',    label: '静かに過ごしたい',         emoji: '🌙' },
  { value: 'cry',     label: '泣きたい気分',             emoji: '💧' },
  { value: 'laugh',   label: '笑いたい',                 emoji: '😄' },
  { value: 'thrill',  label: 'ドキドキしたい',           emoji: '🎢' },
  { value: 'think',   label: '考えさせられたい',         emoji: '🧠' },
  { value: 'escape',  label: '日常を忘れたい',           emoji: '✈️' },
  { value: 'warm',    label: 'ほっこりしたい',           emoji: '☕' },
  { value: 'dark',    label: 'ダークな世界に浸りたい',   emoji: '🌑' },
];

// API送信値: { desiredMoods: string[] }
// 0件でも送信可（推薦エンジン側でおまかせ扱い）
```

#### Step4下部: 入力サマリー表示

Step4の入力欄下に、Step1〜3で選んだ内容をサマリーチップで表示する。
これにより「自分が何を選んだか」が確認でき、推薦結果への納得感につながる。

```
選んだ条件 （セクションラベル）
[90〜120分] [ひとりで] [ホラーなし] [字幕なし]  ← summary-chipで横並び
```

- `summary-chip`: background `--color-bg-elevated`, border `--color-border`, pill型
- 文字色: `--color-text-secondary`（強調項目のみ `--color-text-primary` bold）

#### プログレスバー

```css
/* 上部固定、4セグメント */
.progress-bar {
  display: flex;
  gap: 6px;
  padding: 20px 20px 0;
}
.progress-segment {
  flex: 1;
  height: 2px;
  border-radius: 9999px;
  background: var(--color-bg-elevated);
  transition: background 0.3s ease;
}
.progress-segment.done   { background: var(--color-accent); }
.progress-segment.active { background: rgba(232,201,122,0.45); }
```

#### ボトムバー（CTA）

```css
/* 画面下部 fixed */
.bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  padding: 16px 20px 28px;
  /* フェードアウトで下コンテンツと自然に融合 */
  background: linear-gradient(to top, var(--color-bg-void) 65%, transparent);
}
```

- Step1: runtime が未選択 → `disabled`
- Step2: context が未選択 → `disabled`（ただし自動進行するので通常は押さない）
- Step3: 常に `enabled`（0件でも次へ進める）
- Step4: 常に `enabled`、ラベルは「今夜の1本を見つける」に変化

#### ステップ遷移アニメーション

```css
@keyframes step-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* 新しいステップが表示されるとき */
.step.active {
  animation: step-in 0.35s ease forwards;
}
```

#### スキップリンクの表示ルール

| Step | スキップリンク文言 |
|------|-------------------|
| 1    | 時間は気にしない → スキップ |
| 2    | （自動進行のためスキップ不要） |
| 3    | 特になし → スキップ |
| 4    | 気分はおまかせ → このまま推薦へ |

- 色: `--color-text-muted`
- ホバー: `--color-text-secondary`
- 位置: チップグリッドの下、`margin-top: 22px`、`text-align: center`
- **絶対に目立たせない**（ユーザーに「スキップしてもいい」と気づかせる程度）

### /recommend/result/[sessionId]（推薦結果）
- ヒーロー（rank1）カードを上部に大きく配置
- バックアップ2件はその下に小さく横並び
- 「もう一度探す」リンクは最下部にのみ表示（離脱防止）
- フィードバックボタン（観た / 興味なし）はカード内に常時表示

### /onboarding（初期設定）
- プログレスバーは `--color-accent` で進捗を表示
- Step2スワイプ: カードは `aspect-ratio: 2/3`、左右スワイプでジェスチャー操作
- 「スキップ」リンクは目立たせすぎない（`text-muted` 色）

---

## 7. アニメーション原則

| 用途 | duration | easing |
|------|----------|--------|
| ホバー・フォーカス | 150ms | ease |
| カード出現 | 500ms | ease |
| ページ遷移 | 300ms | ease-in-out |
| スワイプ | 250ms | cubic-bezier(0.4,0,0.2,1) |

- `prefers-reduced-motion` を必ず考慮すること
- transform / opacity のみ animate（layout thrashing を避ける）

---

## 8. 禁止事項

| 禁止 | 理由 |
|------|------|
| 白・明るいグレー背景 | Dark Cinemaトーンを崩す |
| Inter / Roboto / Arial | 汎用的すぎてブランド感がない |
| スコア数値の直接表示（例: 72点） | ライト層に意味が伝わらない |
| 1カードに4つ以上の推薦理由 | 認知負荷が高くなる |
| 推薦カードの高さ固定 | ポスター比率が崩れる |
| カラフルすぎる配色 | シネマティックな雰囲気を壊す |

---

## 9. Tailwind CSS 設定（Next.js連携）

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'void':     '#080808',
        'surface':  '#111111',
        'elevated': '#1A1A1A',
        'accent':   '#E8C97A',
        'text': {
          primary:   '#F0EDE8',
          secondary: '#8A8680',
          muted:     '#4A4845',
        },
        'match': {
          high: '#6EBF8B',
          mid:  '#E8C97A',
          low:  '#8A8680',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '16px',
        '2xl': '24px',
      },
    },
  },
}
```

---

## 10. 新機能追加チェックリスト

新しい画面・コンポーネントを追加する際は以下を確認:

- [ ] 背景色は `--color-bg-void` または `--color-bg-surface` か
- [ ] フォントは `DM Serif Display`（タイトル） / `DM Sans`（UI）か
- [ ] アクセントカラーの使用は1画面3箇所以内か
- [ ] 推薦情報はスコア非表示・理由タグ形式か
- [ ] アニメーションは transform/opacity のみか
- [ ] `prefers-reduced-motion` の考慮があるか
- [ ] モバイル（375px）で表示が崩れていないか
- [ ] ポスター画像の欠損時に `/images/no-poster.svg` が出るか

---

## 11. 現状監査ログ（2026-04-22）

実装済み画面を確認した際に発見した問題点と修正仕様。
Cursor に修正を依頼するときはこのセクションを一緒に渡すこと。

### 11.1 全画面共通の問題

#### 🔴 アクセントカラーの混在（最優先）

**現状**: ピンク系（`#E91E8C`〜`#FF2D78`付近）とゴールド（`#E8C97A`）が画面によって混在している。特に「提案の広がり」ボタン・CTAボタンがピンクになっている。

**修正仕様**:
```css
/* 削除: ピンク系のアクセント変数・クラスをすべて除去 */
/* 統一: 全アクセントを以下に置き換え */
--color-accent: #E8C97A;

/* Tailwind を使っている場合は tailwind.config.js の accent を確認 */
/* bg-pink-*, text-pink-*, border-pink-* をすべて bg-accent, text-accent, border-accent に置換 */
```

**Cursor指示**:
```
DESIGN_SYSTEM.md を読み込んでください。
全ファイルを対象にピンク系のアクセントカラー（#E91E8C, #FF2D78, pink-500 等）を
すべて --color-accent (#E8C97A) に統一してください。
Tailwind クラスは bg-accent / text-accent / border-accent を使用すること。
```

#### 🔴 フォントが未適用

**現状**: 全画面で system-ui フォントのまま。`DM Serif Display` / `DM Sans` が適用されていない。

**修正仕様**:
```tsx
// src/app/layout.tsx に追加
import { DM_Serif_Display, DM_Sans } from 'next/font/google'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '500'],
  variable: '--font-body',
})

// <html> タグに className={`${dmSerif.variable} ${dmSans.variable}`} を追加
```

```css
/* globals.css */
h1, h2, .movie-title { font-family: var(--font-display); }
body, p, button, input { font-family: var(--font-body); }
```

#### 🟡 英語ラベルの日本語化

**現状**: UI上に英語の内部値がそのまま露出している。

| 現状の表示 | 修正後 |
|-----------|--------|
| `solo_watch` | `ひとりで` |
| `match mid` | （非表示 or `おすすめ度: 中`） |
| `Tonight's Top Pick` | `今夜の本命` |
| `Backup 1` | `バックアップ 1` |
| `toneFunny, paceFast, tension` | タグ形式に変換（後述） |
| `calm`, `dark`, `emotional` | `穏やか`, `ダーク`, `感情的` |

**修正仕様 — ラベル変換マップ**:
```ts
// src/lib/constants/labels.ts として作成
export const MOOD_LABELS: Record<string, string> = {
  calm: '穏やか', dark: 'ダーク', emotional: '感情的',
  stylish: 'スタイリッシュ', funny: '笑える', tense: '緊張感',
  uplifting: '前向き', melancholic: '切ない', excited: 'ワクワク',
}

export const CONTEXT_LABELS: Record<string, string> = {
  solo_watch: 'ひとりで', solo: 'ひとりで',
  partner: '恋人と', friends: '友人と',
  family: '家族と', bg: 'ながら見',
}

export const FEEDBACK_LABELS: Record<string, string> = {
  liked: '観た 👍', too_dark: '暗すぎた',
  too_long: '長すぎた', not_now: '今じゃない',
  mismatch: '好みと違う',
}

export const RANK_LABELS: Record<number, string> = {
  1: '今夜の本命', 2: 'バックアップ 1', 3: 'バックアップ 2',
}
```

---

### 11.2 推薦条件入力（`/recommend`）の問題

#### 🔴 「現在のジャンル設定」ブロックが重すぎる

**現状**: ページ上部に「好き: 未設定 / 除外: なし / 提案モード: wide / 推し監督: 未設定 / 推し俳優: 未設定」がテキストで羅列されている。

**修正仕様**: 折りたたみ式サマリーに変更する。

```tsx
// ジャンル設定サマリー（コンパクト版）
<button
  onClick={() => router.push('/mypage')}
  className="w-full flex items-center justify-between px-4 py-3
             bg-surface border border-border rounded-xl text-sm"
>
  <span className="text-muted">ジャンル設定</span>
  <span className="text-secondary">
    {hasPreferences ? '設定済み ›' : '未設定（タップして設定）›'}
  </span>
</button>
// 詳細は展開しない。マイページへ誘導するだけ。
```

#### 🔴 尺の入力が数値テキストボックス2つ

**現状**: 「最小時間: 90」「最大時間: 130」という数値入力フォーム。

**修正仕様**: セクション6の `/recommend` ガイドライン記載のプリセットピル + スライダーに完全移行。数値テキストボックスは廃止。

#### 🔴 「誰と観るか」がドロップダウン

**現状**: `<select>` で `solo_watch` 等の英語値が表示されている。

**修正仕様**: セクション6記載の `CONTEXT_OPTIONS` チップに完全移行。`<select>` は廃止。

#### 🟡 監督・俳優フィルターが推薦条件入力ページにある

**現状**: 推薦条件入力ページに「監督で絞る」「俳優で絞る」入力欄がある。これはマイページの嗜好設定と役割が重複し、ライト層には混乱を招く。

**修正仕様**:
- 推薦条件入力（`/recommend`）: 監督・俳優フィルターは**表示しない**
- マイページ（`/mypage`）: 推し監督・推し俳優の設定のみに集約
- 推薦条件入力は「今夜の気分・尺・文脈・除外」の4項目のみ

#### 🟡 最低レビュー点の数値入力

**現状**: 「最低レビュー点（0-10）: 0」というテキスト入力。

**修正仕様**: 推薦条件入力からは**削除**。マイページの「提案の広がり（絞る / バランス / 広げる）」が代替機能として存在するため不要。

---

### 11.3 推薦結果（`/recommend/result/[sessionId]`）の問題

#### 🔴 推薦理由が長文

**現状例**:
> 「dramaテイストでsolo_watchに向く一本。今夜の気分に合わせて選びやすい作品です。心を動かされた気分に合わせると、ColumbusはユーモアとテンポとReflective aestheticの相性が高い候補です。反応した作品ではInterstellar、Spider-Man: Into the Spider-Verse寄りの要素が見られ...」

**問題**: ライト層はこの長さの文章を読まない。内部変数名（`moodUplifting`等）も露出している。

**修正仕様**:

```ts
// src/lib/recommendation/engine.ts の理由生成部分を修正
// 理由は最大3つ、各理由は15文字以内の体言止め

// 修正前（長文生成）
const reason = `${genre}テイストで${context}に向く一本。今夜の気分に合わせて...`

// 修正後（タグ形式）
const reasons: string[] = []

if (moodMatch > 0.7)    reasons.push('今夜の気分にぴったり')
if (contextMatch)       reasons.push(`${CONTEXT_LABELS[context]}向き`)
if (runtimeFit)         reasons.push(`${runtime}分でちょうどいい`)
if (directorMatch)      reasons.push('好きな監督の作品')
if (actorMatch)         reasons.push('好きな俳優が出演')
if (styleMatch > 0.8)   reasons.push('作風が好みと一致')
if (discoveryMode)      reasons.push('あなたが知らない傑作')

return reasons.slice(0, 3) // 最大3つ
```

**UI側の変更**:
```tsx
// 推薦理由の表示（ReasonTag コンポーネント）
{movie.reasons.map((reason, i) => (
  <ReasonTag key={i} highlight={i === 0}>
    {reason}
  </ReasonTag>
))}
// highlight=true の最初のタグのみゴールド色で強調
```

#### 🔴 スコア数値の表示（7.2/10）

**現状**: 各カードに `David Fincher · 7.2/10` のように表示。

**修正仕様**: スコア数値は**完全に非表示**。代わりに必要な場合は以下の表現に変換。

```ts
// レビュースコア → 自然言語変換（表示する場合）
const scoreLabel = (score: number) => {
  if (score >= 8.0) return '高評価作品'
  if (score >= 7.0) return '評価安定'
  return ''  // 7未満は何も表示しない
}
// ただし基本的には非表示を推奨
```

#### 🟡 「一致特徴: toneFunny, paceFast, tension」の露出

**現状**: 内部の特徴変数名がそのままUIに表示されている。

**修正仕様**: この表示は**完全に削除**。推薦理由タグで代替できている情報のため不要。もしデバッグ目的で残したい場合は開発環境のみ `console.log` に移動する。

#### 🟡 「全体として安定した評価を獲得している作品です。」の定型文

**現状**: すべてのカードの下部にこの文言が表示されている。

**修正仕様**: 削除。推薦理由タグが代替となる。定型文はユーザーに「機械的」な印象を与え、信頼性を下げる。

---

### 11.4 マイページ（`/mypage`）の問題

#### 🟡 「提案の広がり」ボタンの色

**現状**: 選択中のボタンがピンク色になっている。

**修正仕様**: `--color-accent`（ゴールド）に変更。

```tsx
// 修正前
className={selected ? 'bg-pink-500 text-white' : '...'}

// 修正後
className={selected ? 'bg-accent text-void' : '...'}
// text-void = #080808（ゴールド背景上の黒文字）
```

#### 🟡 ジャンルチップが英語

**現状**: `action`, `adventure`, `animation` 等が英語のまま表示。

**修正仕様**:
```ts
// src/lib/constants/labels.ts に追加
export const GENRE_LABELS: Record<string, string> = {
  action: 'アクション', adventure: '冒険', animation: 'アニメ',
  comedy: 'コメディ', crime: '犯罪', drama: 'ドラマ',
  family: 'ファミリー', fantasy: 'ファンタジー', horror: 'ホラー',
  mystery: 'ミステリー', musical: 'ミュージカル', romance: 'ロマンス',
  'sci-fi': 'SF', thriller: 'スリラー',
}
```

---

## 12. Cursor プロンプト集

よく使う修正パターンのコピペ用プロンプト。

### フォント適用
```
DESIGN_SYSTEM.md を読み込んでください。
src/app/layout.tsx に DM Serif Display と DM Sans を next/font/google で設定し、
CSS変数 --font-display / --font-body として globals.css に登録してください。
映画タイトルには font-display、その他UIには font-body を適用してください。
```

### アクセントカラー統一
```
DESIGN_SYSTEM.md を読み込んでください。
プロジェクト全体でピンク系カラー（pink, #E91E8C, #FF2D78 等）を検索し、
すべて Tailwind の bg-accent / text-accent / border-accent（= #E8C97A）に置き換えてください。
```

### 推薦理由タグ化
```
DESIGN_SYSTEM.md を読み込んでください。
src/lib/recommendation/engine.ts の推薦理由生成ロジックを修正し、
長文の理由文ではなく最大3つ・15文字以内の体言止めタグ配列を返すようにしてください。
セクション11.3の修正仕様に従うこと。
推薦結果画面では ReasonTag コンポーネントで表示し、スコア数値(7.2/10等)は非表示にしてください。
```

### 推薦条件入力ウィザード化
```
DESIGN_SYSTEM.md を読み込んでください。
src/app/recommend/page.tsx を4ステップウィザードに書き直してください。
セクション6の「/recommend」ガイドライン、およびセクション11.2の修正仕様に完全に従うこと。
- 数値テキストボックスは廃止しプリセットピル+スライダーに変更
- <select>は廃止しチップ選択に変更
- 監督・俳優フィルターはこの画面から削除
- 最低レビュー点フィールドは削除
```

### 英語ラベル日本語化
```
DESIGN_SYSTEM.md を読み込んでください。
src/lib/constants/labels.ts を新規作成し、セクション11.1の変換マップを実装してください。
その後、推薦結果画面・推薦条件入力画面・フィードバックUIで
この変換マップを使って英語ラベルをすべて日本語表示に切り替えてください。
```

### マイページ改善
```
DESIGN_SYSTEM.md を読み込んでください。
src/app/mypage/page.tsx を以下の仕様で修正してください。
- 「提案の広がり」の選択中ボタンカラーをゴールド(bg-accent text-void)に変更
- ジャンルチップの表示を GENRE_LABELS マップで日本語化
- アクセントカラーをすべて --color-accent に統一
```
