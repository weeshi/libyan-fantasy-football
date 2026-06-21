import { SQL, sql } from "drizzle-orm";

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  limit: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Calculate offset from page and limit
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Create pagination result
 */
export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page: number, limit: number): { page: number; limit: number } {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  return { page: validPage, limit: validLimit };
}

/**
 * Build SQL limit and offset clauses
 */
export function buildPaginationSQL(page: number, limit: number): { limit: number; offset: number } {
  const { page: validPage, limit: validLimit } = validatePaginationParams(page, limit);
  return {
    limit: validLimit,
    offset: getOffset(validPage, validLimit),
  };
}
