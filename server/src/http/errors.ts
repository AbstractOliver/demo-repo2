import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export type ErrorReply = {
  status: number
  body: { error: string; issues?: { path: string; message: string }[] }
}

// What a customer sees when a request fails. Only an HttpError's own message is shown. Any other error
// becomes a plain 500, so a stack trace or a database message never reaches a response.
export function toErrorReply(err: unknown): ErrorReply {
  if (err instanceof HttpError) {
    return { status: err.status, body: { error: err.message } }
  }
  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: 'Invalid request',
        issues: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
    }
  }
  return { status: 500, body: { error: 'Something went wrong' } }
}
