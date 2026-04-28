import { DonationProject, Association, Donation, User } from "../models/index.js";

export const createDonationProject = async (req, res) => {
  try {
    const association = await Association.findOne({ where: { user_id: req.user.id } });
    if (!association) {
      return res.status(404).json({ error: "Association profile not found" });
    }

    const donationProject = await DonationProject.create({
      ...req.body,
      association_id: association.id,
      current_amount: req.body.current_amount ?? 0,
    });

    return res.status(201).json(donationProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllDonationProjects = async (req, res) => {
  try {
    const where = {};
    if (req.query.association_id) where.association_id = req.query.association_id;

    const donationProjects = await DonationProject.findAll({
      where,
      include: [
        { model: Association, as: "association", attributes: ["id", "name", "wilaya"] },
        {
          model: Donation,
          as: "donations",
          include: [{ model: User, as: "donor", attributes: ["id", "full_name", "email", "phone"] }],
        },
      ],
    });
    return res.json(donationProjects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDonationProjectById = async (req, res) => {
  try {
    const donationProject = await DonationProject.findByPk(req.params.id, {
      include: [
        { model: Association, as: "association" },
        {
          model: Donation,
          as: "donations",
          attributes: ["id", "amount", "date", "anonymous", "user_id", "payment_method"],
          include: [{ model: User, as: "donor", attributes: ["id", "full_name", "email", "phone"] }],
        },
      ],
    });
    if (!donationProject) return res.status(404).json({ error: "Donation project not found" });
    return res.json(donationProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateDonationProject = async (req, res) => {
  try {
    const donationProject = await DonationProject.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!donationProject) return res.status(404).json({ error: "Donation project not found" });

    if (donationProject.association.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this donation project" });
    }

    await donationProject.update(req.body);
    await donationProject.reload({
      include: [
        { model: Association, as: "association", attributes: ["id", "name", "wilaya"] },
        {
          model: Donation,
          as: "donations",
          attributes: ["id", "amount", "date", "anonymous", "user_id", "payment_method"],
          include: [{ model: User, as: "donor", attributes: ["id", "full_name", "email", "phone"] }],
        },
      ],
    });
    return res.json(donationProject);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteDonationProject = async (req, res) => {
  try {
    const donationProject = await DonationProject.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!donationProject) return res.status(404).json({ error: "Donation project not found" });

    if (donationProject.association.user_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this donation project" });
    }

    await donationProject.destroy();
    return res.json({ message: "Donation project deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
