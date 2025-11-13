import { PageHeading } from '@/components/global/page-heading';
import { PreferencesForm } from './_components/preferences-form';

export default function PreferencesPage() {
  return (
    <>
      <PageHeading title="Preferences" />

      <PreferencesForm />
    </>
  );
}
