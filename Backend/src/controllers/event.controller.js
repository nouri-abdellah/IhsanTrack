import {
  Event,
  Association,
  User,
  VolunteersRegistry,
} from "../models/index.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createEvent = async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ error: "Association profile not found" });
    }

    const event = await Event.create({
      ...req.body,
      association_id: association.id,
      spots_taken: req.body.spots_taken ?? 0,
    });
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const where = {};
    if (req.query.association_id) where.association_id = req.query.association_id;

    const events = await Event.findAll({
      where,
      include: [{ model: Association, as: "association", attributes: ["id", "name", "wilaya"] }],
      order: [["start_date", "ASC"]],
    });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const registrations = await VolunteersRegistry.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Event,
          as: "event",
          include: [{ model: Association, as: "association", attributes: ["id", "name", "wilaya"] }],
        },
      ],
      order: [["registered_at", "DESC"]],
    });

    return res.json(
      registrations
        .filter((registration) => registration.event)
        .map((registration) => ({
          id: registration.event.id,
          title: registration.event.title,
          location: registration.event.location_wilaya,
          date: registration.event.start_date,
          status: registration.status === "accepted" ? "حضرت" : registration.status === "rejected" ? "غاب" : "مسجّل",
          registered_at: registration.registered_at,
          image_url: registration.event.image_url,
          association: registration.event.association,
        }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: Association, as: "association" },
        {
          model: User,
          as: "volunteers",
          attributes: ["id", "full_name", "email"],
          through: { attributes: ["status", "registered_at"] },
        },
      ],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.association.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    await event.update(req.body);
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.association.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }

    await event.destroy();
    return res.json({ message: "Event deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    if (req.user.role === "association") {
      return res.status(403).json({ error: "Association accounts cannot register for events" });
    }

    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Association,
          as: "association",
          attributes: ["id", "name"],
          include: [{ model: User, as: "user", attributes: ["id", "email", "full_name"] }],
        },
      ],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.spots_taken >= event.max_participants) {
      return res.status(400).json({ error: "No spots available" });
    }

    const existing = await VolunteersRegistry.findOne({
      where: { user_id: req.user.id, event_id: event.id },
    });
    if (existing) {
      return res.status(409).json({ error: "Already registered for this event" });
    }

    await VolunteersRegistry.create({
      user_id: req.user.id,
      event_id: event.id,
      status: "pending",
    });

    const participant = await User.findByPk(req.user.id, {
      attributes: ["id", "full_name", "email", "phone"],
    });
    const associationEmail = event.association?.user?.email;

    if (associationEmail && participant) {
      try {
        await sendEmail({
          to: associationEmail,
          subject: `New participation request for ${event.title}`,
          text: `${participant.full_name} requested to participate in ${event.title}. Contact: ${participant.email} / ${participant.phone}`,
          html: `<p><strong>${participant.full_name}</strong> requested to participate in <strong>${event.title}</strong>.</p><p>Participant contact: ${participant.email} / ${participant.phone}</p>`,
        });
      } catch (emailErr) {
        console.error("Failed to send participation notification:", emailErr.message);
      }
    }

    return res.status(201).json({ message: "Event participation request sent and pending approval" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    const record = await VolunteersRegistry.findOne({
      where: { user_id: req.user.id, event_id: req.params.id },
    });
    if (!record) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await record.destroy();

    const event = await Event.findByPk(req.params.id);
    if (event && event.spots_taken > 0 && record.status === "accepted") {
      await event.decrement("spots_taken", { by: 1 });
    }

    return res.json({ message: "Unregistered from event successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateApplicationStatus = async (req, res, status) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.association.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to manage this event" });
    }

    const application = await VolunteersRegistry.findOne({
      where: { event_id: event.id, user_id: Number(req.params.userId) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (status === "accepted") {
      if (application.status !== "accepted" && event.spots_taken >= event.max_participants) {
        return res.status(400).json({ error: "No spots available" });
      }
      if (application.status !== "accepted") {
        await event.increment("spots_taken", { by: 1 });
      }
    }

    if (status === "rejected" && application.status === "accepted" && event.spots_taken > 0) {
      await event.decrement("spots_taken", { by: 1 });
    }

    await application.update({ status });

    const user = await User.findByPk(application.user_id);
    if (user?.email) {
      const accepted = status === "accepted";
      const decisionWord = accepted ? "approved" : "declined";
      await sendEmail({
        to: user.email,
        subject: `Update on your IhsanTrack event application: ${event.title}`,
        text: `Dear ${user.full_name || "participant"},\n\nThank you for your interest in joining the event \"${event.title}\".\n\nAfter review, your participation request has been ${decisionWord}.\n\nIf you have any questions, please contact the organizing association through the platform.\n\nBest regards,\nIhsanTrack Team`,
        html: `<p>Dear ${user.full_name || "participant"},</p><p>Thank you for your interest in joining the event <strong>${event.title}</strong>.</p><p>After review, your participation request has been <strong>${decisionWord}</strong>.</p><p>If you have any questions, please contact the organizing association through the platform.</p><p>Best regards,<br/>IhsanTrack Team</p>`,
      });
    }

    return res.json({
      message: `Application ${status} successfully`,
      application,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const acceptEventApplication = async (req, res) => updateApplicationStatus(req, res, "accepted");

export const rejectEventApplication = async (req, res) => updateApplicationStatus(req, res, "rejected");
