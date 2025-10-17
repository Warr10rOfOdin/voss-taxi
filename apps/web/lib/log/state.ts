export type LogLevel = 'DEBUG'|'INFO'|'WARN'|'ERROR';
export interface LogEntry { ts: string; level: LogLevel; msg: string; cid?: string; tx?: string; ctx?: Record<string, unknown>; }

type Client = { id: string; send: (data: string) => void };

declare global { var __vt_logStore: { clients: Map<string, Client>; buffer: LogEntry[] } | undefined }

const createStore = () => ({ clients: new Map<string, Client>(), buffer: [] as LogEntry[] });
export const logStore = globalThis.__vt_logStore ?? (globalThis.__vt_logStore = createStore());

export function snapshot(limit = 200) { return logStore.buffer.slice(-limit); }

export function publish(entry: LogEntry) {
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  logStore.buffer.push(entry);
  if (logStore.buffer.length > 2000) logStore.buffer.splice(0, logStore.buffer.length - 2000);
  for (const c of logStore.clients.values()) { try { c.send(data); } catch { /* noop */ } }
}

export function sseRegister(send: (s: string) => void) {
  const id = crypto.randomUUID();
  logStore.clients.set(id, { id, send });
  return id;
}

export function sseUnregister(id: string) { logStore.clients.delete(id); }
