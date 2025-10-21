'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
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
import { Input } from '@/components/ui/input';
import { useAuth, useSignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SetStateAction, Dispatch, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

interface Props {
  successfulCreation: boolean;
  setSuccessfulCreation: Dispatch<SetStateAction<boolean>>;
}

function CreatePasswordResetForm({
  successfulCreation,
  setSuccessfulCreation,
}: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) router.push('/dashboard');
  }, [isSignedIn, router]);

  const handleCreatePasswordReset = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!isLoaded) {
      toast.error('Client is not loaded, please try again.');
      return;
    }
    setIsSubmitting(true);
    await signIn
      ?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      .then((_) => {
        setSuccessfulCreation(true);
        setError('');
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      })
      .finally(() => setIsSubmitting(false));
  };
  return (
    <div className="flex flex-col gap-8 justify-center items-center max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Enter your email address to receive a password reset code.
        </p>
      </div>

      <form onSubmit={handleCreatePasswordReset} className="w-full">
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
          </FieldGroup>
        </FieldSet>

        <Button
          className="w-full mt-8"
          disabled={
            (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            'Send Reset Code'
          )}
        </Button>
      </form>

      {error && <p>{error}</p>}

      <Link
        href="/sign-in"
        className="text-sm text-muted-foreground hover:text-primary/80"
      >
        Back to Login
      </Link>
    </div>
  );
}

function ResetPasswordForm({
  successfulCreation,
  setSuccessfulCreation,
}: Props) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoaded) {
      toast.error('Client is not loaded, please try again.');
      return;
    }

    if (!code || !password) {
      toast.error('Please enter a valid code and password.');
      return;
    }
    setIsSubmitting(true);
    await signIn
      ?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      })
      .then((result) => {
        if (result.status === 'complete') {
          // Set the active session to
          // the newly created session (user is now signed in)
          setActive({
            session: result.createdSessionId,
            navigate: async () => {
              router.push('/dashboard');
            },
          });
          setError('');
        } else {
          console.log(result);
        }
        toast.success(
          'Password reset successfully. Redirecting to dashboard...'
        );
      })
      .catch((err) => {
        console.error('error', err.errors[0].longMessage);
        setError(err.errors[0].longMessage);
      })
      .finally(() => setIsSubmitting(false));
  };
  return (
    <div className="flex flex-col gap-8 justify-center items-center max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Enter your new password to reset your account. You will be redirected
          to the dashboard after successfully resetting your password.
        </p>
      </div>
      <form onSubmit={handleResetPassword} className="w-full">
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="password"
                className="flex justify-between items-center"
              >
                Password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="reset-password"
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

            <Field>
              <FieldLabel htmlFor="code">Code</FieldLabel>
              <div className="flex justify-center items-center">
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
              </div>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Button
          type="submit"
          className="w-full mt-8"
          disabled={password.length <= 8 || code.length !== 6 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [successfulCreation, setSuccessfulCreation] = useState(false);

  if (successfulCreation) {
    return (
      <ResetPasswordForm
        successfulCreation={successfulCreation}
        setSuccessfulCreation={setSuccessfulCreation}
      />
    );
  }
  return (
    <CreatePasswordResetForm
      successfulCreation={successfulCreation}
      setSuccessfulCreation={setSuccessfulCreation}
    />
  );
}
