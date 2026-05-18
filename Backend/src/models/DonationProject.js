import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DonationProject = sequelize.define(
  "DonationProject",
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
    domain: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "عام",
    },
    image_url: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    goal_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    current_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    max_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "donation_projects",
    timestamps: true,
    underscored: true,
  }
);

export default DonationProject;
