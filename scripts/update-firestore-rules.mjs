/**
 * update-firestore-rules.mjs
 * Run: node scripts/update-firestore-rules.mjs
 *
 * Updates Firestore security rules to allow all reads and writes
 * (development mode — suitable for internal school use without auth).
 */
import { createSign } from 'crypto';

const SERVICE_ACCOUNT = {
  project_id: "admigo---ardi",
  private_key_id: "79b4b8333113a341363c975627bf94b98ac6b73f",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgSks/DMb0jAIS\nyOiOvoK8FH02kXpFiQcsLwjX488ELh2Vp5wG5kN1uJG1k09Q8wYYidbaZCky6eFG\n5lh5YoDfs7H7o30MAeLjIRQ3axxgXW53QO3knqK5GDXWrUcBAKj17uWqBKmxtWVH\naMdcwfId8yj+/eAPbMXSN1du7srywdEQ4OlV6bMTisEYQJKsy8eWJQKxiey+F8+M\nH2V4AIMm/8i476pF6r/mxBgUZC6gGrgObefv7bFKCMA/S699HBfFTZjG2BbrO2EE\nQ4a9kpuc2uOVRM7NXhoINpsbTpNKTreE1n2rjSIGk2CzLYHskOQ96tCeiP84acm4\n5iQIV5B7AgMBAAECggEABDsH2fvE4ZulywfqHGMrNnP70U8uK2iZxN4VlcjmFedE\nHJde7IxkV7CbDaiRKu7ikwzqi2UEl+wXGTjCu3YTBeUu+sGghrJJvsytbnGBRVoN\nztxf1bDzqHfJ8C+FiCx52LsLBEl2j/O4IiraSSgesoJB0t7Os/ZycXQkxzgO25mo\n6XWUJEvCzrZgFwC4Bv6N2xDOI+JBeWF7tTOhxEhdKggLWs+bj5Q4b0fla5RIDGFi\nSxiMBGJHhSaifXg6zy/1ks7XC+svI6mdKNXTiCyXR+lZD+EsvydueaWQWJl+TgG2\nF+zynBuA1JYu8ZReP3HSxrIyh3O9hkZQezgmjAzl8QKBgQD8Va06IbkaggkRCch7\nFwcSFZkdICanr2nFT71sb7v+JTWvPPDdPAHWmg28KJQnGXih7GGjne+YKzuLD40j\njAhWOv4gAkbhnl6v+vBW99AJSgkR6Srd9fy/fHpS5cK8DvzrbjFCQaLLy8nVxCLs\n6Oi3KHoZNvDNK3g3N1Dc99k+EQKBgQDjjFUBV3wPPM19YPc9gflpD3m7zL26sRVK\nmmasZDlQJrZPtA5TKTnYzRNEYwVuwx4zt39ryRzNVtKHRtvK2IQDyfCnYQMHFNw+\nxEwanVEytzKsqMX5MelaC+H5aVFkQuADmGFDnfDoWUvDPielK/TBHakRWuf3GGbN\nYd7pn9jJywKBgQDFfNii0pnooTUvXJTHoXIrOTQok20teCA0CQCbyac8dSrbB7sL\nq1dU+iUdyjSJlWnQcQzJ3WYTlmJ3p6gy1foAYxNZQe7vzd8VpDROHI15d7Q5jF+8\ncDVsOKQUFTafsKtKJ2fuDyi2j7xbzbH38SGRl+BXs6QrL4Za0LQ8/M3NwQKBgB6k\nEfpJRopivKUKfqCItQYhsFnKmy3dlKlkGzlRkaoqXFhlPZyTK5f3HYYS83NT0OhT\n6FOiVD+OVnEi6IvrFfPQqJhRZu/4LiRBmKHo1ztGEgvP+kCxKOQYP4ivVudyXen+\nBfLt/Le89ofHAd2rCp1Kmi6dGClc3tL/P94jyTR7AoGAN7s4G0APCT08MIH/Nh4a\nKvJdYXnQpjPFgpIKSYZyCyj4zG7hkkcEbmcQwe3Y/XY092ho5iVwTBs4QnPVMyxM\nBwW/7SjAObneurgej2xRl3LR6oconyhFB9SuTk8Rd+3yYEtHJqpG1mJtON3qxnan\nHLDN4r8oF35Sten7igg4ugU=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@admigo---ardi.iam.gserviceaccount.com",
};

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

async function main() {
  console.log('\n🔑  Getting access token...');
  const token = await getAccessToken();
  console.log('  ✓ Token obtained');

  const pid = SERVICE_ACCOUNT.project_id;

  // Open rules: allow all reads + writes (development/internal use)
  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  // Step 1: Create a new ruleset
  console.log('\n📝  Creating new ruleset (allow all)...');
  const rulesetRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${pid}/rulesets`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: { files: [{ content: rules, name: 'firestore.rules' }] } })
    }
  );
  const ruleset = await rulesetRes.json();
  if (!ruleset.name) {
    console.error('  ❌ Ruleset creation failed:', JSON.stringify(ruleset));
    process.exit(1);
  }
  console.log('  ✓ Ruleset created:', ruleset.name);

  // Step 2: Apply ruleset to the Firestore release
  console.log('\n🚀  Applying ruleset to Firestore...');
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${pid}/releases/cloud.firestore`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ release: { name: `projects/${pid}/releases/cloud.firestore`, rulesetName: ruleset.name } })
    }
  );
  const release = await releaseRes.json();

  if (release.name) {
    console.log('  ✓ Rules applied successfully!');
    console.log('\n✅  Firestore is now open for read/write.');
    console.log('    Go back to your app and try adding a student!\n');
  } else {
    // Try PUT if PATCH fails
    const releaseRes2 = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${pid}/releases/cloud.firestore`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ release: { name: `projects/${pid}/releases/cloud.firestore`, rulesetName: ruleset.name } })
      }
    );
    const release2 = await releaseRes2.json();
    if (release2.name) {
      console.log('  ✓ Rules applied (PUT)!');
      console.log('\n✅  Firestore is now open. Try adding a student!\n');
    } else {
      console.error('  ❌ Apply failed:', JSON.stringify(release2));
      console.log('\n⚠️  Manual fallback: Go to Firebase Console → Firestore → Rules');
      console.log('    and paste:\n');
      console.log(rules);
    }
  }
}

main().catch(err => {
  console.error('\n❌  Error:', err.message);
  process.exit(1);
});
