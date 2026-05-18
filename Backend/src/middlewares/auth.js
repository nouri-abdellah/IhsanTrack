import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const AUTH_REQUIRED_MESSAGE = "You must be logged in to perform this action";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: AUTH_REQUIRED_MESSAGE });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: AUTH_REQUIRED_MESSAGE });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

export const requireVerifiedAssociation = async (req, res, next) => {
  try {
    if (req.user.role !== "association") {
      return res.status(403).json({ error: "Association account required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({ error: AUTH_REQUIRED_MESSAGE });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({ error: "Verify your email before performing this action" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
