export function siteUrl() {
  const value = process.env.SITE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch { return null; }
}
