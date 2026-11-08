"use client";
import { publicMediaUrl } from "@/lib/public-media";


import AdminMutationForm from "@/components/AdminMutationForm";
import { useMemo, useState } from "react";

type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type AdminGame = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  background_image: string | null;
  gallery_images: string[] | null;
  version: string | null;
  category: string | null;
  categories?: AdminCategory[];
  status: string | null;
  file_size: string | null;
  download_count?: number | null;
  download_url: string | null;
  is_downloadable: boolean | null;
  translation_progress: number | null;
  translation_stage: string | null;
  video_url?: string | null;
  preview_video_url?: string | null;
  installation_guide: string | null;
};

type AdminGameFormProps = {
  action: string;
  categories: AdminCategory[];
  game?: AdminGame;
  releaseSource?: Partial<AdminGame>;
  releaseSourceId?: number;
};

export default function AdminGameForm({
  action,
  categories,
  game,
  releaseSource,
  releaseSourceId,
}: AdminGameFormProps) {
  const source = game ?? releaseSource;
  const [name, setName] = useState(source?.name ?? "");
  const [downloadable, setDownloadable] = useState(source?.is_downloadable ?? true);
  const slug = useMemo(() => slugify(name || source?.slug || ""), [source?.slug, name]);
  const selectedCategoryIds = new Set((source?.categories ?? []).map((category) => category.id));

  return (
    <AdminMutationForm action={action} className="admin-form">
      <div className="form-grid">
        <label>
          Tên game
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          Phiên bản
          <input name="version" defaultValue={source?.version ?? ""} />
        </label>

        <label>
          Dung lượng
          <input name="file_size" defaultValue={source?.file_size ?? ""} />
        </label>

        <label>
          Lượt tải
          <input name="download_count" type="number" min="0" defaultValue={source?.download_count ?? 0} />
        </label>

        <label>
          Thể loại
          <select
            name="category_ids[]"
            multiple
            defaultValue={[...selectedCategoryIds].map(String)}
            size={Math.min(Math.max(categories.length, 3), 6)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="form-hint">Giữ Ctrl để chọn nhiều thể loại.</span>
        </label>

        <label>
          Upload ảnh thu nhỏ (tối đa 8 MB)
          <input name="image_file" type="file" accept="image/*" />
        </label>

        <label>
          Upload ảnh nền trang chi tiết (tối đa 8 MB)
          <input name="background_image_file" type="file" accept="image/*" />
        </label>
      </div>

      <input name="slug" type="hidden" value={slug} />
      <input name="image" type="hidden" value={source?.image ?? ""} />
      <input name="background_image" type="hidden" value={source?.background_image ?? ""} />
      <input
        name="gallery_images"
        type="hidden"
        value={JSON.stringify(source?.gallery_images ?? [])}
      />
      {releaseSourceId ? <input name="release_source_id" type="hidden" value={releaseSourceId} /> : null}

      <div className="slug-preview">
        Slug tự tạo: <strong>{slug || "nhap-ten-game"}</strong>
      </div>

      {source?.image ? (
        <div className="current-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicMediaUrl(source.image)} alt={`Ảnh bìa ${source.name}`} />
          <span>Ảnh hiện tại. Upload ảnh mới nếu muốn thay.</span>
        </div>
      ) : null}

      {source?.background_image ? (
        <div className="current-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicMediaUrl(source.background_image)} alt={`Ảnh nền ${source.name}`} />
          <span>Ảnh nền trang chi tiết hiện tại. Upload ảnh mới nếu muốn thay.</span>
        </div>
      ) : null}

      <label>
        Upload gallery giới thiệu game (tối đa 8 MB mỗi ảnh)
        <input name="gallery_image_files[]" type="file" accept="image/*" multiple />
      </label>

      {source?.gallery_images && source.gallery_images.length > 0 ? (
        <div className="gallery-admin-preview">
          {source.gallery_images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={publicMediaUrl(image)} alt={`Ảnh gallery ${source.name}`} />
          ))}
        </div>
      ) : null}

      <label className="checkbox-label">
        <input
          name="is_downloadable"
          type="checkbox"
          value="1"
          checked={downloadable}
          onChange={(event) => setDownloadable(event.target.checked)}
        />
        Cho phép tải bản Việt hóa
      </label>

      <label>
        Link tải
        <input name="download_url" defaultValue={source?.download_url ?? ""} />
      </label>

      <label>
        Mô tả
        <textarea name="description" rows={3} defaultValue={source?.description ?? ""} />
      </label>

      <label>
        Link video giới thiệu (trang chi tiết)
        <input name="video_url" type="url" maxLength={2048} placeholder="https://www.youtube.com/watch?v=..." defaultValue={source?.video_url ?? ""} />
        <span className="form-hint">Video đầy đủ hiển thị ở trang chi tiết game.</span>
      </label>

      <label>
        Link video xem trước (game ngẫu nhiên)
        <input name="preview_video_url" type="url" maxLength={2048} placeholder="https://streamable.com/f46j2w" defaultValue={source?.preview_video_url ?? ""} />
        <span className="form-hint">Video phát khi hover ảnh. Hỗ trợ Streamable, MP4/WebM, YouTube và Vimeo. Để trống để chỉ hiện ảnh.</span>
      </label>

      <label>
        Hướng dẫn cài đặt
        <textarea
          name="installation_guide"
          rows={4}
          defaultValue={source?.installation_guide ?? ""}
        />
      </label>

      <button className="button button-primary" type="submit">
        Lưu
      </button>
    </AdminMutationForm>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
