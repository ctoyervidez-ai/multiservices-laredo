export type EmailConfig = { apiKey: string; from: string };
export type EmailMessage = { to: string; subject: string; text: string };

// A successful API response means accepted by the provider, not inbox delivery.
export async function deliverEmail(config: EmailConfig, message: EmailMessage, key: string, transport: typeof fetch = fetch) {
  const response = await transport('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json', 'idempotency-key': key },
    body: JSON.stringify({ from: config.from, to: [message.to], subject: message.subject, text: message.text }),
  });
  if (!response.ok) throw new Error(`email_provider_${response.status}`);
  const result = await response.json() as { id?: string };
  if (!result.id) throw new Error('email_provider_invalid_response');
  return result.id;
}
