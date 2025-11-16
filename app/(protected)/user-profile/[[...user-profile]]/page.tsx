import { PageHeading } from '@/components/global/page-heading';
import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <>
      <PageHeading title="User Profile" />
      <div className="flex justify-center items-center">
        <UserProfile />
      </div>
    </>
  );
}
