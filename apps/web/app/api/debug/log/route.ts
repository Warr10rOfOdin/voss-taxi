import { NextRequest } from 'next/server';
import { publish, snapshot, sseRegister, sseUnregister } from '../../../lib/log/state';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function headers() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  };
}

export async function GET(req: NextRequest) {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (s: string) => controller.enqueue(enc.encode(s));
      // initial snapshot
      for (const e of snapshot(200)) send(`data: ${JSON.stringify(e)}\n\n`);
      // live
      const id = sseRegister(send);
      const ping = setInterval(() => send(': ping\n\n'), 15000);
      (controller as any)._cleanup = () => { clearInterval(ping); sseUnregister(id); };
    },
    cancel() { const fn = (this as any)._cleanup; if (fn) fn(); }
  });
  return new Response(stream, { headers: headers() });
}

export async function POST(req: NextRequest) {
  // allow posting a log entry for testing/dev
  const body = await req.json().catch(() => ({}));
  const entry = {
    ts: new Date().toISOString(),
    level: (body.level ?? 'INFO') as any,
    msg: body.msg ?? 'manual log',
    cid: body.cid,
    tx: body.tx,
    ctx: body.ctx ?? {}
  };
  publish(entry);
  return new Response('ok');
}
