"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const LOADING_MESSAGE_COUNT = 5;

export function RecommendLoadingScreen() {
  const t = useTranslations("recommend.loading");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGE_COUNT);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <svg className="film-reel" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="#E8C97A" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="24" cy="24" r="8" stroke="#E8C97A" strokeWidth="1.5" />
        <circle cx="24" cy="8" r="3" fill="#E8C97A" fillOpacity="0.6" />
        <circle cx="24" cy="40" r="3" fill="#E8C97A" fillOpacity="0.6" />
        <circle cx="8" cy="24" r="3" fill="#E8C97A" fillOpacity="0.6" />
        <circle cx="40" cy="24" r="3" fill="#E8C97A" fillOpacity="0.6" />
      </svg>
      <p
        key={messageIndex}
        className="fade-up text-center text-sm"
        style={{ color: "rgba(232,227,216,0.5)" }}
      >
        {t(String(messageIndex))}
      </p>
    </div>
  );
}
