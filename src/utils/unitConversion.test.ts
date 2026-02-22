import { describe, it, expect } from 'vitest';
import { cmToPx, pxToCm, getPixelsPerCm, PIXELS_PER_CM } from './unitConversion';

describe('unitConversion', () => {
  describe('cmToPx', () => {
    it('converts 10cm to 50px', () => {
      expect(cmToPx(10)).toBe(50);
    });

    it('converts 0cm to 0px', () => {
      expect(cmToPx(0)).toBe(0);
    });

    it('converts 2.5cm to 12.5px', () => {
      expect(cmToPx(2.5)).toBe(12.5);
    });
  });

  describe('pxToCm', () => {
    it('converts 50px to 10cm', () => {
      expect(pxToCm(50)).toBe(10);
    });

    it('converts 0px to 0cm', () => {
      expect(pxToCm(0)).toBe(0);
    });

    it('converts 12.5px to 2.5cm', () => {
      expect(pxToCm(12.5)).toBe(2.5);
    });
  });

  describe('getPixelsPerCm', () => {
    it('returns PIXELS_PER_CM constant', () => {
      expect(getPixelsPerCm()).toBe(PIXELS_PER_CM);
    });
  });

  describe('round-trip conversions', () => {
    it('cmToPx(pxToCm(100)) equals 100', () => {
      expect(cmToPx(pxToCm(100))).toBe(100);
    });

    it('pxToCm(cmToPx(25)) equals 25', () => {
      expect(pxToCm(cmToPx(25))).toBe(25);
    });
  });
});
