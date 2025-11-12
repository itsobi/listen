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
import { useSignIn } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import {
  ClerkAPIError,
  EmailCodeFactor,
  OAuthStrategy,
  SignInFirstFactor,
} from '@clerk/types';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { SetStateAction, Dispatch, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  verifying: boolean;
  setVerifying: Dispatch<SetStateAction<boolean>>;
}

export default function SignInForm({ verifying, setVerifying }: Props) {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded && !signIn) return;

    try {
      setIsSubmitting(true);
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      const isEmailCodeFactor = (
        factor: SignInFirstFactor
      ): factor is EmailCodeFactor => {
        return factor.strategy === 'email_code';
      };

      const emailCodeFactor = supportedFirstFactors?.find(isEmailCodeFactor);

      if (emailCodeFactor) {
        const { emailAddressId } = emailCodeFactor;

        // send OTP code to user
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId,
        });
        setVerifying(true);
      }
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      if (isClerkAPIResponseError(error)) setErrors(error.errors);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to sign in, please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (strategy: OAuthStrategy) => {
    if (!isLoaded && !signIn) return;
    setIsSubmitting(true);

    toast.promise(
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/home',
      }),
      {
        loading: 'Signing in with Google...',
        success: 'Signed in successfully, redirecting to the home screen...',
        error: (error) => {
          if (isClerkAPIResponseError(error)) setErrors(error.errors);
          return error instanceof Error
            ? error.message
            : 'Unable to sign in, please try again.';
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
        <h1 className="text-2xl font-bold tracking-wide">Welcome Back!</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                aria-invalid={
                  email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                }
                autoCapitalize="none"
                autoComplete="off"
                placeholder="example@gmail.com"
              />
              {email.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <FieldError>Please enter a valid email address.</FieldError>
                )}
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button
          type="submit"
          className="w-full mt-8"
          disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || isSubmitting}
        >
          {isSubmitting ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {errors && (
        <ul className="text-destructive text-sm font-normal">
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
        onClick={() => handleGoogleSignIn('oauth_google')}
        disabled={!signIn || isSubmitting}
        type="button"
      >
        <IconBrandGoogleFilled /> Sign in with Google
      </Button>

      <span className="text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-primary hover:text-primary/80">
          Sign up
        </Link>
      </span>
    </div>
  );
}
