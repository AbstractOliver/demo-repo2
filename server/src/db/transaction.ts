import { connect, type DbClient } from './pool'

export async function withTransaction<T>(work: (client: DbClient) => Promise<T>): Promise<T> {
  const client = await connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
