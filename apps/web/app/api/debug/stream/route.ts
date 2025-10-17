import { NextRequest } from 'next/server';
import { __logState } from '../log/route';
export const runtime = 'nodejs';
export async function GET(req: NextRequest){
  const { subs, buf } = __logState as any;
  const stream = new ReadableStream({
    start(controller){
      function send(e:any){ controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(e)}\n\n`)); }
      send({ hello:true, backlog: Math.min(buf.length,200) });
      for(const e of buf.slice(-200)) send(e);
      const sub = (e:any)=> send(e); subs.add(sub);
      const ping = setInterval(()=> controller.enqueue(new TextEncoder().encode(':keepalive\n\n')), 15000);
      (controller as any)._cleanup = ()=>{ subs.delete(sub); clearInterval(ping); };
    },
    cancel(){ /* noop */ }
  });
  return new Response(stream, { headers:{ 'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive' } });
}
