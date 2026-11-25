import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const routes = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['public/styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['public/app.js', 'text/javascript; charset=utf-8']],
  ['/statement.js', ['public/statement.js', 'text/javascript; charset=utf-8']],
  ['/api/cases', ['data/cases.json', 'application/json; charset=utf-8']],
]);

const host = '127.0.0.1';
const port = Number(process.env.PORT ?? 7990);

createServer(async (request, response) => {
  const path = request.url?.split('?')[0];
  const file = routes.get(path);

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }

  try {
    const [name, contentType] = file;
    const body = await readFile(new URL(name, import.meta.url));
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    }).end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    console.error(error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Could not load workshop file');
  }
}).on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is busy. Set PORT to a different port and try again.`
    : error.message);
  process.exitCode = 1;
}).listen(port, host, function () {
  console.log(`Phantom ₹799 is running at http://${host}:${this.address().port}`);
});
