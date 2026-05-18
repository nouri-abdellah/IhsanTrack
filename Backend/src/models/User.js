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
      type: DataTypes.ENUM("donor", "volunteer", "association"),
      allowNull: false,
      defaultValue: "donor",
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    avatar_url: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    email_verification_code: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
