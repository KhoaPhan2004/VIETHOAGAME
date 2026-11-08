import "server-only";

export function adminBasePath() {
  const value = process.env.ADMIN_PATH;
  if (!value || !/^\/quan-tri-[a-z0-9]{12,40}$/.test(value)) {
    throw new Error("ADMIN_PATH is not configured.");
  }
  return value;
}
export function adminHref(suffix = "") { return adminBasePath() + suffix; }
