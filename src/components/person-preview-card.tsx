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
    <div className={`w-[320px] rounded-2xl border border-violet-400/30 bg-zinc-950 p-4 shadow-xl ${mobile ? "w-full" : ""}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full bg-zinc-800">
            {data?.avatarUrl ? (
              <Image src={data.avatarUrl} alt={data.name} width={56} height={56} className="h-14 w-14 object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">No Image</div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{data?.name ?? "読み込み中..."}</p>
            <p className="text-xs text-zinc-400">{data ? (data.role === "director" ? "監督" : "俳優") : ""}</p>
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">
            閉じる
          </button>
        ) : null}
      </div>

      {loading ? <p className="text-xs text-zinc-400">プロフィールを取得中...</p> : null}
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}

      {!loading && !error && data ? (
        <div className="space-y-3">
          <p className="text-xs text-zinc-300">{data.bio ?? "プロフィール情報がまだありません。"}</p>
          <div>
            <p className="text-[11px] font-semibold text-zinc-200">代表作</p>
            {data.knownFor.length > 0 ? (
              <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                {data.knownFor.slice(0, 3).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">代表作情報がまだありません。</p>
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-200">最近の話題</p>
            {data.news.length > 0 ? (
              <ul className="mt-1 space-y-1 text-xs text-zinc-300">
                {data.news.slice(0, 2).map((news) => (
                  <li key={`${news.title}-${news.publishedAt}`}>- {news.title}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">ニュースは取得できませんでした。</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
