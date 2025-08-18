import {
  BookOpenText,
  Calendar,
  CalendarClock,
  FileSignatureIcon,
  Flag,
  Home,
  Inbox,
  List,
  LucideCalendarDays,
  PieChart,
  PlusCircle,
  Search,
  Settings,
  UserCheck,
  UsersRound,
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
import { Link, useLocation, useLoaderData } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getSessionUser } from "~/lib/session";
import LogoutButton from "~/components/auth/logoutButton";
import { Outlet } from "react-router";
import type { UserRole } from "~/lib/auth/route-guards";

// Menu items configuration
const getAllMenuItems = () => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    roles: ["EMPLOYEE"] as UserRole[],  //"OWNER", "ADMIN", 
  },
  {
    title: "Admin Dashboard",
    url: "/admin-dashboard",
    icon: Settings,
    roles: ["OWNER", "ADMIN"] as UserRole[],
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCheck,
    roles: ["OWNER", "ADMIN"] as UserRole[],
  },
  {
    title: "Groups Management",
    url: "/admin/groups",
    icon: UsersRound,
    roles: ["OWNER", "ADMIN"] as UserRole[],
  },
  {
    title: "Team Requests",
    url: "/admin/team-requests",
    icon: FileSignatureIcon,
    roles: ["OWNER", "ADMIN"] as UserRole[],
  },
  {
    title: "Apply for Leave",
    url: "/apply-leave",
    icon: PlusCircle,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
  {
    title: "My Leaves",
    url: "/my-leaves",
    icon: List,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
  {
    title: "Leave Balance",
    // url: "/leave-balance",
    icon: PieChart,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
  {
    title: "Team Calendar",
    // url: "/team-calendar",
    icon: LucideCalendarDays,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
  {
    title: "Public Holidays",
    // url: "/public-holidays",
    icon: Flag,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
  {
    title: "Policies & Documents",
    // url: "/policies",
    icon: BookOpenText,
    roles: ["OWNER", "ADMIN", "EMPLOYEE"] as UserRole[],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { membership, userRole } = useLoaderData() as { membership: any; userRole: UserRole | null };
  const [name, setName] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (!userRole) return getAllMenuItems();
    return getAllMenuItems().filter(item => item.roles.includes(userRole));
  }, [userRole]);

  // Preload admin routes on hover for better performance
  const handleAdminItemHover = useCallback(async (url: string | undefined) => {
    if (!url || !(userRole === "OWNER" || userRole === "ADMIN")) return;
    
    try {
      // Preload the route component and data
      if (url.startsWith("/admin") || url === "/user-management") {
        // This will trigger React Router's built-in preloading
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        document.head.appendChild(link);
      }
    } catch (error) {
      // Silently fail preloading - it's just an optimization
      console.debug("Preloading failed:", error);
    }
  }, [userRole]);

  useEffect(() => {
    const load = () => {
      const u = getSessionUser();
      setName(u?.name ?? undefined);
      setEmail(u?.email ?? undefined);
      setAvatarUrl(u?.avatarUrl ?? undefined);
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "lm_user") load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [location.pathname]);

  const initials = (name || email || "").split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("") || "?";

  return (
    <Sidebar className="border-r" variant="sidebar">
      <SidebarHeader className="bg-primary px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary-foreground">
            <CalendarClock size={24} color="black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-secondary">
              Leave Manager
            </h1>
            {membership ? (
              <p className="text-xs text-muted-foreground">{membership.organizationName}{membership.role ? ` • ${membership.role}` : ""}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Employee Portal</p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-primary px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {/* Navigation */}
          </SidebarGroupLabel>
          <SidebarGroupContent className="gap-1 pt-2 text-secondary">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="h-10 px-3 font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    onMouseEnter={() => handleAdminItemHover(item.url)}
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

      <SidebarFooter className="bg-primary border-t p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 bg-secondary">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || email || "User"}
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name || "Signed in"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {email || "--"}
            </p>
          </div>
          
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
