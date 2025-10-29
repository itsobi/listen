import { ConvexClientProvider } from '@/components/providers/convex-client-provider';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main>
            <div className="flex items-center justify-between p-4">
              <SidebarTrigger className="md:hidden" />
              <div className="md:block" />
              <ThemeToggle />
            </div>

            <div className="max-w-7xl mx-auto px-8 pb-8">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
