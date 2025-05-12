import { Express, Router } from "express";
import fs from "fs";
import path from "path";
import logger from "./logger";

interface RouteMeta {
  path: string;
  method: string;
  fullPath: string;
  file: string;
  protected: boolean;
  description?: string;
}

interface AutoRouterOptions {
  verbose?: boolean;
  baseApiPath?: string;
  excludeDirs?: string[];
}

/**
 * Registers all route files automatically
 * Scans directories for files with .routes.ts pattern and registers them
 *
 * @param app Express application
 * @param basePath Base directory to scan for route files
 * @param options Configuration options
 */
export function registerRoutes(
  app: Express,
  basePath: string,
  options: AutoRouterOptions = {}
): RouteMeta[] {
  const {
    verbose = true,
    baseApiPath = "/api",
    excludeDirs = ["node_modules", "dist", ".git"],
  } = options;

  // Create the main API router
  const apiRouter = Router();
  app.use(baseApiPath, apiRouter);

  // Track registered routes
  const registeredRoutes: RouteMeta[] = [];

  // Function to scan directories recursively
  function scanDir(dirPath: string, mountPath: string = "") {
    // Skip excluded directories
    const dirName = path.basename(dirPath);
    if (excludeDirs.includes(dirName)) {
      return;
    }

    try {
      const items = fs.readdirSync(dirPath);

      // First pass: register routes
      for (const item of items) {
        const itemPath = path.join(dirPath, item);

        try {
          const stats = fs.statSync(itemPath);

          if (stats.isDirectory()) {
            // Get directory name for the mountPath
            const dirName = path.basename(itemPath);
            // Recursively scan subdirectories
            scanDir(itemPath, path.join(mountPath, dirName));
          } else if (stats.isFile() && item.endsWith(".routes.ts")) {
            try {
              // Calculate the route path from file name and directory
              const routeName = item.replace(".routes.ts", "");

              // If the route name is the same as the parent directory, don't duplicate it
              // e.g., auth/auth.routes.ts -> /api/auth instead of /api/auth/auth
              const parentDir = path.basename(path.dirname(itemPath));
              let routePath;

              if (routeName === parentDir) {
                // Use the parent directory only (auth/auth.routes.ts -> /api/auth)
                routePath = mountPath.replace(/\\/g, "/");
              } else {
                // Use the full path (auth/special.routes.ts -> /api/auth/special)
                routePath = path.join(mountPath, routeName).replace(/\\/g, "/");
              }

              // Import the router
              const routerModule = require(itemPath);
              const router = routerModule.default || routerModule;

              if (router && typeof router === "function" && "use" in router) {
                // Add the router to the API router
                apiRouter.use(`/${routePath}`, router);

                if (verbose) {
                  logger.info(`✅ Registered route: ${routePath} from ${item}`);
                }

                // Track routes from this router for logging
                if (router.stack) {
                  router.stack.forEach((layer: any) => {
                    if (layer.route) {
                      const route = layer.route;
                      Object.keys(route.methods).forEach((method) => {
                        if (route.methods[method]) {
                          // Check if this route is protected (has authMiddleware)
                          const isProtected = route.stack.some(
                            (handler: any) =>
                              handler.name === "authMiddleware" ||
                              handler.name === "authenticate" ||
                              handler.name === "isAuthenticated"
                          );

                          // Get route description from comments if available
                          let description = undefined;
                          if (route.path && typeof route.path === "string") {
                            // Try to extract JSDoc-style description from the route handler
                            const handler =
                              route.stack[route.stack.length - 1]?.handle;
                            if (handler && handler.toString) {
                              const fnString = handler.toString();
                              const docComment =
                                fnString.match(/\/\*\*([\s\S]*?)\*\//);
                              if (docComment) {
                                const descMatch = docComment[1].match(
                                  /@description\s+(.*?)(\n|$)/
                                );
                                if (descMatch) {
                                  description = descMatch[1].trim();
                                }
                              }
                            }
                          }

                          registeredRoutes.push({
                            path: route.path,
                            method: method.toUpperCase(),
                            fullPath:
                              `${baseApiPath}/${routePath}${route.path}`.replace(
                                /\/+/g,
                                "/"
                              ),
                            file: item,
                            protected: isProtected,
                            description,
                          });
                        }
                      });
                    }
                  });
                }
              } else {
                logger.warn(`⚠️ ${item} doesn't export a valid Express router`);
              }
            } catch (error) {
              logger.error(`❌ Error registering routes from ${item}:`, error);
            }
          }
        } catch (error) {
          logger.error(`Error accessing ${itemPath}:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error reading directory ${dirPath}:`, error);
    }
  }

  // Start scanning from the base path
  scanDir(basePath);

  if (verbose) {
    // Log all registered routes
    logger.info("\n📋 Registered API Routes:");
    logger.info("==========================");

    // Sort routes by path for better readability
    const sortedRoutes = [...registeredRoutes].sort((a, b) =>
      a.fullPath.localeCompare(b.fullPath)
    );

    // Log in table format
    sortedRoutes.forEach((route) => {
      const protectionMark = route.protected ? "🔒" : "🔓";
      // console.log(
      //   `${route.method.padEnd(7)} ${protectionMark} ${route.fullPath.padEnd(
      //     50
      //   )} [${route.file}]`
      // );
    });

    // console.log("==========================");
    logger.info(`Total routes: ${registeredRoutes.length}\n`);
  }

  // Return registered routes for programmatic use
  return registeredRoutes;
}

/**
 * Get a JSON representation of all registered routes
 *
 * @param registeredRoutes Routes registered by registerRoutes
 * @returns JSON representation of routes
 */
export function getRoutesAsJson(registeredRoutes: RouteMeta[]): string {
  return JSON.stringify(
    {
      total: registeredRoutes.length,
      routes: registeredRoutes.map((route) => ({
        path: route.fullPath,
        method: route.method,
        protected: route.protected,
        description: route.description || "",
      })),
    },
    null,
    2
  );
}
