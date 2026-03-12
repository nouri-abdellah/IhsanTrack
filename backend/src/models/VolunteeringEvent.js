import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const VolunteeringEvent = sequelize.define(
  "VolunteeringEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    association_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "associations", key: "id" },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    spots_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spots_taken: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "volunteering_events",
    timestamps: true,
    underscored: true,
  }
);

export default VolunteeringEvent;
