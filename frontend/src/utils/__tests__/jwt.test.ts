import { describe, it, expect } from 'vitest';
import { parseJwtPayload, getRoleFromToken, getSubFromToken, isAdminFromToken } from '@/utils/jwt';

// JWT: header.payload.signature
// payload: { "sub": "user@test.com", "role": "ADMIN", "exp": 9999999999 }
function createTestJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'test-signature';
  return `${header}.${body}.${signature}`;
}

describe('parseJwtPayload', () => {
  it('유효한 JWT의 payload를 파싱한다', () => {
    const token = createTestJwt({ sub: 'user@test.com', role: 'ADMIN', exp: 9999999999 });
    const payload = parseJwtPayload(token);
    expect(payload).toEqual({ sub: 'user@test.com', role: 'ADMIN', exp: 9999999999 });
  });

  it('null이면 null을 반환한다', () => {
    expect(parseJwtPayload(null)).toBeNull();
  });

  it('빈 문자열이면 null을 반환한다', () => {
    expect(parseJwtPayload('')).toBeNull();
  });

  it('잘못된 형식이면 null을 반환한다', () => {
    expect(parseJwtPayload('not.a.valid.jwt.token')).toBeNull();
  });

  it('2개 파트만 있으면 null을 반환한다', () => {
    expect(parseJwtPayload('header.payload')).toBeNull();
  });
});

describe('getRoleFromToken', () => {
  it('role을 추출한다', () => {
    const token = createTestJwt({ role: 'USER' });
    expect(getRoleFromToken(token)).toBe('USER');
  });

  it('role이 없는 토큰이면 null을 반환한다', () => {
    const token = createTestJwt({ sub: 'user@test.com' });
    expect(getRoleFromToken(token)).toBeNull();
  });

  it('null 토큰이면 null을 반환한다', () => {
    expect(getRoleFromToken(null)).toBeNull();
  });
});

describe('getSubFromToken', () => {
  it('sub를 추출한다', () => {
    const token = createTestJwt({ sub: 'user@test.com' });
    expect(getSubFromToken(token)).toBe('user@test.com');
  });

  it('null 토큰이면 null을 반환한다', () => {
    expect(getSubFromToken(null)).toBeNull();
  });
});

describe('isAdminFromToken', () => {
  it('ADMIN role이면 true를 반환한다', () => {
    const token = createTestJwt({ role: 'ADMIN' });
    expect(isAdminFromToken(token)).toBe(true);
  });

  it('USER role이면 false를 반환한다', () => {
    const token = createTestJwt({ role: 'USER' });
    expect(isAdminFromToken(token)).toBe(false);
  });

  it('null 토큰이면 false를 반환한다', () => {
    expect(isAdminFromToken(null)).toBe(false);
  });
});
