import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Catch-all route for unknown paths (including Chrome DevTools requests)
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
