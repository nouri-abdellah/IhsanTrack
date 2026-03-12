import { Router } from "express";
import {
  createAssociation,
  getAllAssociations,
  getAssociationById,
  updateAssociation,
  deleteAssociation,
} from "../controllers/association.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createAssociationSchema,
  updateAssociationSchema,
} from "../validators/association.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Associations
 *   description: Association management
 */

/**
 * @swagger
 * /api/associations:
 *   get:
 *     summary: Get all associations (filter by wilaya, is_verified)
 *     tags: [Associations]
 *     parameters:
 *       - in: query
 *         name: wilaya
 *         schema:
 *           type: string
 *         description: Filter by wilaya
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: List of associations
 */
router.get("/", getAllAssociations);

/**
 * @swagger
 * /api/associations/{id}:
 *   get:
 *     summary: Get association by ID
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

/**
 * @swagger
 * /api/associations:
 *   post:
 *     summary: Create a new association
 *     tags: [Associations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, wilaya]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "جمعية الخير"
 *               description:
 *                 type: string
 *                 example: "Charity association in Algiers"
 *               logo_url:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               wilaya:
 *                 type: string
 *                 example: "Algiers"
 *     responses:
 *       201:
 *         description: Association created
 *       403:
 *         description: Insufficient permissions
 */
router.post(
  "/",
  authenticate,
  authorize("assoc_admin"),
  validate(createAssociationSchema),
  createAssociation
);

/**
 * @swagger
 * /api/associations/{id}:
 *   put:
 *     summary: Update an association
 *     tags: [Associations]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               wilaya:
 *                 type: string
 *               is_verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Association updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("assoc_admin"),
  validate(updateAssociationSchema),
  updateAssociation
);

/**
 * @swagger
 * /api/associations/{id}:
 *   delete:
 *     summary: Delete an association
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
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.delete("/:id", authenticate, authorize("assoc_admin"), deleteAssociation);

export default router;
