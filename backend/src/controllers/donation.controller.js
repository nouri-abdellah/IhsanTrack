import { Donation, Campaign, User } from "../models/index.js";

export const createDonation = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.body.campaign_id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.status !== "active") {
      return res.status(400).json({ error: "Campaign is not active" });
    }

    const donation = await Donation.create({
      ...req.body,
      user_id: req.user?.id || null,
      date: new Date(),
    });

    await campaign.increment("current_amount", { by: req.body.amount });

    return res.status(201).json(donation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const where = {};
    if (req.query.campaign_id) where.campaign_id = req.query.campaign_id;
    if (req.query.payment_method) where.payment_method = req.query.payment_method;

    const donations = await Donation.findAll({
      where,
      include: [
        { model: User, as: "donor", attributes: ["id", "full_name", "email"] },
        { model: Campaign, as: "campaign", attributes: ["id", "title"] },
      ],
      order: [["date", "DESC"]],
    });
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: "donor", attributes: ["id", "full_name", "email"] },
        { model: Campaign, as: "campaign" },
      ],
    });
    if (!donation) return res.status(404).json({ error: "Donation not found" });
    return res.json(donation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Campaign, as: "campaign", attributes: ["id", "title", "category"] }],
      order: [["date", "DESC"]],
    });
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
