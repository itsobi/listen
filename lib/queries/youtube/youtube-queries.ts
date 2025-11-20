import 'server-only';

import { YoutubeChannelStats, YoutubeVideo } from './youtube-types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export const getYoutubeVideosByChannelId = async (channelId: string) => {
  if (!YOUTUBE_API_KEY) {
    return {
      success: false,
      message: 'API KEY is not set',
      data: [],
    };
  }
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
        message: 'Youtube videos response failed. Please try again.',
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
      message: 'Failed to get youtube videos. Please try again.',
      data: [],
    };
  }
};

export const getYoutubeChannelStats = async (channelId: string) => {
  if (!YOUTUBE_API_KEY) {
    return {
      success: false,
      message: 'API KEY is not set',
      data: null,
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 60 * 60 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Youtube channel stats response failed. Please try again.',
        data: null,
      };
    }

    const data = await response.json();

    if (data.pageInfo.totalResults === 0) {
      return { success: false, message: 'Channel stats not found', data: null };
    }

    return {
      success: true,
      data: data.items[0] as YoutubeChannelStats,
      message: 'success',
    };
  } catch (error) {
    console.error('Error getting YouTube channel stats:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to get youtube channel stats. Please try again.',
      data: null,
    };
  }
};
