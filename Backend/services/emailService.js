import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send welcome email
export const sendWelcomeEmail = async (email, name, password, role) => {
  try {
    // If credentials are not set, log and return (for development/testing without real credentials)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('---------------------------------------------------');
      console.log('⚠️ EMAIL_USER or EMAIL_PASS not set in .env');
      console.log('📧 MOCK EMAIL SENT:');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to Field Harmony Hub - Credentials`);
      console.log(`Body: Hello ${name}, Data: ${password} Role: ${role}`);
      console.log('---------------------------------------------------');
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Field Harmony Hub - Your Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Welcome to Field Harmony Hub!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
          <p>Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please change your password upon your first login.</p>
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
