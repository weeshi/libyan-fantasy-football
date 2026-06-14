import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface QueryErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function QueryErrorState({
  error,
  onRetry,
  title = "Failed to load data",
  description = "An error occurred while fetching data. Please try again.",
}: QueryErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground font-mono">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface QueryLoadingStateProps {
  title?: string;
  description?: string;
}

export function QueryLoadingState({
  title = "Loading...",
  description = "Please wait while we fetch your data.",
}: QueryLoadingStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface QueryEmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function QueryEmptyState({
  title = "No data available",
  description = "There's nothing to display right now.",
  action,
}: QueryEmptyStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {action && <CardContent>{action}</CardContent>}
    </Card>
  );
}
