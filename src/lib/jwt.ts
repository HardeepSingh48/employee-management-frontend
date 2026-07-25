/**
 * Lightweight client-side JWT utilities.
 *
 * Only the `exp` claim is inspected — no signature verification.
 * The server rejects any tampered token with a 401.
 */

interface JwtPayload {
  exp: number;
  user_id?: string;
  email?: string;
  role?: string;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns `true` when the token is absent, malformed, or its `exp` claim has
 * passed (with a 30-second buffer for clock skew).
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;

  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;

  const bufferMs = 30_000;
  return payload.exp * 1000 < Date.now() + bufferMs;
}
