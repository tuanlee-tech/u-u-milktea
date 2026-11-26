/* Pure Web Crypto RFC 8291 (aes128gcm) + VAPID ES256 Web Push sender for Cloudflare Workers */

function b64uToBytes(str) {
  const s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64u(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concatBytes(...arrays) {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

async function hmacSha256(keyBytes, dataBytes) {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, dataBytes));
}

async function hkdfExtract(salt, ikm) {
  return hmacSha256(salt, ikm);
}

async function hkdfExpand(prk, info, length) {
  const input = concatBytes(info, new Uint8Array([1]));
  const okm = await hmacSha256(prk, input);
  return okm.slice(0, length);
}

async function signVapidJwt(audience, subject, privJwkStr) {
  const jwk = typeof privJwkStr === 'string' ? JSON.parse(privJwkStr) : privJwkStr;
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const enc = new TextEncoder();
  const headerB64 = bytesToB64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const payloadB64 = bytesToB64u(enc.encode(JSON.stringify({ aud: audience, exp, sub: subject })));
  const unsigned = headerB64 + '.' + payloadB64;
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(unsigned))
  );
  // Web Crypto ECDSA P-256 returns raw 64-byte (r || s) IEEE P1363 format, which JWT ES256 expects
  return unsigned + '.' + bytesToB64u(sig);
}

async function encryptPayloadAes128Gcm(subscription, payloadStr) {
  const enc = new TextEncoder();
  const uaPublicBytes = b64uToBytes(subscription.keys.p256dh);
  const authSecretBytes = b64uToBytes(subscription.keys.auth);

  const uaPublicKey = await crypto.subtle.importKey(
    'raw',
    uaPublicBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  const asKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  const asPublicBytes = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey));
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: uaPublicKey }, asKeyPair.privateKey, 256)
  );

  // RFC 8291 Section 3.3
  const prkKey = await hkdfExtract(authSecretBytes, ecdhSecret);
  const keyInfo = concatBytes(enc.encode('WebPush: info\0'), uaPublicBytes, asPublicBytes);
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  // RFC 8188 Section 2.2-2.3
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const prk = await hkdfExtract(salt, ikm);
  const cek = await hkdfExpand(prk, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdfExpand(prk, enc.encode('Content-Encoding: nonce\0'), 12);

  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const plaintext = concatBytes(enc.encode(payloadStr), new Uint8Array([2])); // delimiter 0x02 (last record)
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext)
  );

  // Header: salt (16) || rs (4, uint32 BE = 4096) || idlen (1 = 65) || keyid (65)
  const rsBytes = new Uint8Array([0, 0, 16, 0]);
  const idLenBytes = new Uint8Array([asPublicBytes.length]);
  return concatBytes(salt, rsBytes, idLenBytes, asPublicBytes, ciphertext);
}

export async function sendWebPush(subscription, payloadObj, vapidConfig) {
  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    return { ok: false, status: 400, gone: true };
  }
  if (!vapidConfig || !vapidConfig.publicKey || !vapidConfig.privateJwk) {
    return { ok: false, status: 500, gone: false };
  }

  const endpointUrl = new URL(subscription.endpoint);
  const audience = endpointUrl.origin;
  const subject = vapidConfig.subject || 'mailto:admin@office-order.pages.dev';
  const jwt = await signVapidJwt(audience, subject, vapidConfig.privateJwk);
  const bodyBytes = await encryptPayloadAes128Gcm(subscription, JSON.stringify(payloadObj || {}));

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'vapid t=' + jwt + ', k=' + vapidConfig.publicKey,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': '300',
      'Urgency': 'high'
    },
    body: bodyBytes
  });

  const gone = (res.status === 404 || res.status === 410);
  return { ok: res.ok, status: res.status, gone };
}
