import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  service: config.email.service,
  auth: config.email.auth,
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw new Error("EMAIL_SENDING_FAILED");
  }
};

// Verify connection on startup
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    if (!config.email.auth.user || !config.email.auth.pass) {
      logger.warn("Email credentials not configured - skipping verification");
      return false;
    }
    await transporter.verify();
    logger.info("Email server connection verified");
    return true;
  } catch (error) {
    logger.warn("Email server connection failed:", error);
    return false;
  }
};

export default { sendEmail, verifyEmailConnection };
