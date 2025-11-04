import { PageHeading } from '@/components/global/page-heading';
import { VideoPreferencesForm } from './_components/video-preferences-form';

export default function VideoPreferencesPage() {
  return (
    <>
      <PageHeading title="Video Preferences" />

      <VideoPreferencesForm />
    </>
  );
}
