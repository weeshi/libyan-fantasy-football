import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TeamDetails from "./pages/TeamDetails";
import AdminDashboard from "./pages/AdminDashboard";
import CreateTeam from "./pages/CreateTeam";
import PlayerTrading from "./pages/PlayerTrading";
import Leaderboard from "./pages/Leaderboard";
import Matches from "./pages/Matches";
import Transfers from "./pages/Transfers";
import Chips from "./pages/Chips";
import H2HLeague from "./pages/H2HLeague";
import CupTournament from "./pages/CupTournament";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path={"/create-team"} component={CreateTeam} />
      <Route path={"/team/:id"} component={TeamDetails} />
      <Route path={"/player-trading"} component={PlayerTrading} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/matches"} component={Matches} />
      <Route path={"/transfers"} component={Transfers} />
      <Route path="/chips" component={Chips} />
      <Route path="/h2h" component={H2HLeague} />
      <Route path="/cup" component={CupTournament} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
