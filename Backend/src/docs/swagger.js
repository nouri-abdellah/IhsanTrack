import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IhsanTrack API - إحسان الجزائر",
      version: "1.0.0",
      description:
        "Backend API for IhsanTrack — a Charity & Volunteering Marketplace connecting donors, volunteers, and associations across Algeria.",
      contact: {
        name: "IhsanTrack Team",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
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
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
