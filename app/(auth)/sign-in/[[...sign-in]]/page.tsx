'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClerkAPIError, OAuthStrategy } from '@clerk/types';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { toast } from 'sonner';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ClerkAPIError[]>();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async () => {
            router.push('/dashboard');
          },
        });
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      toast.error('Unable to sign in, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (strategy: OAuthStrategy) => {
    if (!signIn) return;

    setIsSubmitting(true);

    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
      .then((res) => {
        toast.success('Signed in successfully. Redirecting to dashboard...');
      })
      .catch((err: any) => {
        if (isClerkAPIResponseError(err)) setErrors(err.errors);
        toast.error('Unable to sign in, please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex flex-col gap-8 justify-center items-center w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome Back!</h1>
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
                autoComplete="off"
                placeholder="example@gmail.com"
              />
              {email.length > 0 &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
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
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            password.length < 8 ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            'Sign in'
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
        onClick={() => handleGoogleSignIn('oauth_google')}
        disabled={isSubmitting || !signIn}
        type="button"
      >
        {isSubmitting ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <>
            <IconBrandGoogleFilled /> Sign in with Google
          </>
        )}
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
