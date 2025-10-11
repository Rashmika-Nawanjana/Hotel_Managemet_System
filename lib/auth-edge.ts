// Edge-compatible auth utilities (no bcrypt or native modules)
// This file is safe to use in middleware (Edge Runtime)

import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

// Verify JWT token (Edge-compatible)
export async function verifyToken(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    console.log('🔐 Verifying token in Edge Runtime...')
    console.log('🔑 JWT_SECRET exists:', !!JWT_SECRET)
    console.log('🎫 Token length:', token?.length)
    
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Token decoded successfully:', { userId: payload.userId, role: payload.role })
    return payload as { userId: string; role: string }
  } catch (error) {
    console.error('❌ Token verification failed:', error instanceof Error ? error.message : error)
    return null
  }
}

// Generate JWT token (Edge-compatible)
export async function generateToken(userId: string, role: string): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}
