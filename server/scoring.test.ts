/**
 * Tests for Advanced Scoring System
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  calculatePlayerPoints,
  DEFAULT_SCORING_RULES,
  PlayerPerformanceInput,
} from "./scoring";

describe("Scoring System", () => {
  describe("calculatePlayerPoints", () => {
    it("should calculate 0 points for no performance", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      expect(points).toBe(0);
    });

    it("should award 1 point for 0-60 minutes played", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 45,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      expect(points).toBe(1);
    });

    it("should award 2 points for 60+ minutes played", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      expect(points).toBe(2);
    });

    it("should award correct points for midfielder goal", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 5 (goal) = 7
      expect(points).toBe(7);
    });

    it("should award correct points for defender goal", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "defender",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 6 (goal) = 8
      expect(points).toBe(8);
    });

    it("should award correct points for forward goal", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "forward",
        minutesPlayed: 90,
        goals: 2,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 4*2 (goals) = 10
      expect(points).toBe(10);
    });

    it("should award correct points for goalkeeper goal", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "goalkeeper",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 10 (goal) = 12
      expect(points).toBe(12);
    });

    it("should award 3 points for assist", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 1,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 3 (assist) = 5
      expect(points).toBe(5);
    });

    it("should award 4 points for goalkeeper clean sheet", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "goalkeeper",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 4 (clean sheet) = 6
      expect(points).toBe(6);
    });

    it("should award 4 points for defender clean sheet", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "defender",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 4 (clean sheet) = 6
      expect(points).toBe(6);
    });

    it("should award 1 point for midfielder clean sheet", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 1 (clean sheet) = 3
      expect(points).toBe(3);
    });

    it("should deduct 1 point for yellow card", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 1,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) - 1 (yellow card) = 1
      expect(points).toBe(1);
    });

    it("should deduct 3 points for red card", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 1,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) - 3 (red card) = -1, but minimum is 0
      expect(points).toBe(0);
    });

    it("should award 1 point per 3 saves for goalkeeper", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "goalkeeper",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 9,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 3 (saves: 9/3) = 5
      expect(points).toBe(5);
    });

    it("should deduct 1 point per 2 goals against for goalkeeper", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "goalkeeper",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 4,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) - 2 (goals against: 4/2) = 0
      expect(points).toBe(0);
    });

    it("should deduct 1 point per 2 goals against for defender", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "defender",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 4,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) - 2 (goals against: 4/2) = 0
      expect(points).toBe(0);
    });

    it("should award bonus points (capped at 3)", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 5, // Should be capped at 3
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 3 (bonus capped at 3) = 5
      expect(points).toBe(5);
    });

    it("should calculate complex performance correctly", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 2,
        assists: 1,
        cleanSheet: true,
        yellowCards: 1,
        redCards: 0,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 2,
      };

      const points = await calculatePlayerPoints(performance);
      // 2 (minutes) + 10 (goals: 2*5) + 3 (assist) + 1 (clean sheet) - 1 (yellow) + 2 (bonus) = 17
      expect(points).toBe(17);
    });

    it("should never return negative points", async () => {
      const performance: PlayerPerformanceInput = {
        playerId: 1,
        position: "midfielder",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 5,
        redCards: 1,
        goalsAgainst: 0,
        saves: 0,
        bonusPoints: 0,
      };

      const points = await calculatePlayerPoints(performance);
      expect(points).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Scoring Rules", () => {
    it("should have default scoring rules defined", () => {
      expect(DEFAULT_SCORING_RULES.length).toBeGreaterThan(0);
    });

    it("should have rules for all positions", () => {
      const positions = ["goalkeeper", "defender", "midfielder", "forward"];
      const rulePositions = new Set(DEFAULT_SCORING_RULES.map((r) => r.position));

      // Should have rules for all positions plus 'all'
      expect(rulePositions.has("all")).toBe(true);
      positions.forEach((pos) => {
        const hasRuleForPosition = DEFAULT_SCORING_RULES.some(
          (r) => r.position === pos || r.position === "all"
        );
        expect(hasRuleForPosition).toBe(true);
      });
    });

    it("should have positive and negative points", () => {
      const hasPositive = DEFAULT_SCORING_RULES.some((r) => r.points > 0);
      const hasNegative = DEFAULT_SCORING_RULES.some((r) => r.points < 0);

      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
    });
  });
});
