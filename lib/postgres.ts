import { Pool } from 'pg'

// Create a singleton pool instance
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.DATABASE_NAME || process.env.POSTGRES_DB || 'skynest_hotel',
      user: process.env.DATABASE_USER || process.env.POSTGRES_USER || 'skynest_user',
      password: process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || '',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err)
    })

    pool.on('connect', () => {
      console.log('✅ Connected to PostgreSQL database')
    })
  }

  return pool
}

// Export the pool for direct use
export default getPool()
