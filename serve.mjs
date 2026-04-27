import { createServer } from 'node:http';
import { appendFileSync, createReadStream, existsSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';

const root = process.cwd();
const port = 3000;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const target = resolve(root, `.${clean}`);
  if (!target.startsWith(root)) return null;
  if (existsSync(target) && statSync(target).isDirectory()) return join(target, 'index.html');
  return target;
}

function readBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolveBody(body));
    req.on('error', rejectBody);
  });
}

function buildLeadFrame(payload) {
  const data = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<!doctype html><html><body><script>window.parent && window.parent.postMessage(${data}, '*');</script></body></html>`;
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && (req.url || '').split('?')[0] === '/api/leads') {
    try {
      const rawBody = await readBody(req);
      const values = Object.fromEntries(new URLSearchParams(rawBody).entries());
      const leadId = values.lead_id || randomUUID();
      const payload = {
        submitted_at: values.submitted_at || new Date().toISOString(),
        name: values.name || '',
        phone: values.phone || '',
        business: values.business || '',
        campaign: values.campaign || '',
        page_url: values.page_url || '',
        referrer: values.referrer || '',
        utm_source: values.utm_source || '',
        utm_medium: values.utm_medium || '',
        utm_campaign: values.utm_campaign || '',
        utm_content: values.utm_content || '',
        utm_term: values.utm_term || '',
        fbclid: values.fbclid || '',
        gclid: values.gclid || '',
        lead_id: leadId
      };

      appendFileSync(join(tmpdir(), 'hawke-tech-solutions-local-leads.ndjson'), `${JSON.stringify(payload)}\n`);

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(buildLeadFrame({ source: 'hts-lead-capture', status: 'success', leadId }));
      return;
    } catch (error) {
      res.writeHead(500, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(buildLeadFrame({ source: 'hts-lead-capture', status: 'error', message: error.message }));
      return;
    }
  }

  const filePath = resolvePath(req.url || '/');
  const fallback = join(root, 'index.html');
  const target = filePath && existsSync(filePath) ? filePath : fallback;
  const type = types[extname(target).toLowerCase()] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  createReadStream(target).pipe(res);
});

server.listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
