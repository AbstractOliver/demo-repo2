import pg from 'pg'
import { config } from '../config'

const pool = new pg.Pool({ connectionString: config.databaseUrl, max: config.databasePoolSize })

export type Row = pg.QueryResultRow

export class DbClient {
  constructor(private readonly client: pg.PoolClient) {}

  async query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.client.query<T>(text, params)
    return result.rows
  }

  release(): void {
    this.client.release()
  }
}

export async function connect(): Promise<DbClient> {
  return new DbClient(await pool.connect())
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query<T>(text, params)
  return result.rows
}

export async function queryOne<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T | undefined> {
  const rows = await query<T>(text, params)
  return rows[0]
}
