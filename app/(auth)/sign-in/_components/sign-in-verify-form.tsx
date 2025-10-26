'use client';

import { useSignIn } from '@clerk/nextjs';
import { ClerkAPIError } from '@clerk/types';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';
import { InputOTP } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

interface Props {
  verifying: boolean;
  setVerifying: Dispatch<SetStateAction<boolean>>;
}

export function SignInVerifyForm({ verifying, setVerifying }: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded && !signIn) return;

    if (code.length !== 6) {
      toast.error('Please enter a valid verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Use the code the user provided to attempt verification
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async () => {
            router.push('/home');
            setVerifying(false);
          },
        });
        toast.success(
          'Account verified successfully! Redirecting to home screen...'
        );
      } else {
        console.error('Sign in attempt not complete:', signInAttempt);
        console.error('Sign in attempt status:', signInAttempt.status);
        toast.error('Status not complete, make sure all steps are completed.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      toast.error('Unable to sign in, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 justify-center items-center mt-20 w-md mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verification Code</h2>
        <p className="text-sm text-muted-foreground">
          Please enter the verification code sent to your email address.
        </p>
      </div>
      <form id="sign-in-verify-form" onSubmit={handleVerify}>
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={code}
          onChange={(value) => setCode(value)}
        >
          <InputOTPGroup className="flex justify-center items-center">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />

            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </form>
      <Button
        form="sign-in-verify-form"
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || isSubmitting}
        onClick={handleVerify}
      >
        {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Verify'}
      </Button>

      {errors && (
        <ul className="text-destructive text-sm font-normal">
          {errors.map((el, index) => (
            <li key={index}>{el.longMessage}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
