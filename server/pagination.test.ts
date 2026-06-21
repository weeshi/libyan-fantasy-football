import { describe, it, expect } from 'vitest';
import { 
  getOffset, 
  createPaginationResult, 
  validatePaginationParams, 
  buildPaginationSQL 
} from './pagination';

describe('Pagination Utilities', () => {
  describe('getOffset', () => {
    it('should calculate correct offset for page 1', () => {
      expect(getOffset(1, 10)).toBe(0);
    });

    it('should calculate correct offset for page 2', () => {
      expect(getOffset(2, 10)).toBe(10);
    });

    it('should calculate correct offset for page 5 with limit 25', () => {
      expect(getOffset(5, 25)).toBe(100);
    });
  });

  describe('createPaginationResult', () => {
    it('should create correct pagination result for first page', () => {
      const data = [1, 2, 3];
      const result = createPaginationResult(data, 100, 1, 10);

      expect(result.data).toEqual(data);
      expect(result.total).toBe(100);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(10);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should create correct pagination result for middle page', () => {
      const data = [1, 2, 3];
      const result = createPaginationResult(data, 100, 5, 10);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should create correct pagination result for last page', () => {
      const data = [1, 2, 3];
      const result = createPaginationResult(data, 100, 10, 10);

      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should calculate correct total pages', () => {
      const result = createPaginationResult([], 50, 1, 10);
      expect(result.totalPages).toBe(5);
    });

    it('should handle non-divisible total', () => {
      const result = createPaginationResult([], 55, 1, 10);
      expect(result.totalPages).toBe(6);
    });
  });

  describe('validatePaginationParams', () => {
    it('should validate positive page and limit', () => {
      const result = validatePaginationParams(1, 50);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('should correct negative page to 1', () => {
      const result = validatePaginationParams(-5, 10);
      expect(result.page).toBe(1);
    });

    it('should correct page 0 to 1', () => {
      const result = validatePaginationParams(0, 10);
      expect(result.page).toBe(1);
    });

    it('should correct negative limit to 1', () => {
      const result = validatePaginationParams(1, -10);
      expect(result.limit).toBe(1);
    });

    it('should cap limit to 100', () => {
      const result = validatePaginationParams(1, 200);
      expect(result.limit).toBe(100);
    });

    it('should correct limit 0 to 1', () => {
      const result = validatePaginationParams(1, 0);
      expect(result.limit).toBe(1);
    });
  });

  describe('buildPaginationSQL', () => {
    it('should build correct SQL for first page', () => {
      const result = buildPaginationSQL(1, 10);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should build correct SQL for second page', () => {
      const result = buildPaginationSQL(2, 10);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(10);
    });

    it('should validate and build SQL with invalid params', () => {
      const result = buildPaginationSQL(-1, 200);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });
  });
});
