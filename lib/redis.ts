import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })

    redis.on('ready', () => {
      console.log('🚀 Redis is ready to use')
    })
  }

  return redis
}

// Helper functions for 2FA codes
export async function store2FACode(
  userId: string,
  code: string,
  expiresInSeconds: number = 300 // 5 minutes
): Promise<void> {
  const redis = getRedisClient()
  const key = `2fa:${userId}`
  
  const data = JSON.stringify({
    code,
    attempts: 0,
    createdAt: new Date().toISOString(),
  })

  await redis.setex(key, expiresInSeconds, data)
  console.log(`🔐 2FA code stored for user ${userId}, expires in ${expiresInSeconds}s`)
}

export async function get2FACode(userId: string): Promise<{
  code: string
  attempts: number
  createdAt: string
} | null> {
  const redis = getRedisClient()
  const key = `2fa:${userId}`
  
  const data = await redis.get(key)
  
  if (!data) {
    console.log(`⚠️ No 2FA code found for user ${userId}`)
    return null
  }

  return JSON.parse(data)
}

export async function increment2FAAttempts(userId: string): Promise<number> {
  const redis = getRedisClient()
  const key = `2fa:${userId}`
  
  const data = await redis.get(key)
  
  if (!data) {
    return 0
  }

  const parsed = JSON.parse(data)
  parsed.attempts += 1

  // Get remaining TTL
  const ttl = await redis.ttl(key)
  
  // Update with same TTL
  await redis.setex(key, ttl > 0 ? ttl : 300, JSON.stringify(parsed))
  
  console.log(`🔢 2FA attempts incremented for user ${userId}: ${parsed.attempts}`)
  
  return parsed.attempts
}

export async function delete2FACode(userId: string): Promise<void> {
  const redis = getRedisClient()
  const key = `2fa:${userId}`
  
  await redis.del(key)
  console.log(`🗑️ 2FA code deleted for user ${userId}`)
}

export async function get2FATTLRemaining(userId: string): Promise<number> {
  const redis = getRedisClient()
  const key = `2fa:${userId}`
  
  const ttl = await redis.ttl(key)
  return ttl > 0 ? ttl : 0
}

// Session management
export async function storeSession(
  userId: string,
  token: string,
  expiresInSeconds: number = 604800 // 7 days
): Promise<void> {
  const redis = getRedisClient()
  const key = `session:${userId}`
  
  await redis.setex(key, expiresInSeconds, token)
  console.log(`💾 Session stored for user ${userId}`)
}

export async function getSession(userId: string): Promise<string | null> {
  const redis = getRedisClient()
  const key = `session:${userId}`
  
  return await redis.get(key)
}

export async function deleteSession(userId: string): Promise<void> {
  const redis = getRedisClient()
  const key = `session:${userId}`
  
  await redis.del(key)
  console.log(`🗑️ Session deleted for user ${userId}`)
}

// Rate limiting for login attempts
export async function incrementLoginAttempts(
  email: string
): Promise<number> {
  const redis = getRedisClient()
  const key = `login:attempts:${email}`
  
  const attempts = await redis.incr(key)
  
  // Set expiry on first attempt (15 minutes)
  if (attempts === 1) {
    await redis.expire(key, 900)
  }
  
  return attempts
}

export async function getLoginAttempts(email: string): Promise<number> {
  const redis = getRedisClient()
  const key = `login:attempts:${email}`
  
  const attempts = await redis.get(key)
  return attempts ? parseInt(attempts) : 0
}

export async function clearLoginAttempts(email: string): Promise<void> {
  const redis = getRedisClient()
  const key = `login:attempts:${email}`
  
  await redis.del(key)
}

// Cleanup on app shutdown
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    console.log('👋 Redis connection closed')
  }
}