type AvatarFallbackProps = {
  name?: string | null;
  className?: string;
};

function getInitials(name?: string | null) {
  if (!name) return "U";
  const normalized = name.trim();
  if (!normalized) return "U";
  const parts = normalized.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

export function AvatarFallback({ name, className = "" }: AvatarFallbackProps) {
  const initials = getInitials(name);
  return (
    <div
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-sm font-[500] text-[var(--color-text-primary)] ${className}`.trim()}
      aria-label="profile avatar fallback"
    >
      {initials}
    </div>
  );
}
