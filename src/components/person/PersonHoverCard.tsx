"use client";

import { Link } from "@/i18n/navigation";

import type { PersonDetailResponse, PersonRole } from "@/components/person/types";

const ROLE_LABEL: Record<PersonRole, string> = {
  director: "監督",
  actor: "俳優",
  writer: "脚本",
};

type Props = {
  name: string;
  role: PersonRole;
  data: PersonDetailResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function PersonHoverCard({ name, role, data, isLoading, error }: Props) {
  const canOpenPage = role !== "writer";

  return (
    <div
      className="hcard-in"
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        left: 0,
        zIndex: 90,
        width: "min(320px, calc(100vw - 32px))",
        borderRadius: "16px",
        border: "1px solid rgba(232,227,216,0.1)",
        background: "rgba(17,17,17,0.98)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        padding: "14px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            overflow: "hidden",
            background: "rgba(232,227,216,0.06)",
            flexShrink: 0,
          }}
        >
          {data?.person.avatarUrl ? (
            <img src={data.person.avatarUrl} alt={data.person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "rgba(232,227,216,0.4)", fontSize: "18px" }}>
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(232,227,216,0.35)", margin: "0 0 4px" }}>
            {ROLE_LABEL[role]}
          </p>
          <p style={{ fontSize: "16px", color: "#f0ede8", margin: 0, lineHeight: 1.25 }}>
            {data?.person.name ?? name}
          </p>
          {data?.person.knownForDepartment && (
            <p style={{ fontSize: "11px", color: "rgba(232,201,122,0.8)", margin: "6px 0 0" }}>
              {data.person.knownForDepartment}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {isLoading && (
          <p style={{ fontSize: "12px", color: "rgba(232,227,216,0.45)", margin: 0 }}>
            人物情報を読み込み中...
          </p>
        )}

        {error && !isLoading && (
          <p style={{ fontSize: "12px", color: "rgba(216,90,48,0.85)", margin: 0 }}>
            人物情報を読み込めませんでした
          </p>
        )}

        {!isLoading && !error && (
          <>
            {data?.person.biography && (
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(232,227,216,0.68)",
                  lineHeight: 1.6,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {data.person.biography}
              </p>
            )}

            {(data?.person.knownFor?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(232,227,216,0.3)", margin: "0 0 6px" }}>
                  KNOWN FOR
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data!.person.knownFor.slice(0, 3).map((title) => (
                    <span
                      key={title}
                      style={{
                        fontSize: "11px",
                        color: "rgba(232,227,216,0.68)",
                        borderRadius: "999px",
                        border: "1px solid rgba(232,227,216,0.1)",
                        padding: "4px 8px",
                      }}
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(data?.collaborators?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(232,227,216,0.3)", margin: "0 0 6px" }}>
                  COLLABORATORS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data!.collaborators!.slice(0, 4).map((collaborator) => (
                    <span
                      key={collaborator.id}
                      style={{
                        fontSize: "11px",
                        color: "rgba(232,201,122,0.82)",
                        background: "rgba(232,201,122,0.08)",
                        borderRadius: "999px",
                        padding: "4px 8px",
                      }}
                    >
                      {collaborator.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {canOpenPage && (
              <div style={{ paddingTop: "2px" }}>
                <Link
                  href={`/people/${encodeURIComponent(name)}?role=${role}`}
                  style={{ fontSize: "12px", color: "#E8C97A", textDecoration: "none" }}
                >
                  人物ページを見る →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
