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
                url:
                    `${process.env.API_URL}/api/v1` ||
                    "http://localhost:8000/api/v1",
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
    apis: process.env.API_URL
        ? [
              path.resolve(__dirname, "./swaggers/*.js"),
              path.resolve(__dirname, "./index.js"),
          ]
        : [
              path.resolve(__dirname, "./swaggers/*.ts"),
              path.resolve(__dirname, "./index.ts"),
          ],
};

export const swaggerSpec: object = swaggerJsdoc(options);
