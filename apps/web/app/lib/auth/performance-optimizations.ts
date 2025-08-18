/**
 * Performance Optimization Guide for React Router 7
 * 
 * This file contains additional performance optimizations beyond the basic route guards.
 */

import { getUserRole } from "./route-guards";

/**
 * 1. CACHING STRATEGIES
 */

/**
 * Cache user role in memory for the duration of the session
 * This prevents repeated API calls for the same user
 */
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedUserRole(request: Request): Promise<string | null> {
  const session = await import("~/lib/session.server").then(m => m.getSession(request.headers.get("Cookie")));
  const apiKey = session.get("apiKey");
  
  if (!apiKey) return null;
  
  // Check cache first
  const cached = roleCache.get(apiKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }
  
  // Fetch from API if not cached or expired
  const role = await getUserRole(request);
  if (role) {
    roleCache.set(apiKey, { role, timestamp: Date.now() });
  }
  
  return role;
}

/**
 * 2. PRELOADING STRATEGIES
 */

/**
 * Preload critical data for admin routes
 * This can be called from the sidebar when hovering over admin menu items
 */
export async function preloadAdminData(request: Request): Promise<void> {
  // Preload admin-specific data in the background
  // This improves perceived performance when navigating to admin routes
  
  try {
    // Preload in parallel - these will be cached by React Router
    await Promise.all([
      // Preload leave types data
      import("~/routes/admin/leave-types.server").then(m => m.loadLeaveTypes(request)),
      // Preload user management data
      import("~/components/userManagement/mock-users").then(m => m.mockUsers),
      // Add more preloads as needed
    ]);
  } catch (error) {
    // Silently fail preloading - it's just an optimization
    console.debug("Preloading failed:", error);
  }
}

/**
 * 3. OPTIMISTIC UPDATES
 */

/**
 * Optimistically update the UI before API calls complete
 * This makes the app feel faster
 */
export function createOptimisticUpdate<T>(
  currentData: T,
  updateFn: (data: T) => T
): { optimisticData: T; rollback: () => void } {
  const optimisticData = updateFn(currentData);
  
  return {
    optimisticData,
    rollback: () => {
      // This would be called if the API call fails
      // For now, we just return the original data
    }
  };
}

/**
 * 4. LAZY LOADING
 */

/**
 * Lazy load admin components to reduce initial bundle size
 * Only load admin components when needed
 */
export const lazyLoadAdminComponents = () => ({
  AdminDashboard: () => import("~/routes/admin/admin-dashboard"),
  UserManagement: () => import("~/routes/admin/user-management"),
  GroupsManagement: () => import("~/routes/admin/groups-management"),
  TeamRequests: () => import("~/routes/admin/team-requests"),
  LeaveTypesNew: () => import("~/routes/admin/leave-types.new"),
});

/**
 * 5. PERFORMANCE MONITORING
 */

/**
 * Track route transition performance
 * This helps identify slow routes
 */
export function trackRoutePerformance(routePath: string, startTime: number) {
  const duration = performance.now() - startTime;
  
  // Log slow routes for optimization
  if (duration > 100) {
    console.warn(`Slow route transition: ${routePath} took ${duration.toFixed(2)}ms`);
  }
  
  // You could send this to analytics
  if (duration > 500) {
    console.error(`Very slow route: ${routePath} took ${duration.toFixed(2)}ms`);
  }
}

/**
 * 6. BUNDLE OPTIMIZATION
 */

/**
 * Split admin and user code into separate chunks
 * This reduces the main bundle size for regular users
 */
export const adminRoutes = {
  path: "/admin",
  lazy: () => import("~/layouts/main"),
  children: [
    {
      path: "dashboard",
      lazy: () => import("~/routes/admin/admin-dashboard"),
    },
    {
      path: "user-management",
      lazy: () => import("~/routes/admin/user-management"),
    },
    // ... other admin routes
  ],
};

/**
 * 7. MEMORY MANAGEMENT
 */

/**
 * Clear role cache when user logs out
 * This prevents memory leaks
 */
export function clearRoleCache(apiKey: string): void {
  roleCache.delete(apiKey);
}

/**
 * Clear all caches (useful for testing or memory management)
 */
export function clearAllCaches(): void {
  roleCache.clear();
}
