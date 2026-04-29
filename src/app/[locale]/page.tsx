import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { HomeBrowseLink, HomeGuestSections, HomeLoggedInSections } from "@/components/home/HomeContentSections";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMoodChips } from "@/components/home/HomeMoodChips";

export default async function Home() {
  const t = await getTranslations("home");
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  // Fetch personalized data for logged-in users
  let recentPosters: { id: string; title: string; posterUrl: string | null; movieId: string | null }[] = [];
  let stats: { total: number; thisMonth: number } | null = null;
  let discoverTotalSwipes = 0;

  if (session?.user?.id) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [recent, total, thisMonth, movieProfile] = await Promise.all([
      prisma.userWatchedContent.findMany({
        where: { userId: session.user.id, contentType: "movie", posterUrl: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, posterUrl: true, movieId: true },
      }),
      prisma.userWatchedContent.count({
        where: { userId: session.user.id, contentType: "movie", watched: true },
      }),
      prisma.userWatchedContent.count({
        where: { userId: session.user.id, contentType: "movie", watched: true, watchedAt: { gte: startOfMonth } },
      }),
      prisma.userMovieProfile.findUnique({
        where: { userId: session.user.id },
        select: { totalSwipes: true },
      }),
    ]);
    recentPosters = recent;
    stats = { total, thisMonth };
    discoverTotalSwipes = movieProfile?.totalSwipes ?? 0;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080808", paddingBottom: "96px" }}>
      <HomeHero
        isLoggedIn={isLoggedIn}
        title={t("tagline")}
        subtitle={t("sub")}
        cta={t("cta")}
        guestCta={t("ctaGuest")}
        ctaSub={t("ctaSub")}
        alreadyHaveAccount={t("alreadyHaveAccount")}
        loginLabel={t("login")}
      />

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 20px" }}>
        <HomeMoodChips isLoggedIn={isLoggedIn} />

        {isLoggedIn ? (
          <HomeLoggedInSections
            recentPosters={recentPosters}
            stats={stats}
            recentPicksLabel={t("recentPicks")}
            totalLabel={t("stats.total")}
            thisMonthLabel={t("stats.thisMonth")}
            unitLabel={t("stats.unit")}
            discoverTitle={t("discoverCardTitle")}
            discoverProgress={t("discoverProgress", { current: discoverTotalSwipes })}
            mbtiTitle={t("mbtiCardTitle")}
          />
        ) : (
          <HomeGuestSections
            createAccountLabel={t("createAccount")}
            features={[
              { icon: "🎯", title: t("guestFeatures.mood.title"), desc: t("guestFeatures.mood.desc") },
              { icon: "⚡", title: t("guestFeatures.steps.title"), desc: t("guestFeatures.steps.desc") },
              { icon: "🧠", title: t("guestFeatures.mbti.title"), desc: t("guestFeatures.mbti.desc") },
            ]}
          />
        )}

        <HomeBrowseLink label={t("browseLink")} />
      </div>
    </main>
  );
}
