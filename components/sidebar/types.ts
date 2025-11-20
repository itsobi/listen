import type { ElementType } from 'react';

export interface NavItem {
  id: string;
  title: string;
  icon: ElementType;
  url?: string;
  isActive?: boolean;
}

export interface PodcastItem {
  id: string;
  title: string;
  href: string;
  color: string;
}

export interface TeamItem {
  id: string;
  title: string;
  icon: ElementType;
}

export interface TopicItem {
  id: string;
  title: string;
  icon: ElementType;
}

export interface SidebarData {
  navMain: NavItem[];
}
