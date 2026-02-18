/* eslint-disable no-console */

import { renderToString } from 'react-dom/server';

import * as http from 'node:http';

import { generateMetadata, resolveRuntimeAsset } from '@opendatacapture/runtime-meta';

import { Root } from './Root';

export async function createServer(port: number) {
  const metadata = await generateMetadata();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
      if (req.url === '/') {
        const html = renderToString(Root());
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else if (req.url?.startsWith('/runtime')) {
        const asset = await resolveRuntimeAsset(req.url.replace(/^\/?runtime\//, ''), metadata);
        if (!asset) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': asset.contentType });
          res.end(asset.content);
        }
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
