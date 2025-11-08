'use client';

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';

import { SidebarNavCollapsible } from '@/components/sidebar/sidebar-nav-collapsible';
import { SidebarNavFooter } from '@/components/sidebar/sidebar-nav-footer';
import { SidebarNavHeader } from '@/components/sidebar/sidebar-nav-header';
import { SidebarNavMain } from '@/components/sidebar/sidebar-nav-main';
import { Suspense } from 'react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarNavHeader />
      <SidebarContent>
        <SidebarNavMain />
        <SidebarNavCollapsible />
      </SidebarContent>
      <SidebarNavFooter />
    </Sidebar>
  );
}
