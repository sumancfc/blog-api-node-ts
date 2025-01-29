import swaggerJsdoc, { Options } from "swagger-jsdoc";
import path from "path";

const apiUrl = process.env.NODE_ENV === "production" ? process.env.API_URL : "http://localhost:8000";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Blog API - Node, Express, TypeScript, MongoDB",
            version: "1.0.0",
            description: "Blog API documentation",
        },
        servers: [
            {
                url: `${apiUrl}/api/v1`,
                description: "API server",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token",
                },
            },
        },
        security: [
            {
                cookieAuth: [],
            },
        ],
    },
    apis: [
        path.resolve(__dirname, "./swagger/*.{js,ts}"),
        path.resolve(__dirname, "./index.{js,ts}"),
    ],
};

export const swaggerSpec: object = swaggerJsdoc(options);