import { createHmac } from 'node:crypto'

/** Verify GitHub webhook HMAC-SHA256 signature */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`
  return signature === expected
}

export type WebhookEvent =
  | { action: 'opened' | 'labeled'; issue: { number: number; title: string; body: string } }
  | { action: 'closed' | 'merged'; pull_request: { number: number; merged: boolean } }
