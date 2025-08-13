import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // for auth
  route("/", "layouts/auth.tsx", [index("routes/auth/login.tsx")]),
  route("/authCallback", "routes/auth/authCallback.tsx"),
  route("/select", "routes/orgs/select.tsx"),
  route("/onboarding", "routes/onboarding.tsx"),

  // main app route
  layout("layouts/main.tsx", [
    route("/dashboard", "routes/admin/admin-dashboard.tsx"),
    route("/admin/leave-types/new", "routes/admin/leave-types.new.tsx"),
    route("/groups", "routes/admin/groups-management.tsx"),
    route("/team-requests", "routes/admin/team-requests.tsx"),
    // route("/dashboard", "routes/dashboard.tsx"),
    // User magement - only available when admin - crate resticted routes once login is setup.
    route("/user-management", "routes/admin/user-management.tsx"),
    route("/apply-leave", "routes/apply-leave.tsx"),
    route("/my-leaves", "routes/my-leaves.tsx"),
  ]),
] satisfies RouteConfig;
