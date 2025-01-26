import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import dotenv from "dotenv";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerOptions";
import loadRoutes from "./routes";
import connectToDatabase from "./configs/db.config";
import { errorHandler } from "./middlewares/dbErrorHandler.middleware";

dotenv.config();

const csrfProtection = csrf({ cookie: true });
const app: Application = express();
const port: string | number = process.env.PORT || 8000;

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
        // CSRF Protection
        app.use(csrfProtection);
    })
    .catch((error: Error) => {
        console.error("Error loading routes:", error);
        process.exit(1);
    });

app.get(
    "/api/v1/csrf-token",
    (req: Request, res: Response, next: NextFunction) => {
        res.json({ csrfToken: req.csrfToken() });
        next();
    }
);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const errorMessage: string = errorHandler(err);
    res.status(500).json({ error: errorMessage });
});

// Database Connection and Server Start
const startServer: () => Promise<void> = async () => {
    try {
        await connectToDatabase();
        const server = app.listen(port, (): void => {
            console.log(`Server is running on port: ${port}`);
        });

        setupGracefulShutdown(server);
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

const setupGracefulShutdown = (server: any): void => {
    process.on("SIGTERM", () => gracefulShutdown(server));
    process.on("SIGINT", () => gracefulShutdown(server));
};

const gracefulShutdown = (server: any): void => {
    console.log("Received kill signal, shutting down gracefully");
    server.close(() => {
        console.log("Closed out remaining connections");
        connectToDatabase
            .closeConnection()
            .then(() => {
                console.log("MongoDB connection closed");
                process.exit(0);
            })
            .catch((err) => {
                console.error("Error during shutdown:", err);
                process.exit(1);
            });
    });

    setTimeout(() => {
        console.error(
            "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
    }, 10000);
};

startServer();
