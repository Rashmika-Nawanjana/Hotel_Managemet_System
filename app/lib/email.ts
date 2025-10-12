import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// Verify connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email configuration error:', error)
  } else {
    console.log('✅ Email server is ready to send messages')
  }
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Sky Nest Hotel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html,
    })

    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error }
  }
}

// 1. Admin 2FA Code Email
export function get2FACodeHTML(name: string, code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Login Security Code</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center text-white">
          <div class="text-5xl mb-3">🔐</div>
          <h1 class="text-2xl font-bold">Admin Login Security Code</h1>
        </div>
        
        <!-- Body -->
        <div class="p-8 bg-gray-50">
          <p class="text-gray-800 text-base mb-5">Hi <strong>${name}</strong>,</p>
          
          <p class="text-gray-600 text-sm mb-6">
            A login attempt to your admin account has been detected. To complete the login process, please use the following security code:
          </p>
          
          <!-- Code Box -->
          <div class="bg-gray-800 rounded-lg p-6 text-center my-8">
            <div class="text-white text-5xl font-bold tracking-widest font-mono">${code}</div>
          </div>
          
          <!-- Warning -->
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p class="text-yellow-800 text-sm">
              <span class="font-bold">⏰ This code will expire in 5 minutes</span>
            </p>
          </div>
          
          <!-- Info Box -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <p class="text-purple-700 font-bold text-sm mb-3">Important Security Information:</p>
            <ul class="space-y-2">
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Enter this code in your admin login page</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Do not share this code with anyone</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Sky Nest staff will never ask for this code</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>This code is valid for one-time use only</span>
              </li>
            </ul>
          </div>
          
          <!-- Danger Box -->
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p class="text-red-800 font-bold text-sm mb-2">
              ⚠️ Didn't try to log in?
            </p>
            <p class="text-red-700 text-sm">
              If you didn't attempt to access your admin account, please contact IT Security immediately at +94 11 234 5678 (Ext. 200)
            </p>
          </div>
          
          <!-- Login Details -->
          <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <p class="text-purple-700 font-bold text-sm mb-3">Login Details:</p>
            <div class="space-y-2">
              <p class="text-gray-700 text-sm">
                <span class="font-semibold text-gray-900">Time:</span> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
              </p>
              <p class="text-gray-700 text-sm">
                <span class="font-semibold text-gray-900">Email:</span> ${name}@skynest.com
              </p>
            </div>
          </div>
          
          <p class="text-purple-700 text-sm mt-8">
            Best regards,<br>
            <strong>Sky Nest Hotel Security Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-800 text-gray-300 p-6 text-center text-xs">
          <p class="font-bold text-white mb-2">Sky Nest Hotel & Resort</p>
          <p class="mb-1">Colombo <span class="text-gray-500">|</span> Kandy <span class="text-gray-500">|</span> Galle</p>
          <p class="mt-3 text-gray-400">© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function get2FACodeText(name: string, code: string): string {
  return `
Hi ${name},

A login attempt to your admin account has been detected. Your security code is:

${code}

This code expires in 5 minutes.

Important Security Information:
• Enter this code in your admin login page
• Do not share this code with anyone
• Sky Nest staff will never ask for this code
• This code is valid for one-time use only

Didn't try to log in?
If you didn't attempt to access your admin account, contact IT Security at +94 11 234 5678 (Ext. 200)

Login Details:
Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
Email: ${name}@skynest.com

Best regards,
Sky Nest Hotel Security Team

---
Sky Nest Hotel & Resort
Colombo | Kandy | Galle
© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.
  `.trim()
}

// 2. Email Verification
export function getEmailVerificationHTML(name: string, verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email Address</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center text-white">
          <div class="text-5xl mb-3">✉️</div>
          <h1 class="text-2xl font-bold">Verify Your Email Address</h1>
        </div>
        
        <!-- Body -->
        <div class="p-8 bg-gray-50">
          <p class="text-gray-800 text-base mb-5">Hi <strong>${name}</strong>,</p>
          
          <p class="text-gray-600 text-sm mb-6">
            Welcome to Sky Nest Hotel & Resort! To complete your registration and start enjoying our services, please verify your email address by clicking the button below:
          </p>
          
          <!-- Button -->
          <div class="text-center my-8">
            <a href="${verificationLink}" class="inline-block bg-red-600 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-red-700 transition duration-300">
              Verify Email Address
            </a>
          </div>
          
          <!-- Warning -->
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p class="text-yellow-800 text-sm">
              <span class="font-bold">⏰ This verification link will expire in 24 hours</span>
            </p>
          </div>
          
          <!-- Info Box -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <p class="text-purple-700 font-bold text-sm mb-3">Why verify your email?</p>
            <ul class="space-y-2">
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Secure your account access</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Receive booking confirmations</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Get exclusive offers and updates</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Access member-only benefits</span>
              </li>
            </ul>
          </div>
          
          <p class="text-gray-600 text-sm mb-3">If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="bg-gray-100 p-3 rounded break-all text-xs">
            <a href="${verificationLink}" class="text-blue-600 hover:text-blue-800">${verificationLink}</a>
          </div>
          
          <!-- Danger Box -->
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-6 rounded">
            <p class="text-red-800 font-bold text-sm mb-2">
              ⚠️ Didn't create an account?
            </p>
            <p class="text-red-700 text-sm">
              If you didn't register for Sky Nest Hotel, please ignore this email or contact our support team.
            </p>
          </div>
          
          <p class="text-purple-700 text-sm mt-8">
            Best regards,<br>
            <strong>Sky Nest Hotel Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-800 text-gray-300 p-6 text-center text-xs">
          <p class="font-bold text-white mb-2">Sky Nest Hotel & Resort</p>
          <p class="mb-1">Colombo <span class="text-gray-500">|</span> Kandy <span class="text-gray-500">|</span> Galle</p>
          <p class="mb-1">📧 support@skynest.com <span class="text-gray-500">|</span> 📞 +94 11 234 5678</p>
          <p class="mt-3 text-gray-400">© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getEmailVerificationText(name: string, verificationLink: string): string {
  return `
Hi ${name},

Welcome to Sky Nest Hotel & Resort! To complete your registration, please verify your email address.

Verification Link:
${verificationLink}

This link expires in 24 hours.

Why verify your email?
• Secure your account access
• Receive booking confirmations
• Get exclusive offers and updates
• Access member-only benefits

Didn't create an account? Please ignore this email.

Best regards,
Sky Nest Hotel Team

---
Sky Nest Hotel & Resort
Colombo | Kandy | Galle
📧 support@skynest.com | 📞 +94 11 234 5678
© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.
  `.trim()
}

// 3. Password Reset Email
export function getPasswordResetEmailHTML(
  name: string,
  resetLink: string,
  expiryHours: number = 1
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center text-white">
          <div class="text-5xl mb-3">🔑</div>
          <h1 class="text-2xl font-bold">Reset Your Password</h1>
        </div>
        
        <!-- Body -->
        <div class="p-8 bg-gray-50">
          <p class="text-gray-800 text-base mb-5">Hi <strong>${name}</strong>,</p>
          
          <p class="text-gray-600 text-sm mb-6">
            We received a request to reset your password for your Sky Nest Hotel account. Click the button below to create a new password:
          </p>
          
          <!-- Button -->
          <div class="text-center my-8">
            <a href="${resetLink}" class="inline-block bg-red-600 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-red-700 transition duration-300">
              Reset Password
            </a>
          </div>
          
          <!-- Warning -->
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p class="text-yellow-800 text-sm">
              <span class="font-bold">⏰ This link will expire in ${expiryHours} hour(s)</span>
            </p>
            <p class="text-yellow-700 text-xs mt-2">
              For security reasons, please reset your password as soon as possible.
            </p>
          </div>
          
          <p class="text-gray-600 text-sm mb-3">If the button doesn't work, copy and paste this link into your browser:</p>
          <div class="bg-gray-100 p-3 rounded break-all text-xs">
            <a href="${resetLink}" class="text-blue-600 hover:text-blue-800">${resetLink}</a>
          </div>
          
          <!-- Danger Box -->
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mt-6 rounded">
            <p class="text-red-800 font-bold text-sm mb-2">
              ⚠️ Didn't request a password reset?
            </p>
            <p class="text-red-700 text-sm">
              If you didn't request a password reset, please ignore this email or contact our support team if you have concerns about your account security.
            </p>
          </div>
          
          <p class="text-purple-700 text-sm mt-8">
            Best regards,<br>
            <strong>Sky Nest Hotel Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-800 text-gray-300 p-6 text-center text-xs">
          <p class="font-bold text-white mb-2">Sky Nest Hotel & Resort</p>
          <p class="mb-1">Colombo <span class="text-gray-500">|</span> Kandy <span class="text-gray-500">|</span> Galle</p>
          <p class="mb-1">📧 support@skynest.com <span class="text-gray-500">|</span> 📞 +94 11 234 5678</p>
          <p class="mt-3 text-gray-400">© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailText(
  name: string,
  resetLink: string,
  expiryHours: number = 1
): string {
  return `
Hi ${name},

We received a request to reset your password for your Sky Nest Hotel account.

Reset Password Link:
${resetLink}

This link expires in ${expiryHours} hour(s).

Didn't request a password reset? Please ignore this email.

Best regards,
Sky Nest Hotel Team

---
Sky Nest Hotel & Resort
Colombo | Kandy | Galle
📧 support@skynest.com | 📞 +94 11 234 5678
© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.
  `.trim()
}

// 4. Welcome Email
export function getWelcomeEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Sky Nest</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 p-4">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center text-white">
          <div class="text-5xl mb-3">🎉</div>
          <h1 class="text-2xl font-bold">Welcome to Sky Nest Hotel!</h1>
        </div>
        
        <!-- Body -->
        <div class="p-8 bg-gray-50">
          <p class="text-gray-800 text-base mb-5">Hi <strong>${name}</strong>,</p>
          
          <p class="text-gray-600 text-sm mb-6">
            Thank you for registering with Sky Nest Hotel & Resort. We're thrilled to have you as part of our community!
          </p>
          
          <!-- Info Box -->
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <p class="text-purple-700 font-bold text-sm mb-3">What you can do now:</p>
            <ul class="space-y-2">
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Browse and book our luxury rooms across 3 locations</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Access exclusive member benefits and discounts</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Manage your reservations online anytime</span>
              </li>
              <li class="text-gray-700 text-sm flex items-start">
                <span class="text-red-600 font-bold mr-2">•</span>
                <span>Earn loyalty points on every stay</span>
              </li>
            </ul>
          </div>
          
          <!-- Button -->
          <div class="text-center my-8">
            <a href="${process.env.APP_URL || 'http://localhost:3000'}/guest/dashboard" class="inline-block bg-red-600 text-white font-semibold px-8 py-4 rounded-lg text-base hover:bg-red-700 transition duration-300">
              Go to Your Dashboard
            </a>
          </div>
          
          <!-- Help Box -->
          <div class="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <p class="text-purple-700 font-bold text-sm mb-3">Need Help?</p>
            <p class="text-gray-600 text-sm mb-3">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div class="space-y-2">
              <p class="text-gray-700 text-sm">📞 Phone: +94 11 234 5678</p>
              <p class="text-gray-700 text-sm">📧 Email: support@skynest.com</p>
            </div>
          </div>
          
          <p class="text-purple-700 text-sm mt-8">
            Best regards,<br>
            <strong>Sky Nest Hotel Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-800 text-gray-300 p-6 text-center text-xs">
          <p class="font-bold text-white mb-2">Sky Nest Hotel & Resort</p>
          <p class="mb-1">Colombo <span class="text-gray-500">|</span> Kandy <span class="text-gray-500">|</span> Galle</p>
          <p class="mb-1">📧 support@skynest.com <span class="text-gray-500">|</span> 📞 +94 11 234 5678</p>
          <p class="mt-3 text-gray-400">© ${new Date().getFullYear()} Sky Nest Hotel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}