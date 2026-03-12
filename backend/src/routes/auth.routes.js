import { Router } from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Ahmed Benali"
 *               email:
 *                 type: string
 *                 example: "ahmed@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [donor, volunteer, assoc_admin]
 *                 example: "donor"
 *               phone:
 *                 type: string
 *                 example: "0555123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already registered
 */
router.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ahmed@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Not authenticated
 */
router.get("/me", authenticate, me);

export default router;
