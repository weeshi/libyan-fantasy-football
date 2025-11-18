import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Fantasy Football routers
  teams: router({
    list: publicProcedure.query(async () => {
      // Return list of all teams in Libyan Football League
      return [
        { id: 1, name: "Al-Ahly Benghazi", city: "Benghazi" },
        { id: 2, name: "Al-Ahly Tripoli", city: "Tripoli" },
        { id: 3, name: "Al-Hilal", city: "Tripoli" },
        { id: 4, name: "Al-Zawiya", city: "Zawiya" },
        { id: 5, name: "Ittihad Benghazi", city: "Benghazi" },
      ];
    }),
  }),

  players: router({
    list: publicProcedure.query(async () => {
      // Return list of all players
      return [];
    }),
    byTeam: publicProcedure.input(z.object({ teamId: z.number() })).query(async ({ input }) => {
      // Return players for a specific team
      return [];
    }),
  }),

  leagues: router({
    list: publicProcedure.query(async () => {
      // Return all leagues
      return [];
    }),
    myLeagues: protectedProcedure.query(async ({ ctx }) => {
      // Return leagues for current user
      return [];
    }),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional(),
      maxParticipants: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      // Create a new league
      return { id: 1, name: input.name };
    }),
  }),

  userTeams: router({
    myTeams: protectedProcedure.query(async ({ ctx }) => {
      // Return user's teams
      return [];
    }),
    create: protectedProcedure.input(z.object({
      teamName: z.string(),
      leagueId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      // Create a new user team in a league
      return { id: 1, teamName: input.teamName, leagueId: input.leagueId };
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      // Get a specific user team
      return null;
    }),
  }),
});

export type AppRouter = typeof appRouter;
