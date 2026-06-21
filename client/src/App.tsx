import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "./components/Toast";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

// Eagerly load lightweight pages
import Home from "./pages/Home";
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load heavy pages for better initial load performance
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TeamDetails = lazy(() => import("./pages/TeamDetails"));
const CreateTeam = lazy(() => import("./pages/CreateTeam"));
const PlayerTrading = lazy(() => import("./pages/PlayerTrading"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Matches = lazy(() => import("./pages/Matches"));
const Transfers = lazy(() => import("./pages/Transfers"));
const Chips = lazy(() => import("./pages/Chips"));
const H2HLeague = lazy(() => import("./pages/H2HLeague"));
const CupTournament = lazy(() => import("./pages/CupTournament"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));
const PlayerComparison = lazy(() => import("./pages/PlayerComparison"));
const FAQ = lazy(() => import("./pages/FAQ"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/dashboard" component={Home} />
        <Route path="/create-team" component={CreateTeam} />
        <Route path="/team/:id" component={TeamDetails} />
        <Route path="/player-trading" component={PlayerTrading} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/matches" component={Matches} />
        <Route path="/transfers" component={Transfers} />
        <Route path="/chips" component={Chips} />
        <Route path="/h2h" component={H2HLeague} />
        <Route path="/cup" component={CupTournament} />
        <Route path="/player/:id" component={PlayerProfile} />
        <Route path="/player-comparison" component={PlayerComparison} />
        <Route path="/faq" component={FAQ} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <ToastContainer />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
