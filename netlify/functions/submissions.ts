import { buildSubmissionRecord } from '../../src/submission-record';

type Settings = { GOOGLE_SHEETS_WEB_APP_URL?: string; GOOGLE_SHEETS_SUBMISSION_TOKEN?: string };
const json = (body: object, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

// Separate handler makes network behaviour testable without any Google credentials.
export async function handleSubmission(request: Request, settings: Settings, send: typeof fetch = fetch): Promise<Response> {
  const enabled = Boolean(settings.GOOGLE_SHEETS_WEB_APP_URL && settings.GOOGLE_SHEETS_SUBMISSION_TOKEN);
  if (request.method === 'GET') return json({ enabled });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!enabled) return json({ error: 'Online collection has not been configured. Download your files and send them to your lecturer.' }, 503);
  // Keep the secret and destination server-side and restrict the upstream to Google Apps Script.
  let target: URL;
  try {
    target = new URL(settings.GOOGLE_SHEETS_WEB_APP_URL!);
    if (target.protocol !== 'https:' || target.hostname !== 'script.google.com' ||
        !/^\/macros\/s\/[^/]+\/exec$/.test(target.pathname) || target.search || target.hash) throw new Error();
  } catch { return json({ error: 'Online collection configuration needs attention. Contact your lecturer.' }, 503); }
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Expected JSON.' }, 415);
  let record;
  try {
    if (Number(request.headers.get('content-length') || 0) > 40000) return json({ error: 'Submission is too large.' }, 413);
    // Bound the stream even when content-length is absent or inaccurate.
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Empty request.');
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 40000) { await reader.cancel(); return json({ error: 'Submission is too large.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    record = buildSubmissionRecord(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return json({ error: 'These decisions are incomplete or invalid. Review your submission.' }, 400); }
  try {
    const response = await send(target.toString(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: settings.GOOGLE_SHEETS_SUBMISSION_TOKEN, record }),
      signal: AbortSignal.timeout(25000), redirect: 'follow',
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true || result.submissionId !== record.Submission_ID ||
        typeof result.receivedAt !== 'string' || !Number.isFinite(Date.parse(result.receivedAt))) throw new Error('No receipt.');
    return json({ ok: true, submissionId: result.submissionId, receivedAt: result.receivedAt });
  } catch {
    // A lost reply may follow a successful save. Retrying uses the same UUID and is deduplicated by Apps Script.
    return json({ error: 'We could not confirm receipt in the lecturer’s sheet. Retry using this submission, or download the Excel file as a backup.' }, 502);
  }
}

export default async (request: Request) => {
  // Netlify supplies environment variables to functions; none are included in the Vite bundle.
  const env = (globalThis as unknown as { process: { env: Settings } }).process.env;
  return handleSubmission(request, env);
};
