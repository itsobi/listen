'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SignUpForm } from '../_components/sign-up-form';
import { SignUpVerifyForm } from '../_components/sign-up-verify-form';

export default function SignUpPage() {
  const [verifying, setVerifying] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push('/dashboard');
  }, [isSignedIn, router]);

  if (verifying) {
    return (
      <SignUpVerifyForm verifying={verifying} setVerifying={setVerifying} />
    );
  }

  return <SignUpForm verifying={verifying} setVerifying={setVerifying} />;
}
