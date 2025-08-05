import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  // for auth
  route("/", "layouts/auth.tsx", [index("routes/login.tsx")]),

  // main app route
  layout("layouts/main.tsx", [
    route("/dashboard", "routes/admin/admin-dashboard.tsx"),
    route("/groups", "routes/admin/groups-management.tsx"),
    // route("/dashboard", "routes/dashboard.tsx"),
    // User magement - only available when admin - crate resticted routes once login is setup.
    route("/user-management", "routes/admin/user-management.tsx"),
    route("/apply-leave", "routes/apply-leave.tsx"),
    route("/my-leaves", "routes/my-leaves.tsx"),
  ]),
] satisfies RouteConfig;
