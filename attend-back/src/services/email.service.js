const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

/**
 * Send OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} purpose - Purpose of OTP (signup, reset-password, etc.)
 */
async function sendOTPEmail(email, otp, purpose = 'signup') {
  const subjects = {
    signup: 'Verify Your Email - Attendance System',
    'reset-password': 'Reset Your Password - Attendance System',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .otp-box {
          background-color: #f0f0f0;
          border: 2px dashed #4F46E5;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
          border-radius: 5px;
          color: #4F46E5;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 10px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Attendance System</h1>
        </div>
        <div class="content">
          <h2>Email Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for ${purpose === 'signup' ? 'account registration' : 'password reset'} is:</p>

          <div class="otp-box">${otp}</div>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
          </div>

          <p>If you didn't request this OTP, please ignore this email.</p>

          <p>Best regards,<br>Attendance System Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Attendance System" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subjects[purpose] || 'OTP Verification - Attendance System',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = {
  sendOTPEmail,
};
