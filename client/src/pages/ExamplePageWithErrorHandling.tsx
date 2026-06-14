/**
 * EXAMPLE: Page with proper error handling
 * This demonstrates the recommended pattern for all pages
 * 
 * Key patterns:
 * 1. Always check isLoading, isError, and data states
 * 2. Show appropriate UI for each state
 * 3. Provide retry functionality on errors
 * 4. Use proper TypeScript typing
 */

import { QueryErrorState, QueryLoadingState, QueryEmptyState } from "@/components/QueryErrorState";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ExamplePageWithErrorHandling() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Example query with proper error handling
  const {
    data: teams,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.userTeams.myTeams.useQuery(undefined, {
    enabled: Boolean(user), // Only fetch if user is authenticated
  });

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <QueryLoadingState title="Loading your teams..." />
      </div>
    );
  }

  // Show error state with retry
  if (isError) {
    return (
      <div className="space-y-4">
        <QueryErrorState
          error={error}
          onRetry={() => refetch()}
          title="Failed to load teams"
          description="We couldn't fetch your teams. Please try again."
        />
      </div>
    );
  }

  // Show empty state
  if (!teams || teams.length === 0) {
    return (
      <div className="space-y-4">
        <QueryEmptyState
          title="No teams yet"
          description="Create your first fantasy football team to get started."
        />
      </div>
    );
  }

  // Show data
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your Teams</h1>
      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <h2 className="font-semibold">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              Budget: ${team.budget?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
