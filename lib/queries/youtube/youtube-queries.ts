import 'server-only';

import { YoutubeVideo } from './youtube-types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY is not set');
}

export const getYoutubeVideosByChannelId = async (channelId: string) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&key=${YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 60 * 60 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Youtube videos response failed',
        data: [],
      };
    }

    const data = await response.json();

    if (data.pageInfo.totalResults === 0) {
      return { success: false, message: 'Videos not found', data: [] };
    }

    return {
      success: true,
      data: data.items as YoutubeVideo[],
      message: 'success',
    };
  } catch (error) {
    console.error('Error getting YouTube videos:', error);
    return {
      success: false,
      message: 'Failed to get youtube videos',
      data: [],
    };
  }
};
