export const getApplePodcast = async (podcastName: string) => {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${podcastName}}&media=podcast&limit=5`,
    { next: { revalidate: 60 * 60 * 6 } }
  );
  const data = await res.json();

  // If no results, it doesn't exist
  if (!data.results || data.results.length === 0) {
    return { exists: false, message: 'No podcasts found.' };
  }

  // Otherwise, check for valid feed URLs
  const validResults = data.results.filter((pod: any) => !!pod.feedUrl);

  if (validResults.length > 0) {
    return {
      exists: true,
      podcast: validResults[0],
      message: 'Podcast found and has a valid feed URL.',
    };
  }

  return { exists: false, message: 'No valid feed URLs found.' };
};

export const getApplePodcastEpisodes = async (podcastName: string) => {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${podcastName}}&entity=podcastEpisode&limit=5`,
    { next: { revalidate: 60 * 60 * 6 } }
  );
  const data = await res.json();

  // If no results, it doesn't exist
  if (!data.results || data.results.length === 0) {
    return { exists: false, message: 'No podcasts found.' };
  }

  // Otherwise, check for valid feed URLs
  const validResults = data.results.filter((pod: any) => !!pod.feedUrl);

  if (validResults.length > 0) {
    // Sort episodes by release date (most recent first)
    const sortedEpisodes = validResults.sort((a: any, b: any) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return dateB - dateA;
    });

    return {
      exists: true,
      episodes: sortedEpisodes,
      message: 'Podcast found and has a valid feed URL.',
    };
  }

  return { exists: false, message: 'No valid feed URLs found.' };
};
