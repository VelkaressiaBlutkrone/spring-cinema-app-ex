import { describe, it, expect } from 'vitest';
import { formatNumber, formatPrice, truncateText } from '@/utils/formatters';

describe('formatNumber', () => {
  it('null이면 "0"을 반환한다', () => {
    expect(formatNumber(null)).toBe('0');
  });

  it('undefined이면 "0"을 반환한다', () => {
    expect(formatNumber(undefined)).toBe('0');
  });

  it('정수를 쉼표 포맷으로 반환한다', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('큰 수를 쉼표 포맷으로 반환한다', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('0을 "0"으로 반환한다', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatPrice', () => {
  it('포맷된 숫자에 "원"을 붙인다', () => {
    expect(formatPrice(15000)).toBe('15,000원');
  });

  it('null이면 "0원"을 반환한다', () => {
    expect(formatPrice(null)).toBe('0원');
  });
});

describe('truncateText', () => {
  it('maxLength 이하면 원본 텍스트를 반환한다', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('maxLength 초과면 잘라서 "..."을 붙인다', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });

  it('정확히 maxLength이면 원본을 반환한다', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });
});
