import { Router } from "express";
import {
	register,
	registerAssociation,
	checkEmail,
	verifyRegistrationCode,
	resendRegistrationCode,
	verifyEmail,
	login,
	logout,
	me,
	updateMyProfile,
	forgotPassword,
	resetPassword,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
	registerSchema,
	registerAssociationSchema,
	loginSchema,
	checkEmailSchema,
	verifyRegistrationCodeSchema,
	resendRegistrationCodeSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and email verification
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a donor/volunteer user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password, phone]
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Ahmed Benali"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [donor, volunteer]
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

router.post("/check-email", validate(checkEmailSchema), checkEmail);
router.post("/verify-registration-code", validate(verifyRegistrationCodeSchema), verifyRegistrationCode);
router.post("/resend-registration-code", validate(resendRegistrationCodeSchema), resendRegistrationCode);

/**
 * @swagger
 * /api/auth/register-association:
 *   post:
 *     summary: Register an association account with linked association profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - phone
 *               - social_number
 *               - name
 *               - description
 *               - logo_url
 *               - wilaya
 *               - Maps_link
 *               - phone_number
 *               - agreed_to_tos
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               social_number:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *                 format: uri
 *               wilaya:
 *                 type: string
 *               Maps_link:
 *                 type: string
 *                 format: uri
 *               phone_number:
 *                 type: string
 *               social_media_links:
 *                 type: object
 *               opening_hours:
 *                 type: string
 *               agreed_to_tos:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Association registered and verification email sent
 *       409:
 *         description: Email or social number already registered
 */
router.post(
	"/register-association",
	validate(registerAssociationSchema),
	registerAssociation
);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify association email using verification token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or missing token
 */
router.get("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and set auth cookie
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
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), login);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear auth cookie
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
 *         description: Current user profile
 *       401:
 *         description: You must be logged in to perform this action
 */
router.get("/me", authenticate, me);
router.patch("/me/profile", authenticate, updateMyProfile);

export default router;
