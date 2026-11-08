import "server-only";
import { adminHref } from "./admin-path";
import { revalidateTag, revalidatePath } from "next/cache";
import { adminAuthHeaders, signOutAdmin } from "@/lib/admin-auth";
import { adminUpdateHref } from "@/lib/admin-pagination";
import type { AdminListContext } from "@/lib/admin-mutation-url";
import { API_BASE_URL as API_URL, API_CACHE_TAG } from "./api-config";

async function createGame(formData: FormData) {

  const releaseSourceId = nullableField(formData, "release_source_id");
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(await gamePayload(formData)),
  });
  await assertAdminResponse(response, "Tạo game thất bại.");

  if (releaseSourceId) {
    const releaseResponse = await fetch(`${API_URL}/in-progress-games/${releaseSourceId}/release`, {
      method: "POST",
    signal: AbortSignal.timeout(30000),
      headers: await adminAuthHeaders(),
    });
    await assertAdminResponse(releaseResponse, "Đã tạo game nhưng cập nhật giai đoạn phát hành thất bại.");
  }

  revalidateAdminPaths();
  return adminHref("?tab=games&notice=game-created");
}

async function updateGame(id: number, context: AdminListContext, formData: FormData) {

  const response = await fetch(`${API_URL}/games/${id}`, {
    method: "PUT",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(await gamePayload(formData)),
  });
  await assertAdminResponse(response, "Sửa game thất bại.");

  revalidateAdminPaths();
  return adminUpdateHref("games", context.page, "game-updated", context.keyword, context.sort);
}

async function deleteGame(id: number) {

  const response = await fetch(`${API_URL}/games/${id}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(30000),
    headers: await adminAuthHeaders(),
  });
  await assertAdminResponse(response, "Xóa game thất bại.");

  revalidateAdminPaths();
  return adminHref("?tab=games&notice=game-deleted");
}

async function createInProgressGame(formData: FormData) {

  const response = await fetch(`${API_URL}/in-progress-games`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(await inProgressPayload(formData)),
  });
  await assertAdminResponse(response, "Tạo game đang Việt hóa thất bại.");

  revalidateAdminPaths();
  return adminHref("?tab=in-progress&notice=in-progress-created");
}

async function updateInProgressGame(id: number, context: AdminListContext, formData: FormData) {

  const response = await fetch(`${API_URL}/in-progress-games/${id}`, {
    method: "PUT",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(await inProgressPayload(formData)),
  });
  await assertAdminResponse(response, "Sửa game đang Việt hóa thất bại.");

  revalidateAdminPaths();
  return adminUpdateHref("in-progress", context.page, "in-progress-updated", context.keyword, context.sort);
}

async function deleteInProgressGame(id: number) {

  const response = await fetch(`${API_URL}/in-progress-games/${id}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(30000),
    headers: await adminAuthHeaders(),
  });
  await assertAdminResponse(response, "Xóa game đang Việt hóa thất bại.");

  revalidateAdminPaths();
  return adminHref("?tab=in-progress&notice=in-progress-deleted");
}

async function createCategory(formData: FormData) {

  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(categoryPayload(formData)),
  });
  await assertAdminResponse(response, "Tạo thể loại thất bại.");

  revalidateAdminPaths();
  return adminHref("?tab=categories&notice=category-created");
}

async function updateCategory(id: number, context: AdminListContext, formData: FormData) {

  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    signal: AbortSignal.timeout(30000),
    headers: await adminJsonHeaders(),
    body: JSON.stringify(categoryPayload(formData)),
  });
  await assertAdminResponse(response, "Sửa thể loại thất bại.");

  revalidateAdminPaths();
  return adminUpdateHref("categories", context.page, "category-updated", context.keyword, context.sort);
}

async function deleteCategory(id: number) {

  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    signal: AbortSignal.timeout(30000),
    headers: await adminAuthHeaders(),
  });
  await assertAdminResponse(response, "Xóa thể loại thất bại.");

  revalidateAdminPaths();
  return adminHref("?tab=categories&notice=category-deleted");
}

async function logout() {

  await signOutAdmin();
  return adminHref("/login");
}

async function gamePayload(formData: FormData) {
  const uploadedImageUrl = await uploadImage(formData, "image_file");
  const uploadedBackgroundUrl = await uploadImage(formData, "background_image_file");
  const uploadedGalleryUrls = await uploadImages(formData, "gallery_image_files[]");
  const currentGalleryImages = jsonStringArray(field(formData, "gallery_images"));

  return {
    name: field(formData, "name"),
    slug: field(formData, "slug") || slugify(field(formData, "name")),
    description: nullableField(formData, "description"),
    image: uploadedImageUrl ?? nullableField(formData, "image"),
    background_image: uploadedBackgroundUrl ?? nullableField(formData, "background_image"),
    gallery_images: [...currentGalleryImages, ...uploadedGalleryUrls],
    version: nullableField(formData, "version"),
    category_ids: formData.getAll("category_ids[]").map(Number).filter((id) => Number.isInteger(id)),
    status: "Hoàn thành",
    file_size: nullableField(formData, "file_size"),
    download_count: Number(field(formData, "download_count") || 0),
    download_url: nullableField(formData, "download_url"),
    is_downloadable: formData.get("is_downloadable") === "1",
    translation_progress: 100,
    translation_stage: "Hoàn thành",
    video_url: nullableField(formData, "video_url"),
    preview_video_url: nullableField(formData, "preview_video_url"),
    installation_guide: nullableField(formData, "installation_guide"),
  };
}

async function inProgressPayload(formData: FormData) {
  const uploadedImageUrl = await uploadImage(formData, "image_file");
  const totalLines = Number(field(formData, "total_text_lines") || 0);

  return {
    name: field(formData, "name"),
    slug: field(formData, "slug") || slugify(field(formData, "name")),
    description: null,
    image: uploadedImageUrl ?? nullableField(formData, "image"),
    background_image: null,
    total_text_lines: totalLines,
    translated_text_lines: Math.min(Number(field(formData, "translated_text_lines") || 0), totalLines),
    translation_stage: field(formData, "translation_stage") || "Khảo sát",
    current_task: null,
    last_progress_update: nullableField(formData, "last_progress_update"),
  };
}

function categoryPayload(formData: FormData) {
  const name = field(formData, "name");

  return {
    name,
    slug: slugify(name),
    description: nullableField(formData, "description"),
  };
}

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function nullableField(formData: FormData, name: string) {
  const value = field(formData, name);

  return value.length > 0 ? value : null;
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

function jsonStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [];
  } catch {
    return [];
  }
}

async function uploadImage(formData: FormData, fieldName: string) {
  const image = formData.get(fieldName);

  if (!(image instanceof File) || image.size === 0) {
    return null;
  }

  return uploadSingleImage(image);
}

async function uploadImages(formData: FormData, fieldName: string) {
  const images = formData
    .getAll(fieldName)
    .filter((image): image is File => image instanceof File && image.size > 0);
  const urls = await Promise.all(images.map((image) => uploadSingleImage(image)));

  return urls.filter((url): url is string => url != null);
}

async function uploadSingleImage(image: File) {
  if (image.size > 8 * 1024 * 1024) {
    throw new Error("Ảnh quá lớn. Dung lượng tối đa là 8 MB mỗi ảnh.");
  }
  const uploadData = new FormData();
  uploadData.set("image", image);

  const response = await fetch(`${API_URL}/uploads/images`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: await adminAuthHeaders(),
    body: uploadData,
  });

  if (!response.ok) {
    let message = response.status === 413
      ? "Ảnh quá lớn. Dung lượng tối đa là 8 MB mỗi ảnh."
      : "Upload ảnh thất bại. Vui lòng thử lại.";
    try {
      const result = await response.json() as { errors?: { image?: string[] }; message?: string };
      message = result.errors?.image?.[0] ?? result.message ?? message;
    } catch {}
    throw new Error(message);
  }

  const result = (await response.json()) as { url?: string };

  return result.url ?? null;
}

async function assertAdminResponse(response: Response, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  let message = fallbackMessage;

  try {
    const result = (await response.json()) as { message?: string };
    message = result.message ?? message;
  } catch {
  }

  throw new Error(message);
}

function revalidateAdminPaths() {
  revalidateTag(API_CACHE_TAG, { expire: 0 });
  revalidatePath("/categories", "layout");
  revalidatePath("/games/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/games");
  revalidatePath("/in-progress");
  revalidatePath("/");
}

async function adminJsonHeaders() {
  return {
    ...await adminAuthHeaders(),
    "Content-Type": "application/json",
  };
}


export async function performAdminMutation(operation: string, id: number, context: AdminListContext, formData: FormData): Promise<string> {
  switch (operation) {
    case "create-game": return createGame(formData);
    case "update-game": return updateGame(id, context, formData);
    case "delete-game": return deleteGame(id);
    case "create-progress": return createInProgressGame(formData);
    case "update-progress": return updateInProgressGame(id, context, formData);
    case "delete-progress": return deleteInProgressGame(id);
    case "create-category": return createCategory(formData);
    case "update-category": return updateCategory(id, context, formData);
    case "delete-category": return deleteCategory(id);
    case "logout": return logout();
    default: throw new Error("Thao tác không hợp lệ.");
  }
}
