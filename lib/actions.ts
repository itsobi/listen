'use server';

import { revalidateTag } from 'next/cache';
import { QueryTags } from './query-tags';

export const refreshQueries = async () => {
  revalidateTag(QueryTags.APPLE_PODCASTS, 'max');
  revalidateTag(QueryTags.SPOTIFY_PODCASTS, 'max');
};
