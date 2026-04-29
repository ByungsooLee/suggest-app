import Image from "next/image";
import { Link } from "@/i18n/navigation";

type RecentPoster = {
  id: string;
  title: string;
  posterUrl: string | null;
  movieId: string | null;
};

type Stats = {
  total: number;
  thisMonth: number;
};

type LoggedInProps = {
  recentPosters: RecentPoster[];
  stats: Stats | null;
  recentPicksLabel: string;
  totalLabel: string;
  thisMonthLabel: string;
  unitLabel: string;
  discoverTitle: string;
  discoverProgress: string;
  mbtiTitle: string;
};

export function HomeLoggedInSections({
  recentPosters,
  stats,
  recentPicksLabel,
  totalLabel,
  thisMonthLabel,
  unitLabel,
  discoverTitle,
  discoverProgress,
  mbtiTitle,
}: LoggedInProps) {
  return (
    <>
      {recentPosters.length > 0 && (
        <section style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(240,237,232,0.35)", marginBottom: "12px" }}>
            {recentPicksLabel}
          </p>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "none" }}>
            {recentPosters.map((item) => (
              <Link key={item.id} href={item.movieId ? `/movies/${item.movieId}` : "#"} style={{ flexShrink: 0, textDecoration: "none" }}>
                <div
                  style={{
                    width: "72px",
                    height: "108px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#1a1a1a",
                    border: "1px solid rgba(255,255,255,0.06)",
                    position: "relative",
                  }}
                >
                  {item.posterUrl && <Image src={item.posterUrl} alt={item.title} fill sizes="72px" style={{ objectFit: "cover" }} />}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {stats && stats.total > 0 && (
        <section style={{ marginTop: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {[
              { label: totalLabel, value: stats.total, accent: "#E8C97A" },
              { label: thisMonthLabel, value: stats.thisMonth, accent: "#f0ede8" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: "rgba(240,237,232,0.03)",
                  border: "1px solid rgba(240,237,232,0.06)",
                }}
              >
                <p style={{ fontSize: "11px", color: "rgba(240,237,232,0.35)", margin: "0 0 4px", letterSpacing: "0.08em" }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: "var(--font-dm-serif)", fontSize: "28px", color: item.accent, margin: 0 }}>
                  {item.value}
                  <span style={{ fontSize: "13px", color: "rgba(240,237,232,0.35)", marginLeft: "4px" }}>{unitLabel}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: "20px" }}>
        <HomeShortcutCard
          href="/discover"
          label="DISCOVER"
          title={discoverTitle}
          subtitle={discoverProgress}
          tone="discover"
        />
      </section>

      <section style={{ marginTop: "12px" }}>
        <HomeShortcutCard href="/mbti" label="MBTI" title={mbtiTitle} tone="mbti" />
      </section>
    </>
  );
}

type GuestFeature = {
  icon: string;
  title: string;
  desc: string;
};

type GuestProps = {
  features: GuestFeature[];
  createAccountLabel: string;
};

export function HomeGuestSections({ features, createAccountLabel }: GuestProps) {
  return (
    <section style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {features.map((feature) => (
          <div
            key={feature.title}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(240,237,232,0.03)",
              border: "1px solid rgba(240,237,232,0.06)",
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>{feature.icon}</span>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#f0ede8", margin: "0 0 2px" }}>{feature.title}</p>
              <p style={{ fontSize: "12px", color: "rgba(240,237,232,0.4)", margin: 0 }}>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/login"
        style={{
          display: "block",
          marginTop: "20px",
          padding: "13px",
          borderRadius: "10px",
          background: "rgba(240,237,232,0.06)",
          border: "1px solid rgba(240,237,232,0.1)",
          textAlign: "center",
          color: "rgba(240,237,232,0.6)",
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        {createAccountLabel}
      </Link>
    </section>
  );
}

export function HomeBrowseLink({ label }: { label: string }) {
  return (
    <div style={{ marginTop: "32px", textAlign: "center" }}>
      <Link href="/browse" style={{ fontSize: "13px", color: "rgba(240,237,232,0.3)", textDecoration: "none", letterSpacing: "0.06em" }}>
        {label}
      </Link>
    </div>
  );
}

type ShortcutTone = "discover" | "mbti";

function HomeShortcutCard({
  href,
  label,
  title,
  subtitle,
  tone,
}: {
  href: string;
  label: string;
  title: string;
  subtitle?: string;
  tone: ShortcutTone;
}) {
  const styles =
    tone === "discover"
      ? {
          background: "rgba(127,119,221,0.05)",
          border: "1px solid rgba(127,119,221,0.15)",
          label: "rgba(127,119,221,0.55)",
          title: "#9F99E8",
          subtitle: "rgba(127,119,221,0.45)",
          arrow: "rgba(127,119,221,0.45)",
        }
      : {
          background: "rgba(232,201,122,0.05)",
          border: "1px solid rgba(232,201,122,0.15)",
          label: "rgba(232,201,122,0.5)",
          title: "#E8C97A",
          subtitle: "rgba(232,201,122,0.45)",
          arrow: "rgba(232,201,122,0.45)",
        };

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: "10px",
        textDecoration: "none",
        background: styles.background,
        border: styles.border,
      }}
    >
      <div>
        <p style={{ fontSize: "11px", color: styles.label, margin: "0 0 2px", letterSpacing: "0.08em" }}>{label}</p>
        <p style={{ fontSize: "14px", color: styles.title, margin: 0, fontWeight: 500 }}>{title}</p>
        {subtitle && <p style={{ fontSize: "11px", color: styles.subtitle, margin: "3px 0 0" }}>{subtitle}</p>}
      </div>
      <span style={{ color: styles.arrow, fontSize: "16px" }}>→</span>
    </Link>
  );
}
