import fs from "fs";
import path from "path";

const APP_DIR = path.join(process.cwd(), "app");
const OUT_FILE = path.join(process.cwd(), "route-inventory.json");

interface RouteInfo {
  path: string;
  type: "page" | "api";
  isProtected: boolean;
  file: string;
}

const routes: RouteInfo[] = [];

function scanDir(dir: string, baseRoute: string = "") {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Handle route groups (folders in parentheses)
      let segment = entry.name;
      let isGroup = false;

      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        isGroup = true;
        // Don't add group name to route path
        scanDir(fullPath, baseRoute);
      } else if (entry.name.startsWith("[") && entry.name.endsWith("]")) {
        // Dynamic segement
        scanDir(fullPath, `${baseRoute}/${entry.name}`);
      } else {
        scanDir(fullPath, `${baseRoute}/${entry.name}`);
      }
    } else {
      if (entry.name === "page.tsx" || entry.name === "page.ts") {
        const routePath = baseRoute || "/";
        const isProtected = isRouteProtected(dir, routePath);
        routes.push({
          path: routePath,
          type: "page",
          isProtected,
          file: fullPath.replace(process.cwd(), "").replace(/^\\/, ""),
        });
      } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
        const routePath = baseRoute;
        const isProtected = isRouteProtected(dir, routePath);
        routes.push({
          path: routePath,
          type: "api",
          isProtected,
          file: fullPath.replace(process.cwd(), "").replace(/^\\/, ""),
        });
      }
    }
  }
}

function isRouteProtected(dir: string, routePath: string): boolean {
  // Heuristic: check if path contains (admin) or url starts with /admin or /dashboard
  // Also check if the file path has (admin) in it.

  const relativePath = dir.replace(APP_DIR, "");

  if (relativePath.includes("(admin)")) return true;
  if (routePath.startsWith("/admin")) return true;
  if (routePath.startsWith("/dashboard")) return true;
  if (routePath.includes("/api/admin")) return true;

  return false;
}

console.log("Scanning app directory...");
scanDir(APP_DIR);
console.log(`Found ${routes.length} routes.`);

fs.writeFileSync(OUT_FILE, JSON.stringify(routes, null, 2));
console.log(`Inventory written to ${OUT_FILE}`);
