import sequelize from "../config/db.js";
import User from "./User.js";
import Association from "./Association.js";
import Campaign from "./Campaign.js";
import Donation from "./Donation.js";
import VolunteeringEvent from "./VolunteeringEvent.js";
import VolunteersRegistry from "./VolunteersRegistry.js";

// ── User <-> Association ──
User.hasMany(Association, { foreignKey: "admin_id", as: "associations" });
Association.belongsTo(User, { foreignKey: "admin_id", as: "admin" });

// ── Association <-> Campaign ──
Association.hasMany(Campaign, { foreignKey: "association_id", as: "campaigns" });
Campaign.belongsTo(Association, { foreignKey: "association_id", as: "association" });

// ── User <-> Donation ──
User.hasMany(Donation, { foreignKey: "user_id", as: "donations" });
Donation.belongsTo(User, { foreignKey: "user_id", as: "donor" });

// ── Campaign <-> Donation ──
Campaign.hasMany(Donation, { foreignKey: "campaign_id", as: "donations" });
Donation.belongsTo(Campaign, { foreignKey: "campaign_id", as: "campaign" });

// ── Association <-> VolunteeringEvent ──
Association.hasMany(VolunteeringEvent, { foreignKey: "association_id", as: "events" });
VolunteeringEvent.belongsTo(Association, { foreignKey: "association_id", as: "association" });

// ── User <-> VolunteeringEvent (Many-to-Many via VolunteersRegistry) ──
User.belongsToMany(VolunteeringEvent, {
  through: VolunteersRegistry,
  foreignKey: "user_id",
  otherKey: "event_id",
  as: "volunteeredEvents",
});
VolunteeringEvent.belongsToMany(User, {
  through: VolunteersRegistry,
  foreignKey: "event_id",
  otherKey: "user_id",
  as: "volunteers",
});

export {
  sequelize,
  User,
  Association,
  Campaign,
  Donation,
  VolunteeringEvent,
  VolunteersRegistry,
};
