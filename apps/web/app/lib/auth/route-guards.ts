import { redirect } from "react-router";
import { getSession } from "~/lib/session.server";
import { getUserMembership } from "~/lib/api/organization/membership";

export type UserRole = "OWNER" | "ADMIN" | "EMPLOYEE";

export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

// Define which routes are accessible to which roles
export const ROUTE_ACCESS: Record<string, RouteConfig> = {
  // Admin routes - only OWNER and ADMIN can access
  "/admin": { path: "/admin", allowedRoles: ["OWNER", "ADMIN"] },
  "/admin/leave-types": { path: "/admin/leave-types", allowedRoles: ["OWNER", "ADMIN"] },
  "/admin/leave-types/new": { path: "/admin/leave-types/new", allowedRoles: ["OWNER", "ADMIN"] },
  "/admin-dashboard": { path: "/admin-dashboard", allowedRoles: ["OWNER", "ADMIN"] },
  "/admin/groups": { path: "/admin/groups-management", allowedRoles: ["OWNER", "ADMIN"] },
  "/admin/team-requests": { path: "/admin/team-requests", allowedRoles: ["OWNER", "ADMIN"] },
  "/user-management": { path: "/user-management", allowedRoles: ["OWNER", "ADMIN"] },
  
  // User routes - all roles can access
  "/dashboard": { path: "/dashboard", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/apply-leave": { path: "/apply-leave", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/team-requests": { path: "/team-requests", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/my-leaves": { path: "/my-leaves", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/groups": { path: "/groups", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/leave-balance": { path: "/leave-balance", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/team-calendar": { path: "/team-calendar", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/public-holidays": { path: "/public-holidays", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
  "/policies": { path: "/policies", allowedRoles: ["OWNER", "ADMIN", "EMPLOYEE"] },
};

/**
 * Check if a user has access to a specific route based on their role
 */
export function hasRouteAccess(userRole: UserRole, routePath: string): boolean {
  // Find the most specific route match
  const routeConfig = ROUTE_ACCESS[routePath];
  if (!routeConfig) {
    // If no specific config, default to allowing access
    return true;
  }
  
  return routeConfig.allowedRoles.includes(userRole);
}

/**
 * Get the user's role from the session and API
 * This is optimized for individual route loaders
 */
export async function getUserRole(request: Request): Promise<UserRole | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const apiKey = session.get("apiKey");
  const currentOrgId = session.get("currentOrgId");

  if (!apiKey || !currentOrgId) {
    return null;
  }

  try {
    const membership = await getUserMembership({ apiKey, organizationId: currentOrgId });
    return membership.role;
  } catch (error) {
    console.error("Failed to fetch user role:", error);
    return null;
  }
}

/**
 * Optimized route guard for individual route loaders
 * Returns the user role if authorized, or a redirect response if not
 */
export async function requireRole(request: Request, routePath: string, requiredRoles: UserRole[]): Promise<UserRole | Response> {
  const userRole = await getUserRole(request);
  
  if (!userRole) {
    // No role found, redirect to login
    return redirect("/auth/login");
  }

  if (!requiredRoles.includes(userRole)) {
    // User doesn't have access, redirect to dashboard
    return redirect("/dashboard");
  }

  // User has access, return the role for use in the route
  return userRole;
}

/**
 * Legacy route guard function (kept for backward compatibility)
 * @deprecated Use requireRole for better performance
 */
export async function guardRoute(request: Request, routePath: string): Promise<Response | null> {
  const userRole = await getUserRole(request);
  
  if (!userRole) {
    // No role found, redirect to login
    return redirect("/auth/login");
  }

  if (!hasRouteAccess(userRole, routePath)) {
    // User doesn't have access, redirect to dashboard
    return redirect("/dashboard");
  }

  // User has access, return null to continue
  return null;
}

/**
 * Check if user is admin (OWNER or ADMIN)
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === "OWNER" || userRole === "ADMIN";
}

/**
 * Check if user is owner
 */
export function isOwner(userRole: UserRole): boolean {
  return userRole === "OWNER";
}
