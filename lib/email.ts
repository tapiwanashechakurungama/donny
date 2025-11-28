import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: "chakurungamatapiwanashe@gmail.com",
    pass: "zryeogtrlwwuhwjn", // Gmail App Password
  },
};

// Create transporter with fallback
const createTransporter = async () => {
  // Try Gmail first
  try {
    const transporter = nodemailer.createTransport(emailConfig);
    await transporter.verify();
    console.log('✅ Gmail transporter ready');
    return transporter;
  } catch (error) {
    console.log('⚠️ Gmail failed, using Ethereal for testing');
    
    // Fallback to Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    const etherealConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    };
    
    const transporter = nodemailer.createTransport(etherealConfig);
    console.log('📧 Ethereal credentials:', testAccount);
    return transporter;
  }
};

// Verification email template
const getVerificationEmailTemplate = (username: string, verificationToken: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;
  
  return {
    subject: 'Verify Your Community Portal Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Community Portal Account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to Community Portal!</h1>
        </div>
        <div class="content">
          <h2>Hi ${username},</h2>
          <p>Thank you for registering with Community Portal! To complete your registration and start using our platform, please verify your email address.</p>
          
          <p>Click the button below to verify your account:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Account</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          
          <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with Community Portal, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Community Portal Team</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
  };
};

// Send verification email
export const sendVerificationEmail = async (email: string, username: string, verificationToken: string) => {
  try {
    const transporter = await createTransporter();
    const emailTemplate = getVerificationEmailTemplate(username, verificationToken);

    const mailOptions = {
      from: `"Community Portal" <${process.env.EMAIL_USER || 'noreply@communityportal.com'}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
    
    // If using Ethereal, show preview URL
    if (result.messageId && result.messageId.includes('ethereal')) {
      console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(result));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Password reset email template
const getPasswordResetEmailTemplate = (username: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
  
  return {
    subject: 'Reset Your Community Portal Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Community Portal Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #e74c3c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${username},</h2>
          <p>We received a request to reset your password for your Community Portal account. If you made this request, please click the button below to reset your password.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #e74c3c;">${resetUrl}</p>
          
          <p><strong>Note:</strong> This reset link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Community Portal Team</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
  };
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, username: string, resetToken: string) => {
  try {
    const transporter = await createTransporter();
    const emailTemplate = getPasswordResetEmailTemplate(username, resetToken);

    const mailOptions = {
      from: `"Community Portal" <${process.env.EMAIL_USER || 'noreply@communityportal.com'}>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    
    // If using Ethereal, show preview URL
    if (result.messageId && result.messageId.includes('ethereal')) {
      console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(result));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
