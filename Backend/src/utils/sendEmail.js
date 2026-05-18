import nodemailer from "nodemailer";

const port = Number(process.env.EMAIL_PORT);
const hasValidConfig =
  Boolean(process.env.EMAIL_HOST) &&
  Boolean(process.env.EMAIL_USER) &&
  Boolean(process.env.EMAIL_PASS) &&
  Number.isFinite(port);

const transporter = hasValidConfig
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error("Missing email configuration. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.");
  }

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};
