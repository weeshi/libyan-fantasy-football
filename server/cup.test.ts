/**
 * Tests for Cup Competition System
 */

import { describe, it, expect } from "vitest";
import { calculateTotalRounds, calculateMatchesInRound } from "./cup";

describe("Cup Competition System", () => {
  describe("calculateTotalRounds", () => {
    it("should calculate 1 round for 2 teams", () => {
      expect(calculateTotalRounds(2)).toBe(1);
    });

    it("should calculate 2 rounds for 3-4 teams", () => {
      expect(calculateTotalRounds(3)).toBe(2);
      expect(calculateTotalRounds(4)).toBe(2);
    });

    it("should calculate 3 rounds for 5-8 teams", () => {
      expect(calculateTotalRounds(5)).toBe(3);
      expect(calculateTotalRounds(8)).toBe(3);
    });

    it("should calculate 4 rounds for 9-16 teams", () => {
      expect(calculateTotalRounds(9)).toBe(4);
      expect(calculateTotalRounds(16)).toBe(4);
    });

    it("should calculate 5 rounds for 17-32 teams", () => {
      expect(calculateTotalRounds(17)).toBe(5);
      expect(calculateTotalRounds(32)).toBe(5);
    });

    it("should calculate 6 rounds for 33-64 teams", () => {
      expect(calculateTotalRounds(33)).toBe(6);
      expect(calculateTotalRounds(64)).toBe(6);
    });

    it("should handle 1 team", () => {
      expect(calculateTotalRounds(1)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(calculateTotalRounds(1024)).toBe(10);
    });
  });

  describe("calculateMatchesInRound", () => {
    it("should calculate 1 match in final with 2 teams", () => {
      const totalRounds = calculateTotalRounds(2);
      expect(calculateMatchesInRound(2, totalRounds)).toBe(1);
    });

    it("should calculate matches correctly for 8 teams", () => {
      // 8 teams = 3 rounds
      // Round 1: 4 matches
      // Round 2: 2 matches
      // Round 3: 1 match (final)
      expect(calculateMatchesInRound(8, 1)).toBe(4);
      expect(calculateMatchesInRound(8, 2)).toBe(2);
      expect(calculateMatchesInRound(8, 3)).toBe(1);
    });

    it("should calculate matches correctly for 16 teams", () => {
      // 16 teams = 4 rounds
      // Round 1: 8 matches
      // Round 2: 4 matches
      // Round 3: 2 matches
      // Round 4: 1 match (final)
      expect(calculateMatchesInRound(16, 1)).toBe(8);
      expect(calculateMatchesInRound(16, 2)).toBe(4);
      expect(calculateMatchesInRound(16, 3)).toBe(2);
      expect(calculateMatchesInRound(16, 4)).toBe(1);
    });

    it("should calculate matches correctly for 32 teams", () => {
      // 32 teams = 5 rounds
      // Round 1: 16 matches
      expect(calculateMatchesInRound(32, 1)).toBe(16);
      expect(calculateMatchesInRound(32, 2)).toBe(8);
      expect(calculateMatchesInRound(32, 3)).toBe(4);
      expect(calculateMatchesInRound(32, 4)).toBe(2);
      expect(calculateMatchesInRound(32, 5)).toBe(1);
    });

    it("should handle odd number of teams", () => {
      // 5 teams = 3 rounds
      // Round 1: 2 matches (1 team gets bye)
      expect(calculateMatchesInRound(5, 1)).toBe(2);
      expect(calculateMatchesInRound(5, 2)).toBe(1);
      expect(calculateMatchesInRound(5, 3)).toBe(0);
    });

    it("should handle 3 teams", () => {
      // 3 teams = 2 rounds
      // Round 1: 1 match (1 team gets bye)
      expect(calculateMatchesInRound(3, 1)).toBe(1);
      expect(calculateMatchesInRound(3, 2)).toBe(0);
    });
  });

  describe("Cup Structure", () => {
    it("should have correct total matches for 8 teams", () => {
      // 8 teams = 7 total matches (4 + 2 + 1)
      let totalMatches = 0;
      const totalRounds = calculateTotalRounds(8);
      for (let i = 1; i <= totalRounds; i++) {
        totalMatches += calculateMatchesInRound(8, i);
      }
      expect(totalMatches).toBe(7);
    });

    it("should have correct total matches for 16 teams", () => {
      // 16 teams = 15 total matches (8 + 4 + 2 + 1)
      let totalMatches = 0;
      const totalRounds = calculateTotalRounds(16);
      for (let i = 1; i <= totalRounds; i++) {
        totalMatches += calculateMatchesInRound(16, i);
      }
      expect(totalMatches).toBe(15);
    });

    it("should have correct total matches for 32 teams", () => {
      // 32 teams = 31 total matches
      let totalMatches = 0;
      const totalRounds = calculateTotalRounds(32);
      for (let i = 1; i <= totalRounds; i++) {
        totalMatches += calculateMatchesInRound(32, i);
      }
      expect(totalMatches).toBe(31);
    });

    it("should follow pattern: total matches = teams - 1 for power of 2", () => {
      const powers = [2, 4, 8, 16, 32, 64];
      powers.forEach((teams) => {
        let totalMatches = 0;
        const totalRounds = calculateTotalRounds(teams);
        for (let i = 1; i <= totalRounds; i++) {
          totalMatches += calculateMatchesInRound(teams, i);
        }
        expect(totalMatches).toBe(teams - 1);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle 2 teams (minimum)", () => {
      expect(calculateTotalRounds(2)).toBe(1);
      expect(calculateMatchesInRound(2, 1)).toBe(1);
    });

    it("should handle power of 2 teams", () => {
      const powers = [2, 4, 8, 16, 32, 64, 128];
      powers.forEach((teams) => {
        const rounds = calculateTotalRounds(teams);
        expect(Math.pow(2, rounds)).toBe(teams);
      });
    });

    it("should handle non-power of 2 teams", () => {
      const nonPowers = [3, 5, 6, 7, 9, 10, 15, 17, 20];
      nonPowers.forEach((teams) => {
        const rounds = calculateTotalRounds(teams);
        expect(Math.pow(2, rounds - 1)).toBeLessThan(teams);
        expect(Math.pow(2, rounds)).toBeGreaterThanOrEqual(teams);
      });
    });
  });
});
