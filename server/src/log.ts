// The one place that writes log lines. A line is a fixed event name plus ids and counts, never personal
// data: no emails, names or tokens, and no error messages, which can quote the row a query failed on.

export type LogEvent = 'server_started' | 'request_failed' | 'reminders_sent' | 'reminders_failed'

export type LogFields = {
  workspaceId?: string
  userId?: string
  invoiceId?: string
  port?: number
  count?: number
}

export type ErrorSummary = {
  name: string
  code?: string
  frames: string[]
}

export function logEvent(event: LogEvent, fields: LogFields = {}): void {
  writeLine({ level: 'info', event, ...fields })
}

export function logError(event: LogEvent, err: unknown, fields: LogFields = {}): void {
  writeLine({ level: 'error', event, ...fields, error: summarizeError(err) })
}

// An error's name, code and stack frames, without its message.
export function summarizeError(err: unknown): ErrorSummary {
  if (!(err instanceof Error)) {
    return { name: typeof err, frames: [] }
  }
  const code = (err as { code?: unknown }).code
  const frames = (err.stack ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
  return typeof code === 'string' ? { name: err.name, code, frames } : { name: err.name, frames }
}

function writeLine(line: Record<string, unknown>): void {
  console.log(JSON.stringify({ at: new Date().toISOString(), ...line }))
}
