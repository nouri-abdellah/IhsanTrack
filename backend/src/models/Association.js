import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Association = sequelize.define(
  "Association",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    wilaya: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "associations",
    timestamps: true,
    underscored: true,
  }
);

export default Association;
