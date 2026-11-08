const TKPKPIN_CHANNEL_ID = "UCJVSZjAHnHiqS_q9LZ5ZK8Q";
const YOUTUBE_FEED_URL = "https://www.youtube.com/feeds/videos.xml";

export type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
};

export async function getTkpkpinVideos() {
  try {
    const channelId = TKPKPIN_CHANNEL_ID;

    if (!channelId) {
      return [];
    }

    const feedResponse = await fetch(`${YOUTUBE_FEED_URL}?channel_id=${channelId}`, {
      signal: AbortSignal.timeout(8000), next: { revalidate: 3600 },
    });

    if (!feedResponse.ok) {
      return [];
    }

    const feedXml = await feedResponse.text();

    return parseVideos(feedXml);
  } catch {
    return [];
  }
}

function parseVideos(feedXml: string): YouTubeVideo[] {
  const entries = feedXml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries
    .map((entry) => {
      const id = matchEntry(entry, /<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
      const title = matchEntry(entry, /<title>([\s\S]*?)<\/title>/);
      const thumbnail = matchEntry(entry, /<media:thumbnail url="([^"]+)"/);

      if (!id || !title || !thumbnail) {
        return null;
      }

      return {
        id,
        title: decodeXml(title),
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail: decodeXml(thumbnail),
      };
    })
    .filter((video): video is YouTubeVideo => video !== null);
}

function matchEntry(entry: string, pattern: RegExp) {
  return entry.match(pattern)?.[1]?.trim() ?? "";
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
