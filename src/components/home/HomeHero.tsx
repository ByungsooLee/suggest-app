import { Link } from "@/i18n/navigation";

type Props = {
  isLoggedIn: boolean;
  title: string;
  subtitle: string;
  cta: string;
  guestCta: string;
  ctaSub: string;
  alreadyHaveAccount: string;
  loginLabel: string;
};

export function HomeHero({
  isLoggedIn,
  title,
  subtitle,
  cta,
  guestCta,
  ctaSub,
  alreadyHaveAccount,
  loginLabel,
}: Props) {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(40px, 10vw, 80px) 20px clamp(32px, 8vw, 60px)",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,201,122,0.07) 0%, transparent 70%)",
        }}
      />
      <div style={{ position: "relative", maxWidth: "560px", margin: "0 auto", width: "100%" }}>
        <p style={{ fontSize: "11px", letterSpacing: "0.14em", color: "rgba(232,201,122,0.6)", marginBottom: "16px" }}>
          MOVIE TONIGHT
        </p>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "clamp(2.2rem, 7vw, 3.6rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#f0ede8",
            marginBottom: "16px",
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: "15px", color: "rgba(240,237,232,0.5)", lineHeight: 1.65, marginBottom: "28px", maxWidth: "380px" }}>
          {subtitle}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
          <Link
            href={isLoggedIn ? "/recommend" : "/login"}
            className="pulse-gold btn-bounce"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "14px 28px",
              borderRadius: "12px",
              background: "#E8C97A",
              color: "#080808",
              fontWeight: 700,
              fontSize: "15px",
              letterSpacing: "0.04em",
              textDecoration: "none",
            }}
          >
            {isLoggedIn ? cta : guestCta}
          </Link>
          <p style={{ fontSize: "11px", color: "rgba(240,237,232,0.3)", letterSpacing: "0.06em" }}>{ctaSub}</p>
        </div>
        {!isLoggedIn && (
          <p style={{ marginTop: "16px", fontSize: "13px", color: "rgba(240,237,232,0.4)" }}>
            {alreadyHaveAccount}{" "}
            <Link href="/login" style={{ color: "#E8C97A", textDecoration: "none" }}>
              {loginLabel}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
