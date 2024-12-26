import express, { Express, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import dotenv from "dotenv";

dotenv.config();

const csrfProtection = csrf({cookie: true})
const app: Express = express();
const port = process.env.PORT || 8000;

// Database Connection
mongoose.connect(process.env.DATABASE_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => console.log("Connected to DataBase!!!")).catch((err) => console.log("Database Connection Error:", err));

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: process.env.CLIENT_URL,
        })
    );
}

// Imported here otherwise it gives error for secret should be set for express jwt
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/category";

app.use("/api/v1", authRoutes);
app.use("/api/v1", categoryRoutes);

// Dynamically load routes
// fs.readdirSync("./routes").forEach((routeFile) => {
//     const routePath = `./routes/${routeFile}`;
//     import(routePath).then((routeModule) => {
//         app.use("/api/v1", routeModule.default);
//     });
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

