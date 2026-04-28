"use client";

import { Link } from "@/i18n/navigation";

import type { PersonDetailResponse, PersonRole } from "@/components/person/types";

const ROLE_LABEL: Record<PersonRole, string> = {
  director: "監督",
  actor: "俳優",
  writer: "脚本",
};

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  role: PersonRole;
  data: PersonDetailResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function PersonBottomSheet({ open, onClose, name, role, data, isLoading, error }: Props) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 80,
          background: "rgba(0,0,0,0.62)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        className="sheet"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          zIndex: 90,
          width: "100%",
          maxWidth: "430px",
          translate: "-50% 0",
          background: "#111111",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(232,227,216,0.08)",
          padding: "0 0 calc(28px + env(safe-area-inset-bottom))",
          maxHeight: "82vh",
          overflowY: "auto",
          boxShadow: "0 -24px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
          <div style={{ width: "38px", height: "4px", borderRadius: "999px", background: "rgba(232,227,216,0.16)" }} />
        </div>

        <div style={{ padding: "8px 20px 0" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "18px",
                overflow: "hidden",
                background: "rgba(232,227,216,0.06)",
                flexShrink: 0,
              }}
            >
              {data?.person.avatarUrl ? (
                <img src={data.person.avatarUrl} alt={data.person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "rgba(232,227,216,0.4)", fontSize: "24px" }}>
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(232,227,216,0.35)", margin: "2px 0 6px" }}>
                {ROLE_LABEL[role]}
              </p>
              <h3 style={{ fontSize: "21px", color: "#f0ede8", margin: 0, lineHeight: 1.2 }}>
                {data?.person.name ?? name}
              </h3>
              {data?.person.knownForDepartment && (
                <p style={{ fontSize: "12px", color: "#E8C97A", margin: "6px 0 0" }}>
                  {data.person.knownForDepartment}
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {isLoading && (
              <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.45)", margin: 0 }}>
                人物情報を読み込み中...
              </p>
            )}

            {error && !isLoading && (
              <p style={{ fontSize: "13px", color: "rgba(216,90,48,0.85)", margin: 0 }}>
                人物情報を読み込めませんでした
              </p>
            )}

            {!isLoading && !error && (
              <>
                {data?.person.biography && (
                  <p style={{ fontSize: "13px", color: "rgba(232,227,216,0.7)", lineHeight: 1.7, margin: 0 }}>
                    {data.person.biography}
                  </p>
                )}

                {(data?.person.knownFor?.length ?? 0) > 0 && (
                  <div>
                    <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.35)", margin: "0 0 8px" }}>
                      代表作
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {data!.person.knownFor.slice(0, 4).map((title) => (
                        <span
                          key={title}
                          style={{
                            fontSize: "12px",
                            color: "rgba(232,227,216,0.7)",
                            borderRadius: "999px",
                            border: "1px solid rgba(232,227,216,0.1)",
                            padding: "5px 10px",
                          }}
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(data?.credits?.length ?? 0) > 0 && (
                  <div>
                    <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(232,227,216,0.35)", margin: "0 0 8px" }}>
                      最近の関連作品
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {data!.credits!.slice(0, 4).map((credit) => (
                        <Link
                          key={`${credit.movieId}-${credit.role}`}
                          href={`/movies/${credit.movieId}`}
                          onClick={onClose}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            textDecoration: "none",
                            color: "#f0ede8",
                            padding: "10px 12px",
                            borderRadius: "12px",
                            background: "rgba(232,227,216,0.04)",
                          }}
                        >
                          <span style={{ fontSize: "13px" }}>{credit.movieTitle}</span>
                          <span style={{ fontSize: "12px", color: "rgba(232,227,216,0.4)", flexShrink: 0 }}>{credit.releaseYear}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {role !== "writer" && (
                  <Link
                    href={`/people/${encodeURIComponent(name)}?role=${role}`}
                    onClick={onClose}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "rgba(232,201,122,0.12)",
                      border: "1px solid rgba(232,201,122,0.35)",
                      color: "#E8C97A",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    人物ページを見る
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
