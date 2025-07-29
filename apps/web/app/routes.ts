import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("/", "layouts/auth.tsx", [index("routes/login.tsx")]),

  layout("layouts/main.tsx", [route("/home", "routes/home.tsx")]),
] satisfies RouteConfig;
