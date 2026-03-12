import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("donor", "volunteer", "assoc_admin"),
      allowNull: false,
      defaultValue: "donor",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
