import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Campaign = sequelize.define(
  "Campaign",
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
      allowNull: true,
    },
    goal_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    current_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    category: {
      type: DataTypes.ENUM(
        "Health",
        "Education",
        "Food",
        "Emergency",
        "Mosque",
        "Orphans"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "paused"),
      defaultValue: "active",
    },
  },
  {
    tableName: "campaigns",
    timestamps: true,
    underscored: true,
  }
);

export default Campaign;
