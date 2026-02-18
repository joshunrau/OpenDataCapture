/* eslint-disable no-console */

import { renderToString } from 'react-dom/server';

import * as http from 'node:http';
import * as path from 'node:path';

import { generateMetadata, resolveRuntimeAsset } from '@opendatacapture/runtime-meta';
import * as esbuild from 'esbuild';

import { Root } from './Root';

import type { RootProps } from './Root';

async function generateBootstrapScript(props: RootProps): Promise<string> {
  const result = await esbuild.build({
    bundle: true,
    define: {
      __ROOT_PROPS__: JSON.stringify(props)
    },
    entryPoints: [path.resolve(import.meta.dirname, 'entry-client.tsx')],
    format: 'esm',
    jsx: 'automatic',
    minify: false,
    platform: 'browser',
    target: 'es2022',
    write: false
  });

  console.log(result);

  return result.outputFiles.find((output) => output.path === '<stdout>')!.text;
}

export async function createServer(port: number) {
  const metadata = await generateMetadata();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
      if (req.url === '/') {
        let html = '<!DOCTYPE html>\n';
        html += renderToString(
          <html lang="en">
            <head>
              <meta charSet="UTF-8" />
              <meta content="width=device-width, initial-scale=1.0" name="viewport" />
              <title>Open Data Capture</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body>
              <div id="root">
                <Root />
              </div>
            </body>
            <script dangerouslySetInnerHTML={{ __html: await generateBootstrapScript({}) }} type="module" />
          </html>
        );
        console.log(await generateBootstrapScript({}));
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
