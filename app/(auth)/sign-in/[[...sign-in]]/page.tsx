'use client';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import SignInForm from '../_components/sign-in-form';
import { SignInVerifyForm } from '../_components/sign-in-verify-form';

export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push('/home');
  }, [isSignedIn, router]);

  if (verifying) {
    return (
      <SignInVerifyForm verifying={verifying} setVerifying={setVerifying} />
    );
  }

  return <SignInForm verifying={verifying} setVerifying={setVerifying} />;
}
