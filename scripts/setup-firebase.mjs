/**
 * setup-firebase.mjs
 * Run with: node scripts/setup-firebase.mjs
 * 
 * This script uses the Service Account to:
 * 1. Get an OAuth2 access token
 * 2. Fetch (or create) the Firebase Web App configuration
 * 3. Write the .env file automatically
 */
import { createSign } from 'crypto';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SERVICE_ACCOUNT = {
  project_id: "admigo---ardi",
  private_key_id: "79b4b8333113a341363c975627bf94b98ac6b73f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgSks/DMb0jAIS\nyOiOvoK8FH02kXpFiQcsLwjX488ELh2Vp5wG5kN1uJG1k09Q8wYYidbaZCky6eFG\n5lh5YoDfs7H7o30MAeLjIRQ3axxgXW53QO3knqK5GDXWrUcBAKj17uWqBKmxtWVH\naMdcwfId8yj+/eAPbMXSN1du7srywdEQ4OlV6bMTisEYQJKsy8eWJQKxiey+F8+M\nH2V4AIMm/8i476pF6r/mxBgUZC6gGrgObefv7bFKCMA/S699HBfFTZjG2BbrO2EE\nQ4a9kpuc2uOVRM7NXhoINpsbTpNKTreE1n2rjSIGk2CzLYHskOQ96tCeiP84acm4\n5iQIV5B7AgMBAAECggEABDsH2fvE4ZulywfqHGMrNnP70U8uK2iZxN4VlcjmFedE\nHJde7IxkV7CbDaiRKu7ikwzqi2UEl+wXGTjCu3YTBeUu+sGghrJJvsytbnGBRVoN\nztxf1bDzqHfJ8C+FiCx52LsLBEl2j/O4IiraSSgesoJB0t7Os/ZycXQkxzgO25mo\n6XWUJEvCzrZgFwC4Bv6N2xDOI+JBeWF7tTOhxEhdKggLWs+bj5Q4b0fla5RIDGFi\nSxiMBGJHhSaifXg6zy/1ks7XC+svI6mdKNXTiCyXR+lZD+EsvydueaWQWJl+TgG2\nF+zynBuA1JYu8ZReP3HSxrIyh3O9hkZQezgmjAzl8QKBgQD8Va06IbkaggkRCch7\nFwcSFZkdICanr2nFT71sb7v+JTWvPPDdPAHWmg28KJQnGXih7GGjne+YKzuLD40j\njAhWOv4gAkbhnl6v+vBW99AJSgkR6Srd9fy/fHpS5cK8DvzrbjFCQaLLy8nVxCLs\n6Oi3KHoZNvDNK3g3N1Dc99k+EQKBgQDjjFUBV3wPPM19YPc9gflpD3m7zL26sRVK\nmmasZDlQJrZPtA5TKTnYzRNEYwVuwx4zt39ryRzNVtKHRtvK2IQDyfCnYQMHFNw+\nxEwanVEytzKsqMX5MelaC+H5aVFkQuADmGFDnfDoWUvDPielK/TBHakRWuf3GGbN\nYd7pn9jJywKBgQDFfNii0pnooTUvXJTHoXIrOTQok20teCA0CQCbyac8dSrbB7sL\nq1dU+iUdyjSJlWnQcQzJ3WYTlmJ3p6gy1foAYxNZQe7vzd8VpDROHI15d7Q5jF+8\ncDVsOKQUFTafsKtKJ2fuDyi2j7xbzbH38SGRl+BXs6QrL4Za0LQ8/M3NwQKBgB6k\nEfpJRopivKUKfqCItQYhsFnKmy3dlKlkGzlRkaoqXFhlPZyTK5f3HYYS83NT0OhT\n6FOiVD+OVnEi6IvrFfPQqJhRZu/4LiRBmKHo1ztGEgvP+kCxKOQYP4ivVudyXen+\nBfLt/Le89ofHAd2rCp1Kmi6dGClc3tL/P94jyTR7AoGAN7s4G0APCT08MIH/Nh4a\nKvJdYXnQpjPFgpIKSYZyCyj4zG7hkkcEbmcQwe3Y/XY092ho5iVwTBs4QnPVMyxM\nBwW/7SjAObneurgej2xRl3LR6oconyhFB9SuTk8Rd+3yYEtHJqpG1mJtON3qxnan\nHLDN4r8oF35Sten7igg4ugU=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@admigo---ardi.iam.gserviceaccount.com",
};

// ── 1. Create signed JWT ──────────────────────────────────────────────────────
function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: SERVICE_ACCOUNT.private_key_id })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase'
  })).toString('base64url');

  const signingInput = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(SERVICE_ACCOUNT.private_key, 'base64url');
  return `${signingInput}.${signature}`;
}

// ── 2. Exchange JWT for access token ──────────────────────────────────────────
async function getAccessToken() {
  const jwt = createJWT();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ── 3. Get or create a Firebase Web App ───────────────────────────────────────
async function getWebAppName(accessToken) {
  const pid = SERVICE_ACCOUNT.project_id;
  const listRes = await fetch(
    `https://firebase.googleapis.com/v1beta1/projects/${pid}/webApps`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const list = await listRes.json();

  if (list.apps && list.apps.length > 0) {
    console.log(`  Found existing web app: ${list.apps[0].displayName || list.apps[0].name}`);
    return list.apps[0].name; // e.g. "projects/.../webApps/..."
  }

  // No web app exists — create one
  console.log('  No web app found. Creating one...');
  const createRes = await fetch(
    `https://firebase.googleapis.com/v1beta1/projects/${pid}/webApps`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Admigo Ardi Web' })
    }
  );
  const op = await createRes.json();
  console.log('  Create operation:', JSON.stringify(op).slice(0, 200));

  // Poll until the app appears (up to 30 seconds)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const listRes2 = await fetch(
      `https://firebase.googleapis.com/v1beta1/projects/${pid}/webApps`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const list2 = await listRes2.json();
    if (list2.apps && list2.apps.length > 0) {
      console.log(`  ✓ Web app ready after ${(i + 1) * 3}s`);
      return list2.apps[0].name;
    }
    console.log(`  Waiting... (${(i + 1) * 3}s)`);
  }
  throw new Error('Could not retrieve newly created web app after 30 seconds.');
}

// ── 4. Get web app config ─────────────────────────────────────────────────────
async function getWebConfig(accessToken, appName) {
  const res = await fetch(
    `https://firebase.googleapis.com/v1beta1/${appName}/config`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const config = await res.json();
  if (!config.apiKey) throw new Error(`Config error: ${JSON.stringify(config)}`);
  return config;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    console.log('⚠️  .env already exists. Delete it first if you want to regenerate.');
    return;
  }

  try {
    console.log('\n🔑  Getting Google OAuth2 access token...');
    const token = await getAccessToken();
    console.log('  ✓ Token obtained');

    console.log('📱  Looking for Firebase Web App...');
    const appName = await getWebAppName(token);
    console.log('  ✓ App found:', appName);

    console.log('⚙️   Fetching Web App config...');
    const cfg = await getWebConfig(token, appName);
    console.log('  ✓ Config received');

    const envContent = [
      `VITE_FIREBASE_API_KEY=${cfg.apiKey}`,
      `VITE_FIREBASE_AUTH_DOMAIN=${cfg.authDomain}`,
      `VITE_FIREBASE_PROJECT_ID=${cfg.projectId}`,
      `VITE_FIREBASE_STORAGE_BUCKET=${cfg.storageBucket || ''}`,
      `VITE_FIREBASE_MESSAGING_SENDER_ID=${cfg.messagingSenderId || ''}`,
      `VITE_FIREBASE_APP_ID=${cfg.appId}`,
    ].join('\n') + '\n';

    writeFileSync(envPath, envContent, 'utf-8');
    console.log('\n✅  .env file written to', envPath);
    console.log('\n👉  Next steps:');
    console.log('    1. Stop the dev server (Ctrl+C)');
    console.log('    2. Run: npm run dev');
    console.log('    3. Open http://localhost:5173 — data should now load!\n');
  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
