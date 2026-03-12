import { Association, User, Campaign } from "../models/index.js";

export const createAssociation = async (req, res) => {
  try {
    const association = await Association.create({
      ...req.body,
      admin_id: req.user.id,
    });
    return res.status(201).json(association);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllAssociations = async (req, res) => {
  try {
    const where = {};
    if (req.query.wilaya) where.wilaya = req.query.wilaya;
    if (req.query.is_verified !== undefined) where.is_verified = req.query.is_verified === "true";

    const associations = await Association.findAll({
      where,
      include: [{ model: User, as: "admin", attributes: ["id", "full_name", "email"] }],
    });
    return res.json(associations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAssociationById = async (req, res) => {
  try {
    const association = await Association.findByPk(req.params.id, {
      include: [
        { model: User, as: "admin", attributes: ["id", "full_name", "email"] },
        { model: Campaign, as: "campaigns" },
      ],
    });
    if (!association) return res.status(404).json({ error: "Association not found" });
    return res.json(association);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateAssociation = async (req, res) => {
  try {
    const association = await Association.findByPk(req.params.id);
    if (!association) return res.status(404).json({ error: "Association not found" });

    if (association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this association" });
    }

    await association.update(req.body);
    return res.json(association);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteAssociation = async (req, res) => {
  try {
    const association = await Association.findByPk(req.params.id);
    if (!association) return res.status(404).json({ error: "Association not found" });

    if (association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this association" });
    }

    await association.destroy();
    return res.json({ message: "Association deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
