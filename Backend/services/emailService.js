import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send welcome email
export const sendWelcomeEmail = async (email, name, password, role, verificationToken) => {
  try {
    const port = process.env.PORT || 3000;
    const backendUrl = `http://localhost:${port}`;
    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${verificationToken}`;

    // If credentials are not set, log and return
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('---------------------------------------------------');
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
      console.log('📧 MOCK EMAIL SENT:');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to Field Harmony Hub - Credentials & Verification`);
      console.log(`Link: ${verificationLink}`);
      console.log('---------------------------------------------------');
      return true;
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Field Harmony Hub - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Welcome to Field Harmony Hub!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
          <p>Here are your temporary login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p><strong>IMPORTANT:</strong> You must verify your email address before you can login.</p>
          <p>
            <a href="${verificationLink}" style="background-color: #2E7D32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </p>
          <p>After verifying, please login and change your password immediately.</p>
          <p>Best regards,<br>Field Harmony Hub Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('---------------------------------------------------');
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
      console.log('📧 MOCK OTP SENT:');
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log('---------------------------------------------------');
      return true;
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Field Harmony Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Password Reset Request</h2>
          <p>You requested a password reset for your Field Harmony Hub account.</p>
          <p>Your OTP (One Time Password) is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Send Verification Email
export const sendVerificationEmail = async (email, token) => {
  try {
    const port = process.env.PORT || 3000;
    const backendUrl = `http://localhost:${port}`;
    const verificationLink = `${backendUrl}/api/auth/verify-email?token=${token}`;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('---------------------------------------------------');
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
      console.log('📧 MOCK VERIFICATION EMAIL SENT:');
      console.log(`To: ${email}`);
      console.log(`Link: ${verificationLink}`);
      console.log('---------------------------------------------------');
      return true;
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Field Harmony Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Email Verification</h2>
          <p>Thank you for registering with Field Harmony Hub.</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or verify using this link:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};
