import { create } from 'zustand';

export type Podcast = {
  name: string;
  artistName: string;
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
