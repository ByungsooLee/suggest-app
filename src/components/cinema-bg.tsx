"use client";

type Props = {
  titles: string[];
};

export function CinemaBg({ titles }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <div
        className="credits-roll-active"
        style={{ "--roll-duration": "240s" } as React.CSSProperties}
      >
        {[...titles, ...titles].map((title, i) => (
          <p
            key={i}
            className="py-3 text-center"
            style={{
              fontFamily: "var(--font-dm-serif)",
              fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
              opacity: 0.07,
              color: "var(--color-text-primary)",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </p>
        ))}
      </div>
    </div>
  );
}
