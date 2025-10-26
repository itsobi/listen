'use client';

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { IconAd2, IconNews, IconSettingsCode } from '@tabler/icons-react';
import { LayoutDashboard, List, Package, Pointer } from 'lucide-react';
import { SidebarNavCollapsible } from '@/components/sidebar/sidebar-nav-collapsible';
import { SidebarNavFooter } from '@/components/sidebar/sidebar-nav-footer';
import { SidebarNavHeader } from '@/components/sidebar/sidebar-nav-header';
import { SidebarNavMain } from '@/components/sidebar/sidebar-nav-main';
import type { SidebarData } from '@/components/sidebar/types';

const data: SidebarData = {
  navMain: [
    {
      id: 'home',
      title: 'Home',
      url: '/home',
      icon: '🏠',
    },
    {
      id: 'preferences',
      title: 'Preferences',
      url: '/preferences',
      icon: '⚙️',
    },
    {
      id: 'episodes',
      title: 'Episodes',
      url: '/episodes',
      icon: '📋',
    },
  ],
  navCollapsible: {
    favorites: [
      {
        id: 'design',
        title: 'Design',
        href: '#',
        color: 'bg-green-400 dark:bg-green-300',
      },
      {
        id: 'development',
        title: 'Development',
        href: '#',
        color: 'bg-blue-400 dark:bg-blue-300',
      },
      {
        id: 'workshop',
        title: 'Workshop',
        href: '#',
        color: 'bg-orange-400 dark:bg-orange-300',
      },
      {
        id: 'personal',
        title: 'Personal',
        href: '#',
        color: 'bg-red-400 dark:bg-red-300',
      },
    ],
    teams: [
      {
        id: 'engineering',
        title: 'Engineering',
        icon: IconSettingsCode,
      },
      {
        id: 'marketing',
        title: 'Marketing',
        icon: IconAd2,
      },
    ],
    topics: [
      {
        id: 'product-updates',
        title: 'Product Updates',
        icon: Package,
      },
      {
        id: 'company-news',
        title: 'Company News',
        icon: IconNews,
      },
    ],
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarNavHeader data={data} />
      <SidebarContent>
        <SidebarNavMain items={data.navMain} />
        <SidebarNavCollapsible
          favorites={data.navCollapsible.favorites}
          teams={data.navCollapsible.teams}
          topics={data.navCollapsible.topics}
        />
      </SidebarContent>
      <SidebarNavFooter />
    </Sidebar>
  );
}
