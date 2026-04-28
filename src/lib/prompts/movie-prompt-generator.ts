export type PromptType = "director" | "actor" | "critic" | "trivia";

export function generateMoviePrompt(
  movie: {
    title: string;
    releaseYear: number;
    directors: string[];
    cast?: string[];
    overview?: string;
    genrePrimary?: string;
  },
  type: PromptType,
): string {
  switch (type) {
    case "director":
      return `あなたは${movie.directors[0] ?? "監督"}です。${movie.releaseYear}年に制作した「${movie.title}」について、私はいまこの映画を観終わったばかりです。この作品でもっとも苦心した演出上の判断、脚本との格闘、撮影現場の空気感、そしてラストシーンに込めた意図について、監督として率直に語ってください。私はあなたの視点から深くこの映画を理解したいと思っています。`;

    case "actor": {
      const actor = movie.cast?.[0] ?? "主演俳優";
      return `あなたは「${movie.title}」に出演した${actor}です。この役を引き受けた理由、役作りのために行ったリサーチや準備、撮影中にもっとも印象に残ったシーン、そして${movie.directors[0] ?? "監督"}との関係について話してください。俳優として、この映画があなた自身に与えた影響も聞かせてください。`;
    }

    case "critic":
      return `あなたは著名な映画評論家です。「${movie.title}」（${movie.releaseYear}）を、同時代の映画史的文脈・社会的背景・${movie.directors[0] ?? "監督"}のフィルモグラフィーの中での位置づけという3つの軸から分析してください。この映画が公開当時どのように受け取られ、今日どのような意味を持つのかについても論じてください。`;

    case "trivia":
      return `あなたは映画「${movie.title}」（${movie.releaseYear}）の撮影に関わった裏方スタッフです。制作現場の面白いエピソード、公式には語られていない小ネタ、撮影中に起きたハプニング、カットされたシーンの裏話、そしてキャストとスタッフの間で語り継がれているエピソードをたっぷり教えてください。`;
  }
}
