const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Common Swagger Options
const baseSwaggerOptions = {
  openapi: "3.0.0",
  info: {
    title: "REST API Documentation",
    version: "1.0.0",
    description: "Simple REST API with User and Admin roles using Swagger",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};

// Admin Swagger Options
const adminSwaggerOptions = {
  swaggerDefinition: {
    ...baseSwaggerOptions,
    info: {
      ...baseSwaggerOptions.info,
      title: "Admin API Documentation",
    },
  },
  apis: ["./routes/adminRoutes.js"], // Admin-specific route file
};

// User Swagger Options
const userSwaggerOptions = {
  swaggerDefinition: {
    ...baseSwaggerOptions,
    info: {
      ...baseSwaggerOptions.info,
      title: "User API Documentation",
    },
  },
  apis: ["./routes/userRoutes.js", "./routes/postRoutes.js",] // User-specific route file
};

// Generate Swagger Docs
const adminSwaggerDocs = swaggerJsDoc(adminSwaggerOptions);
const userSwaggerDocs = swaggerJsDoc(userSwaggerOptions);

module.exports = { adminSwaggerDocs, userSwaggerDocs, swaggerUi };
