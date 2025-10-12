import pool from './postgres'
import { QueryResult } from 'pg'

// Generic query executor
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now()
  try {
    const result: QueryResult<T> = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Executed query', { text, duration, rows: result.rowCount })
    return result.rows
  } catch (error) {
    console.error('❌ Query error:', error)
    throw error
  }
}

// Get one record
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows.length > 0 ? rows[0] : null
}

// Execute insert/update/delete
export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Executed command', { text, duration, rows: result.rowCount })
    return result.rowCount || 0
  } catch (error) {
    console.error('❌ Execute error:', error)
    throw error
  }
}

// Transaction support
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}