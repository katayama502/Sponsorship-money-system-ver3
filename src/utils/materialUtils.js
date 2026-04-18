/** Allowed hostnames for iframe embeds (whitelist). */
const ALLOWED_EMBED_HOSTS = ['www.youtube-nocookie.com', 'www.youtube.com'];

export const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    // Only allow https
    if (u.protocol !== 'https:') return null;

    let videoId = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0];
    } else if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com' || u.hostname === 'm.youtube.com') {
      if (u.pathname === '/watch') {
        videoId = u.searchParams.get('v');
      } else if (u.pathname.startsWith('/embed/')) {
        videoId = u.pathname.split('/embed/')[1].split('?')[0];
      } else if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.split('/shorts/')[1].split('?')[0];
      } else if (u.pathname.startsWith('/live/')) {
        videoId = u.pathname.split('/live/')[1].split('?')[0];
      } else if (u.pathname.startsWith('/v/')) {
        videoId = u.pathname.split('/v/')[1].split('?')[0];
      }
    }

    // Validate video ID format (alphanumeric + - _)
    if (videoId && /^[\w-]{5,15}$/.test(videoId)) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    }
  } catch { /* invalid URL */ }
  return null;
};

/**
 * Returns true if the embed URL is from an allowed host.
 * Used to validate before rendering an iframe.
 */
export const isAllowedEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_EMBED_HOSTS.some(h => u.hostname === h);
  } catch { return false; }
};
