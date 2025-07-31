import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create email transporter
export const emailTransporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration
export async function testEmailConnection() {
  try {
    await emailTransporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return false;
  }
}

// Email configuration validation
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  logger.warn('Email credentials not configured. Email sending will be disabled.');
}
