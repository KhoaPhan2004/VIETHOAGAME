"use client";
import { publicMediaUrl } from "@/lib/public-media";


import AdminMutationForm from "@/components/AdminMutationForm";
import { useMemo, useState } from "react";

const stages = ["Khảo sát", "Dịch thuật", "Thử game"];

type AdminInProgressGame = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  total_text_lines: number;
  translated_text_lines: number;
  translation_stage: string | null;
  last_progress_update: string | null;
};

type AdminInProgressGameFormProps = {
  action: string;
  game?: AdminInProgressGame;
};

export default function AdminInProgressGameForm({
  action,
  game,
}: AdminInProgressGameFormProps) {
  const [name, setName] = useState(game?.name ?? "");
  const [stage, setStage] = useState(game?.translation_stage ?? "Khảo sát");
  const [totalLines, setTotalLines] = useState(game?.total_text_lines ?? 0);
  const [translatedLines, setTranslatedLines] = useState(game?.translated_text_lines ?? 0);
  const slug = useMemo(() => slugify(name || game?.slug || ""), [game?.slug, name]);
  const progress = progressFromData(
    totalLines,
    Math.min(translatedLines, totalLines),
    stage,
  );

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
          Giai đoạn
          <select
            name="translation_stage"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label>
          Số dòng text cần dịch
          <input
            min="0"
            name="total_text_lines"
            required
            type="number"
            value={totalLines}
            onChange={(event) => setTotalLines(Number(event.target.value))}
          />
        </label>

        <label>
          Số dòng đã dịch
          <input
            min="0"
            name="translated_text_lines"
            required
            type="number"
            value={translatedLines}
            onChange={(event) => setTranslatedLines(Number(event.target.value))}
          />
        </label>

        <label>
          Upload ảnh hiển thị
          <input name="image_file" type="file" accept="image/*" />
        </label>

        <label>
          Ngày cập nhật tiến độ
          <input
            name="last_progress_update"
            type="date"
            defaultValue={game?.last_progress_update ?? todayInputValue()}
          />
        </label>
      </div>

      <input name="slug" type="hidden" value={slug} />
      <input name="image" type="hidden" value={game?.image ?? ""} />

      <div className="slug-preview">
        Slug tự tạo: <strong>{slug || "nhap-ten-game"}</strong> · Tiến độ hệ thống tính:{" "}
        <strong>{progress}%</strong>
      </div>

      {game?.image ? (
        <div className="current-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicMediaUrl(game.image)} alt={`Ảnh ${game.name}`} />
          <span>Ảnh hiện tại. Upload ảnh mới nếu muốn thay.</span>
        </div>
      ) : null}

      <button className="button button-primary" type="submit">
        Lưu
      </button>
    </AdminMutationForm>
  );
}

function progressFromData(totalLines: number, translatedLines: number, stage: string) {
  if (stage === "Phát hành") {
    return 100;
  }

  const ratio = totalLines > 0 ? Math.min(1, translatedLines / totalLines) : 0;

  if (stage === "Thử game") {
    return Math.round(76 + ratio * 19);
  }

  if (stage === "Dịch thuật") {
    return Math.round(20 + ratio * 55);
  }

  return Math.round(8 + ratio * 11);
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
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
