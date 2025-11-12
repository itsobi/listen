import { QueryTags } from '@/lib/query-tags';

export const getApplePodcastByName = async (podcastName: string) => {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${podcastName}}&media=podcast&limit=5`,
      { next: { revalidate: 60 * 60 } }
    );

    if (!res.ok) {
      return {
        success: false,
        message: 'Apple podcast request failed. Please try again.',
      };
    }

    const data = await res.json();

    // If no results, it doesn't exist
    if (!data.results || data.results.length === 0) {
      return { success: false, message: 'No podcasts found.' };
    }

    // Otherwise, check for valid feed URLs
    const validResults = data.results.filter((pod: any) => !!pod.feedUrl);

    if (validResults.length > 0) {
      return {
        success: true,
        podcastId: validResults[0].collectionId,
        image: validResults[0].artworkUrl600 ?? undefined,
        podcastName: validResults[0].trackName,
        publisher: validResults[0].artistName,
        message: 'Podcast found and has a valid feed URL.',
      };
    }

    return { success: false, message: 'No valid feed URLs found.' };
  } catch (error) {
    console.error('Error getting podcast', error);
    return {
      success: false,
      message: 'Apple podcast request failed. Please try again.',
    };
  }
};

export const getApplePodcastEpisodes = async (podcastName: string) => {
  try {
    const data = await getApplePodcastByName(podcastName);

    // If no results, it doesn't exist
    if (!data.success) {
      return { success: false, message: data.message };
    }

    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${data.podcastId}&entity=podcastEpisode&limit=5`,
      { next: { revalidate: 60 * 60, tags: [QueryTags.APPLE_PODCASTS] } }
    );

    if (!response.ok) {
      return {
        success: false,
        message: 'Apple podcast episodes request failed. Please try again.',
      };
    }

    const episodesData = await response.json();

    if (!episodesData.results || episodesData.results.length === 0) {
      return { success: false, message: 'No podcast episodes found.' };
    }

    // Otherwise, check for valid feed URLs
    const validEpisodes = episodesData.results.filter(
      (pod: any) => !!pod.feedUrl && pod.episodeFileExtension === 'mp3'
    );

    if (validEpisodes.length > 0) {
      // Sort episodes by release date (most recent first)
      const sortedEpisodes = validEpisodes.sort((a: any, b: any) => {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return dateB - dateA;
      });

      return {
        success: true,
        podcastId: data.podcastId,
        name: data.podcastName,
        publisher: data.publisher,
        image: data.image,
        episodes: sortedEpisodes,
        message: 'Apple podcast episodes found.',
      };
    }

    return { success: false, message: 'No valid podcast episodes found.' };
  } catch (error) {
    console.error('Error getting podcast episodes', error);
    return {
      success: false,
      message: 'Apple podcast episodes request failed. Please try again.',
    };
  }
};
