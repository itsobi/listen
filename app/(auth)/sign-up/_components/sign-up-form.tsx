'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { useSignIn, useSignUp } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { ClerkAPIError, OAuthStrategy } from '@clerk/types';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Eye, EyeOff, Loader } from 'lucide-react';
import Link from 'next/link';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  verifying: boolean;
  setVerifying: Dispatch<SetStateAction<boolean>>;
}

export function SignUpForm({ verifying, setVerifying }: Props) {
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignUpLoaded) return;

    try {
      setIsSubmitting(true);
      await signUp.create({
        emailAddress,
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

  const handleGoogleSignUp = async (strategy: OAuthStrategy) => {
    if (!isSignInLoaded) return;

    toast.promise(
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/home',
      }),
      {
        loading: 'Signing up with Google...',
        success:
          'Signed up with Google successfully. Redirecting to the home screen...',
        error: (error) => {
          if (isClerkAPIResponseError(error)) setErrors(error.errors);
          return (
            error.errors[0]?.longMessage ||
            'Unable to sign up with Google, please try again.'
          );
        },
        finally: () => {
          setIsSubmitting(false);
        },
      }
    );
  };
  return (
    <div className="flex flex-col gap-8 justify-center items-center w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Welcome to <span className="text-primary animate-pulse">Listen</span>
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Enter your email address or sign up with Google to get create an
          account.
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
                autoCapitalize="none"
                autoComplete="off"
                placeholder="example@gmail.com"
              />

              {emailAddress.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) && (
                  <FieldError>Please enter a valid email address.</FieldError>
                )}
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button
          type="submit"
          className="w-full mt-8"
          disabled={
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress) || isSubmitting
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

      <Button
        variant="outline"
        className="w-full"
        disabled={!isSignInLoaded || isSubmitting}
        onClick={() => handleGoogleSignUp('oauth_google')}
      >
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
