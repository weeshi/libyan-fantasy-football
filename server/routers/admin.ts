/**
 * Admin Router for tRPC
 * Handles all admin operations for gameweeks, matches, and results
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import * as adminGameweek from "../admin-gameweek";
import * as adminMatches from "../admin-matches";
import * as adminResults from "../admin-results";

export const adminRouter = router({
  // Gameweek Management
  gameweek: router({
    create: adminProcedure
      .input(
        z.object({
          leagueId: z.number(),
          gameweekNumber: z.number(),
          startDate: z.date(),
          endDate: z.date(),
          transferDeadline: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return adminGameweek.createGameweek(
          input.leagueId,
          input.gameweekNumber,
          input.startDate,
          input.endDate,
          input.transferDeadline
        );
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          gameweekId: z.number(),
          status: z.enum(["upcoming", "active", "completed"]),
        })
      )
      .mutation(async ({ input }) => {
        return adminGameweek.updateGameweekStatus(input.gameweekId, input.status);
      }),

    updateDeadline: adminProcedure
      .input(
        z.object({
          gameweekId: z.number(),
          deadline: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        return adminGameweek.updateTransferDeadline(input.gameweekId, input.deadline);
      }),

    closeTransferWindow: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .mutation(async ({ input }) => {
        return adminGameweek.closeTransferWindowForGameweek(input.gameweekId);
      }),

    getAll: adminProcedure
      .input(z.object({ leagueId: z.number() }))
      .query(async ({ input }) => {
        return adminGameweek.getLeagueGameweeks(input.leagueId);
      }),

    getById: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .query(async ({ input }) => {
        return adminGameweek.getGameweekById(input.gameweekId);
      }),

    getCurrent: adminProcedure
      .input(z.object({ leagueId: z.number() }))
      .query(async ({ input }) => {
        return adminGameweek.getCurrentGameweekForLeague(input.leagueId);
      }),

    delete: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .mutation(async ({ input }) => {
        return adminGameweek.deleteGameweek(input.gameweekId);
      }),

    getStats: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .query(async ({ input }) => {
        return adminGameweek.getGameweekStats(input.gameweekId);
      }),

    createSeason: adminProcedure
      .input(
        z.object({
          leagueId: z.number(),
          startDate: z.date(),
          numberOfGameweeks: z.number().default(38),
        })
      )
      .mutation(async ({ input }) => {
        return adminGameweek.createSeasonGameweeks(
          input.leagueId,
          input.startDate,
          input.numberOfGameweeks
        );
      }),
  }),

  // Match Management
  match: router({
    create: adminProcedure
      .input(
        z.object({
          gameweekId: z.number(),
          team1Id: z.number(),
          team2Id: z.number(),
          kickoffTime: z.date(),
          venue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return adminMatches.createMatch(
          input.gameweekId,
          input.team1Id,
          input.team2Id,
          input.kickoffTime,
          input.venue
        );
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          matchId: z.number(),
          status: z.enum(["scheduled", "live", "completed"]),
        })
      )
      .mutation(async ({ input }) => {
        return adminMatches.updateMatchStatus(input.matchId, input.status);
      }),

    updateKickoffTime: adminProcedure
      .input(
        z.object({
          matchId: z.number(),
          kickoffTime: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        return adminMatches.updateMatchKickoffTime(input.matchId, input.kickoffTime);
      }),

    updateVenue: adminProcedure
      .input(
        z.object({
          matchId: z.number(),
          venue: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return adminMatches.updateMatchVenue(input.matchId, input.venue);
      }),

    getByGameweek: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .query(async ({ input }) => {
        return adminMatches.getGameweekMatches(input.gameweekId);
      }),

    getById: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return adminMatches.getMatchById(input.matchId);
      }),

    delete: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        return adminMatches.deleteMatch(input.matchId);
      }),

    getByStatus: adminProcedure
      .input(z.object({ status: z.enum(["scheduled", "live", "completed"]) }))
      .query(async ({ input }) => {
        return adminMatches.getMatchesByStatus(input.status);
      }),

    getUpcoming: adminProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return adminMatches.getUpcomingMatches(input.limit);
      }),

    getLive: adminProcedure.query(async () => {
      return adminMatches.getLiveMatches();
    }),

    bulkCreate: adminProcedure
      .input(
        z.object({
          gameweekId: z.number(),
          matches: z.array(
            z.object({
              team1Id: z.number(),
              team2Id: z.number(),
              kickoffTime: z.date(),
              venue: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return adminMatches.bulkCreateMatches(input.gameweekId, input.matches);
      }),

    getStats: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return adminMatches.getMatchStats(input.matchId);
      }),
  }),

  // Result Management
  result: router({
    updateMatchResult: adminProcedure
      .input(
        z.object({
          matchId: z.number(),
          team1Score: z.number(),
          team2Score: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return adminResults.updateMatchResult(input.matchId, input.team1Score, input.team2Score);
      }),

    recordPlayerPerformance: adminProcedure
      .input(
        z.object({
          playerId: z.number(),
          gameweekId: z.number(),
          matchId: z.number(),
          stats: z.object({
            minutesPlayed: z.number(),
            goals: z.number(),
            assists: z.number(),
            cleanSheet: z.boolean(),
            saves: z.number().optional(),
            yellowCards: z.number(),
            redCards: z.number(),
            ownGoals: z.number().optional(),
            penaltyMissed: z.number().optional(),
            bonusPoints: z.number().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return adminResults.recordPlayerPerformance(
          input.playerId,
          input.gameweekId,
          input.matchId,
          input.stats
        );
      }),

    getPlayerStats: adminProcedure
      .input(
        z.object({
          playerId: z.number(),
          gameweekId: z.number(),
        })
      )
      .query(async ({ input }) => {
        return adminResults.getPlayerGameweekStats(input.playerId, input.gameweekId);
      }),

    getGameweekPlayerStats: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .query(async ({ input }) => {
        return adminResults.getGameweekPlayerStats(input.gameweekId);
      }),

    finalizeGameweek: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .mutation(async ({ input }) => {
        return adminResults.finalizeGameweekResults(input.gameweekId);
      }),

    getMatchDetails: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return adminResults.getMatchResultDetails(input.matchId);
      }),

    bulkUpdateResults: adminProcedure
      .input(
        z.object({
          results: z.array(
            z.object({
              matchId: z.number(),
              team1Score: z.number(),
              team2Score: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        return adminResults.bulkUpdateMatchResults(input.results);
      }),

    getGameweekSummary: adminProcedure
      .input(z.object({ gameweekId: z.number() }))
      .query(async ({ input }) => {
        return adminResults.getGameweekSummary(input.gameweekId);
      }),

    undoMatchResult: adminProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        return adminResults.undoMatchResult(input.matchId);
      }),
  }),
});
