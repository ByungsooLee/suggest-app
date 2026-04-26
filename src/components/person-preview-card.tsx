import Image from "next/image";

type NewsItem = {
  title: string;
  source: string;
  publishedAt: string;
  url: string | null;
};

type PersonPreviewData = {
  name: string;
  role: "director" | "actor";
  avatarUrl: string | null;
  bio: string | null;
  knownFor: string[];
  news: NewsItem[];
  strictMatched?: boolean;
  matchStatus?: "verified" | "unverified";
  matchConfidence?: number | null;
  matchReason?: string | null;
};

type PersonPreviewCardProps = {
  data: PersonPreviewData | null;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
  mobile?: boolean;
};

export function PersonPreviewCard({ data, loading, error, onClose, mobile = false }: PersonPreviewCardProps) {
  return (
    <div
      className={`w-[320px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 ${
        mobile ? "w-full" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
            {data?.avatarUrl ? (
              <Image src={data.avatarUrl} alt={data.name} width={56} height={56} className="h-14 w-14 object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--color-text-muted)]">No Image</div>
            )}
          </div>
          <div>
            <p className="text-sm font-[500] text-[var(--color-text-primary)]">{data?.name ?? "読み込み中..."}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{data ? (data.role === "director" ? "監督" : "俳優") : ""}</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
          >
            閉じる
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-xs text-[var(--color-text-secondary)]">プロフィールを取得中...</p> : null}
      {error ? <p className="text-xs text-[var(--color-streaming)]">{error}</p> : null}

      {!loading && !error && data ? (
        <div className="space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">{data.bio ?? "プロフィール情報がまだありません。"}</p>
          <div>
            <p className="text-[11px] font-[500] text-[var(--color-text-primary)]">代表作</p>
            {data.knownFor.length > 0 ? (
              <ul className="mt-1 space-y-1 text-xs text-[var(--color-text-secondary)]">
                {data.knownFor.slice(0, 3).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">代表作情報がまだありません。</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-[500] text-[var(--color-text-primary)]">最近の話題</p>
            {data.news.length > 0 ? (
              <ul className="mt-1 space-y-1 text-xs text-[var(--color-text-secondary)]">
                {data.news.slice(0, 2).map((news) => (
                  <li key={`${news.title}-${news.publishedAt}`}>- {news.title}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">ニュースは取得できませんでした。</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
