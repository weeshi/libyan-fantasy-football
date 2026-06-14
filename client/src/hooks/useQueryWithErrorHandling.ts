import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Enhanced useQuery hook with built-in error handling
 * Ensures all queries have proper loading, error, and data states
 */
export function useQueryWithErrorHandling<TData, TError = Error>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> & {
  hasError: boolean;
  errorMessage: string | null;
  isReady: boolean;
} {
  const query = useQuery(options);

  const hasError = Boolean(query.error);
  const errorMessage = query.error
    ? query.error instanceof Error
      ? query.error.message
      : String(query.error)
    : null;

  // isReady = data is loaded and no error
  const isReady = Boolean(query.data) && !hasError;

  return {
    ...query,
    hasError,
    errorMessage,
    isReady,
  };
}

/**
 * Hook to retry a failed query
 */
export function useRetryQuery<TData, TError = Error>(
  query: UseQueryResult<TData, TError>
) {
  return useCallback(() => {
    query.refetch();
  }, [query]);
}
