import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Simulateur DCA Crypto — S'investir",
  description:
    "Visualisez l'évolution passée d'un investissement progressif (DCA) sur plus de 7 000 cryptomonnaies, à partir de données de marché historiques. Outil pédagogique.",
  applicationName: "Simulateur Crypto — S'investir",
  // Standalone test/embeddable tool — keep it out of search indexes for now.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${lexend.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
