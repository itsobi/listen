import { ApplePodcastEpisode } from './queries/apple/apple-types';
import { SpotifyEpisode } from './queries/spotify/spotify-types';

export const generateRandomColor = () => {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
};

export const formatDate = (date: string) => {
  // If the string has a time (Apple), use normal parsing
  if (date.includes('T')) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // If it's a plain date (Spotify), parse manually to avoid timezone shifts
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day); // treated as local time
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const decodeHtmlEntities = (text: string) => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  // Client-side: use browser's built-in HTML decoding
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const formatStatNumber = (num: string | number): string => {
  const numValue = typeof num === 'string' ? parseInt(num, 10) : num;

  if (isNaN(numValue)) return '0';

  if (numValue >= 1_000_000_000) {
    return (numValue / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (numValue >= 1_000_000) {
    return (numValue / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (numValue >= 1_000) {
    return (numValue / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return numValue.toString();
};

interface MergedPodcastEpisode {
  title: string;
  releaseDate: string;
  apple?: ApplePodcastEpisode;
  spotify?: SpotifyEpisode;
}

export const mergePodcastEpisodes = (
  appleEpisodes: ApplePodcastEpisode[],
  spotifyEpisodes: SpotifyEpisode[]
): MergedPodcastEpisode[] => {
  const episodeMap = new Map<string, MergedPodcastEpisode>();

  // Add Apple episodes
  appleEpisodes.forEach((episode) => {
    const normalizedTitle = episode.trackName.toLowerCase().trim();
    const releaseDate = episode.releaseDate.split('T')[0];
    const key = `${normalizedTitle}-${releaseDate}`;

    episodeMap.set(key, {
      title: episode.trackName,
      releaseDate: episode.releaseDate,
      apple: episode,
    });
  });

  // Add Spotify episodes (merge with existing if found)
  spotifyEpisodes.forEach((episode) => {
    const normalizedTitle = episode.name.toLowerCase().trim();
    const releaseDate = episode.release_date;
    const key = `${normalizedTitle}-${releaseDate}`;

    if (episodeMap.has(key)) {
      // Merge with existing Apple episode
      const existing = episodeMap.get(key)!;
      episodeMap.set(key, {
        ...existing,
        spotify: episode,
      });
    } else {
      // Add as Spotify-only episode
      episodeMap.set(key, {
        title: episode.name,
        releaseDate: episode.release_date,
        spotify: episode,
      });
    }
  });

  // Convert to array and sort by release date (newest first)
  return Array.from(episodeMap.values()).sort((a, b) => {
    return (
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  });
};
