import { Application } from "express";
import * as fs from "fs/promises";
import path from "path";
import { Dirent } from "fs";

const routesPath: string = path.join(__dirname);

const loadRoutes = async (app: Application): Promise<void> => {
    await loadRoutesRecursively(app, routesPath, "/api/v1");
};

const loadRoutesRecursively = async (
    app: Application,
    currentPath: string,
    apiPath: string
): Promise<void> => {
    const items: Dirent[] = await fs.readdir(currentPath, {
        withFileTypes: true,
    });

    for (const item of items) {
        const fullPath: string = path.join(currentPath, item.name);

        if (item.isDirectory()) {
            // Recursively load routes from subdirectories
            await loadRoutesRecursively(
                app,
                fullPath,
                `${apiPath}/${item.name}`
            );
        } else if (
            item.isFile() &&
            (item.name.endsWith(".ts") || item.name.endsWith(".js")) &&
            item.name !== "index.ts" &&
            item.name !== "index.js"
        ) {
            try {
                const routeModule: any = await import(fullPath);
                const routeName: string = path
                    .parse(item.name)
                    .name.replace(".route", "");
                const routePath: string =
                    routeName === "index" ? apiPath : `${apiPath}/${routeName}`;
                app.use(routePath, routeModule.default);
            } catch (error) {
                console.error(`Error loading route ${fullPath}:`, error);
            }
        }
    }
};

export default loadRoutes;