import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/analysis", "routes/analysis.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  // Catch-all route for unknown paths (including Chrome DevTools requests)
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
