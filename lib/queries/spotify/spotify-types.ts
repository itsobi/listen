export type SpotifyEpisode = {
  audio_preview_url: string;
  description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  html_description: string;
  id: string;
  images?: {
    height: number;
    url: string;
    width: number;
  }[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string; // e.g., "2025-10-28"
  release_date_precision: 'year' | 'month' | 'day';
  type: 'episode';
  uri: string;
};
