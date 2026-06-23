import { describe, it, expect } from 'vitest';
import { imageOptimization } from './OptimizedImage';

describe('Image Optimization Utilities', () => {
  describe('toWebP', () => {
    it('should convert jpg to webp', () => {
      const result = imageOptimization.toWebP('image.jpg');
      expect(result).toBe('image.webp');
    });

    it('should convert jpeg to webp', () => {
      const result = imageOptimization.toWebP('image.jpeg');
      expect(result).toBe('image.webp');
    });

    it('should convert png to webp', () => {
      const result = imageOptimization.toWebP('image.png');
      expect(result).toBe('image.webp');
    });

    it('should handle case insensitive extensions', () => {
      const result = imageOptimization.toWebP('image.JPG');
      expect(result).toBe('image.webp');
    });

    it('should handle URLs with paths', () => {
      const result = imageOptimization.toWebP('/path/to/image.jpg');
      expect(result).toBe('/path/to/image.webp');
    });
  });

  describe('resize', () => {
    it('should generate resize URL with width', () => {
      const result = imageOptimization.resize('image.jpg', 800);
      expect(result).toContain('w=800');
      expect(result).toContain('q=75');
    });

    it('should generate resize URL with width and height', () => {
      const result = imageOptimization.resize('image.jpg', 800, 600);
      expect(result).toContain('w=800');
      expect(result).toContain('h=600');
    });

    it('should respect custom quality', () => {
      const result = imageOptimization.resize('image.jpg', 800, 600, 90);
      expect(result).toContain('q=90');
    });

    it('should handle URLs with existing query params', () => {
      const result = imageOptimization.resize('image.jpg?existing=param', 800);
      expect(result).toContain('existing=param');
      expect(result).toContain('w=800');
    });
  });

  describe('generateSrcSet', () => {
    it('should generate responsive srcset', () => {
      const result = imageOptimization.generateSrcSet('image.jpg');
      const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

      sizes.forEach((size) => {
        expect(result).toContain(`${size}w`);
      });
    });

    it('should include all responsive sizes', () => {
      const result = imageOptimization.generateSrcSet('image.jpg');
      const parts = result.split(', ');
      expect(parts).toHaveLength(8);
    });

    it('should respect custom quality in srcset', () => {
      const result = imageOptimization.generateSrcSet('image.jpg', 85);
      expect(result).toContain('q=85');
    });
  });

  describe('getOptimalSize', () => {
    it('should return a valid size', () => {
      const size = imageOptimization.getOptimalSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('preload', () => {
    it('should create preload link', () => {
      const initialLength = document.head.children.length;
      imageOptimization.preload('image.jpg');
      const link = document.head.querySelector('link[rel="preload"]');

      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('image.jpg');
      expect(link?.getAttribute('as')).toBe('image');
    });
  });

  describe('prefetch', () => {
    it('should create prefetch link', () => {
      imageOptimization.prefetch('image.jpg');
      const link = document.head.querySelector('link[rel="prefetch"]');

      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('image.jpg');
    });
  });
});
