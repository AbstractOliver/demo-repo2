import assert from 'node:assert/strict'
import { test } from 'node:test'
import { summarizeError } from './log'

test('an error summary keeps the name, code and stack frames, not the message', () => {
  const err = Object.assign(new Error('Key (email)=(maya@acme.test) already exists.'), { code: '23505' })
  const summary = summarizeError(err)
  assert.equal(summary.name, 'Error')
  assert.equal(summary.code, '23505')
  assert.ok(summary.frames.length > 0)
  assert.ok(!JSON.stringify(summary).includes('maya@acme.test'))
})
