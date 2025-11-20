export interface ApplePodcastShow {
  wrapperType: 'track';
  kind: 'podcast';
  collectionId: number;
  trackId: number;
  artistName: string;
  collectionName: string;
  trackName: string;
  collectionCensoredName: string;
  trackCensoredName: string;
  collectionViewUrl: string;
  feedUrl: string;
  trackViewUrl: string;
  artworkUrl30: string;
  artworkUrl60: string;
  artworkUrl100: string;
  collectionPrice: number;
  trackPrice: number;
  collectionHdPrice: number;
  releaseDate: string; // ISO date string
  collectionExplicitness: 'explicit' | 'notExplicit' | string;
  trackExplicitness: 'explicit' | 'notExplicit' | string;
  trackCount: number;
  trackTimeMillis: number;
  country: string;
  currency: string;
  primaryGenreName: string;
  contentAdvisoryRating: 'Explicit' | 'Clean' | string;
  artworkUrl600: string;
  genreIds: string[];
  genres: string[];
}

export interface ApplePodcastEpisode {
  episodeFileExtension: string;
  episodeContentType: string;
  episodeUrl: string;
  artistIds: string[] | number[];
  releaseDate: string;
  shortDescription: string;
  feedUrl: string;
  closedCaptioning: string;
  collectionId: number;
  collectionName: string;
  kind: string;
  wrapperType: string;
  description: string;
  country: string;
  artworkUrl600: string;
  collectionViewUrl: string;
  trackViewUrl: string;
  artworkUrl60: string;
  trackTimeMillis: number;
  contentAdvisoryRating: 'Explicit' | 'Clean' | string;
  artworkUrl160: string;
  previewUrl: string;
  trackId: number;
  trackName: string;
  episodeGuid: string;
  genres: { name: string; id: string }[];
}
