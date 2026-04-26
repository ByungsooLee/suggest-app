import { type MbtiType } from "@/lib/constants/taxonomy";
import { type UserMood } from "@/lib/onboarding/mood-map";
import { type FeatureDimension } from "@/lib/recommendation/feature-vector";

type ReasonPayload = {
  mbti: MbtiType | null;
  currentMood: UserMood | null;
  likedMovies: string[];
  rejectedMovies: string[];
  recommendedMovie: {
    title: string;
    genres: string[];
    matchedFeatures: FeatureDimension[];
    scoreBreakdown: {
      knownTasteScore: number;
      currentMoodScore: number;
      mbtiAdjustmentScore: number;
    };
  };
};

const moodLabel: Record<UserMood, string> = {
  want_healing: "癒やされたい気分",
  want_to_be_moved: "心を動かされたい気分",
  want_excitement: "刺激が欲しい気分",
  want_to_laugh: "笑いたい気分",
  want_tension: "緊張感を味わいたい気分",
  want_quiet_immersion: "静かに没入したい気分",
  want_to_switch_off: "気楽に観たい気分",
  okay_with_something_heavy: "重めでも大丈夫な気分",
};

const featureLabel: Record<FeatureDimension, string> = {
  moodCalm: "落ち着いた空気",
  moodDark: "ダークなトーン",
  moodEmotional: "感情の深さ",
  moodUplifting: "前向きさ",
  toneStylish: "スタイリッシュさ",
  toneFunny: "ユーモア",
  paceFast: "テンポの速さ",
  paceSlowBurn: "じわっと進むテンポ",
  complexity: "物語の複雑さ",
  emotionalWeight: "感情の重み",
  tension: "緊張感",
  accessibility: "観やすさ",
};

export const RECOMMENDATION_REASON_SYSTEM_PROMPT = `You explain why a movie was recommended.
Be brief, concrete, and natural.
Do not overclaim personality traits from MBTI.
Treat MBTI as a mild preference signal, not a deterministic truth.
Prioritize the user's current mood and their reactions to known movies.
Keep the explanation to 2 or 3 short sentences.
Avoid filler, generic praise, and horoscope-like language.
Do not say things like “because you are an INFP, you are...”.
Instead say things like “based on the movies you responded to” or “for your current mood”.`;

export function generateRecommendationReason(payload: ReasonPayload): string {
  const matched = payload.recommendedMovie.matchedFeatures.slice(0, 3).map((feature) => featureLabel[feature]);
  const moodText = payload.currentMood ? moodLabel[payload.currentMood] : "今の気分";
  const liked = payload.likedMovies.slice(0, 2);
  const rejected = payload.rejectedMovies.slice(0, 1);

  const sentence1 =
    matched.length > 0
      ? `${moodText}に合わせると、${payload.recommendedMovie.title}は${matched.join("・")}の相性が高い候補です。`
      : `${moodText}に合わせると、${payload.recommendedMovie.title}は今夜の条件にバランスよく合う候補です。`;

  if (liked.length === 0 && rejected.length === 0) {
    return `${sentence1} 反応データが少ないため、今回は気分との一致を中心に選んでいます。`;
  }

  const sentence2 =
    liked.length > 0
      ? `反応した作品では${liked.join("、")}寄りの要素が見られ、この作品にも近い特徴があります。`
      : "今回の反応では好みの傾向がまだ薄いため、気分との一致を強めに反映しています。";

  const sentence3 =
    rejected.length > 0
      ? `${rejected[0]}で合わなかったトーンからは少し離した提案です。`
      : payload.mbti
        ? `MBTIは弱い補助信号として使い、気分と反応を優先して調整しています。`
        : "MBTIは補助的に扱い、主に気分と反応データで絞り込みました。";

  return `${sentence1} ${sentence2} ${sentence3}`;
}
