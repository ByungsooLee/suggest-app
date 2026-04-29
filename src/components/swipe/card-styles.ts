const GENRE_GRADIENTS: Record<string, string> = {
  action: "linear-gradient(160deg,#1a0a0a 0%,#3d1010 100%)",
  adventure: "linear-gradient(160deg,#15151f 0%,#27304f 100%)",
  animation: "linear-gradient(160deg,#0d1a14 0%,#1a3d28 100%)",
  comedy: "linear-gradient(160deg,#1e1a0d 0%,#3d3510 100%)",
  crime: "linear-gradient(160deg,#120f18 0%,#2a2034 100%)",
  drama: "linear-gradient(160deg,#1a0e0e 0%,#3d1a1a 100%)",
  family: "linear-gradient(160deg,#13211e 0%,#25403a 100%)",
  fantasy: "linear-gradient(160deg,#161126 0%,#34285a 100%)",
  horror: "linear-gradient(160deg,#0a0e0a 0%,#0e2e0e 100%)",
  mystery: "linear-gradient(160deg,#12131d 0%,#24324b 100%)",
  musical: "linear-gradient(160deg,#25131e 0%,#5a2947 100%)",
  romance: "linear-gradient(160deg,#1a0d14 0%,#3d1a2d 100%)",
  "sci-fi": "linear-gradient(160deg,#0d1a2e 0%,#1a3a5c 100%)",
  thriller: "linear-gradient(160deg,#1a1020 0%,#2d1a3d 100%)",
  default: "linear-gradient(160deg,#141418 0%,#2a2a30 100%)",
};

export function getMovieCardGradient(genre: string | null | undefined) {
  if (!genre) return GENRE_GRADIENTS.default;
  return GENRE_GRADIENTS[genre] ?? GENRE_GRADIENTS.default;
}
