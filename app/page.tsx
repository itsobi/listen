import { LandingPageView } from '@/components/landing-page/landing-page-view';
import { auth } from '@clerk/nextjs/server';
import { cacheLife } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { isAuthenticated } = await auth();

  if (isAuthenticated) {
    return redirect('/home');
  }
  return <LandingPageView />;
}
