import nodemailer from 'nodemailer';
import { getShareEmailTemplate } from '../templates/shareEmail.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify environment variables
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('Email credentials are missing in environment variables!');
  console.log('SMTP_USER:', process.env.SMTP_USER ? 'Present' : 'Missing');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Present' : 'Missing');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email connection error:', error);
    console.log('Email Credentials:', {
      user: process.env.SMTP_USER,
      passLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0
    });
  } else {
    console.log('Email Server is ready to send emails');
  }
});

export const sendShareEmail = async (recipientEmail, documentTitle, senderName, accessLevel, documentId) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email credentials are not configured');
  }

  const loginLink = `https://storymosaic-nine.vercel.app/document/d/${documentId}`;
  
  const mailOptions = {
    from: `"DocCollab" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `${senderName} shared a document with you: ${documentTitle}`,
    html: getShareEmailTemplate(documentTitle, senderName, accessLevel, loginLink),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Detailed email error:', error);
    throw new Error(`Failed to send share notification email: ${error.message}`);
  }
};

export const sendMail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      ...options
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default transporter; 