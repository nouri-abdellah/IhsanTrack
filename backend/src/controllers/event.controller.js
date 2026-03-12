import {
  VolunteeringEvent,
  Association,
  User,
  VolunteersRegistry,
} from "../models/index.js";

export const createEvent = async (req, res) => {
  try {
    const association = await Association.findByPk(req.body.association_id);
    if (!association) return res.status(404).json({ error: "Association not found" });

    if (association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized for this association" });
    }

    const event = await VolunteeringEvent.create(req.body);
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const where = {};
    if (req.query.association_id) where.association_id = req.query.association_id;

    const events = await VolunteeringEvent.findAll({
      where,
      include: [{ model: Association, as: "association", attributes: ["id", "name", "wilaya"] }],
      order: [["date", "ASC"]],
    });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await VolunteeringEvent.findByPk(req.params.id, {
      include: [
        { model: Association, as: "association" },
        { model: User, as: "volunteers", attributes: ["id", "full_name", "email"] },
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
    const event = await VolunteeringEvent.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.association.admin_id !== req.user.id) {
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
    const event = await VolunteeringEvent.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.association.admin_id !== req.user.id) {
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
    const event = await VolunteeringEvent.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.spots_taken >= event.spots_total) {
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
    });

    await event.increment("spots_taken", { by: 1 });

    return res.status(201).json({ message: "Registered for event successfully" });
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

    const event = await VolunteeringEvent.findByPk(req.params.id);
    if (event && event.spots_taken > 0) {
      await event.decrement("spots_taken", { by: 1 });
    }

    return res.json({ message: "Unregistered from event successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
