import { create } from 'zustand';
import { YoutubeChannel } from './queries/youtube/youtube-types';

export type Podcast = {
  name: string;
  creatorName: string;
  color: string;
  image?: string;
};

interface PreferencesStore {
  podcasts: Podcast[];
  setPodcasts: (podcasts: Podcast[]) => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  podcasts: [],
  setPodcasts: (podcasts) => set({ podcasts }),
  removeAllPodcasts: () => set({ podcasts: [] }),
}));

interface VideoPreferencesStore {
  channels: YoutubeChannel[];
  setChannels: (channels: YoutubeChannel[]) => void;
  removeAllChannels: () => void;
}
export const useVideoPreferencesStore = create<VideoPreferencesStore>(
  (set) => ({
    channels: [],
    setChannels: (channels) => set({ channels }),
    removeAllChannels: () => set({ channels: [] }),
  })
);
