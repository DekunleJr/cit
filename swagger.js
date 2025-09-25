const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CIT API Documentation",
      version: "1.0.0",
      description:
        "API documentation for the CIT application, including routes for authentication, home, and admin functionalities.",
    },
    servers: [
      {
        url: "http://localhost:3000", // Adjust if your app runs on a different port
        description: "Development server",
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
  apis: ["./route/*.js", "./app.js"], // Path to the API docs (route files)
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
