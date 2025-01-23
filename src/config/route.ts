import * as path from "path";
import * as fs from "fs/promises";
import { Express } from "express";

const routesPath: string = path.resolve(__dirname, "routes");

const loadRoutes = async (app: Express) => {
    const routeFiles: string[] = await fs.readdir(routesPath);

    for (const routeFile of routeFiles) {
        const routePath: string = path.join(routesPath, routeFile);
        const routeModule: any = await import(routePath);
        app.use("/api/v1", routeModule.default);
    }
};

export default loadRoutes;
