import { Campaign, Association, Donation } from "../models/index.js";

export const createCampaign = async (req, res) => {
  try {
    const association = await Association.findByPk(req.body.association_id);
    if (!association) return res.status(404).json({ error: "Association not found" });

    if (association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized for this association" });
    }

    const campaign = await Campaign.create(req.body);
    return res.status(201).json(campaign);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.association_id) where.association_id = req.query.association_id;

    const campaigns = await Campaign.findAll({
      where,
      include: [{ model: Association, as: "association", attributes: ["id", "name", "wilaya"] }],
    });
    return res.json(campaigns);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        { model: Association, as: "association" },
        { model: Donation, as: "donations" },
      ],
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(campaign);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this campaign" });
    }

    await campaign.update(req.body);
    return res.json(campaign);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [{ model: Association, as: "association" }],
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.association.admin_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this campaign" });
    }

    await campaign.destroy();
    return res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
