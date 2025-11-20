'use server';

import { revalidateTag } from 'next/cache';
import { QueryTags } from './query-tags';
import { auth } from '@clerk/nextjs/server';

export const refreshQueries = async () => {
  revalidateTag(QueryTags.APPLE_PODCASTS, 'max');
  revalidateTag(QueryTags.SPOTIFY_PODCASTS, 'max');
};

export const checkProPlanStatus = async () => {
  const { has } = await auth();
  const hasProPlan = has({ plan: 'pro' });

  if (hasProPlan) return true;

  return false;
};
