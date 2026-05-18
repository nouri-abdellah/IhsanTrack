import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./src/models/index.js";
import swaggerSpec from "./src/docs/swagger.js";

import authRoutes from "./src/routes/auth.routes.js";
import associationRoutes from "./src/routes/association.routes.js";
import donationProjectRoutes from "./src/routes/donationProject.routes.js";
import donationRoutes from "./src/routes/donation.routes.js";
import eventRoutes from "./src/routes/event.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const repairVolunteersRegistryEventFk = async () => {
  const [rows] = await sequelize.query(`
    SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'volunteers_registry'
      AND COLUMN_NAME = 'event_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
  `);

  for (const row of rows) {
    if (row.REFERENCED_TABLE_NAME !== "events") {
      await sequelize.query(
        `ALTER TABLE volunteers_registry DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`
      );
    }
  }

  const [updatedRows] = await sequelize.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'volunteers_registry'
      AND COLUMN_NAME = 'event_id'
      AND REFERENCED_TABLE_NAME = 'events'
  `);

  if (!updatedRows.length) {
    await sequelize.query(`
      ALTER TABLE volunteers_registry
      ADD CONSTRAINT fk_volunteers_registry_event_id
      FOREIGN KEY (event_id)
      REFERENCES events(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }
};

const widenImageColumns = async () => {
  await sequelize.query("ALTER TABLE users MODIFY avatar_url LONGTEXT NULL");
  await sequelize.query("ALTER TABLE associations MODIFY logo_url LONGTEXT NOT NULL");
  await sequelize.query("ALTER TABLE donation_projects MODIFY image_url LONGTEXT NOT NULL");
  await sequelize.query("ALTER TABLE events MODIFY image_url LONGTEXT NOT NULL");
};

const ensureDonationAnonymousColumn = async () => {
  const [rows] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'donations'
      AND COLUMN_NAME = 'anonymous'
  `);

  if (!rows.length) {
    await sequelize.query(
      "ALTER TABLE donations ADD COLUMN anonymous TINYINT(1) NOT NULL DEFAULT 0 AFTER payment_method"
    );
  }
};

const ensureDonationProjectDomainColumn = async () => {
  const [rows] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'donation_projects'
      AND COLUMN_NAME = 'domain'
  `);

  if (!rows.length) {
    await sequelize.query(
      "ALTER TABLE donation_projects ADD COLUMN domain VARCHAR(100) NOT NULL DEFAULT 'عام' AFTER description"
    );
  }
};

const ensureAssociationFieldsColumn = async () => {
  const [rows] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'associations'
      AND COLUMN_NAME = 'fields'
  `);

  if (!rows.length) {
    await sequelize.query(
      "ALTER TABLE associations ADD COLUMN fields JSON NULL AFTER social_media_links"
    );
  }
};

const ensureAssociationCoverImageColumn = async () => {
  const [rows] = await sequelize.query(`
    SELECT COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'associations'
      AND COLUMN_NAME = 'cover_image_url'
  `);

  if (!rows.length) {
    await sequelize.query(
      "ALTER TABLE associations ADD COLUMN cover_image_url LONGTEXT NULL AFTER logo_url"
    );
  }
};

// ── Middleware ──
app.use(cors({ 
  origin: ['http://localhost:5173', process.env.FRONTEND_URL], // Allow local and online frontend
  credentials: true 
}));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// ── Swagger Docs ──
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/associations", associationRoutes);
app.use("/api/donation-projects", donationProjectRoutes);
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

    // 1. Sync models FIRST to ensure tables exist in empty databases (like Aiven)
    await sequelize.sync({ alter: true });
    console.log("All models synchronized and tables created.");

    // 2. Run manual column alterations safely
    try {
      await sequelize.query(
        "ALTER TABLE users MODIFY role ENUM('donor','volunteer','association','assoc_admin','user') NOT NULL DEFAULT 'donor'"
      );
      await sequelize.query(
        "UPDATE users SET role = 'association' WHERE role IN ('assoc_admin')"
      );
      await sequelize.query("UPDATE users SET role = 'donor' WHERE role IN ('user', '') OR role IS NULL");

      await repairVolunteersRegistryEventFk();
      await ensureDonationAnonymousColumn();
      await ensureDonationProjectDomainColumn();
      await ensureAssociationFieldsColumn();
      await ensureAssociationCoverImageColumn();
      await widenImageColumns();
    } catch (migrationError) {
      console.log("Migration notice (Expected on new databases):", migrationError.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs at /api-docs`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();