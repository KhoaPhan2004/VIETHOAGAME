import { StatisticValue } from "@/components/SiteStatistics";
import YouTubeVideoCarousel from "@/components/YouTubeVideoCarousel";
import InProgressGameCard from "@/components/InProgressGameCard";
import GameCardRotator from "@/components/GameCardRotator";
import RandomGamePairs from "@/components/RandomGamePairs";
import Section from "@/components/Section";
import SearchForm from "@/components/SearchForm";
import { getGames } from "@/lib/games";
import { getInProgressGames } from "@/lib/in-progress-games";
import { getTkpkpinVideos, type YouTubeVideo } from "@/lib/youtube";
import type { Game } from "@/types/game";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const [completedGames, inProgressGames, channelVideos] = await Promise.all([
    getGames(),
    getInProgressGames(),
    getTkpkpinVideos(),
  ]);
  const totalDownloads = completedGames.reduce(
    (total, game) => total + (game.download_count ?? 0),
    0,
  );
  const heroStats = [
    { label: "GAME ĐÃ VIỆT HÓA", value: formatNumber(completedGames.length) },
    { label: "LƯỢT TẢI VIỆT HÓA", value: formatNumber(totalDownloads) },
    { label: "TỔNG LƯỢT XEM", value: <StatisticValue field="page_views" /> },
    { label: "ONLINE", value: <StatisticValue field="online" /> },
  ];
  const randomGames = pickDailyRandomGames(completedGames).map(game => ({
    id: game.id, name: game.name, slug: game.slug, image: game.image, background_image: game.background_image,
    version: game.version, updated_at: game.updated_at, created_at: game.created_at, preview_video_url: game.preview_video_url,
    description: game.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 26).join(" ") ?? null,
  }));
  const newestGames = getNewestGames(completedGames, 8);
  const mostDownloadedGames = getMostDownloadedGames(completedGames, 8);
  const youtubeVideos = pickHourlyRandomVideos(channelVideos, 10);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>
            <span>Kho Game Việt Hóa</span>
            <span className="hero-outline-title">Miễn Phí</span>
          </h1>

          <p>
            TKPkpin chia sẻ các bản Việt hóa hoàn toàn miễn phí cho tất cả game
            thủ sử dụng.
          </p>

          <SearchForm />

          <div className="hero-actions">
            <Link href="/games" className="button button-primary">
              Xem game
            </Link>
            <Link href="#huong-dan" className="button button-secondary">
              Hướng dẫn cài đặt
            </Link>
          </div>

          <p className="hero-support">
            Nếu mọi người thấy trải nghiệm tốt, hãy ủng hộ mình bằng cách vào
            <a href="https://www.youtube.com/@tkpkpin"> YouTube đăng ký kênh TKPkpin</a>.
            Đó là một động lực lớn để mình có thể
            tiếp tục làm ra những bản dịch game tốt nhất.
          </p>

          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RandomGamePairs games={randomGames} />

      <Section title="Game việt hóa mới" titleClassName="section-title-display" action={<Link className="section-view-all" href="/games">Xem tất cả <span aria-hidden="true">↗</span></Link>}>
        <GameCardRotator games={newestGames.map(cardData)} />
      </Section>

      <Section title="Tải nhiều" titleClassName="section-title-display" action={<Link className="section-view-all" href="/games?sort=downloads">Xem tất cả <span aria-hidden="true">↗</span></Link>}>
        <GameCardRotator games={mostDownloadedGames.map(cardData)} />
      </Section>

      <Section title="Tiến độ" titleClassName="section-title-display">
        <div className="home-progress-layout">
          <div className="progress-game-list progress-game-list-compact">
            {inProgressGames.slice(0, 3).map((game) => (
              <InProgressGameCard key={game.id} game={game} variant="compact" />
            ))}
          </div>

          <aside className="youtube-promo-card">
            <div className="youtube-promo-brand">
              <Image src="/tkpkpin-youtube-logo.png" alt="TKPkpin" width={76} height={76} loading="eager" />
              <strong>TKPkpin</strong>
            </div>

            <p>
              Đăng ký kênh youtube của mình để có thể cùng giao lưu nói chuyện khi
              mình livestream và theo dõi các bản việt hóa, video Game Việt Hóa mới nhất.
            </p>
          </aside>
        </div>

        <div className="section-action">
          <Link href="/in-progress" className="button button-secondary">
            Xem tất cả tiến độ
          </Link>
        </div>
      </Section>

      {youtubeVideos.length > 0 ? (
        <Section title="Kênh TKPkpin" titleClassName="section-title-display">
          <YouTubeVideoCarousel videos={youtubeVideos} />
        </Section>
      ) : null}

      <section className="feature-band" id="huong-dan">
        <div>
          <p className="eyebrow">Quy trình tải và cài đặt</p>
          <h2>Cài bản Việt hóa cơ bản</h2>
          <p>Mỗi game cũng sẽ có cách việt hóa khác nhau nên hãy vào kênh youtube TKPkpin hoặc chi tiết game đó để xem kỹ</p>
        </div>

        <div className="step-grid">
          <article>
            <span>01</span>
            <h3>Tải bản dịch</h3>
            <p>Tải file Việt hóa, đọc ghi chú tương thích và yêu cầu cài đặt.</p>
          </article>

          <article>
            <span>02</span>
            <h3>Giải nén</h3>
            <p>Dùng các công cụ giải nén file ,giải nén file với pass là TKPkpin.</p>
          </article>

          <article>
            <span>03</span>
            <h3>Sao chép vào game</h3>
            <p>Dán file việt hóa xong, sau đó mở game và kiểm tra ngôn ngữ.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function pickDailyRandomGames(games: Game[]) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const shuffledGames = [...games].sort((firstGame, secondGame) => {
    const firstScore = seededScore(`${today}-${firstGame.id}-${firstGame.slug}`);
    const secondScore = seededScore(`${today}-${secondGame.id}-${secondGame.slug}`);

    return firstScore - secondScore;
  });

  return shuffledGames.slice(0, 8);
}

function getNewestGames(games: Game[], limit: number) {
  return [...games]
    .sort((firstGame, secondGame) => getGameTime(secondGame) - getGameTime(firstGame))
    .slice(0, limit);
}

function getMostDownloadedGames(games: Game[], limit: number) {
  return [...games]
    .sort((firstGame, secondGame) => {
      const downloadDiff =
        (secondGame.download_count ?? 0) - (firstGame.download_count ?? 0);

      return downloadDiff || getGameTime(secondGame) - getGameTime(firstGame);
    })
    .slice(0, limit);
}

function pickHourlyRandomVideos(videos: YouTubeVideo[], limit: number) {
  const currentHour = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
  }).format(new Date());

  return [...videos]
    .sort((firstVideo, secondVideo) => {
      const firstScore = seededScore(`${currentHour}-${firstVideo.id}`);
      const secondScore = seededScore(`${currentHour}-${secondVideo.id}`);

      return firstScore - secondScore;
    })
    .slice(0, limit);
}

function getGameTime(game: Game) {
  const dateValue = game.updated_at ?? game.created_at ?? game.published_at;

  return dateValue ? new Date(dateValue).getTime() : 0;
}

function seededScore(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function cardData(game: Game) {
  const { id, name, slug, image, version, download_count, updated_at, created_at } = game;
  return { id, name, slug, image, version, download_count, updated_at, created_at };
}
