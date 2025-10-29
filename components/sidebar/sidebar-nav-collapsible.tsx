'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import { PodcastItem, TeamItem, TopicItem } from '@/components/sidebar/types';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  IconBrandAppleFilled,
  IconBrandSpotifyFilled,
  IconBrandYoutubeFilled,
} from '@tabler/icons-react';

const ProviderIconsMap = {
  apple: <IconBrandAppleFilled className="size-4" />,
  spotify: <IconBrandSpotifyFilled className="size-4" />,
  youtube: <IconBrandYoutubeFilled className="size-4" />,
};

export function SidebarNavCollapsible() {
  const preferences = useQuery(api.preferences.getPreferences);
  const { open: sidebarIsOpen, isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const router = useRouter();

  const isRouteActive = (name: string, itemProvider: string) =>
    `${pathname}?provider=${provider}` ===
    `/podcasts/${encodeURIComponent(name)}?provider=${itemProvider}`;

  // function to only return the first 20 characters and add ... if the name is longer
  const truncateName = (name: string) => {
    if (name.length > 20) {
      return name.slice(0, 20) + '...';
    }
    return name;
  };

  const routeToPodcast = (name: string, provider: string) => {
    router.push(`/podcasts/${encodeURIComponent(name)}?provider=${provider}`);
    if (isMobile && sidebarIsOpen) {
      toggleSidebar();
    }
  };

  if (!preferences) return null;

  return (
    <div className="space-y-0">
      {preferences?.podcasts && preferences?.podcasts.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Podcasts</SidebarGroupLabel>

          <SidebarGroupContent>
            {preferences.podcasts.map((item, index) => (
              <Collapsible
                key={index}
                className="group/collapsible"
                defaultOpen={preferences.providers.some((p) =>
                  isRouteActive(item.name, p)
                )}
              >
                <SidebarGroup>
                  <SidebarGroupLabel
                    asChild
                    className="text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-[4px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">
                          {truncateName(item.name)}
                        </span>
                      </div>
                      <ChevronDown className="transition-transform group-data-[state=closed]/collapsible:rotate-0 group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <div className="ml-3 px-2 border-l">
                      <SidebarGroupContent className="mt-2">
                        <SidebarMenu>
                          {preferences.providers.map((provider, index) => (
                            <SidebarMenuItem key={index}>
                              <SidebarMenuButton
                                className={cn(
                                  'capitalize',
                                  isRouteActive(item.name, provider) &&
                                    'dark:text-primary'
                                )}
                                isActive={isRouteActive(item.name, provider)}
                                onClick={() =>
                                  routeToPodcast(item.name, provider)
                                }
                              >
                                {
                                  ProviderIconsMap[
                                    provider as keyof typeof ProviderIconsMap
                                  ]
                                }
                                {provider}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </div>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </div>
  );
}
