export default function ContactPage() {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow">Kết nối</p>
        <h1>Liên hệ</h1>
        <p>
          Dùng trang này để nhận góp ý, báo lỗi bản dịch, đề xuất game cần Việt
          hóa hoặc gửi thông tin cập nhật từ nhóm dịch.
        </p>
      </section>

      <section className="contact-layout">
        <div className="contact-panel">
          <h2>Gửi thông tin</h2>
          <form className="admin-form">
            <label>
              Tên của bạn
              <input name="name" placeholder="Nhập tên hoặc nickname" />
            </label>

            <label>
              Email
              <input name="email" type="email" placeholder="email@example.com" />
            </label>

            <label>
              Chủ đề
              <select name="topic" defaultValue="suggest">
                <option value="suggest">Đề xuất game cần Việt hóa</option>
                <option value="bug">Báo lỗi bản dịch</option>
                <option value="update">Gửi cập nhật tiến độ</option>
                <option value="other">Khác</option>
              </select>
            </label>

            <label>
              Nội dung
              <textarea
                name="message"
                rows={6}
                placeholder="Ghi rõ tên game, phiên bản, lỗi gặp phải hoặc nội dung bạn muốn góp ý."
              />
            </label>

            <button className="button button-primary" type="button">
              Gửi liên hệ
            </button>
          </form>
        </div>

        <aside className="contact-panel">
          <h2>Thông tin nên gửi kèm</h2>
          <div className="contact-list">
            <p>Tên game và phiên bản game.</p>
            <p>Phiên bản bản Việt hóa nếu đang báo lỗi.</p>
            <p>Ảnh chụp lỗi hoặc mô tả vị trí lỗi trong game.</p>
            <p>Link nguồn nếu bạn đề xuất một dự án Việt hóa.</p>
          </div>
          <p className="contact-note">
            Form hiện là giao diện trước. Bước sau có thể nối backend để lưu liên
            hệ vào database hoặc gửi email cho admin.
          </p>
        </aside>
      </section>
    </main>
  );
}
