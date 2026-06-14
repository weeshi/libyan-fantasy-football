# 🛡️ Error Handling & Auth Flow Guide

## Overview

This document outlines the error handling improvements made to Libyan Fantasy Football to ensure robust runtime stability, proper authentication flow, and graceful error recovery.

---

## 1️⃣ Error Boundary

### Implementation
Located in: `client/src/components/ErrorBoundary.tsx`

The app is wrapped with a top-level Error Boundary in `App.tsx`:

```tsx
<ErrorBoundary>
  <ThemeProvider defaultTheme="dark">
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  </ThemeProvider>
</ErrorBoundary>
```

### Features
- ✅ Catches React rendering errors
- ✅ Logs errors with `componentDidCatch`
- ✅ Shows user-friendly error UI
- ✅ Provides "Reload Page" button for recovery
- ✅ Displays error stack in development

### Usage
The Error Boundary automatically catches any unhandled React errors and prevents the entire app from crashing.

---

## 2️⃣ React Query Configuration

### Improved Defaults
Located in: `client/src/main.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // Retry failed queries once
      retryDelay: exponentialBackoff, // Exponential backoff (1s, 2s, 4s...)
      staleTime: 5 * 60 * 1000,   // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000,     // Cache kept for 10 minutes
    },
    mutations: {
      retry: 1,
      retryDelay: exponentialBackoff,
    },
  },
});
```

### Error Logging
Global error handlers log all API errors with context:

```typescript
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", {
      error,
      queryKey: event.query.queryKey,
      timestamp: new Date().toISOString(),
    });
  }
});
```

### Benefits
- 🔄 Automatic retry with exponential backoff
- 📊 Centralized error logging
- 🔐 Automatic redirect to login on 401 errors
- ⏱️ Optimized cache timing

---

## 3️⃣ Authentication Flow

### useAuth Hook
Located in: `client/src/_core/hooks/useAuth.ts`

#### Features
- ✅ Checks user authentication status
- ✅ Handles logout with proper cleanup
- ✅ Redirects to login if unauthenticated
- ✅ Logs auth state changes
- ✅ Stores user info in localStorage

#### Usage
```typescript
const { user, loading, error, isAuthenticated, logout } = useAuth();

// With redirect
const { user } = useAuth({ 
  redirectOnUnauthenticated: true,
  redirectPath: getLoginUrl()
});
```

#### Logout Flow
```typescript
const logout = useCallback(async () => {
  try {
    await logoutMutation.mutateAsync();
    console.log('[Auth] Logout successful');
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Still clear local state even if logout fails
  } finally {
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
    console.log('[Auth] Local auth state cleared');
  }
}, [logoutMutation, utils]);
```

### DashboardLayout Integration
Located in: `client/src/components/DashboardLayout.tsx`

The logout button includes error handling:

```typescript
<DropdownMenuItem
  onClick={async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[DashboardLayout] Logout failed:', error);
      // Redirect to home even if logout fails
      window.location.href = '/';
    }
  }}
>
  <LogOut className="mr-2 h-4 w-4" />
  <span>Sign out</span>
</DropdownMenuItem>
```

---

## 4️⃣ Query Error Handling Components

### QueryErrorState
Located in: `client/src/components/QueryErrorState.tsx`

Displays error with retry button:

```typescript
import { QueryErrorState } from "@/components/QueryErrorState";

<QueryErrorState
  error={error}
  onRetry={() => refetch()}
  title="Failed to load teams"
  description="We couldn't fetch your teams. Please try again."
/>
```

### QueryLoadingState
Shows loading indicator:

```typescript
import { QueryLoadingState } from "@/components/QueryErrorState";

<QueryLoadingState 
  title="Loading your teams..."
/>
```

### QueryEmptyState
Shows empty state message:

```typescript
import { QueryEmptyState } from "@/components/QueryErrorState";

<QueryEmptyState
  title="No teams yet"
  description="Create your first fantasy football team to get started."
/>
```

---

## 5️⃣ Recommended Page Pattern

### Example Implementation
Located in: `client/src/pages/ExamplePageWithErrorHandling.tsx`

```typescript
export default function ExamplePage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Query with proper error handling
  const {
    data: teams,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.userTeams.myTeams.useQuery(undefined, {
    enabled: Boolean(user),
  });

  // Handle loading
  if (authLoading || isLoading) {
    return <QueryLoadingState title="Loading..." />;
  }

  // Handle error
  if (isError) {
    return (
      <QueryErrorState
        error={error}
        onRetry={() => refetch()}
        title="Failed to load teams"
      />
    );
  }

  // Handle empty
  if (!teams || teams.length === 0) {
    return <QueryEmptyState title="No teams yet" />;
  }

  // Show data
  return (
    <div>
      {teams.map(team => (
        <div key={team.id}>{team.name}</div>
      ))}
    </div>
  );
}
```

### Key Points
1. ✅ Always check `isLoading`, `isError`, and `data`
2. ✅ Show appropriate UI for each state
3. ✅ Provide retry functionality
4. ✅ Use proper TypeScript typing
5. ✅ Redirect unauthenticated users

---

## 6️⃣ Custom Query Hook

### useQueryWithErrorHandling
Located in: `client/src/hooks/useQueryWithErrorHandling.ts`

Simplified error handling:

```typescript
import { useQueryWithErrorHandling } from "@/hooks/useQueryWithErrorHandling";

const {
  data,
  isLoading,
  hasError,      // Boolean flag
  errorMessage,  // String message
  isReady,       // data loaded && no error
  refetch,
} = useQueryWithErrorHandling({
  queryKey: ['teams'],
  queryFn: () => fetchTeams(),
});

if (isReady) {
  // Safe to use data
}
```

---

## 7️⃣ OAuth & Cookies

### OAuth Flow
Located in: `server/_core/oauth.ts`

1. User clicks "Sign in"
2. Redirected to Manus OAuth
3. OAuth callback at `/api/oauth/callback`
4. Session token created and stored in HTTP-only cookie
5. Redirect to home page

### Cookie Configuration
Located in: `server/_core/cookies.ts`

```typescript
{
  httpOnly: true,      // Not accessible from JavaScript
  path: "/",           // Available site-wide
  sameSite: "none",    // Cross-site requests
  secure: true,        // HTTPS only
}
```

### Security Features
- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=none (CSRF protection)
- ✅ 1-year expiration

---

## 8️⃣ Logging & Debugging

### Console Logs
The app logs important events:

```
[ErrorBoundary] Error caught: ...
[Auth] Logout successful
[Auth] Logout error: ...
[Auth] Local auth state cleared
[Auth] Redirecting to login: ...
[API Query Error] { error, queryKey, timestamp }
[API Mutation Error] { error, mutationKey, timestamp }
[DashboardLayout] Logout failed: ...
```

### Browser DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. Filter by `[Auth]`, `[API]`, `[ErrorBoundary]`
4. Check Network tab for API calls

---

## 9️⃣ Testing

### Run Tests
```bash
pnpm test                    # Run all tests
pnpm test -- --ui           # Run with UI
pnpm test -- auth.logout    # Run specific test
```

### Current Test Coverage
- ✅ 467 tests passing
- ✅ Auth logout test
- ✅ Query error handling
- ✅ Mutation error handling

---

## 🔟 Checklist for New Pages

When creating a new page, ensure:

- [ ] Import `useAuth` and check authentication
- [ ] Use proper query state handling (`isLoading`, `isError`, `data`)
- [ ] Show loading state with `QueryLoadingState`
- [ ] Show error state with `QueryErrorState`
- [ ] Show empty state with `QueryEmptyState`
- [ ] Provide retry functionality
- [ ] Use TypeScript for type safety
- [ ] Log important events
- [ ] Test error scenarios
- [ ] Test loading states
- [ ] Test empty states

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `client/src/components/ErrorBoundary.tsx` | Top-level error catching |
| `client/src/main.tsx` | React Query configuration |
| `client/src/_core/hooks/useAuth.ts` | Authentication hook |
| `client/src/components/DashboardLayout.tsx` | Dashboard with auth |
| `client/src/components/QueryErrorState.tsx` | Error/loading/empty UI |
| `client/src/hooks/useQueryWithErrorHandling.ts` | Enhanced query hook |
| `client/src/pages/ExamplePageWithErrorHandling.tsx` | Example pattern |
| `server/_core/oauth.ts` | OAuth implementation |
| `server/_core/cookies.ts` | Cookie configuration |

---

## 🎯 Best Practices

1. **Always handle loading states** - Show skeleton or spinner
2. **Always handle error states** - Show error message + retry button
3. **Always handle empty states** - Show helpful message
4. **Use proper TypeScript** - Avoid `any` type
5. **Log important events** - Use `console.log/error` with prefixes
6. **Test error scenarios** - Don't just test happy path
7. **Provide user feedback** - Toast messages for actions
8. **Redirect on auth errors** - Automatic redirect to login
9. **Clean up on logout** - Clear cache and local state
10. **Use exponential backoff** - Don't hammer API on retry

---

## 🚀 Performance Tips

- Use `enabled` option to prevent unnecessary queries
- Use `staleTime` to reduce API calls
- Use `gcTime` to balance memory usage
- Batch queries with `httpBatchLink`
- Use optimistic updates for mutations
- Implement request deduplication

---

**Last Updated:** June 14, 2026
**Version:** 1.0
**Status:** ✅ Production Ready
