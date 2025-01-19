import swaggerJsdoc, { Options } from "swagger-jsdoc";
import path from "path";

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
                url: process.env.API_URL || "http://localhost:8000/api/v1",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        path.resolve(__dirname, "./routes/*.ts"),
        path.resolve(__dirname, "./index.ts"),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
