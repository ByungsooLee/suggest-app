import { getTmdbPersonBiography, getTmdbPersonCombinedCredits, hasTmdbApiKey, searchTmdbPersonByName, toTmdbProfileImageUrl, type TmdbCreditItem } from "@/lib/tmdb/client";

type PersonRole = "director" | "actor";

type MatchResult =
  | {
      matched: true;
      personId: number;
      avatarUrl: string | null;
      biography: string | null;
      knownFor: string[];
      confidence: number;
      evidence: {
        required: "name_exact_and_two_titles";
        nameMatched: boolean;
        roleMatched: boolean;
        matchedKnownForTitles: string[];
        reason?: string;
      };
    }
  | {
      matched: false;
      reason: string;
      evidence: {
        required: "name_exact_and_two_titles";
        nameMatched: boolean;
        roleMatched: boolean;
        matchedKnownForTitles: string[];
        reason?: string;
      };
    };

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function normalizeTitle(value: string) {
  return normalizeText(value.replace(/\(\d{4}\)/g, "").trim());
}

function creditTitle(credit: TmdbCreditItem) {
  return credit.title ?? credit.name ?? "";
}

function scoreRoleMatch(role: PersonRole, cast: TmdbCreditItem[], crew: TmdbCreditItem[]) {
  if (role === "actor") return cast.length > 0;
  return crew.some((item) => (item.job ?? "").toLowerCase() === "director");
}

export async function resolveStrictPersonMatch(args: {
  name: string;
  role: PersonRole;
  knownForFromCatalog: string[];
}): Promise<MatchResult> {
  if (!hasTmdbApiKey()) {
    return {
      matched: false,
      reason: "TMDB_API_KEY is missing.",
      evidence: {
        required: "name_exact_and_two_titles",
        nameMatched: false,
        roleMatched: false,
        matchedKnownForTitles: [],
        reason: "TMDB_API_KEY is missing.",
      },
    };
  }

  const candidates = await searchTmdbPersonByName(args.name);
  const normalizedName = normalizeText(args.name);
  const expectedTitles = args.knownForFromCatalog.map(normalizeTitle).filter(Boolean);

  for (const candidate of candidates) {
    const nameMatched = normalizeText(candidate.name) === normalizedName;
    if (!nameMatched) continue;

    const credits = await getTmdbPersonCombinedCredits(candidate.id);
    const roleMatched = scoreRoleMatch(args.role, credits.cast, credits.crew);
    if (!roleMatched) continue;

    const titleSet = new Set(
      [...credits.cast, ...credits.crew]
        .map((item) => normalizeTitle(creditTitle(item)))
        .filter(Boolean),
    );
    const matchedKnownForTitles = expectedTitles.filter((title) => titleSet.has(title));

    if (matchedKnownForTitles.length < 2) {
      continue;
    }

    const person = await getTmdbPersonBiography(candidate.id);
    const matchedVisibleTitles = args.knownForFromCatalog.filter((title) => matchedKnownForTitles.includes(normalizeTitle(title)));

    return {
      matched: true,
      personId: candidate.id,
      avatarUrl: toTmdbProfileImageUrl(person.profilePath),
      biography: person.biography,
      knownFor: matchedVisibleTitles.length > 0 ? matchedVisibleTitles.slice(0, 3) : args.knownForFromCatalog.slice(0, 3),
      confidence: Math.min(1, 0.6 + matchedKnownForTitles.length * 0.2),
      evidence: {
        required: "name_exact_and_two_titles",
        nameMatched: true,
        roleMatched: true,
        matchedKnownForTitles: matchedVisibleTitles,
      },
    };
  }

  return {
    matched: false,
    reason: "No strict TMDB match (name + at least two known titles).",
    evidence: {
      required: "name_exact_and_two_titles",
      nameMatched: false,
      roleMatched: false,
      matchedKnownForTitles: [],
      reason: "No strict TMDB match (name + at least two known titles).",
    },
  };
}
