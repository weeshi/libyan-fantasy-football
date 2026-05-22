/**
 * Advanced Scoring System Tests
 * Comprehensive test cases for FPL-style point calculations
 */

import { describe, it, expect } from "vitest";
import {
  calculatePlayerPoints,
  calculateMinutesPoints,
  calculateGoalsPoints,
  calculateAssistsPoints,
  calculateCleanSheetPoints,
  calculateSavesPoints,
  calculateYellowCardPenalty,
  calculateRedCardPenalty,
  calculateGoalsAgainstPenalty,
  calculateOwnGoalPenalty,
  calculatePenaltyMissedPenalty,
  calculateBonusPoints,
  DEFAULT_SCORING_CONFIG,
  type PlayerPerformanceData,
  type ScoringConfig,
} from "./advanced-scoring";

describe("Advanced Scoring System", () => {
  // Test 1: Minutes played calculation
  describe("Minutes Played Points", () => {
    it("should return 0 points for less than 60 minutes", () => {
      const points = calculateMinutesPoints(45, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 1 point per minute for 60+ minutes", () => {
      const points = calculateMinutesPoints(90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(90);
    });

    it("should return 0 points for 0 minutes", () => {
      const points = calculateMinutesPoints(0, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 60 points for exactly 60 minutes", () => {
      const points = calculateMinutesPoints(60, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(60);
    });
  });

  // Test 2: Goals calculation
  describe("Goals Points", () => {
    it("should return 0 points for no goals", () => {
      const points = calculateGoalsPoints(0, "forward", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 4 points per goal for forward", () => {
      const points = calculateGoalsPoints(2, "forward", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(8);
    });

    it("should return 5 points per goal for midfielder", () => {
      const points = calculateGoalsPoints(1, "midfielder", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(5);
    });

    it("should return 6 points per goal for defender", () => {
      const points = calculateGoalsPoints(1, "defender", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(6);
    });

    it("should return 10 points per goal for goalkeeper", () => {
      const points = calculateGoalsPoints(1, "goalkeeper", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(10);
    });
  });

  // Test 3: Assists calculation
  describe("Assists Points", () => {
    it("should return 0 points for no assists", () => {
      const points = calculateAssistsPoints(0, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 3 points per assist", () => {
      const points = calculateAssistsPoints(2, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(6);
    });

    it("should return 3 points for 1 assist", () => {
      const points = calculateAssistsPoints(1, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(3);
    });
  });

  // Test 4: Clean sheet calculation
  describe("Clean Sheet Points", () => {
    it("should return 0 points for no clean sheet", () => {
      const points = calculateCleanSheetPoints(false, "defender", 90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 0 points for clean sheet with less than 60 minutes", () => {
      const points = calculateCleanSheetPoints(true, "defender", 45, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 4 points for defender clean sheet", () => {
      const points = calculateCleanSheetPoints(true, "defender", 90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(4);
    });

    it("should return 4 points for goalkeeper clean sheet", () => {
      const points = calculateCleanSheetPoints(true, "goalkeeper", 90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(4);
    });

    it("should return 1 point for midfielder clean sheet", () => {
      const points = calculateCleanSheetPoints(true, "midfielder", 90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(1);
    });

    it("should return 0 points for forward clean sheet", () => {
      const points = calculateCleanSheetPoints(true, "forward", 90, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });
  });

  // Test 5: Saves calculation
  describe("Saves Points", () => {
    it("should return 0 points for non-goalkeeper", () => {
      const points = calculateSavesPoints(9, "defender", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 0 points for no saves", () => {
      const points = calculateSavesPoints(0, "goalkeeper", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 1 point per 3 saves for goalkeeper", () => {
      const points = calculateSavesPoints(9, "goalkeeper", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(3);
    });

    it("should return 0 points for less than 3 saves", () => {
      const points = calculateSavesPoints(2, "goalkeeper", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });
  });

  // Test 6: Card penalties
  describe("Card Penalties", () => {
    it("should return -1 point per yellow card", () => {
      const points = calculateYellowCardPenalty(2, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-2);
    });

    it("should return -3 points per red card", () => {
      const points = calculateRedCardPenalty(1, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-3);
    });

    it("should return 0 points for no cards", () => {
      const yellowPoints = calculateYellowCardPenalty(0, DEFAULT_SCORING_CONFIG);
      const redPoints = calculateRedCardPenalty(0, DEFAULT_SCORING_CONFIG);
      expect(yellowPoints).toEqual(0);
      expect(redPoints).toEqual(0);
    });
  });

  // Test 7: Goals against penalty
  describe("Goals Against Penalty", () => {
    it("should return 0 points for forward", () => {
      const points = calculateGoalsAgainstPenalty(3, "forward", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return 0 points for midfielder", () => {
      const points = calculateGoalsAgainstPenalty(3, "midfielder", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });

    it("should return -1 point per 2 goals for defender", () => {
      const points = calculateGoalsAgainstPenalty(4, "defender", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-2);
    });

    it("should return -1 point per 2 goals for goalkeeper", () => {
      const points = calculateGoalsAgainstPenalty(5, "goalkeeper", DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-2);
    });
  });

  // Test 8: Own goal penalty
  describe("Own Goal Penalty", () => {
    it("should return -2 points per own goal", () => {
      const points = calculateOwnGoalPenalty(1, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-2);
    });

    it("should return -4 points for 2 own goals", () => {
      const points = calculateOwnGoalPenalty(2, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-4);
    });
  });

  // Test 9: Missed penalty
  describe("Missed Penalty", () => {
    it("should return -2 points per missed penalty", () => {
      const points = calculatePenaltyMissedPenalty(1, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(-2);
    });

    it("should return 0 points for no missed penalties", () => {
      const points = calculatePenaltyMissedPenalty(0, DEFAULT_SCORING_CONFIG);
      expect(points).toEqual(0);
    });
  });

  // Test 10: Bonus points
  describe("Bonus Points", () => {
    it("should return bonus points as-is", () => {
      const points = calculateBonusPoints(3, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(3);
    });

    it("should return 0 for no bonus points", () => {
      const points = calculateBonusPoints(0, DEFAULT_SCORING_CONFIG);
      expect(points).toBe(0);
    });
  });

  // Test 11: Complete player performance calculations
  describe("Complete Player Performance Calculations", () => {
    it("should calculate points for a forward with goal and assist", () => {
      const performance: PlayerPerformanceData = {
        playerId: 1,
        position: "forward",
        minutesPlayed: 90,
        goals: 1,
        assists: 1,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + 1 goal (4) + 1 assist (3) = 97
      expect(points).toBe(97);
    });

    it("should calculate points for a defender with clean sheet", () => {
      const performance: PlayerPerformanceData = {
        playerId: 2,
        position: "defender",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + clean sheet (4) = 94
      expect(points).toBe(94);
    });

    it("should calculate points for a goalkeeper with saves and clean sheet", () => {
      const performance: PlayerPerformanceData = {
        playerId: 3,
        position: "goalkeeper",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        saves: 9,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + clean sheet (4) + 9 saves (3) = 97
      expect(points).toBe(97);
    });

    it("should calculate points with penalties", () => {
      const performance: PlayerPerformanceData = {
        playerId: 4,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: false,
        yellowCards: 2,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + 1 goal (5) - 2 yellow cards (-2) = 93
      expect(points).toBe(93);
    });

    it("should handle player with red card", () => {
      const performance: PlayerPerformanceData = {
        playerId: 5,
        position: "defender",
        minutesPlayed: 45,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 1,
      };

      const points = calculatePlayerPoints(performance);
      // 0 minutes (< 60) + 0 clean sheet + -3 red card = -3 (clamped to 0)
      expect(points).toBe(0);
    });

    it("should calculate points with bonus points", () => {
      const performance: PlayerPerformanceData = {
        playerId: 6,
        position: "forward",
        minutesPlayed: 90,
        goals: 2,
        assists: 1,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 3,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + 2 goals (8) + 1 assist (3) + 3 bonus = 104
      expect(points).toBe(104);
    });

    it("should handle player with goals against penalty", () => {
      const performance: PlayerPerformanceData = {
        playerId: 7,
        position: "defender",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        goalsAgainst: 4,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + 0 clean sheet + -2 goals against = 88
      expect(points).toBe(88);
    });

    it("should handle player with own goal", () => {
      const performance: PlayerPerformanceData = {
        playerId: 8,
        position: "defender",
        minutesPlayed: 90,
        goals: 0,
        assists: 0,
        cleanSheet: true,
        yellowCards: 0,
        redCards: 0,
        ownGoals: 1,
      };

      const points = calculatePlayerPoints(performance);
      // 90 minutes (90) + clean sheet (4) - 2 own goal = 92
      expect(points).toBe(92);
    });

    it("should ensure non-negative total points", () => {
      const performance: PlayerPerformanceData = {
        playerId: 9,
        position: "forward",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 3,
        redCards: 1,
      };

      const points = calculatePlayerPoints(performance);
      // Should be clamped to 0 (negative would be -6)
      expect(points).toBe(0);
    });

    it("should calculate complex performance with all factors", () => {
      const performance: PlayerPerformanceData = {
        playerId: 10,
        position: "midfielder",
        minutesPlayed: 90,
        goals: 1,
        assists: 2,
        cleanSheet: true,
        saves: 0,
        yellowCards: 1,
        redCards: 0,
        goalsAgainst: 0,
        ownGoals: 0,
        penaltyMissed: 0,
        bonusPoints: 2,
      };

      const points = calculatePlayerPoints(performance);
      // 90 (minutes) + 5 (goal) + 6 (assists) + 1 (clean sheet) - 1 (yellow) + 2 (bonus) = 103
      expect(points).toBe(103);
    });
  });

  // Test 12: Edge cases
  describe("Edge Cases", () => {
    it("should handle zero performance", () => {
      const performance: PlayerPerformanceData = {
        playerId: 11,
        position: "forward",
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      expect(points).toBe(0);
    });

    it("should handle 59 minutes (just below threshold)", () => {
      const performance: PlayerPerformanceData = {
        playerId: 12,
        position: "forward",
        minutesPlayed: 59,
        goals: 0,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance);
      expect(points).toBe(0);
    });

    it("should handle very high performance", () => {
      const performance: PlayerPerformanceData = {
        playerId: 13,
        position: "forward",
        minutesPlayed: 90,
        goals: 5,
        assists: 3,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
        bonusPoints: 3,
      };

      const points = calculatePlayerPoints(performance);
      // 90 + 20 (5 goals) + 9 (3 assists) + 3 (bonus) = 122
      expect(points).toBe(122);
    });
  });

  // Test 13: Configuration flexibility
  describe("Configuration Flexibility", () => {
    it("should use custom configuration", () => {
      const customConfig: ScoringConfig = {
        ...DEFAULT_SCORING_CONFIG,
        goalsForward: 10, // Custom: 10 points per goal for forward
      };

      const performance: PlayerPerformanceData = {
        playerId: 14,
        position: "forward",
        minutesPlayed: 90,
        goals: 1,
        assists: 0,
        cleanSheet: false,
        yellowCards: 0,
        redCards: 0,
      };

      const points = calculatePlayerPoints(performance, customConfig);
      // 90 minutes + 10 goals (custom) = 100
      expect(points).toBe(100);
    });
  });
});
