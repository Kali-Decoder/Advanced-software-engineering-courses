import type { Metadata } from "next";
import { Crimson_Pro, Source_Sans_3 } from "next/font/google";
import { ProgressProvider } from "@/context/ProgressContext";
import { COURSE_META } from "@/lib/course";
import "./globals.css";

const crimson = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${COURSE_META.title} — Academic Course`,
  description: COURSE_META.subtitle,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimson.variable} ${sourceSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-neutral-950 antialiased">
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
