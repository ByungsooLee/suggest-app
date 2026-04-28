"use client";

import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "映画を探しています...",
  "あなたの気分を分析中...",
  "今夜最適な1本を選んでいます...",
  "MBTIとの相性を確認中...",
  "もうすぐです...",
];

export function RecommendLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
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
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
