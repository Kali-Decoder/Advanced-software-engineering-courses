import type { Metadata } from "next";
import { Crimson_Pro, Source_Sans_3 } from "next/font/google";
import { NavigationProgress } from "@/components/loading/NavigationProgress";
import { ProgressProvider } from "@/context/ProgressContext";
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
  title: "Engineering Courses — Academic Course Platform",
  description:
    "Structured courses on AI agent memory systems and advanced backend & distributed systems engineering.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimson.variable} ${sourceSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-neutral-950 antialiased">
        <ProgressProvider>
          <NavigationProgress />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
