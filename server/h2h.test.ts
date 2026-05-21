/**
 * Tests for Head-to-Head Leagues System
 */

import { describe, it, expect } from "vitest";
import { calculateH2HPoints } from "./h2h";

describe("Head-to-Head Leagues System", () => {
  describe("calculateH2HPoints", () => {
    it("should award 3 points to team1 when team1 wins", () => {
      const result = calculateH2HPoints(50, 40);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });

    it("should award 3 points to team2 when team2 wins", () => {
      const result = calculateH2HPoints(40, 50);
      expect(result.team1).toBe(0);
      expect(result.team2).toBe(3);
    });

    it("should award 1 point to each team on draw", () => {
      const result = calculateH2HPoints(45, 45);
      expect(result.team1).toBe(1);
      expect(result.team2).toBe(1);
    });

    it("should handle zero points", () => {
      const result = calculateH2HPoints(0, 0);
      expect(result.team1).toBe(1);
      expect(result.team2).toBe(1);
    });

    it("should handle large point differences", () => {
      const result = calculateH2HPoints(100, 10);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });

    it("should handle very close scores", () => {
      const result = calculateH2HPoints(50, 49);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });

    it("should handle negative points", () => {
      const result = calculateH2HPoints(-5, -10);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });

    it("should handle one team with negative points", () => {
      const result = calculateH2HPoints(10, -5);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });

    it("should handle decimal points", () => {
      const result = calculateH2HPoints(50.5, 50.5);
      expect(result.team1).toBe(1);
      expect(result.team2).toBe(1);
    });

    it("should handle very large numbers", () => {
      const result = calculateH2HPoints(1000000, 999999);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });
  });

  describe("H2H Points Distribution", () => {
    it("should always award 3 total points for win/loss", () => {
      const result = calculateH2HPoints(60, 40);
      expect(result.team1 + result.team2).toBe(3);
    });

    it("should always award 2 total points for draw", () => {
      const result = calculateH2HPoints(50, 50);
      expect(result.team1 + result.team2).toBe(2);
    });

    it("should maintain symmetry in results", () => {
      const result1 = calculateH2HPoints(60, 40);
      const result2 = calculateH2HPoints(40, 60);

      expect(result1.team1).toBe(result2.team2);
      expect(result1.team2).toBe(result2.team1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle identical large numbers", () => {
      const result = calculateH2HPoints(999999, 999999);
      expect(result.team1).toBe(1);
      expect(result.team2).toBe(1);
    });

    it("should handle identical negative numbers", () => {
      const result = calculateH2HPoints(-100, -100);
      expect(result.team1).toBe(1);
      expect(result.team2).toBe(1);
    });

    it("should handle one point difference", () => {
      const result = calculateH2HPoints(51, 50);
      expect(result.team1).toBe(3);
      expect(result.team2).toBe(0);
    });
  });
});
