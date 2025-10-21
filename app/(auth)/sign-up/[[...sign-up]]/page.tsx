'use client';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ClerkAPIError } from '@clerk/types';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

interface Props {
  verifying: boolean;
  setVerifying: Dispatch<SetStateAction<boolean>>;
}

function VerifyForm({ verifying, setVerifying }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error('Please enter a valid verification code.');
      return;
    }

    if (!isLoaded) {
      toast.error('Client is not loaded, please try again.');
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
            router.push('/dashboard');
            setVerifying(false);
          },
        });
        toast.success(
          'Account created successfully. Redirecting to dashboard...'
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
          Enter the verification code sent to your email address.
        </p>
      </div>
      <form id="verify-form" onSubmit={handleVerify}>
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
        form="verify-form"
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || isSubmitting}
        onClick={handleVerify}
      >
        {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Verify'}
      </Button>

      {errors && (
        <ul className="text-destructive text-xs font-normal list-disc list-inside">
          {errors.map((el, index) => (
            <li key={index}>{el.longMessage}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignUpForm({ verifying, setVerifying }: Props) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      setIsSubmitting(true);
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setVerifying(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      toast.error('Unable to create account, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col gap-8 justify-center items-center w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Welcome to <span className="text-primary animate-pulse">Listen</span>
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Enter your details or sign up with Google to get create an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                type="email"
                required
                aria-invalid={
                  emailAddress.length > 0 &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
                }
                autoComplete="off"
                placeholder="example@gmail.com"
              />
              {emailAddress.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) && (
                  <FieldError>Please enter a valid email address.</FieldError>
                )}
            </Field>
            <Field>
              <FieldLabel
                htmlFor="password"
                className="flex justify-between items-center"
              >
                <span>Password</span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-muted-foreground/80"
                >
                  Forgot password?
                </Link>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  aria-invalid={password.length > 0 && password.length < 8}
                  placeholder="********"
                  autoComplete="off"
                />
                <InputGroupAddon
                  align={'inline-end'}
                  onClick={() => setShowPassword(!showPassword)}
                  className={
                    password.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupAddon>
              </InputGroup>

              {password.length > 0 && password.length < 8 && (
                <FieldError>
                  Password must be at least 8 characters long.
                </FieldError>
              )}
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button
          type="submit"
          className="w-full mt-8"
          disabled={
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) ||
            password.length < 8 ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {errors && (
        <ul className="text-destructive text-xs font-normal list-disc list-inside">
          {errors.map((el, index) => (
            <li key={index}>{el.longMessage}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-[1px] bg-muted-foreground" />
        <span className="text-xs text-muted-foreground">Or</span>
        <div className="flex-1 h-[1px] bg-muted-foreground" />
      </div>

      <Button variant="outline" className="w-full">
        <IconBrandGoogleFilled />
        Sign up with Google
      </Button>

      <span className="text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-primary hover:text-primary/80">
          Sign in
        </Link>
      </span>
    </div>
  );
}

export default function Page() {
  const [verifying, setVerifying] = useState(false);

  if (verifying) {
    return <VerifyForm verifying={verifying} setVerifying={setVerifying} />;
  }

  return <SignUpForm verifying={verifying} setVerifying={setVerifying} />;
}
