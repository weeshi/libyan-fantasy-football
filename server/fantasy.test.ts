import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(userId: number): TrpcContext {
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

  return {
    user,
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
    it("returns a list of teams", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.teams.list();

      expect(Array.isArray(teams)).toBe(true);
      expect(teams.length).toBeGreaterThan(0);
      expect(teams[0]).toHaveProperty("name");
      expect(teams[0]).toHaveProperty("city");
    });

    it("includes Al-Ahly Benghazi in the list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const teams = await caller.teams.list();
      const alAhlyBenghazi = teams.find((t) => t.name === "الأهلي بنغازي");

      expect(alAhlyBenghazi).toBeDefined();
      expect(alAhlyBenghazi?.city).toBe("بنغازي");
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

  describe("leagues.list", () => {
    it("returns a list of leagues", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const leagues = await caller.leagues.list();

      expect(Array.isArray(leagues)).toBe(true);
    });
  });

  describe("leagues.create", () => {
    it("requires authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.leagues.create({
          name: "Test League",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("creates a new league when authenticated", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const league = await caller.leagues.create({
        name: "Test League",
        description: "A test league",
      });

      expect(league).toBeDefined();
      expect(league.name).toBe("Test League");
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

    it("returns user's teams when authenticated", async () => {
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
          teamName: "Test Team",
          selectedPlayerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("requires at least 11 players", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.userTeams.create({
          teamName: "Small Team",
          leagueId: 1,
          selectedPlayerIds: [1, 2, 3],
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("creates a new user team with valid input", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const team = await caller.userTeams.create({
        teamName: "My Fantasy Team",
        leagueId: 1,
        selectedPlayerIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      });

      expect(team).toBeDefined();
      expect(team.teamName).toBe("My Fantasy Team");
      expect(team.leagueId).toBe(1);
      expect(team.success).toBe(true);
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

    it("returns team details when authenticated", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const team = await caller.userTeams.getById({ id: 1 });

      expect(team).toBeDefined();
      expect(team?.players).toBeDefined();
      expect(Array.isArray(team?.players)).toBe(true);
    });
  });
});
