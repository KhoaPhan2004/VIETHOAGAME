import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTkpkpinVideos } from "@/lib/youtube";
import AboutMotion from "./AboutMotion";
import "./about.css";

export const metadata: Metadata = {
  title: "Giới thiệu | TKPkpin Việt Hóa Game",
  description: "Tìm hiểu về TKPkpin, mục đích chia sẻ game Việt hóa miễn phí và định hướng phát triển của website.",
};

const channelUrl = "https://www.youtube.com/@tkpkpin";

export default async function AboutPage() {
  const videos = (await getTkpkpinVideos()).slice(0, 3);

  return (
    <main className="page-shell about-page">
      <AboutMotion>
        <header className="about-page-title">
          <p className="eyebrow">TKPkpin · Việt Hóa Game</p>
          <h1>Giới thiệu</h1>
        </header>

        <section className="about-row about-introduction" aria-labelledby="about-intro-title">
          <div className="about-picture about-brand-picture">
            <Image src="/tkpkpin-logo.png" alt="Thế giới game của TKPkpin" width={320} height={320} />
            <span>Chơi game theo cách gần gũi hơn.</span>
          </div>
          <div className="about-copy">
            <p className="about-kicker">01 / Giới thiệu ngắn</p>
            <h2 id="about-intro-title">Một thế giới game.<br />Gần hơn bằng tiếng Việt.</h2>
            <p>Chào bạn, đây là Việt Hóa Game — góc nhỏ của TKPkpin dành cho những ai muốn khám phá game bằng ngôn ngữ quen thuộc của mình.</p>
            <p>Tại đây, mình chia sẻ các bản Việt hóa miễn phí, hướng dẫn cài đặt và cập nhật tiến độ những tựa game đang dịch. Hy vọng mỗi bản dịch sẽ giúp bạn hiểu câu chuyện, theo kịp lời thoại và tận hưởng chuyến phiêu lưu trọn vẹn hơn.</p>
          </div>
        </section>

        <section className="about-purpose about-copy" aria-labelledby="about-purpose-title">
          <p className="about-kicker">02 / Mục đích</p>
          <h2 id="about-purpose-title">Để ngôn ngữ không cản bước khám phá.</h2>
          <p>Có những tựa game khiến chúng ta muốn ở lại thật lâu, nhưng rào cản ngôn ngữ đôi khi làm trải nghiệm bị ngắt quãng. Mình xây dựng website này để việc tìm bản Việt hóa, xem hướng dẫn và theo dõi dự án trở nên đơn giản hơn, tập trung tại một nơi.</p>
          <p>Mỗi bản dịch là một cách chia sẻ niềm vui chơi game. Bạn có thể tìm một tựa game yêu thích, cài đặt theo hướng dẫn và bắt đầu hành trình của mình.</p>
        </section>

        <section className="about-row about-developer" aria-labelledby="about-developer-title">
          <div className="about-picture about-developer-picture">
            <Image src="/tkpkpin-youtube-logo.png" alt="Ảnh đại diện TKPkpin" width={240} height={240} />
            <strong>TKPkpin</strong>
            <span>Người đứng sau dự án</span>
          </div>
          <div className="about-copy">
            <p className="about-kicker">03 / Người phát triển</p>
            <h2 id="about-developer-title">Từ một người thích game,<br />gửi đến những người cùng sở thích.</h2>
            <p>Mình là TKPkpin. Website này là nơi mình tập hợp các bản Việt hóa và chia sẻ những trải nghiệm chơi game với mọi người.</p>
            <p>Bên cạnh các bản dịch, mình còn đăng video hướng dẫn và livestream trên YouTube. Những góp ý, báo lỗi hay lời động viên của bạn đều là động lực để mình tiếp tục hoàn thiện dự án.</p>
            <a className="about-text-link" href={channelUrl} target="_blank" rel="noreferrer">Gặp mình trên YouTube <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="about-principles" aria-labelledby="about-values-title">
          <div className="about-values-heading">
            <p className="about-kicker">04 / Nguyên tắc & định hướng</p>
            <h2 id="about-values-title">Những điều mình hướng tới.</h2>
          </div>
          <div className="about-values-layout">
            <div className="about-copy">
              <h3>Miễn phí & dễ tiếp cận</h3>
              <p>Chia sẻ các bản Việt hóa miễn phí, trình bày thông tin dễ hiểu và hướng dẫn cài đặt rõ ràng để bạn thuận tiện bắt đầu.</p>
              <h3>Tôn trọng tác phẩm gốc</h3>
              <p>Hướng tới bản dịch truyền tải được nội dung và tinh thần của game. Khuyến khích bạn ủng hộ nhà phát triển bằng cách sở hữu game bản quyền.</p>
            </div>
            <div className="about-picture about-compass" aria-hidden="true">
              <svg viewBox="0 0 200 220" fill="none">
                <circle cx="100" cy="100" r="72" stroke="currentColor" strokeOpacity=".25" />
                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeDasharray="2 9" />
                <path d="m126 55-12 58-40 32 12-58 40-32Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" />
                <path d="m126 55-26 45-14-13 40-32Z" fill="currentColor" />
                <circle cx="100" cy="100" r="5" fill="currentColor" />
                <path d="M100 18V8M100 182v10M18 100H8M182 100h10" stroke="currentColor" />
                <text x="100" y="216" textAnchor="middle" fill="currentColor" fontSize="10" letterSpacing="3">CÙNG MỘT HƯỚNG</text>
              </svg>
            </div>
            <div className="about-copy">
              <h3>Lắng nghe & hoàn thiện</h3>
              <p>Tiếp nhận góp ý về lỗi dịch, cách cài đặt và trải nghiệm sử dụng. Từng phản hồi giúp website và các bản dịch ngày một tốt hơn.</p>
              <h3>Thông tin minh bạch</h3>
              <p>Giúp bạn xem phiên bản, trạng thái và tiến độ dự án trước khi tải. Các lưu ý cài đặt được đặt cùng thông tin của từng game.</p>
            </div>
          </div>
        </section>

        <section className="about-row about-features" aria-labelledby="about-features-title">
          <div className="about-copy">
            <p className="about-kicker">05 / Website có những gì?</p>
            <h2 id="about-features-title">Từ tìm game đến bắt đầu chơi.</h2>
            <ul className="about-feature-list">
              <li><Link href="/games">Thư viện game Việt hóa <span aria-hidden="true">↗</span></Link><p>Tìm bản dịch, xem phiên bản, link tải và hướng dẫn cài đặt.</p></li>
              <li><Link href="/in-progress">Tiến độ dự án <span aria-hidden="true">↗</span></Link><p>Theo dõi những tựa game đang được Việt hóa.</p></li>
              <li><Link href="/categories">Khám phá theo thể loại <span aria-hidden="true">↗</span></Link><p>Tìm hành trình tiếp theo theo sở thích của bạn.</p></li>
            </ul>
          </div>
          <div className="about-picture about-library" aria-hidden="true">
            <svg viewBox="0 0 240 240" fill="none">
              <rect x="28" y="42" width="108" height="148" rx="10" stroke="currentColor" strokeOpacity=".3" transform="rotate(-12 28 42)" />
              <rect x="66" y="31" width="108" height="148" rx="10" stroke="currentColor" strokeOpacity=".5" transform="rotate(7 66 31)" />
              <rect x="64" y="65" width="132" height="156" rx="12" fill="#151922" stroke="currentColor" />
              <path d="M88 94h56M88 105h34M88 190h80" stroke="currentColor" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
              <path d="M111 130h38c10 0 18 27 12 31-5 4-12-9-16-9h-30c-4 0-11 13-16 9-6-4 2-31 12-31Z" stroke="currentColor" strokeWidth="3" />
              <path d="M112 138v12M106 144h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="146" cy="140" r="2" fill="currentColor" /><circle cx="152" cy="147" r="2" fill="currentColor" />
            </svg>
            <span>Tìm game · Cài đặt · Khám phá</span>
          </div>
        </section>

        <section className="about-youtube" aria-labelledby="about-youtube-title">
          <div className="about-youtube-header">
            <a className="about-channel" href={channelUrl} target="_blank" rel="noreferrer">
              <Image src="/tkpkpin-youtube-logo.png" alt="" width={56} height={56} />
              <span><span className="about-kicker">06 / Kết nối trên YouTube</span><h2 id="about-youtube-title">TKPkpin</h2></span>
            </a>
            <a className="button button-primary" href={channelUrl} target="_blank" rel="noreferrer">Ghé thăm kênh <span aria-hidden="true">↗</span></a>
          </div>
          <p>Video hướng dẫn Việt hóa, những buổi livestream và những câu chuyện cùng cộng đồng. Hẹn gặp bạn ở đó!</p>
          {videos.length > 0 ? (
            <div className="about-youtube-videos">
              {videos.map((video) => (
                <a href={video.url} target="_blank" rel="noreferrer" key={video.id}>
                  <div className="about-video-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={video.thumbnail} alt="" loading="lazy" />
                    <span className="about-play" aria-hidden="true">▶</span>
                  </div>
                  <h3>{video.title}</h3>
                </a>
              ))}
            </div>
          ) : <a className="about-text-link" href={`${channelUrl}/videos`} target="_blank" rel="noreferrer">Xem các video mới trên kênh →</a>}
        </section>
      </AboutMotion>
    </main>
  );
}
