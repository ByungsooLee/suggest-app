import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { PersonBioSection } from "./person-bio-section";

type PersonRole = "director" | "actor";

function isPersonRole(value: string | null | undefined): value is PersonRole {
  return value === "director" || value === "actor";
}

const roleLabel: Record<PersonRole, string> = {
  director: "監督",
  actor: "俳優",
};

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { name: rawName } = await params;
  const { role: roleParam } = await searchParams;
  const name = decodeURIComponent(rawName).trim();
  const role: PersonRole = isPersonRole(roleParam) ? roleParam : "director";

  const cached = await prisma.personProfileCache.findUnique({
    where: { name_role: { name, role } },
  });

  const now = new Date();
  const hasCacheHit = Boolean(cached && cached.expiresAt > now);
  const isVerified = hasCacheHit && (cached?.matchConfidence ?? 0) >= 0.8;
  const initialAvatarUrl = isVerified ? (cached?.avatarUrl ?? null) : null;
  const initialBio = hasCacheHit ? (cached?.bio ?? null) : null;

  const movies = await prisma.movie.findMany({
    where: role === "director" ? { directors: { has: name } } : { cast: { has: name } },
    orderBy: [{ reviewScore: "desc" }, { releaseYear: "desc" }],
    take: 10,
    select: { id: true, title: true, releaseYear: true, reviewScore: true },
  });

  return (
    <main className="film-grain min-h-screen bg-[var(--color-bg-void)]">
      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Label */}
        <p className="credits-label mb-6 text-center">{roleLabel[role]}</p>

        {/* Name */}
        <h1 className="credits-name-lg mb-2 text-center">{name}</h1>

        <div className="credits-divider my-10" />

        {/* Bio section (Task 4) */}
        <PersonBioSection
          name={name}
          role={role}
          initialBio={initialBio}
          initialAvatarUrl={initialAvatarUrl}
          hasCacheHit={hasCacheHit}
        />

        {/* Filmography */}
        {movies.length > 0 && (
          <>
            <div className="credits-divider mb-10" />
            <section className="credits-section mb-10">
              <p className="credits-label mb-6">Filmography</p>
              <div className="space-y-4">
                {movies.map((m) => (
                  <Link
                    key={m.id}
                    href={`/movies/${m.id}`}
                    className="credits-name block text-base transition hover:text-[var(--color-accent)]"
                  >
                    {m.title}
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                      {m.releaseYear}
                      {m.reviewScore != null && ` · ${m.reviewScore.toFixed(1)}`}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Nav */}
        <div className="credits-divider mb-8" />
        <nav className="flex justify-center gap-6">
          <Link href="/browse" className="credits-label transition hover:text-[var(--color-text-primary)]">
            ← Browse
          </Link>
          <Link href="/discover" className="credits-label transition hover:text-[var(--color-text-primary)]">
            Discover →
          </Link>
        </nav>
      </div>
    </main>
  );
}
