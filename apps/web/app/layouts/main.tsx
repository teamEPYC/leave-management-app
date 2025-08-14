import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/shared/app-sidebar";
import { Separator } from "../components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Outlet } from "react-router";
import { useEffect } from "react";
import { setSessionUser } from "~/lib/session";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      if (userParam) {
        const u = JSON.parse(decodeURIComponent(userParam));
        if (u && (u.name || u.email || u.avatarUrl || u.id)) {
          setSessionUser({ id: u.id ?? null, name: u.name ?? null, email: u.email ?? null, avatarUrl: u.avatarUrl ?? null });
        }
        if (u && (u.organizationName || u.role)) {
          try {
            window.localStorage.setItem("lm_org", JSON.stringify({ name: u.organizationName ?? null, role: u.role ?? null }));
          } catch {}
        }
      }
    } catch {}
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-muted">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-card">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Leave Management
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-6 bg-muted">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
