import {
  Briefcase,
  CalendarCog,
  LayoutDashboard,
  Route,
  Settings,
  Ticket,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Routes",
    url: "/routes",
    icon: Route,
  },
  {
    title: "Schedules",
    url: "/schedules",
    icon: CalendarCog,
  },
  {
    title: "Trips",
    url: "/trips",
    icon: Briefcase,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: Ticket,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      {
        title: "General",
        url: "/settings/general",
      },
      {
        title: "Teams",
        url: "/settings/teams",
      },
      {
        title: "Authorisation",
        url: "/settings/authorisation",
      },
    ],
  },
];
