'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { NavItem } from './types';
import { usePathname, useRouter } from 'next/navigation';

export function SidebarNavMain({ items }: { items: NavItem[] }) {
  const { open: sidebarIsOpen, isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;
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
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
