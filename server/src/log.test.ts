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

test('a message line that looks like a stack frame stays out of the summary', () => {
  const summary = summarizeError(new Error('Could not send to maya@acme.test\n    at the second line'))
  assert.ok(summary.frames.length > 0)
  assert.ok(!summary.frames.includes('at the second line'))
})
