import { Ear } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggle } from '../theme/theme-toggle';

export function AppLogo() {
  return (
    <Link href="/" className="italic font-thin tracking-wide text-primary">
      Listen
    </Link>
  );
}

export function Navbar() {
  return (
    <nav
      className={cn('flex items-center justify-between max-w-5xl mx-auto p-4 ')}
    >
      <AppLogo />

      <div className="flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-sm font-medium hover:text-primary"
        >
          Login
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  );
}
