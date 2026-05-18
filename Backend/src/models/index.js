import sequelize from "../config/db.js";
import User from "./User.js";
import Association from "./Association.js";
import DonationProject from "./DonationProject.js";
import Donation from "./Donation.js";
import Event from "./Event.js";
import VolunteersRegistry from "./VolunteersRegistry.js";

// ── User <-> Association ──
User.hasOne(Association, { foreignKey: "user_id", as: "associationProfile" });
Association.belongsTo(User, { foreignKey: "user_id", as: "user" });

// ── Association <-> DonationProject ──
Association.hasMany(DonationProject, { foreignKey: "association_id", as: "donationProjects" });
DonationProject.belongsTo(Association, { foreignKey: "association_id", as: "association" });

// ── User <-> Donation ──
User.hasMany(Donation, { foreignKey: "user_id", as: "donations" });
Donation.belongsTo(User, { foreignKey: "user_id", as: "donor" });

// ── DonationProject <-> Donation ──
DonationProject.hasMany(Donation, { foreignKey: "donation_project_id", as: "donations" });
Donation.belongsTo(DonationProject, { foreignKey: "donation_project_id", as: "donationProject" });

// ── Association <-> Event ──
Association.hasMany(Event, { foreignKey: "association_id", as: "events" });
Event.belongsTo(Association, { foreignKey: "association_id", as: "association" });

// ── VolunteersRegistry direct links ──
VolunteersRegistry.belongsTo(User, { foreignKey: "user_id", as: "user" });
VolunteersRegistry.belongsTo(Event, { foreignKey: "event_id", as: "event" });

// ── User <-> Event (Many-to-Many via VolunteersRegistry) ──
User.belongsToMany(Event, {
  through: VolunteersRegistry,
  foreignKey: "user_id",
  otherKey: "event_id",
  as: "volunteeredEvents",
});
Event.belongsToMany(User, {
  through: VolunteersRegistry,
  foreignKey: "event_id",
  otherKey: "user_id",
  as: "volunteers",
});

export {
  sequelize,
  User,
  Association,
  DonationProject,
  Donation,
  Event,
  VolunteersRegistry,
};
