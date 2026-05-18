import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  acceptEventApplication,
  rejectEventApplication,
} from "../controllers/event.controller.js";
import {
  authenticate,
  authorize,
  requireVerifiedAssociation,
} from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and participation workflow
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Events list
 */
router.get("/", getAllEvents);

router.get("/my", authenticate, authorize("donor", "volunteer"), getMyEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by id with participants and application statuses
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create event (association role + verified email required)
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - image_url
 *               - start_date
 *               - end_date
 *               - location_wilaya
 *               - location_maps_link
 *               - max_participants
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: uri
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               location_wilaya:
 *                 type: string
 *               location_maps_link:
 *                 type: string
 *                 format: uri
 *               max_participants:
 *                 type: integer
 *               age_range:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
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
  validate(createEventSchema),
  createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update own event (association role + verified email required)
 *     tags: [Events]
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
 *         description: Event updated
 *       401:
 *         description: You must be logged in to perform this action
 *       403:
 *         description: Association account required, verified email required, or insufficient permissions
 */
router.put(
  "/:id",
  authenticate,
  authorize("association"),
  validate(updateEventSchema),
  updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete own event (association role + verified email required)
 *     tags: [Events]
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
 *         description: Event deleted
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
  deleteEvent
);

/**
 * @swagger
 * /api/events/{id}/register:
 *   post:
 *     summary: Apply to participate in an event (auth required, creates pending application)
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Application submitted as pending
 *       401:
 *         description: You must be logged in to perform this action
 */
router.post("/:id/register", authenticate, authorize("donor", "volunteer"), registerForEvent);

/**
 * @swagger
 * /api/events/{id}/unregister:
 *   delete:
 *     summary: Cancel event participation/application (auth required)
 *     tags: [Events]
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
 *         description: Unregistered successfully
 *       401:
 *         description: You must be logged in to perform this action
 */
router.delete("/:id/unregister", authenticate, authorize("donor", "volunteer"), unregisterFromEvent);

/**
 * @swagger
 * /api/events/{id}/applications/{userId}/accept:
 *   patch:
 *     summary: Accept a volunteer application (association role + verified email required)
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application accepted and volunteer notified by email
 */
router.patch(
  "/:id/applications/:userId/accept",
  authenticate,
  authorize("association"),
  requireVerifiedAssociation,
  acceptEventApplication
);

/**
 * @swagger
 * /api/events/{id}/applications/{userId}/reject:
 *   patch:
 *     summary: Reject a volunteer application (association role + verified email required)
 *     tags: [Events]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application rejected and volunteer notified by email
 */
router.patch(
  "/:id/applications/:userId/reject",
  authenticate,
  authorize("association"),
  requireVerifiedAssociation,
  rejectEventApplication
);

export default router;
