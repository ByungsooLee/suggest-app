import { getTranslations } from "next-intl/server";
import { getAppUserId } from "@/lib/auth/app-user";
import { prisma } from "@/lib/db/prisma";
import { HomeBrowseLink, HomeLoggedInSections } from "@/components/home/HomeContentSections";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeMoodChips } from "@/components/home/HomeMoodChips";

export default async function Home() {
  const t = await getTranslations("home");
  const userId = await getAppUserId();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [recent, total, thisMonth, movieProfile] = await Promise.all([
    prisma.userWatchedContent.findMany({
      where: { userId, contentType: "movie", posterUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, posterUrl: true, movieId: true },
    }),
    prisma.userWatchedContent.count({
      where: { userId, contentType: "movie", watched: true },
    }),
    prisma.userWatchedContent.count({
      where: { userId, contentType: "movie", watched: true, watchedAt: { gte: startOfMonth } },
    }),
    prisma.userMovieProfile.findUnique({
      where: { userId },
      select: { totalSwipes: true },
    }),
  ]);
  const recentPosters = recent;
  const stats = { total, thisMonth };
  const discoverTotalSwipes = movieProfile?.totalSwipes ?? 0;

  return (
    <main style={{ minHeight: "100vh", background: "#080808", paddingBottom: "96px" }}>
      <HomeHero
        title={t("tagline")}
        subtitle={t("sub")}
        cta={t("cta")}
        ctaSub={t("ctaSub")}
      />

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "0 20px" }}>
        <HomeMoodChips />

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

        <HomeBrowseLink label={t("browseLink")} />
      </div>
    </main>
  );
}
