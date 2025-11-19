'use client';

import { SidebarHeader } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Notifications } from './notifications';

export function SidebarNavHeader() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 pb-0 pt-3">
          <Link
            href="/"
            className="italic font-bold tracking-wide text-primary"
          >
            Listen
          </Link>
          <Notifications />
        </div>
      </SidebarHeader>
    </>
  );
}
