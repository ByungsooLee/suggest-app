import { PageLoadingSkeleton } from "@/components/ui/page-loading-skeleton";

export default function LoadingTasteProfilePage() {
  return (
    <PageLoadingSkeleton
      blocks={[
        { height: "h-8", width: "w-64" },
        { height: "h-48" },
      ]}
    />
  );
}
