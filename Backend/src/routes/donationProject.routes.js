import { Router } from "express";
import {
  createDonationProject,
  getAllDonationProjects,
  getDonationProjectById,
  updateDonationProject,
  deleteDonationProject,
} from "../controllers/donationProject.controller.js";
import {
  authenticate,
  authorize,
  requireVerifiedAssociation,
} from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createDonationProjectSchema,
  updateDonationProjectSchema,
} from "../validators/donationProject.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: DonationProjects
 *   description: Donation project management
 */

/**
 * @swagger
 * /api/donation-projects:
 *   get:
 *     summary: List donation projects
 *     tags: [DonationProjects]
 *     parameters:
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donation projects list
 */
router.get("/", getAllDonationProjects);

/**
 * @swagger
 * /api/donation-projects/{id}:
 *   get:
 *     summary: Get donation project by id
 *     tags: [DonationProjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Donation project details
 *       404:
 *         description: Donation project not found
 */
router.get("/:id", getDonationProjectById);

/**
 * @swagger
 * /api/donation-projects:
 *   post:
 *     summary: Create donation project (association role + verified email required)
 *     tags: [DonationProjects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, image_url, goal_amount]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: uri
 *               goal_amount:
 *                 type: number
 *               current_amount:
 *                 type: number
 *               max_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Donation project created
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: Association account required, verified email required, or insufficient permissions
 */
router.post(
  "/",
  authenticate,
  authorize("association"),
  requireVerifiedAssociation,
  validate(createDonationProjectSchema),
  createDonationProject
);

/**
 * @swagger
 * /api/donation-projects/{id}:
 *   put:
 *     summary: Update own donation project (association role + verified email required)
 *     tags: [DonationProjects]
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
 *         description: Donation project updated
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: Association account required, verified email required, or insufficient permissions
 */
router.put(
  "/:id",
  authenticate,
  authorize("association"),
  validate(updateDonationProjectSchema),
  updateDonationProject
);

/**
 * @swagger
 * /api/donation-projects/{id}:
 *   delete:
 *     summary: Delete own donation project (association role + verified email required)
 *     tags: [DonationProjects]
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
 *         description: Donation project deleted
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: Association account required, verified email required, or insufficient permissions
 */
router.delete(
  "/:id",
  authenticate,
  authorize("association"),
  requireVerifiedAssociation,
  deleteDonationProject
);

export default router;
