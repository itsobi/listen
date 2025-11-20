'use client';

import { useSignUp } from '@clerk/nextjs';
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

export function SignUpVerifyForm({ verifying, setVerifying }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded && !signUp) return;

    if (code.length !== 6) {
      toast.error('Please enter a valid verification code.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async () => {
            router.push('/home');
            setVerifying(false);
          },
        });
        toast.success(
          'Account created successfully! Redirecting to the home screen...'
        );
      } else {
        console.error('Sign-up attempt not complete:', signUpAttempt);
        console.error('Sign-up attempt status:', signUpAttempt.status);
        toast.error('Status not complete, make sure all steps are completed.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      toast.error('Unable to create account, please try again.');
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
      <form id="sign-up-verify-form" onSubmit={handleVerify}>
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
        form="sign-up-verify-form"
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
