import { describe, it, expect } from 'vitest';
import {
  filmEnter,
  filmExit,
  filmAccent,
  filmDramatic,
  defaultTransition,
  springTransition,
  fadeIn,
  slideUp,
  staggerContainer,
} from '@/lib/animations';

describe('Film easing curves', () => {
  it('filmEnter 값을 확인한다', () => {
    expect(filmEnter).toEqual([0.0, 0.0, 0.2, 1.0]);
  });

  it('filmExit 값을 확인한다', () => {
    expect(filmExit).toEqual([0.4, 0.0, 1.0, 1.0]);
  });

  it('filmAccent 값을 확인한다', () => {
    expect(filmAccent).toEqual([0.16, 1.0, 0.3, 1.0]);
  });

  it('filmDramatic 값을 확인한다', () => {
    expect(filmDramatic).toEqual([0.0, 0.0, 0.0, 1.0]);
  });
});

describe('Transitions', () => {
  it('defaultTransition duration이 0.4이다', () => {
    expect(defaultTransition).toMatchObject({ duration: 0.4 });
  });

  it('springTransition stiffness/damping를 확인한다', () => {
    expect(springTransition).toMatchObject({
      type: 'spring',
      stiffness: 200,
      damping: 20,
    });
  });
});

describe('Variants', () => {
  it('fadeIn에 hidden/visible 키가 존재한다', () => {
    expect(fadeIn).toHaveProperty('hidden');
    expect(fadeIn).toHaveProperty('visible');
  });

  it('slideUp에 hidden/visible 키가 존재한다', () => {
    expect(slideUp).toHaveProperty('hidden');
    expect(slideUp).toHaveProperty('visible');
  });

  it('staggerContainer의 staggerChildren 간격을 확인한다', () => {
    const visible = staggerContainer.visible as Record<string, unknown>;
    const transition = visible.transition as Record<string, unknown>;
    expect(transition.staggerChildren).toBe(0.1);
  });
});
