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
import { ChevronsUpDown, LogOut, User } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

export function SidebarNavFooter() {
  const { user } = useUser();
  const router = useRouter();
  return (
    <SidebarFooter className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between gap-2 border rounded-md cursor-pointer w-full shadow-sm p-2">
                  <div className="flex items-center gap-2">
                    {user?.imageUrl ? (
                      <Avatar className="h-8 w-8 rounded-full">
                        <AvatarImage
                          src={user?.imageUrl}
                          alt={user?.firstName ?? ''}
                        />
                      </Avatar>
                    ) : (
                      <Skeleton className="h-8 w-8 rounded-full" />
                    )}
                    <div className="flex flex-col">
                      {user ? (
                        <>
                          <p className="text-xs font-semibold text-muted-foreground">
                            {user?.fullName ??
                              user?.emailAddresses[0].emailAddress}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.emailAddresses[0].emailAddress}
                          </p>
                        </>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-20 rounded-full" />
                          <Skeleton className="h-4 w-32 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronsUpDown className="size-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="m-2">
                <DropdownMenuItem asChild>
                  <button onClick={() => router.push('/user-profile')}>
                    <div className="flex items-center gap-2 w-full cursor-pointer">
                      <User
                        size={16}
                        className="opacity-80"
                        aria-hidden="true"
                      />
                      Manage Account
                    </div>
                  </button>
                </DropdownMenuItem>
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
