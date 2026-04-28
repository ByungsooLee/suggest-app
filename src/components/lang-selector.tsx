"use client";

import { MovieTitleLanguageSwitcher } from "@/components/LanguageSwitcher";

type Props = {
  className?: string;
};

export function LangSelector({ className }: Props) {
  return <MovieTitleLanguageSwitcher className={className} />;
}
