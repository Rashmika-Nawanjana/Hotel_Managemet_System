import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId: string, role: string): string {
  console.log('🔐 Generating token with:', { userId, role })
  console.log('🔑 JWT_SECRET exists:', !!JWT_SECRET)
  
  const token = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  console.log('✅ Token generated, length:', token.length)
  return token
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch (error) {
    return null
  }
}

// Generate email verification token
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}