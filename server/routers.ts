import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getUserTeamsByUserId, createUserTeam, addPlayerToUserTeam, getUserTeamPlayers, getPlayerById } from "./db";

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
        { id: 1, name: "الأهلي بنغازي", city: "بنغازي" },
        { id: 2, name: "الأهلي طرابلس", city: "طرابلس" },
        { id: 3, name: "الهلال", city: "طرابلس" },
        { id: 4, name: "الزاوية", city: "الزاوية" },
        { id: 5, name: "اتحاد بنغازي", city: "بنغازي" },
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
      if (!ctx.user) return [];
      const teams = await getUserTeamsByUserId(ctx.user.id);
      // For each team, get the players
      const teamsWithPlayers = await Promise.all(
        teams.map(async (team) => {
          const teamPlayers = await getUserTeamPlayers(team.id);
          return { ...team, players: teamPlayers };
        })
      );
      return teamsWithPlayers;
    }),
    create: protectedProcedure.input(z.object({
      teamName: z.string(),
      teamDescription: z.string().optional(),
      selectedPlayerIds: z.array(z.number()),
      leagueId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("User not authenticated");
      }

      if (input.selectedPlayerIds.length < 11) {
        throw new Error("يجب اختيار 11 لاعباً على الأقل");
      }

      try {
        // Create the user team
        const userTeamResult = await createUserTeam({
          userId: ctx.user.id,
          leagueId: input.leagueId || 1,
          teamName: input.teamName,
          budget: 100000000,
          totalPoints: 0,
        });

        // Get the inserted team ID
        const userTeamId = (userTeamResult as any).insertId || 1;

        // Add selected players to the team
        for (const playerId of input.selectedPlayerIds) {
          const player = await getPlayerById(playerId);
          if (player) {
            await addPlayerToUserTeam({
              userTeamId,
              playerId,
              purchasePrice: player.marketValue || 0,
              isCaptain: 0,
              isOnBench: 0,
            });
          }
        }

        return {
          id: userTeamId,
          teamName: input.teamName,
          leagueId: input.leagueId || 1,
          success: true,
        };
      } catch (error) {
        console.error("Failed to create user team:", error);
        throw new Error("فشل في إنشاء الفريق");
      }
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      if (!ctx.user) return null;
      const teamPlayers = await getUserTeamPlayers(input.id);
      return { id: input.id, players: teamPlayers };
    }),
  }),
});

export type AppRouter = typeof appRouter;
