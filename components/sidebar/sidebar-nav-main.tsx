'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HomeIcon, SettingsIcon, VideoIcon } from 'lucide-react';

const navMain = [
  {
    id: 'home',
    title: 'Home',
    url: '/home',
    icon: HomeIcon,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    url: '/preferences',
    icon: SettingsIcon,
  },
  {
    id: 'video-preferences',
    title: 'Video Preferences',
    url: '/video-preferences',
    icon: VideoIcon,
  },
];

export function SidebarNavMain() {
  const { open: sidebarIsOpen, isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navMain.map((item) => {
          const isActive = pathname === item.url;
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.title}
                onClick={() => {
                  if (item.url) {
                    router.push(item.url);
                    if (isMobile && sidebarIsOpen) {
                      toggleSidebar();
                    }
                  }
                }}
              >
                <Icon
                  className={cn('mr-2 size-4', isActive && 'dark:text-primary')}
                />
                <span className={cn(isActive && 'dark:text-primary')}>
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
