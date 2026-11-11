import type { ErrorRequestHandler, Request, RequestHandler, Response } from 'express'
import { logError } from '../log'
import { toErrorReply } from './errors'

export type Reply = {
  status?: number
  body?: unknown
}

// A route handler takes the request and returns what to answer. It never writes the response itself.
export type Handler = (req: Request) => Promise<Reply>

// The HTTP boundary: the only code that writes a response or catches an error on its way to a customer.
export function endpoint(handler: Handler): RequestHandler {
  return async (req, res) => {
    try {
      send(res, await handler(req))
    } catch (err) {
      sendError(res, err)
    }
  }
}

// Errors raised before a handler runs, such as a request body that isn't valid JSON.
export const handleErrors: ErrorRequestHandler = (err, _req, res, _next) => {
  sendError(res, err)
}

function sendError(res: Response, err: unknown): void {
  const reply = toErrorReply(err)
  if (reply.status >= 500) {
    logError('request_failed', err)
  }
  send(res, reply)
}

function send(res: Response, reply: Reply): void {
  res.status(reply.status ?? 200)
  if (reply.body === undefined) {
    res.end()
  } else {
    res.json(reply.body)
  }
}
