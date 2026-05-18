import { Donation, DonationProject, User, Association } from "../models/index.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createDonation = async (req, res) => {
  try {
    const donationProject = await DonationProject.findByPk(req.body.donation_project_id, {
      include: [
        {
          model: Association,
          as: "association",
          attributes: ["id", "name", "user_id"],
          include: [{ model: User, as: "user", attributes: ["id", "email", "full_name"] }],
        },
      ],
    });
    if (!donationProject) return res.status(404).json({ error: "Donation project not found" });

    if (req.user.role === "association" && donationProject.association?.user_id === req.user.id) {
      return res.status(403).json({ error: "Association cannot donate to its own donation campaign" });
    }

    if (donationProject.max_date && new Date(donationProject.max_date) < new Date()) {
      return res.status(400).json({ error: "Donation project has reached its deadline" });
    }

    const donation = await Donation.create({
      ...req.body,
      user_id: req.user.id,
      anonymous: Boolean(req.body.anonymous),
      date: new Date(),
    });

    await donationProject.increment("current_amount", { by: Number(req.body.amount) });

    const donor = await User.findByPk(req.user.id, {
      attributes: ["id", "full_name", "email", "phone"],
    });
    const associationEmail = donationProject.association?.user?.email;

    if (associationEmail && donor) {
      const isAnonymous = Boolean(req.body.anonymous);
      const emailText = isAnonymous
        ? `A new anonymous donation of ${req.body.amount} DZD was made to ${donationProject.title}.`
        : `${donor.full_name} donated ${req.body.amount} DZD to ${donationProject.title}. Contact: ${donor.email} / ${donor.phone}`;
      const emailHtml = isAnonymous
        ? `<p>A new <strong>anonymous</strong> donation of <strong>${req.body.amount} DZD</strong> was made to <strong>${donationProject.title}</strong>.</p>`
        : `<p><strong>${donor.full_name}</strong> donated <strong>${req.body.amount} DZD</strong> to <strong>${donationProject.title}</strong>.</p><p>Donor contact: ${donor.email} / ${donor.phone}</p>`;

      try {
        await sendEmail({
          to: associationEmail,
          subject: `New donation for ${donationProject.title}`,
          text: emailText,
          html: emailHtml,
        });
      } catch (emailErr) {
        console.error("Failed to send donation notification:", emailErr.message);
      }
    }

    return res.status(201).json(donation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const where = {};
    if (req.query.donation_project_id) where.donation_project_id = req.query.donation_project_id;
    if (req.query.payment_method) where.payment_method = req.query.payment_method;

    const donations = await Donation.findAll({
      where,
      include: [
        { model: User, as: "donor", attributes: ["id", "full_name", "email", "phone"] },
        { model: DonationProject, as: "donationProject", attributes: ["id", "title"] },
      ],
      order: [["date", "DESC"]],
    });
    const sanitized = donations.map((donation) => {
      if (!donation.anonymous) return donation;
      const json = donation.toJSON();
      json.donor = null;
      return json;
    });

    return res.json(sanitized);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: "donor", attributes: ["id", "full_name", "email", "phone"] },
        { model: DonationProject, as: "donationProject" },
      ],
    });
    if (!donation) return res.status(404).json({ error: "Donation not found" });

    if (donation.anonymous) {
      const json = donation.toJSON();
      json.donor = null;
      return res.json(json);
    }

    return res.json(donation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: DonationProject,
          as: "donationProject",
          attributes: ["id", "title", "goal_amount", "current_amount"],
        },
      ],
      order: [["date", "DESC"]],
    });
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
