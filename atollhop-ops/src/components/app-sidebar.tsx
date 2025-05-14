'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { OpsIcon } from './icons';
import { NavMain } from './nav-main';
import { navItems } from '@/config/nav';
import { NavUser } from './nav-user';
import { usePathname } from 'next/navigation';

const userData = {
  name: 'Demo',
  email: 'demo@demo.com',
  avatar: '',
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      {...props}
      role="complementary"
      aria-label="Application sidebar"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <span className="flex h-8 w-8 items-center justify-center">
                  <OpsIcon />
                </span>
                <span className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">demo</span>
                  <small>v1.0.0</small>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} activePath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
