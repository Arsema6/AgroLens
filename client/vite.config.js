import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Browsers only allow camera access on localhost or HTTPS, so the live viewfinder cannot open on a
 * phone reaching the dev server by LAN address over plain HTTP (it falls back to the phone's own
 * camera app). Drop a cert pair in `client/certs/` - e.g. `mkcert -cert-file certs/cert.pem
 * -key-file certs/key.pem 192.168.1.4 localhost` - and the dev server serves HTTPS instead.
 */
const certDir = path.resolve(import.meta.dirname, 'certs');
const cert = path.join(certDir, 'cert.pem');
const key = path.join(certDir, 'key.pem');
const https = fs.existsSync(cert) && fs.existsSync(key)
  ? { cert: fs.readFileSync(cert), key: fs.readFileSync(key) }
  : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    https,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
