import { Router } from "express";
import {
  getAllAssociations,
  getAssociationById,
  getMyAssociation,
  updateAssociation,
  deleteAssociation,
  getMyCampaigns,
  getMyEvents,
} from "../controllers/association.controller.js";
import {
  authenticate,
  authorize,
  requireVerifiedAssociation,
} from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateAssociationSchema } from "../validators/association.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Associations
 *   description: Association profiles
 */

/**
 * @swagger
 * /api/associations:
 *   get:
 *     summary: List associations
 *     tags: [Associations]
 *     parameters:
 *       - in: query
 *         name: wilaya
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Associations list
 */
router.get("/", getAllAssociations);

router.get("/me", authenticate, authorize("association"), getMyAssociation);

/**
 * @swagger
 * /api/associations/{id}:
 *   get:
 *     summary: Get association by id
 *     tags: [Associations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Association details
 *       404:
 *         description: Association not found
 */
router.get("/:id", getAssociationById);

router.get("/me/campaigns", authenticate, authorize("association"), getMyCampaigns);
router.get("/me/events", authenticate, authorize("association"), getMyEvents);

/**
 * @swagger
 * /api/associations/{id}:
 *   put:
 *     summary: Update own association profile (association role + verified email required)
 *     tags: [Associations]
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
 *         description: Association updated
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: Association account required, verified email required, or insufficient permissions
 */
router.put(
  "/:id",
  authenticate,
  authorize("association"),
  validate(updateAssociationSchema),
  updateAssociation
);

/**
 * @swagger
 * /api/associations/{id}:
 *   delete:
 *     summary: Delete own association profile (association role + verified email required)
 *     tags: [Associations]
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
 *         description: Association deleted
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
  deleteAssociation
);

export default router;
