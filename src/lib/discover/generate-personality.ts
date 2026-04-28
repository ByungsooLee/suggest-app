import { prisma } from "@/lib/db/prisma";

export async function generatePersonalityLabel(userId: string): Promise<string> {
  const profile = await prisma.userMovieProfile.findUnique({ where: { userId } });
  if (!profile) return "映画を愛する人";

  const genreWeights = profile.genreWeights as Record<string, number>;
  const directorAffinity = profile.directorAffinity as Record<string, number>;

  const topGenres = Object.entries(genreWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([g]) => g);

  const topDirectors = Object.entries(directorAffinity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([d]) => d.replace(/_/g, " "));

  const prompt = `あなたは映画評論家です。以下の映画の好み傾向から、その人の映画鑑賞スタイルを10〜15文字の日本語で表現してください。ラベルだけを返してください。

好きなジャンル（上位順）: ${topGenres.join(", ") || "不明"}
好きな監督: ${topDirectors.join(", ") || "不明"}
複雑な構成への好み: ${profile.preferComplex.toFixed(1)}
暗いテーマへの好み: ${profile.preferDark.toFixed(1)}
外国語映画への好み: ${profile.preferForeign.toFixed(1)}

例: "静かな緊張感を好む観察者" / "痛烈な社会批評を愛するリアリスト"`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 50,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json() as { content: Array<{ type: string; text: string }> };
    const label = data.content?.[0]?.text?.trim() ?? "映画を愛する人";

    await prisma.userMovieProfile.update({
      where: { userId },
      data: { personalityLabel: label, personalityUpdatedAt: new Date() },
    });

    return label;
  } catch {
    return "映画を愛する人";
  }
}
