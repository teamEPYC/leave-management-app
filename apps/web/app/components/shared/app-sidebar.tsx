import {
  BookOpenText,
  Calendar,
  CalendarClock,
  Flag,
  Home,
  Inbox,
  List,
  LucideCalendarDays,
  PieChart,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Apply for Leave",
    url: "#",
    icon: PlusCircle,
  },
  {
    title: "My Leaves",
    url: "#",
    icon: List,
  },
  {
    title: "Leave Balance",
    url: "#",
    icon: PieChart,
  },
  {
    title: "Team Calendar",
    url: "#",
    icon: LucideCalendarDays,
  },
  {
    title: "Public Holidays",
    url: "#",
    icon: Flag,
  },
  {
    title: "Policies & Documents",
    url: "#",
    icon: BookOpenText,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="gap-2.5 text-lg">
            <CalendarClock size={64} /> Leave Management
          </SidebarGroupLabel>
          <SidebarGroupContent className="h-57 gap-2 pt-2 pr-0 pb-2 pl-0">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
