import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sequelize, User, Association } from "../models/index.js";
import { sendEmail } from "../utils/sendEmail.js";

const buildAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10),
});

const issueAuthToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const buildVerificationUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/verify-email?token=${token}`;
};

const buildResetPasswordUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
  return `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
};

const sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url,
  phone: user.phone,
  is_email_verified: user.is_email_verified,
  createdAt: user.createdAt,
  associationProfile: user.associationProfile
    ? {
        id: user.associationProfile.id,
        social_number: user.associationProfile.social_number,
        name: user.associationProfile.name,
        description: user.associationProfile.description,
        logo_url: user.associationProfile.logo_url,
        wilaya: user.associationProfile.wilaya,
        Maps_link: user.associationProfile.Maps_link,
        phone_number: user.associationProfile.phone_number,
        social_media_links: user.associationProfile.social_media_links,
        fields: user.associationProfile.fields,
        opening_hours: user.associationProfile.opening_hours,
        agreed_to_tos: user.associationProfile.agreed_to_tos,
        createdAt: user.associationProfile.createdAt,
        updatedAt: user.associationProfile.updatedAt,
      }
    : null,
});

const buildVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));

const setUserEmailCode = async (user, options = {}) => {
  const code = buildVerificationCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await user.update({
    email_verification_code: code,
    email_verification_expires: expires,
    is_email_verified: false,
  }, options);

  return code;
};

const sendRegistrationCodeEmail = async (email, code) => {
  await sendEmail({
    to: email,
    subject: "IhsanTrack verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
  });
};

export const register = async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing && existing.is_email_verified) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    let user = existing;
    if (!user) {
      user = await User.create({
        full_name,
        email,
        password_hash,
        role: role || "donor",
        phone,
        is_email_verified: false,
      });
    } else {
      await user.update({
        full_name,
        password_hash,
        role: role || "donor",
        phone,
      });
    }

    const code = await setUserEmailCode(user);
    await sendRegistrationCodeEmail(user.email, code);

    return res.status(201).json({
      message: "Verification code sent to your email",
      requires_email_verification: true,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    return res.json({
      exists: Boolean(user),
      is_verified: Boolean(user?.is_email_verified),
      message: user ? "Email already registered" : "Email is available",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const verifyRegistrationCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_email_verified) {
      const token = issueAuthToken(user);
      res.cookie("token", token, buildAuthCookieOptions());
      return res.json({
        message: "Email already verified",
        user: sanitizeUser(user),
      });
    }

    const isExpired = !user.email_verification_expires || new Date(user.email_verification_expires) < new Date();
    if (isExpired) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    if (!user.email_verification_code || user.email_verification_code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await user.update({
      is_email_verified: true,
      email_verification_code: null,
      email_verification_expires: null,
    });

    const token = issueAuthToken(user);
    res.cookie("token", token, buildAuthCookieOptions());

    return res.json({
      message: "Email verified successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const resendRegistrationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_email_verified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const code = await setUserEmailCode(user);
    await sendRegistrationCodeEmail(user.email, code);

    return res.json({ message: "Verification code resent" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const registerAssociation = async (req, res) => {
  const tx = await sequelize.transaction();

  try {
    const {
      full_name,
      email,
      password,
      phone,
      social_number,
      name,
      description,
      logo_url,
      wilaya,
      Maps_link,
      phone_number,
      social_media_links,
      fields,
      opening_hours,
      agreed_to_tos,
    } = req.body;

    let user = await User.findOne({ where: { email }, transaction: tx });
    if (user && user.is_email_verified) {
      await tx.rollback();
      return res.status(409).json({ error: "Email already registered" });
    }

    if (user && user.role !== "association") {
      await tx.rollback();
      return res.status(409).json({ error: "This email belongs to a different account type" });
    }

    let association = null;
    if (user) {
      association = await Association.findOne({ where: { user_id: user.id }, transaction: tx });
    }

    const socialNumberTaken = await Association.findOne({
      where: { social_number },
      transaction: tx,
    });
    if (socialNumberTaken && (!association || socialNumberTaken.id !== association.id)) {
      await tx.rollback();
      return res.status(409).json({ error: "Social number already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    if (!user) {
      user = await User.create(
        {
          full_name,
          email,
          password_hash,
          role: "association",
          phone,
          is_email_verified: false,
          verification_token: null,
        },
        { transaction: tx }
      );
    } else {
      await user.update(
        {
          full_name,
          password_hash,
          role: "association",
          phone,
          is_email_verified: false,
          verification_token: null,
        },
        { transaction: tx }
      );
    }

    if (!association) {
      association = await Association.create(
        {
          user_id: user.id,
          social_number,
          name,
          description,
          logo_url,
          wilaya,
          Maps_link,
          phone_number,
          social_media_links,
          fields,
          opening_hours,
          agreed_to_tos,
        },
        { transaction: tx }
      );
    } else {
      await association.update(
        {
          social_number,
          name,
          description,
          logo_url,
          wilaya,
          Maps_link,
          phone_number,
          social_media_links,
          fields,
          opening_hours,
          agreed_to_tos,
        },
        { transaction: tx }
      );
    }

    const code = await setUserEmailCode(user, { transaction: tx });

    try {
      await sendRegistrationCodeEmail(user.email, code);
    } catch (emailErr) {
      await tx.rollback();
      return res.status(500).json({ error: `Association registration failed while sending verification code: ${emailErr.message}` });
    }

    await tx.commit();

    return res.status(201).json({
      message: "Verification code sent to your email",
      requires_email_verification: true,
      email: user.email,
      role: "association",
    });
  } catch (err) {
    if (!tx.finished) {
      await tx.rollback();
    }
    return res.status(500).json({ error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    await user.update({
      is_email_verified: true,
      verification_token: null,
    });

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({ error: "Please verify your email first" });
    }

    const token = issueAuthToken(user);
    res.cookie("token", token, buildAuthCookieOptions());

    return res.json({
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { full_name, avatar_url, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.update({
      full_name: full_name ?? user.full_name,
      avatar_url: avatar_url ?? user.avatar_url,
      phone: phone ?? user.phone,
    });

    return res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpires,
    });

    const resetUrl = buildResetPasswordUrl(resetToken);
    await sendEmail({
      to: user.email,
      subject: "IhsanTrack password reset",
      text: `Reset your password using this link: ${resetUrl}`,
      html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>. This link expires in 1 hour.</p>`,
    });

    return res.json({
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ where: { reset_password_token: token } });
    if (!user || !user.reset_password_expires || new Date(user.reset_password_expires) < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await user.update({
      password_hash,
      reset_password_token: null,
      reset_password_expires: null,
    });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: [
          "password_hash",
          "verification_token",
          "email_verification_code",
          "email_verification_expires",
          "reset_password_token",
          "reset_password_expires",
        ],
      },
      include: [{ model: Association, as: "associationProfile" }],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(sanitizeUser(user));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
