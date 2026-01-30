/**
 * JWT payload 파싱 (클라이언트)
 * 서버 서명 검증 없이 payload만 읽어 role 등 확인용.
 */
export interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
}

function base64UrlDecode(str: string): string {
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
      .join('')
  );
}

export function parseJwtPayload(token: string | null): JwtPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1] ?? '');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string | null): string | null {
  return parseJwtPayload(token)?.role ?? null;
}

export function getSubFromToken(token: string | null): string | null {
  return parseJwtPayload(token)?.sub ?? null;
}

export function isAdminFromToken(token: string | null): boolean {
  return getRoleFromToken(token) === 'ADMIN';
}
