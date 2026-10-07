// Servidor de produção: entrega o build do Vite (dist/) e guarda as planilhas
// de fechamento no banco — uma por mês —, para que todo mundo que abrir a
// apresentação veja os mesmos meses e o comparativo entre eles.
//
//   GET    /api/planilhas                    → meses salvos [{ id, competencia, monthLabel, fileName, importedAt }]
//   GET    /api/planilhas/arquivo/:id        → o .xlsx daquela versão (imutável, cacheado no navegador)
//   PUT    /api/planilhas/:competencia       → salva/substitui o mês ({ fileName, monthLabel, base64 })
//   DELETE /api/planilhas/:competencia       → apaga o mês da base (todas as versões)
//   GET    /api/health                       → status do servidor e do banco
//
// Banco: Postgres via DATABASE_URL (Railway). Sem DATABASE_URL, cai em arquivos
// locais (data/) — serve para desenvolvimento, não para produção, porque o
// disco do Railway é apagado a cada deploy.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { competenciaFromLabel, createStore } from './store.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const IMPORT_TOKEN = process.env.IMPORT_TOKEN || '';
const MAX_BODY = 30 * 1024 * 1024; // .xlsx em base64

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const store = await createStore(process.env.DATABASE_URL, path.join(ROOT, 'data'));

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Planilha grande demais.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('JSON inválido.'), { status: 400 });
  }
}

function authorized(req) {
  return !IMPORT_TOKEN || req.headers['x-import-token'] === IMPORT_TOKEN;
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, storage: store.kind, protected: !!IMPORT_TOKEN });
  }

  if (pathname === '/api/planilhas' && req.method === 'GET') {
    return sendJson(res, 200, await store.listActive());
  }

  const file = /^\/api\/planilhas\/arquivo\/(\d+)$/.exec(pathname);
  if (file && req.method === 'GET') {
    const data = await store.getFile(Number(file[1]));
    if (!data) return sendJson(res, 404, { error: 'Planilha não encontrada.' });
    // Cada id é uma versão que nunca muda: o navegador baixa uma vez só.
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Cache-Control': 'private, max-age=31536000, immutable',
    });
    return res.end(data);
  }

  const month = /^\/api\/planilhas\/(\d{4}-\d{2})$/.exec(pathname);
  if (!month) return sendJson(res, 404, { error: 'Rota não encontrada.' });
  const competencia = month[1];

  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    res.writeHead(405, { Allow: 'PUT, DELETE' });
    return res.end();
  }
  if (!authorized(req)) return sendJson(res, 401, { error: 'Senha de importação inválida.' });

  if (req.method === 'DELETE') {
    const removed = await store.remove(competencia);
    console.log(`[planilha] mês apagado: ${competencia} (${removed} versões)`);
    return sendJson(res, 200, { ok: true, removed });
  }

  const body = await readJsonBody(req);
  const fileName = typeof body.fileName === 'string' ? body.fileName.trim().slice(0, 255) : '';
  const monthLabel = typeof body.monthLabel === 'string' ? body.monthLabel.trim() : '';
  const base64 = typeof body.base64 === 'string' ? body.base64 : '';
  if (!fileName || !base64) return sendJson(res, 400, { error: 'Envie fileName, monthLabel e base64.' });
  if (competenciaFromLabel(monthLabel) !== competencia) {
    return sendJson(res, 400, { error: `O mês ${monthLabel || '(vazio)'} não corresponde à competência ${competencia}.` });
  }
  const data = Buffer.from(base64, 'base64');
  // Todo .xlsx é um ZIP: começa com "PK".
  if (data.length < 4 || data[0] !== 0x50 || data[1] !== 0x4b) {
    return sendJson(res, 400, { error: 'O arquivo não parece ser um .xlsx.' });
  }
  const saved = await store.save({ competencia, fileName, monthLabel, data });
  console.log(`[planilha] salva: ${fileName} (${monthLabel}, ${data.length} bytes, versão ${saved.id})`);
  return sendJson(res, 200, saved);
}

async function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }
  const filePath = path.normalize(path.join(DIST, decodeURIComponent(pathname)));
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end();
  }

  let target = filePath;
  try {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) target = path.join(target, 'index.html');
    await fs.access(target);
  } catch {
    target = path.join(DIST, 'index.html'); // SPA fallback
  }

  try {
    const content = await fs.readFile(target);
    const ext = path.extname(target).toLowerCase();
    const immutable = target.includes(`${path.sep}assets${path.sep}`);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build não encontrado. Rode "npm run build" antes de "npm start".');
  }
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url || '/', 'http://localhost');
  try {
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    return await serveStatic(req, res, pathname);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error('[servidor]', err);
    if (!res.headersSent) sendJson(res, status, { error: status === 500 ? 'Erro interno no servidor.' : err.message });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`[servidor] http://localhost:${PORT} · armazenamento: ${store.kind}${IMPORT_TOKEN ? ' · importação protegida por senha' : ''}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close();
    store.close().finally(() => process.exit(0));
  });
}
