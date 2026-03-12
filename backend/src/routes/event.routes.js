import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
} from "../controllers/event.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Volunteering Events
 *   description: Volunteering event management
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all volunteering events (filter by association_id)
 *     tags: [Volunteering Events]
 *     parameters:
 *       - in: query
 *         name: association_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", getAllEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID (includes volunteer list)
 *     tags: [Volunteering Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details with volunteers
 *       404:
 *         description: Event not found
 */
router.get("/:id", getEventById);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a volunteering event
 *     tags: [Volunteering Events]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [association_id, title, date, time, spots_total]
 *             properties:
 *               association_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "حملة تنظيف الشاطئ"
 *               date:
 *                 type: string
 *                 example: "2026-04-15"
 *               time:
 *                 type: string
 *                 example: "09:00"
 *               spots_total:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Event created
 *       403:
 *         description: Not authorized
 */
router.post(
  "/",
  authenticate,
  authorize("assoc_admin"),
  validate(createEventSchema),
  createEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update a volunteering event
 *     tags: [Volunteering Events]
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
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               spots_total:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put(
  "/:id",
  authenticate,
  authorize("assoc_admin"),
  validate(updateEventSchema),
  updateEvent
);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete a volunteering event
 *     tags: [Volunteering Events]
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
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.delete("/:id", authenticate, authorize("assoc_admin"), deleteEvent);

/**
 * @swagger
 * /api/events/{id}/register:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags: [Volunteering Events]
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
 *         description: Registered for event
 *       400:
 *         description: No spots available
 *       409:
 *         description: Already registered
 */
router.post("/:id/register", authenticate, registerForEvent);

/**
 * @swagger
 * /api/events/{id}/unregister:
 *   delete:
 *     summary: Unregister the authenticated user from an event
 *     tags: [Volunteering Events]
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
 *         description: Unregistered from event
 *       404:
 *         description: Registration not found
 */
router.delete("/:id/unregister", authenticate, unregisterFromEvent);

export default router;
