'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function SidebarNavCollapsible() {
  const { open: sidebarIsOpen, isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const router = useRouter();

  const preferences = useQuery(api.preferences.getPreferences);

  const isRouteActive = (
    type: 'podcasts' | 'videos',
    name: string,
    itemProvider: string
  ) =>
    `${pathname}?provider=${provider}` ===
    `/${type}/${encodeURIComponent(name)}?provider=${itemProvider}`;

  // function to only return the first 20 characters and add ... if the name is longer
  const truncateName = (name: string) => {
    if (name.length > 20) {
      return name.slice(0, 20) + '...';
    }
    return name;
  };

  const handleRouteTo = (
    type: 'podcasts' | 'videos',
    name: string,
    provider: string,
    channelId?: string
  ) => {
    router.push(
      `/${type}/${encodeURIComponent(name)}?provider=${provider}${
        channelId ? `&channelId=${channelId}` : ''
      }`
    );
    if (isMobile && sidebarIsOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Podcasts */}
      <div className="space-y-0">
        {preferences?.podcasts && preferences?.podcasts.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm">Podcasts</SidebarGroupLabel>

            <SidebarGroupContent>
              {preferences.podcasts.map((item, index) => (
                <SidebarGroup key={index}>
                  <SidebarGroupLabel
                    asChild
                    className="text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <SidebarMenuButton
                      isActive={isRouteActive('podcasts', item.name, 'apple')}
                      onClick={() =>
                        handleRouteTo('podcasts', item.name, 'apple')
                      }
                      className="flex w-full items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-[4px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">
                          {truncateName(item.name)}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarGroupLabel>
                </SidebarGroup>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </div>
    </>
  );
}
