export type PromptType = "director" | "actor" | "critic" | "trivia";

type PromptLocale = "ja" | "en" | "ko";

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
  locale: PromptLocale = "ja",
): string {
  const directorName = movie.directors[0] ?? (locale === "en" ? "the director" : locale === "ko" ? "감독" : "監督");
  const actorName = movie.cast?.[0] ?? (locale === "en" ? "the lead actor" : locale === "ko" ? "주연 배우" : "主演俳優");

  switch (type) {
    case "director":
      if (locale === "en") {
        return `You are ${directorName}. I just finished watching "${movie.title}" (${movie.releaseYear}). Please speak candidly as the director about the hardest creative decisions you made, the struggle of shaping the script, the atmosphere on set, and the intention behind the ending. I want to understand this film more deeply from your point of view.`;
      }
      if (locale === "ko") {
        return `당신은 ${directorName}입니다. 저는 방금 "${movie.title}"(${movie.releaseYear})을 보고 나왔습니다. 이 작품에서 가장 고심했던 연출상의 판단, 각본과 씨름했던 과정, 촬영 현장의 공기, 그리고 마지막 장면에 담은 의도를 감독의 입장에서 솔직하게 들려주세요. 감독의 시선으로 이 영화를 더 깊이 이해하고 싶습니다.`;
      }
      return `あなたは${directorName}です。${movie.releaseYear}年に制作した「${movie.title}」について、私はいまこの映画を観終わったばかりです。この作品でもっとも苦心した演出上の判断、脚本との格闘、撮影現場の空気感、そしてラストシーンに込めた意図について、監督として率直に語ってください。私はあなたの視点から深くこの映画を理解したいと思っています。`;

    case "actor": {
      if (locale === "en") {
        return `You are ${actorName}, who appeared in "${movie.title}". Tell me why you took this role, how you prepared for it, which moment from the shoot stayed with you most, and what your working relationship with ${directorName} was like. I would also love to hear how this film changed you as an actor.`;
      }
      if (locale === "ko") {
        return `당신은 "${movie.title}"에 출연한 ${actorName}입니다. 이 역할을 맡은 이유, 역할 준비를 위해 했던 조사와 훈련, 촬영 중 가장 인상 깊었던 장면, 그리고 ${directorName}와의 작업 관계를 들려주세요. 배우로서 이 작품이 당신에게 어떤 영향을 남겼는지도 궁금합니다.`;
      }
      return `あなたは「${movie.title}」に出演した${actorName}です。この役を引き受けた理由、役作りのために行ったリサーチや準備、撮影中にもっとも印象に残ったシーン、そして${directorName}との関係について話してください。俳優として、この映画があなた自身に与えた影響も聞かせてください。`;
    }

    case "critic":
      if (locale === "en") {
        return `You are a renowned film critic. Analyze "${movie.title}" (${movie.releaseYear}) through three lenses: its place in film history at the time, its social context, and where it sits within ${directorName}'s filmography. Also discuss how the film was received on release and what it means today.`;
      }
      if (locale === "ko") {
        return `당신은 저명한 영화 평론가입니다. "${movie.title}"(${movie.releaseYear})을 동시대 영화사적 맥락, 사회적 배경, 그리고 ${directorName}의 필모그래피 안에서의 위치라는 세 가지 축으로 분석해 주세요. 개봉 당시 어떤 평가를 받았는지, 오늘날에는 어떤 의미를 갖는지도 함께 설명해 주세요.`;
      }
      return `あなたは著名な映画評論家です。「${movie.title}」（${movie.releaseYear}）を、同時代の映画史的文脈・社会的背景・${directorName}のフィルモグラフィーの中での位置づけという3つの軸から分析してください。この映画が公開当時どのように受け取られ、今日どのような意味を持つのかについても論じてください。`;

    case "trivia":
      if (locale === "en") {
        return `You worked behind the scenes on "${movie.title}" (${movie.releaseYear}). Tell me the best production stories you know: funny on-set moments, unofficial trivia, mishaps during shooting, stories behind deleted scenes, and the kind of legends that the cast and crew still talk about.`;
      }
      if (locale === "ko") {
        return `당신은 "${movie.title}"(${movie.releaseYear}) 제작에 참여한 스태프입니다. 현장의 재미있는 에피소드, 공식적으로는 잘 알려지지 않은 트리비아, 촬영 중 벌어진 해프닝, 삭제된 장면의 뒷이야기, 그리고 배우와 스태프 사이에서 지금도 회자되는 이야기들을 듬뿍 들려주세요.`;
      }
      return `あなたは映画「${movie.title}」（${movie.releaseYear}）の撮影に関わった裏方スタッフです。制作現場の面白いエピソード、公式には語られていない小ネタ、撮影中に起きたハプニング、カットされたシーンの裏話、そしてキャストとスタッフの間で語り継がれているエピソードをたっぷり教えてください。`;
  }
}
