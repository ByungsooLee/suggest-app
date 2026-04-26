export function isUnknownUseFavoritesFieldError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("useFavoritesInRecommendations") &&
    (error.message.includes("Unknown field") || error.message.includes("Unknown argument"))
  );
}

export function isMissingUserWatchedContentTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("UserWatchedContent") &&
    (error.message.includes("does not exist") || error.message.includes("P2021") || error.message.includes("P2022"))
  );
}

export function isMissingUserWatchlistTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("UserWatchlistItem") &&
    (error.message.includes("does not exist") || error.message.includes("P2021") || error.message.includes("P2022"))
  );
}
