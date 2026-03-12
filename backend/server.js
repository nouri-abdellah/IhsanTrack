import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./src/models/index.js";
import swaggerSpec from "./src/docs/swagger.js";

import authRoutes from "./src/routes/auth.routes.js";
import associationRoutes from "./src/routes/association.routes.js";
import campaignRoutes from "./src/routes/campaign.routes.js";
import donationRoutes from "./src/routes/donation.routes.js";
import eventRoutes from "./src/routes/event.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ── Swagger Docs ──
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/associations", associationRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/events", eventRoutes);

// ── Health Check ──
app.get("/", (req, res) => {
  res.json({
    message: "IhsanTrack API is running — إحسان الجزائر",
    docs: "/api-docs",
  });
});

// ── Start Server ──
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync({ alter: true });
    console.log("All models synchronized.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
