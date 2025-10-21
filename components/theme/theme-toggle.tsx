'use client';

import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Skeleton } from '../ui/skeleton';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-15 h-7 rounded-full" />;
  }

  return (
    <ThemeSwitcher
      defaultValue="system"
      onChange={setTheme}
      value={theme as 'light' | 'dark' | 'system'}
    />
  );
}
