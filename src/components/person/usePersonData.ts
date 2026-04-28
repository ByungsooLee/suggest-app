"use client";

import { useEffect, useMemo, useState } from "react";

import type { PersonDetailResponse, PersonRole } from "@/components/person/types";

const personCache = new Map<string, PersonDetailResponse>();

type Options = {
  personId?: string | null;
  tmdbId?: number | null;
  role: PersonRole;
  enabled: boolean;
};

function buildRequestUrl({ personId, tmdbId, role }: Omit<Options, "enabled">) {
  if (personId) {
    return `/api/people/id/${personId}?role=${role}`;
  }
  if (typeof tmdbId === "number") {
    return `/api/people/tmdb/${tmdbId}`;
  }
  return null;
}

export function usePersonData({ personId, tmdbId, role, enabled }: Options) {
  const cacheKey = useMemo(
    () => (personId ? `id:${personId}:${role}` : typeof tmdbId === "number" ? `tmdb:${tmdbId}` : null),
    [personId, role, tmdbId],
  );
  const [state, setState] = useState<{ key: string | null; data: PersonDetailResponse | null }>({
    key: null,
    data: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const cachedData = cacheKey ? personCache.get(cacheKey) ?? null : null;
  const data = state.key === cacheKey ? state.data : null;

  useEffect(() => {
    if (!enabled || !cacheKey) return;

    if (cachedData) return;

    const controller = new AbortController();
    const url = buildRequestUrl({ personId, tmdbId, role });
    if (!url) return;

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null;
        setIsLoading(true);
        setError(null);
        return fetch(url, { signal: controller.signal });
      })
      .then(async (response) => {
        if (!response) return null;
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<PersonDetailResponse>;
      })
      .then(async (response) => {
        if (!response) return;
        const nextData = response as PersonDetailResponse;
        personCache.set(cacheKey, nextData);
        setState({ key: cacheKey, data: nextData });
      })
      .catch((nextError) => {
        if (controller.signal.aborted) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load person.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [cacheKey, cachedData, enabled, personId, role, tmdbId, reloadKey]);

  return {
    data: data ?? cachedData,
    error,
    isLoading,
    retry() {
      if (cacheKey) {
        personCache.delete(cacheKey);
      }
      setReloadKey((value) => value + 1);
    },
  };
}
