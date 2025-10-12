import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  )
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('❌ Token verification failed:', error)
    return null
  }
}

// Verify token for Edge Runtime (middleware)
export function verifyTokenEdge(token: string): TokenPayload | null {
  try {
    console.log('🔐 Verifying token in Edge Runtime...')
    console.log('🔑 JWT_SECRET exists:', !!JWT_SECRET)
    console.log('🎫 Token length:', token.length)

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    
    console.log('✅ Token decoded successfully:', decoded)
    
    if (!decoded.userId || !decoded.role) {
      console.error('❌ Invalid token structure:', decoded)
      return null
    }

    return decoded
  } catch (error) {
    console.error('❌ Edge token verification failed:', error)
    return null
  }
}

// Generate random verification token (for email verification, password reset)
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Generate OTP (One-Time Password)
export function generateOTP(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return otp
}

// Hash token for storage (optional but recommended)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}