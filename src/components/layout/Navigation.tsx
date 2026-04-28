import Link from "next/link";
import { auth } from "@/auth";

export async function Navigation() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(14,14,15,0.95)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(232,227,216,0.08)",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <NavItem href="/browse" icon="⊞" label="Browse" />
      <NavItem href="/techo" icon="📖" label="手帳" />
      <NavItem href="/recommend" icon="✦" label="おすすめ" />
      <NavItem href="/mypage" icon="○" label="マイページ" />
    </nav>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
        textDecoration: "none", color: "rgba(232,227,216,0.45)", padding: "4px 16px",
        fontSize: "10px", letterSpacing: "0.08em",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
