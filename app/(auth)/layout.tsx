import { ThemeSwitcher } from '@/components/kibo-ui/theme-switcher';
import { AppLogo } from '@/components/landing-page/navbar';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between p-4">
        <AppLogo />
        <ThemeToggle />
      </div>
      <main className="flex justify-center mt-20 px-4 lg:px-0">{children}</main>
    </div>
  );
}
