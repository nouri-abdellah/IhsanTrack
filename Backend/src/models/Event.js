import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Event = sequelize.define(
  "Event",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location_wilaya: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location_maps_link: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age_range: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    spots_taken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "events",
    timestamps: true,
    underscored: true,
  }
);

export default Event;
