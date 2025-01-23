import { Application } from "express";
import * as fs from "fs/promises";
import path from "path";

const routesPath: string = path.join(__dirname);

const loadRoutes = async (app: Application): Promise<void> => {
    const routeFiles: string[] = await fs.readdir(routesPath);

    for (const routeFile of routeFiles) {
        if (routeFile === "index.ts") continue;

        const routeModule: any = await import(`./${routeFile}`);

        // Extract the route type from the file name (e.g., 'category' from 'category.ts')
        const routeType: string = path.parse(routeFile).name;

        // Use the route type as a prefix in the API path
        app.use(`/api/v1/${routeType}`, routeModule.default);
    }
};

export default loadRoutes;
