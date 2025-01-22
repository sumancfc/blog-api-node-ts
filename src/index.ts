import express, { Request, Response, NextFunction, Application } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import dotenv from "dotenv";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerOptions";

dotenv.config();

const csrfProtection = csrf({ cookie: true });
const app: Application = express();
const port: string | number = process.env.PORT || 8000;

// Database Connection
mongoose
    .connect(process.env.DATABASE_URL as string)
    .then(() => console.log("Connected to DataBase!!!"))
    .catch((err: Error) => console.log("Database Connection Error:", err));

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: process.env.CLIENT_URL as string,
        })
    );
} else {
    app.use(cors());
}

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Imported here otherwise it gives error for secret should be set for express jwt
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import categoryRoutes from "./routes/category";
import tagRoutes from "./routes/tag";
// import blogRoutes from "./routes/blog";

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", tagRoutes);
// app.use("/api/v1", blogRoutes);

// Dynamically load routes
// const routesPath = path.resolve(__dirname, "routes");
// fs.readdirSync(routesPath).forEach(async (routeFile: string) => {
//   const routePath = path.join(routesPath, routeFile);
//   const routeModule = await import(routePath);
//   app.use("/api/v1", routeModule.default);
// });

// CSRF Protection
app.use(csrfProtection);

app.get(
    "/api/v1/csrf-token",
    (req: Request, res: Response, next: NextFunction) => {
        res.json({ csrfToken: req.csrfToken() });
        next();
    }
);

// Start server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
