import { Link } from "@/i18n/navigation";

type MovieProfileData = { totalSwipes: number; personalityLabel: string | null };

export function MyPageShortcutLinks({
  movieProfile,
  mbtiLabel,
  personalityProgressLabel,
}: {
  movieProfile: MovieProfileData | null;
  mbtiLabel: string;
  personalityProgressLabel: (remaining: number) => string;
}) {
  return (
    <>
      {movieProfile && (
        <ShortcutCard
          href="/discover"
          label="DISCOVER"
          tone="discover"
          title={
            movieProfile.personalityLabel
              ? `✦ ${movieProfile.personalityLabel}`
              : personalityProgressLabel(Math.max(0, 100 - movieProfile.totalSwipes))
          }
        />
      )}

      <ShortcutCard href="/mbti" label="MBTI" tone="mbti" title={mbtiLabel} />
    </>
  );
}

function ShortcutCard({
  href,
  label,
  title,
  tone,
}: {
  href: string;
  label: string;
  title: string;
  tone: "discover" | "mbti";
}) {
  const styles =
    tone === "discover"
      ? {
          background: "rgba(127,119,221,0.05)",
          border: "1px solid rgba(127,119,221,0.15)",
          label: "rgba(127,119,221,0.55)",
          title: "#9F99E8",
          arrow: "rgba(127,119,221,0.45)",
        }
      : {
          background: "rgba(232,201,122,0.06)",
          border: "1px solid rgba(232,201,122,0.2)",
          label: "rgba(232,227,216,0.4)",
          title: "#E8C97A",
          arrow: "rgba(232,201,122,0.5)",
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
        <p style={{ fontSize: "11px", letterSpacing: "0.08em", color: styles.label, margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: "14px", color: styles.title, margin: 0, fontWeight: 500 }}>{title}</p>
      </div>
      <span style={{ fontSize: "18px", color: styles.arrow }}>→</span>
    </Link>
  );
}
