import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${verificationToken}`

  const mailOptions = {
    from: `"Sky Nest Hotel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Sky Nest Hotel',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Sky Nest Hotel!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for registering with Sky Nest Hotel. We're excited to have you join our community!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563EB;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <p>Best regards,<br><strong>Sky Nest Hotel Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 Sky Nest Hotel. All rights reserved.</p>
              <p>Colombo | Kandy | Galle, Sri Lanka</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent to:', email)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send verification email')
  }
}

// forgot password

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
) {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"Sky Nest Hotel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Sky Nest Hotel',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>We received a request to reset your password for your Sky Nest Hotel account.</p>
              <p>Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563EB;">${resetUrl}</p>
              
              <div class="warning">
                <p style="margin: 0; font-weight: bold; color: #92400E;">⏰ This link will expire in 1 hour</p>
              </div>
              
              <p><strong>Didn't request a password reset?</strong></p>
              <p>If you didn't make this request, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br><strong>Sky Nest Hotel Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 Sky Nest Hotel. All rights reserved.</p>
              <p>Colombo | Kandy | Galle, Sri Lanka</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent to:', email)
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}