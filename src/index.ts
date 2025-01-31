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

const app: Application = express();
const port: number = Number(process.env.PORT) || 8000;

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    credentials: true
};
app.use(cors(corsOptions));

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CSRF Protection
const csrfProtection = csrf({
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'Strict', // Adjust based on your needs
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// CSRF Token Route
app.get("/api/v1/csrf-token", csrfProtection, (req: Request, res: Response) => {
    try {
        const csrfToken = req.csrfToken();
        res.json({ csrfToken });
    } catch (error) {
        console.error('CSRF Token Generation Error:', error);
        res.status(500).json({
            message: 'Could not generate CSRF token',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


// Dynamically load routes
const setupRoutes = async () => {
    try {
        await loadRoutes(app);
        console.log("Routes loaded successfully");

        // Apply CSRF protection after routes are loaded
        app.use(csrfProtection);
    } catch (error) {
        console.error("Error loading routes:", error);
        process.exit(1);
    }
};
setupRoutes();

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const errorMessage: string = errorHandler(err);
    res.status(500).json({ message: errorMessage });
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await connectToDatabase();
        await setupRoutes();
        const server = app.listen(port, () => {
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
