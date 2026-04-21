import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { resolveStrictPersonMatch } from "@/lib/people/strict-person-match";
import { PersonPreviewSchema } from "@/lib/validation/schemas";

type PersonRole = "director" | "actor";

const TTL_HOURS = 6;

const roleLabel: Record<PersonRole, string> = {
  director: "監督",
  actor: "俳優",
};

function isPersonRole(value: string | null): value is PersonRole {
  return value === "director" || value === "actor";
}

export async function GET(request: Request, context: { params: Promise<{ name: string }> }) {
  const authResult = await requireUser();
  if (!authResult.ok) return authResult.response;

  const { name: rawName } = await context.params;
  const name = decodeURIComponent(rawName).trim();
  if (!name) {
    return Response.json({ code: "INVALID_NAME", message: "name is required." }, { status: 400 });
  }

  const roleParam = new URL(request.url).searchParams.get("role");
  if (!isPersonRole(roleParam)) {
    return Response.json({ code: "INVALID_ROLE", message: "role must be director or actor." }, { status: 422 });
  }
  const role = roleParam;

  const now = new Date();
  const cached = await prisma.personProfileCache.findUnique({
    where: { name_role: { name, role } },
  });

  if (cached && cached.expiresAt > now) {
    const isVerified = (cached.matchConfidence ?? 0) >= 0.8;
    const profile = {
      name: cached.name,
      role: cached.role,
      avatarUrl: isVerified ? cached.avatarUrl : null,
      bio: cached.bio,
      knownFor: cached.knownFor,
      news: Array.isArray(cached.news) ? cached.news : [],
      strictMatched: isVerified,
      matchStatus: isVerified ? "verified" : "unverified",
      matchConfidence: cached.matchConfidence ?? null,
      matchReason:
        isVerified
          ? null
          : ((cached.matchEvidence as { reason?: string } | null)?.reason ?? null),
      matchEvidence: cached.matchEvidence ?? null,
      externalSource: cached.externalSource ?? null,
      externalPersonId: cached.externalPersonId ?? null,
      cached: true,
      lastSyncedAt: cached.lastSyncedAt?.toISOString() ?? null,
    };
    const normalized = PersonPreviewSchema.safeParse(profile);
    return Response.json(
      {
        profile: normalized.success ? normalized.data : profile,
      },
      { status: 200 },
    );
  }

  const where =
    role === "director"
      ? { directors: { has: name } }
      : { cast: { has: name } };

  const movies = await prisma.movie.findMany({
    where,
    select: {
      title: true,
      releaseYear: true,
      posterUrl: true,
      reviewScore: true,
    },
    orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }],
    take: 8,
  });

  const knownFor = movies.slice(0, 3).map((movie) => `${movie.title} (${movie.releaseYear})`);
  const strictMatch = await resolveStrictPersonMatch({
    name,
    role,
    knownForFromCatalog: knownFor,
  });

  const avatarUrl = strictMatch.matched ? strictMatch.avatarUrl : null;
  const bio = strictMatch.matched
    ? strictMatch.biography ?? (knownFor.length > 0 ? `${roleLabel[role]}として ${knownFor[0]} などで知られています。` : `${roleLabel[role]}情報はまだ収集中です。`)
    : knownFor.length > 0
      ? `${roleLabel[role]}として ${knownFor[0]} などで知られています。`
      : `${roleLabel[role]}情報はまだ収集中です。`;
  const finalKnownFor = strictMatch.matched ? strictMatch.knownFor : knownFor;

  const news = finalKnownFor.slice(0, 2).map((title, index) => ({
    title: `${name} 関連トピック: ${title}`,
    source: "catalog_digest",
    publishedAt: new Date(now.getTime() - index * 86_400_000).toISOString(),
    url: null,
  }));

  const expiresAt = new Date(now.getTime() + TTL_HOURS * 60 * 60 * 1000);
  const upserted = await prisma.personProfileCache.upsert({
    where: { name_role: { name, role } },
    update: {
      avatarUrl,
      bio,
      knownFor: finalKnownFor,
      news,
      externalSource: strictMatch.matched ? "tmdb" : (cached?.externalSource ?? null),
      externalPersonId: strictMatch.matched ? strictMatch.personId : (cached?.externalPersonId ?? null),
      matchConfidence: strictMatch.matched ? strictMatch.confidence : 0,
      matchEvidence: strictMatch.evidence,
      lastSyncedAt: now,
      expiresAt,
    },
    create: {
      name,
      role,
      avatarUrl,
      bio,
      knownFor: finalKnownFor,
      news,
      externalSource: strictMatch.matched ? "tmdb" : null,
      externalPersonId: strictMatch.matched ? strictMatch.personId : null,
      matchConfidence: strictMatch.matched ? strictMatch.confidence : 0,
      matchEvidence: strictMatch.evidence,
      lastSyncedAt: now,
      expiresAt,
    },
  });

  const profile = {
    name: upserted.name,
    role: upserted.role,
    avatarUrl: upserted.avatarUrl,
    bio: upserted.bio,
    knownFor: upserted.knownFor,
    news: Array.isArray(upserted.news) ? upserted.news : [],
    strictMatched: (upserted.matchConfidence ?? 0) >= 0.8,
    matchStatus: (upserted.matchConfidence ?? 0) >= 0.8 ? "verified" : "unverified",
    matchConfidence: upserted.matchConfidence ?? null,
    matchReason: strictMatch.matched ? null : strictMatch.reason,
    matchEvidence: upserted.matchEvidence ?? null,
    externalSource: upserted.externalSource ?? null,
    externalPersonId: upserted.externalPersonId ?? null,
    cached: false,
    lastSyncedAt: upserted.lastSyncedAt?.toISOString() ?? null,
  };
  const normalized = PersonPreviewSchema.safeParse(profile);

  return Response.json(
    {
      profile: normalized.success ? normalized.data : profile,
    },
    { status: 200 },
  );
}
