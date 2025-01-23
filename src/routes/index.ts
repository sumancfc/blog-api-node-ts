import { Express } from "express";
import * as fs from "fs/promises";
import path from "path";

const routesPath: string = path.join(__dirname);

const loadRoutes = async (app: Express): Promise<void> => {
    const routeFiles: string[] = await fs.readdir(routesPath);

    for (const routeFile of routeFiles) {
        if (routeFile === "index.ts") continue;

        const routeModule: any = await import(`./${routeFile}`);
        app.use("/api/v1", routeModule.default);
    }
};

export default loadRoutes;
