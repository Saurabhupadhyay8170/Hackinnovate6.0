import nodemailer from 'nodemailer';
import { getShareEmailTemplate } from '../templates/shareEmail.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Verify environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email credentials are missing in environment variables!');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Present' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Present' : 'Missing');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email connection error:', error);
    console.log('Email Credentials:', {
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0
    });
  } else {
    console.log('Email Server is ready to send emails');
  }
});

export const sendShareEmail = async (recipientEmail, documentTitle, senderName, accessLevel, documentId) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials are not configured');
  }

  const loginLink = `${process.env.FRONTEND_URL}/document/d/${documentId}`;
  
  const mailOptions = {
    from: `"DocCollab" <${process.env.EMAIL_USER}>`,
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
      from: process.env.EMAIL_USER,
      ...options
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default transporter; 