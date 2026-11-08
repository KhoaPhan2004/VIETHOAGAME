import GameDownloadButton from "@/components/GameDownloadButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import GameCardCoverImage from "@/components/GameCardCoverImage";
import GameDetailGallery from "@/components/GameDetailGallery";
import GameBackgroundSetter from "@/components/GameBackgroundSetter";
import { getGame, getGames } from "@/lib/games";
import { categoryNames } from "@/lib/game-categories";
import { getGameVideo } from "@/lib/game-video";
import type { Game } from "@/types/game";
import "./game-detail.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const game = await getGame((await params).slug);
  if (!game) return { title: "Không tìm thấy game", robots: { index: false } };
  return { title: game.name, description: game.description?.slice(0, 160) ?? ("Bản Việt hóa " + game.name + ", hướng dẫn cài đặt và tải về.") };
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [game, games] = await Promise.all([getGame(slug), getGames()]);
  if (!game) notFound();
  const progress = Math.max(0, Math.min(100, game.translation_progress ?? (game.is_downloadable ? 100 : 0)));
  const translating = game.is_downloadable === false || progress < 100;
  const names = categoryNames(game);
  const candidates = games.filter((item) => item.id !== game.id && item.slug !== game.slug);
  const related = candidates.filter((item) => categoryNames(item).some((name) => names.includes(name))).slice(0, 3);
  const newest = [...candidates].sort((a, b) => gameTime(b) - gameTime(a)).slice(0, 3);
  const popular = [...candidates].sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0) || gameTime(b) - gameTime(a)).slice(0, 3);
  const gallery = [...new Set((game.gallery_images ?? []).filter(Boolean))];
  const hero = game.background_image ?? game.image ?? gallery[0];
  const video = getGameVideo(game.video_url);
  const canDownload = !translating && Boolean(game.download_url);

  return (
    <>

      <GameBackgroundSetter image={hero} name={game.name} />
      <main className="page-shell gd-page">
        <article className="gd-shell">
          <div className="footer-snow gd-snow" aria-hidden="true">
            {Array.from({ length: 56 }, (_, index) => (
              <span key={index} style={{
                "--snow-left": `${(index * 37 + 3) % 100}%`,
                "--snow-size": `${2 + index % 3}px`,
                "--snow-duration": `${36 + index % 23}s`,
                "--snow-delay": `${-(index * 13 % (36 + index % 23))}s`,
                "--snow-drift": `${index % 2 ? -22 : 26}px`,
              } as CSSProperties} />
            ))}
          </div>
          <nav className="gd-breadcrumb" aria-label="Đường dẫn"><Link href="/games">Thư viện game</Link><span aria-hidden="true">/</span><span>Chi tiết game</span></nav>
          <section className="gd-hero" aria-labelledby="gd-title">
            <div className="gd-cover"><GameCardCoverImage image={game.image ?? hero ?? null} name={game.name} /></div>
            <div className="gd-hero-copy">
              <p className="eyebrow">TKPkpin · Bản Việt hóa</p>
              <h1 id="gd-title">{game.name}</h1>
              <dl className="gd-meta">
                <div><dt>Phiên bản</dt><dd>{game.version || "Đang cập nhật"}</dd></div>
                <div><dt>Dung lượng</dt><dd>{game.file_size || "Đang cập nhật"}</dd></div>
                <div><dt>Cập nhật</dt><dd>{formatDate(game.updated_at ?? game.created_at)}</dd></div>
                <div><dt>Lượt tải</dt><dd>{new Intl.NumberFormat("vi-VN").format(game.download_count ?? 0)}</dd></div>
              </dl>
              <div className="gd-actions">
                {canDownload ? <GameDownloadButton slug={game.slug} className="button button-primary">Tải bản Việt hóa <span aria-hidden="true">↓</span></GameDownloadButton>
                  : <span className="gd-status">{translating ? "Chưa mở tải" : "Link tải đang cập nhật"}</span>}
                <a href="#gd-guide" className="gd-guide-link">Hướng dẫn cài đặt <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </section>

          <div className="gd-layout">
            <div className="gd-content">
              <section className="gd-section" aria-labelledby="gd-description-title">
                <p className="gd-kicker">01 / Khám phá game</p>
                <h2 id="gd-description-title">Mô tả game</h2>
                <div className="gd-prose">{game.description?.trim() || "Mô tả của game đang được cập nhật."}</div>
              </section>

              <section className="gd-section" aria-labelledby="gd-video-title">
                <p className="gd-kicker">02 / Xem trước</p>
                <h2 id="gd-video-title">Video giới thiệu</h2>
                {video?.kind === "embed" ? <div className="gd-video"><iframe src={video.url} title={`Video giới thiệu ${game.name}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
                  : video?.kind === "file" ? <div className="gd-video"><video controls preload="metadata" poster={hero ?? undefined} aria-label={`Video giới thiệu ${game.name}`}><source src={video.url} /><track kind="captions" />Trình duyệt không hỗ trợ phát video. <a href={video.url}>Mở video</a></video></div>
                  : video ? <div className="gd-empty"><p>Khám phá lối chơi và thế giới của {game.name} qua video.</p><a className="button button-secondary" href={video.url} target="_blank" rel="noreferrer">Xem video ↗</a></div>
                  : <p className="gd-empty">Video giới thiệu của game đang được cập nhật.</p>}
              </section>

              <section className="gd-section" aria-labelledby="gd-gallery-title">
                <p className="gd-kicker">03 / Trong thế giới game</p>
                <h2 id="gd-gallery-title">Hình ảnh game</h2>
                <GameDetailGallery images={gallery.length ? gallery : hero ? [hero] : []} name={game.name} />
              </section>

              <section className="gd-section gd-installation" id="gd-guide" aria-labelledby="gd-guide-title">
                <p className="gd-kicker">04 / Bắt đầu chơi</p>
                <h2 id="gd-guide-title">Hướng dẫn cài đặt</h2>
                {translating ? <div className="gd-progress"><div><span>{game.translation_stage || "Tiến độ Việt hóa"}</span><strong>{progress}%</strong></div><meter min="0" max="100" value={progress}>{progress}%</meter><p>Bản Việt hóa chưa mở tải. Bạn có thể theo dõi tiến độ và quay lại khi bản dịch hoàn tất.</p></div> : null}
                <div className="gd-prose">{game.installation_guide?.trim() || "Hướng dẫn cài đặt cho game này đang được cập nhật."}</div>
                {canDownload ? <GameDownloadButton slug={game.slug} className="button button-primary gd-download-bottom">Tải bản Việt hóa ↓</GameDownloadButton> : null}
              </section>
            </div>

            <aside className="gd-sidebar" aria-label="Khám phá thêm game">
              <section className="gd-side-section" aria-labelledby="gd-categories-title">
                <h2 id="gd-categories-title">Thể loại game</h2>
                <div className="gd-tags">
                  {game.categories?.length ? game.categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`}>{category.name}</Link>)
                    : names.length ? names.map((name) => <Link key={name} href={`/games?category=${encodeURIComponent(name)}`}>{name}</Link>) : <p className="gd-side-empty">Chưa phân loại.</p>}
                </div>
              </section>
              <SidebarGames title="Game cùng thể loại" games={related} empty="Chưa có game cùng thể loại." />
              <SidebarGames title="Game mới" games={newest} reverse />
              <SidebarGames title="Game tải nhiều" games={popular} downloads />
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}

function SidebarGames({ title, games, reverse = false, downloads = false, empty = "Chưa có game để hiển thị." }: { title: string; games: Game[]; reverse?: boolean; downloads?: boolean; empty?: string }) {
  return <section className="gd-side-section" aria-label={title}><h2>{title}</h2>
    {games.length ? <ul className={`gd-side-games ${reverse ? "gd-side-reverse" : ""}`}>{games.map((game) => <li key={game.id}>
      <Link href={`/games/${game.slug}`}><div className="gd-side-cover"><GameCardCoverImage image={game.image} name={game.name} /></div><div className="gd-side-copy"><h3>{game.name}</h3><span>{downloads ? `${new Intl.NumberFormat("vi-VN").format(game.download_count ?? 0)} lượt tải` : game.version || "Bản Việt hóa"}</span></div></Link>
    </li>)}</ul> : <p className="gd-side-empty">{empty}</p>}
  </section>;
}

function formatDate(value: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function gameTime(game: Game) {
  return Date.parse(game.published_at ?? game.created_at ?? "") || 0;
}
