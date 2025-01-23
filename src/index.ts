import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import dotenv from "dotenv";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import loadRoutes from "./routes";
import { swaggerSpec } from "./swaggerOptions";

dotenv.config();

const csrfProtection = csrf({ cookie: true });
const app: Express = express();
const port: string | number = process.env.PORT || 8000;

// Database Connection
mongoose
    .connect(process.env.DATABASE_URL as string)
    .then((): void => console.log("Connected to DataBase!!!"))
    .catch((err: Error): void =>
        console.log("Database Connection Error:", err)
    );

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

// Dynamically load routes
loadRoutes(app)
    .then((): void => {
        console.log("Routes loaded successfully");
    })
    .catch((error) => {
        console.error("Error loading routes:", error);
        process.exit(1);
    });

// CSRF Protection
app.use(csrfProtection);

app.get(
    "/api/v1/csrf-token",
    (req: Request, res: Response, next: NextFunction) => {
        res.json({ csrfToken: req.csrfToken() });
        next();
    }
);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(port, (): void => {
    console.log(`Server is running on port: ${port}`);
});
