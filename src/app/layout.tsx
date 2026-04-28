import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "500"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Movie Tonight MVP",
  description: "Decide tonight's pick quickly with personalized recommendations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const htmlLang = cookieLocale === "en" || cookieLocale === "ko" || cookieLocale === "ja" ? cookieLocale : "ja";

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-[var(--color-bg-void)] text-[var(--color-text-primary)]">
        {process.env.NODE_ENV === "development" && (
          <Script
            id="strip-cursor-browser-refs"
            src="/strip-cursor-browser-refs.js"
            strategy="beforeInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}
