export async function getPodcastNames(podcasts: string[]) {
  try {
    const podcastData = await Promise.all(
      podcasts.map(async (podcast) => {
        const encodedPodcast = encodeURIComponent(podcast);
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodedPodcast}&media=podcast`
        );
        if (!response.ok) {
          return { success: false, error: 'Server error' };
        }
        const data = await response.json();
        if (data.resultCount === 0) {
          return { success: false, error: 'Podcasts not found' };
        } else {
          return {
            success: true,
            data: [
              {
                name: data.results[0].trackName,
                artistName: data.results[0].artistName,
                image: data.results[0].artworkUrl100,
              },
            ],
          };
        }
      })
    );

    return { success: true, data: podcastData };
  } catch (error) {
    console.error('Error getting podcast names', error);
    return { success: false, error: 'Unable to validate podcasts' };
  }
}
