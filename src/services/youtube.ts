import { Song } from '@/contexts/MusicContext';

const API_KEY = 'AIzaSyBl3ofFw_BABkb5TRNoaLqDI-yElFk7Yy4';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
    };
  };
  contentDetails?: {
    duration: string;
  };
}

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
};

const videoToSong = (video: YouTubeVideo): Song => {
  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
  return {
    id: videoId,
    videoId,
    title: video.snippet.title,
    artist: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
    duration: video.contentDetails ? formatDuration(video.contentDetails.duration) : '0:00',
  };
};

export const searchSongs = async (query: string, maxResults = 20): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(
        query + ' official music video'
      )}&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) throw new Error('Failed to fetch songs');

    const data = await response.json();
    const videoIds = data.items.map((item: YouTubeVideo) => 
      typeof item.id === 'string' ? item.id : item.id.videoId
    ).join(',');

    // Get video details for duration
    const detailsResponse = await fetch(
      `${BASE_URL}/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`
    );

    const detailsData = await detailsResponse.json();
    const durationsMap = new Map(
      detailsData.items.map((item: any) => [item.id, item.contentDetails.duration])
    );

    return data.items.map((video: YouTubeVideo) => {
      const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
      const duration = durationsMap.get(videoId);
      return {
        ...videoToSong(video),
        duration: formatDuration(typeof duration === 'string' ? duration : 'PT0S'),
      };
    });
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
};

export const getTrending = async (maxResults = 20): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&regionCode=US&maxResults=${maxResults}&key=${API_KEY}`
    );

    if (!response.ok) throw new Error('Failed to fetch trending songs');

    const data = await response.json();
    return data.items.map((item: any) => videoToSong(item));
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
};

export const getRecommendations = async (query: string, maxResults = 12): Promise<Song[]> => {
  return searchSongs(query, maxResults);
};
