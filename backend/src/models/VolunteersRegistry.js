import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const VolunteersRegistry = sequelize.define(
  "VolunteersRegistry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "volunteering_events", key: "id" },
    },
    registered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "volunteers_registry",
    timestamps: false,
    underscored: true,
  }
);

export default VolunteersRegistry;
