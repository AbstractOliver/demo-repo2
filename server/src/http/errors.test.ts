import assert from 'node:assert/strict'
import { test } from 'node:test'
import { z } from 'zod'
import { HttpError, toErrorReply } from './errors'

test('an HttpError shows its own status and message', () => {
  assert.deepEqual(toErrorReply(new HttpError(404, 'Invoice not found')), {
    status: 404,
    body: { error: 'Invoice not found' },
  })
})

test('a validation error names the fields that failed, not the values sent', () => {
  const parsed = z.object({ email: z.string().email() }).safeParse({ email: 'maya@' })
  assert.equal(parsed.success, false)
  const reply = toErrorReply(parsed.error)
  assert.equal(reply.status, 400)
  assert.deepEqual(reply.body.issues?.map((issue) => issue.path), ['email'])
  assert.ok(!JSON.stringify(reply).includes('maya@'))
})

test('any other error becomes a plain 500, without its message or stack', () => {
  const err = new Error('duplicate key value violates unique constraint "users_email_key"')
  assert.deepEqual(toErrorReply(err), { status: 500, body: { error: 'Something went wrong' } })
})
