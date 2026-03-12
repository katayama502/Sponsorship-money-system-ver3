export const getMaterialThumbnail = (category) => {
  switch (category) {
    case 'scratch': return "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=400";
    case 'Canva': return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=400";
    case 'robot': return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400";
    default: return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400";
  }
};

export const getYoutubeEmbedUrl = (url) => {
  try {
    const u = new URL(url);
    let videoId = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0];
    } else if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') {
        videoId = u.searchParams.get('v');
      } else if (u.pathname.startsWith('/embed/')) {
        videoId = u.pathname.split('/embed/')[1].split('?')[0];
      } else if (u.pathname.startsWith('/shorts/')) {
        videoId = u.pathname.split('/shorts/')[1].split('?')[0];
      }
    }
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  } catch { }
  return null;
};
