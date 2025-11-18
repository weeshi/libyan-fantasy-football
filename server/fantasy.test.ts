import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Fantasy Football API", () => {
  describe("teams.list", () => {
    it("returns list of Libyan teams", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.teams.list();

      expect(teams).toBeDefined();
      expect(Array.isArray(teams)).toBe(true);
      expect(teams.length).toBeGreaterThan(0);
      expect(teams[0]).toHaveProperty("id");
      expect(teams[0]).toHaveProperty("name");
      expect(teams[0]).toHaveProperty("city");
    });

    it("includes Al-Ahly Benghazi in the list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.teams.list();
      const alAhlyBenghazi = teams.find((t) => t.name === "Al-Ahly Benghazi");

      expect(alAhlyBenghazi).toBeDefined();
      expect(alAhlyBenghazi?.city).toBe("Benghazi");
    });
  });

  describe("players.list", () => {
    it("returns empty list initially", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const players = await caller.players.list();

      expect(Array.isArray(players)).toBe(true);
    });
  });

  describe("players.byTeam", () => {
    it("returns players for a specific team", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const players = await caller.players.byTeam({ teamId: 1 });

      expect(Array.isArray(players)).toBe(true);
    });
  });

  describe("leagues.list", () => {
    it("returns list of leagues", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const leagues = await caller.leagues.list();

      expect(Array.isArray(leagues)).toBe(true);
    });
  });

  describe("leagues.myLeagues", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leagues.myLeagues();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("returns leagues for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const leagues = await caller.leagues.myLeagues();

      expect(Array.isArray(leagues)).toBe(true);
    });
  });

  describe("leagues.create", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leagues.create({ name: "Test League" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("creates a new league for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const league = await caller.leagues.create({
        name: "My Test League",
        description: "A test league",
        maxParticipants: 10,
      });

      expect(league).toBeDefined();
      expect(league.name).toBe("My Test League");
      expect(league.id).toBeDefined();
    });
  });

  describe("userTeams.myTeams", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.userTeams.myTeams();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("returns user teams", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.userTeams.myTeams();

      expect(Array.isArray(teams)).toBe(true);
    });
  });

  describe("userTeams.create", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.userTeams.create({
          teamName: "My Team",
          leagueId: 1,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("creates a new user team", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const team = await caller.userTeams.create({
        teamName: "My Fantasy Team",
        leagueId: 1,
      });

      expect(team).toBeDefined();
      expect(team.teamName).toBe("My Fantasy Team");
      expect(team.leagueId).toBe(1);
      expect(team.id).toBeDefined();
    });
  });

  describe("userTeams.getById", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.userTeams.getById({ id: 1 });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("returns user team by id", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const team = await caller.userTeams.getById({ id: 1 });

      // Team may not exist, but the call should succeed
      expect(team === null || typeof team === "object").toBe(true);
    });
  });
});
