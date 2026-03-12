import { Router } from "express";
import {
  createDonation,
  getAllDonations,
  getDonationById,
  getMyDonations,
} from "../controllers/donation.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createDonationSchema } from "../validators/donation.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Donations
 *   description: Donation management
 */

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations (filter by campaign_id, payment_method)
 *     tags: [Donations]
 *     parameters:
 *       - in: query
 *         name: campaign_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of donations
 */
router.get("/", getAllDonations);

/**
 * @swagger
 * /api/donations/my:
 *   get:
 *     summary: Get donations of the authenticated user
 *     tags: [Donations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user's donations
 *       401:
 *         description: Not authenticated
 */
router.get("/my", authenticate, getMyDonations);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donation details
 *       404:
 *         description: Donation not found
 */
router.get("/:id", getDonationById);

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaign_id, amount, payment_method]
 *             properties:
 *               campaign_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 5000
 *               payment_method:
 *                 type: string
 *                 example: "CCP"
 *     responses:
 *       201:
 *         description: Donation created and campaign amount updated
 *       400:
 *         description: Campaign not active
 *       404:
 *         description: Campaign not found
 */
router.post("/", authenticate, validate(createDonationSchema), createDonation);

export default router;
