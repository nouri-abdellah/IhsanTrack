import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Donation = sequelize.define(
  "Donation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "campaigns", key: "id" },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "donations",
    timestamps: true,
    underscored: true,
  }
);

export default Donation;
