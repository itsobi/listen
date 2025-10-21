import { Ear } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ThemeToggle } from '../theme/theme-toggle';

export function AppLogo() {
  return (
    <Link href="/" className="dark:border-none rounded bg-[#0f172a] p-1">
      <Ear className="text-primary" />
    </Link>
  );
}

export function Navbar() {
  return (
    <nav
      className={cn('flex items-center justify-between max-w-5xl mx-auto p-4 ')}
    >
      <AppLogo />

      <div className="flex items-center gap-2">
        <Link href="/sign-in">
          <Button variant="outline">Login</Button>
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  );
}
