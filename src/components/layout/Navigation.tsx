import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function Navigation() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Check if MBTI is set (for badge)
  const profile = await prisma.userOnboardingProfile.findUnique({
    where: { userId: session.user.id },
    select: { mbtiType: true },
  });
  const mbtiUnset = !profile?.mbtiType;

  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(8,8,8,0.96)", backdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(232,227,216,0.07)",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <NavItem href="/browse" icon="⊞" label="探す" />
      <NavItem href="/techo" icon="📖" label="手帳" />
      <NavItemTonight href="/" />
      <NavItem href="/mypage" icon="○" label="私" badge={mbtiUnset} />
    </nav>
  );
}

function NavItem({ href, icon, label, badge }: { href: string; icon: string; label: string; badge?: boolean }) {
  return (
    <Link
      href={href}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
        textDecoration: "none", color: "rgba(232,227,216,0.4)", padding: "4px 16px",
        fontSize: "10px", letterSpacing: "0.08em",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
      {badge && (
        <span style={{
          position: "absolute", top: "2px", right: "10px",
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#E8C97A", display: "block",
        }} />
      )}
    </Link>
  );
}

function NavItemTonight({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="pulse-gold"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
        textDecoration: "none", color: "#E8C97A", padding: "4px 16px",
        fontSize: "10px", letterSpacing: "0.08em",
        borderRadius: "10px",
      }}
    >
      <span style={{ fontSize: "18px" }}>✦</span>
      <span style={{ fontWeight: 600 }}>今夜</span>
    </Link>
  );
}
