/* eslint-disable no-console */

import * as http from 'node:http';

import { generateMetadata } from '@opendatacapture/runtime-meta';

export async function createServer(port: number) {
  const metadata = await generateMetadata();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Hello World</h1>');
      } else if (req.url?.startsWith('/runtime')) {
        const [version, ...paths] = req.url.split('/').filter(Boolean) ?? [];
        const filepath = paths.join('/');
        if (!(version && filepath) || !metadata.has(version)) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }

        const { baseDir, manifest } = metadata.get(version!)!;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
    }
  });

  return new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
      resolve();
    });
  });
}
