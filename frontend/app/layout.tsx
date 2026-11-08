import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteBackground from "@/components/SiteBackground";
import SiteSplash from "@/components/SiteSplash";
import RouteViewport from "@/components/RouteViewport";
import { getGames } from "@/lib/games";
import { siteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl() ? new URL(siteUrl()!) : undefined,
  title: { default: "TKPkpin | Game Việt Hóa", template: "%s | TKPkpin" },
  description: "Kho game Việt hóa và hướng dẫn cài đặt dành cho cộng đồng game thủ Việt.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const games = await getGames().catch(() => []);
  const hottestGame = games
    .filter((game) => game.background_image || game.image)
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))[0];
  const backgroundImage = hottestGame?.background_image ?? hottestGame?.image;

  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <SiteBackground image={backgroundImage} name={hottestGame?.name} />
        <SiteSplash />
        <Header />
        <RouteViewport>{children}</RouteViewport>
        <Footer />
      </body>
    </html>
  );
}
