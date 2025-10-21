'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { ChevronsUpDown, LogOut } from 'lucide-react';

export function SidebarNavFooter() {
  const { user } = useUser();
  return (
    <SidebarFooter className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between gap-2 border rounded-md cursor-pointer w-full shadow-sm p-2">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.firstName ?? ''}
                    />
                    <AvatarFallback className="rounded-full">{`${user?.firstName
                      ?.charAt(0)
                      .toUpperCase()}${user?.lastName
                      ?.charAt(0)
                      .toUpperCase()}`}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {user?.fullName ?? user?.emailAddresses[0].emailAddress}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.emailAddresses[0].emailAddress}
                    </span>
                  </div>
                  <ChevronsUpDown className="size-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="m-2">
                <DropdownMenuItem asChild>
                  <SignOutButton>
                    <div className="flex items-center gap-2 w-full cursor-pointer">
                      <LogOut
                        size={16}
                        className="opacity-80"
                        aria-hidden="true"
                      />
                      Logout
                    </div>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
