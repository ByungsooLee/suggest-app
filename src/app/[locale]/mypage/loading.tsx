import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function LoadingMyPage() {
  return (
    <PageLoadingSkeleton
      maxWidth="2xl"
      blocks={[
        { height: "h-8", width: "w-40" },
        { height: "h-20" },
        { height: "h-72" },
      ]}
    />
  );
}
