import 'server-only';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set');
}

const getToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString(
          'base64'
        ),
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return { success: false, message: 'Failed to get token' };
  }

  return await response.json();
};

const getPodcastByName = async (podcastName: string) => {
  const token = await getToken();

  if (!token.access_token) {
    return { success: false, message: 'Access token not found' };
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${podcastName}&type=show&limit=1`,
    {
      headers: { Authorization: `Bearer ${token.access_token}` },
      next: { revalidate: 60 * 60 * 24 },
    }
  );

  if (!response.ok) {
    return { success: false, message: 'Failed to get podcast' };
  }

  const data = await response.json();

  if (!data.shows || data.shows.items.length === 0) {
    return { success: false, message: 'Podcast not found' };
  }

  return {
    success: true,
    podcastId: data.shows.items[0].id,
    podcastInfo: data.shows.items[0],
    token: token.access_token,
  };
};

export const getSpotifyEpisodes = async (podcastName: string) => {
  const data = await getPodcastByName(podcastName);

  if (!data.success) {
    return { success: false, message: data.message };
  }

  const response = await fetch(
    `https://api.spotify.com/v1/shows/${data.podcastId}/episodes?limit=5`,
    {
      headers: { Authorization: `Bearer ${data.token}` },
      next: { revalidate: 60 * 60 * 6 },
    }
  );

  if (!response.ok) {
    return { success: false, message: 'Failed to get episodes' };
  }

  const episodesData = await response.json();

  const filteredEpisodes = Array.isArray(episodesData.items)
    ? episodesData.items.filter((episode: any) => episode != null)
    : [];

  return {
    success: true,
    podcastInfo: data.podcastInfo,
    episodes: filteredEpisodes,
  };
};
