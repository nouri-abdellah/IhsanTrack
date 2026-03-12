import { Router } from "express";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} from "../controllers/campaign.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
} from "../validators/campaign.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Campaigns
 *   description: Campaign management
 */

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns (filter by category, status, association_id)
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Health, Education, Food, Emergency, Mosque, Orphans]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, paused]
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.get("/", getAllCampaigns);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign details with donations
 *       404:
 *         description: Campaign not found
 */
router.get("/:id", getCampaignById);

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [association_id, title, goal_amount, category]
 *             properties:
 *               association_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "مساعدة الأيتام"
 *               description:
 *                 type: string
 *                 example: "Campaign to help orphans"
 *               goal_amount:
 *                 type: number
 *                 example: 500000
 *               category:
 *                 type: string
 *                 enum: [Health, Education, Food, Emergency, Mosque, Orphans]
 *                 example: "Orphans"
 *     responses:
 *       201:
 *         description: Campaign created
 *       403:
 *         description: Not authorized
 */
router.post(
  "/",
  authenticate,
  authorize("assoc_admin"),
  validate(createCampaignSchema),
  createCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   put:
 *     summary: Update a campaign
 *     tags: [Campaigns]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               goal_amount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [Health, Education, Food, Emergency, Mosque, Orphans]
 *               status:
 *                 type: string
 *                 enum: [active, completed, paused]
 *     responses:
 *       200:
 *         description: Campaign updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("assoc_admin"),
  validate(updateCampaignSchema),
  updateCampaign
);

/**
 * @swagger
 * /api/campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign
 *     tags: [Campaigns]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.delete("/:id", authenticate, authorize("assoc_admin"), deleteCampaign);

export default router;
