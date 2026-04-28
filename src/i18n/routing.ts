import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "ko"],
  defaultLocale: "ja",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
