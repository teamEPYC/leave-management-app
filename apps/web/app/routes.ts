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
  layout("layouts/main.tsx", [route("/dashboard", "routes/dashboard.tsx")]),
] satisfies RouteConfig;
