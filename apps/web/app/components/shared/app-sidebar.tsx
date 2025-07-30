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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "../ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router";

// Menu items configuration
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Apply for Leave",
    url: "/apply-leave",
    icon: PlusCircle,
  },
  {
    title: "My Leaves",
    url: "/my-leaves",
    icon: List,
  },
  {
    title: "Leave Balance",
    // url: "/leave-balance",
    icon: PieChart,
  },
  {
    title: "Team Calendar",
    // url: "/team-calendar",
    icon: LucideCalendarDays,
  },
  {
    title: "Public Holidays",
    // url: "/public-holidays",
    icon: Flag,
  },
  {
    title: "Policies & Documents",
    // url: "/policies",
    icon: BookOpenText,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className=" px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarClock size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">Leave Manager</h1>
            <p className="text-sm text-muted-foreground">Employee Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="gap-1 pt-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="h-10 px-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 bg-muted/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            JD
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">
              john.doe@company.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
