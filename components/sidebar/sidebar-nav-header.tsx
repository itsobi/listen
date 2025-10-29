'use client';

import { SidebarHeader } from '@/components/ui/sidebar';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Link from 'next/link';

export function SidebarNavHeader() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 pb-0 pt-3">
          <Link
            href="/"
            className="italic font-thin tracking-wide text-primary"
          >
            Listen
          </Link>
          <Popover>
            <PopoverTrigger asChild className="cursor-pointer">
              <Bell className="size-4 hover:text-primary" />
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col gap-2">
                <p>Notifications</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </SidebarHeader>
    </>
  );
}
