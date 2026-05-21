/**
 * Tests for Transfer Deadline System
 */

import { describe, it, expect } from "vitest";
import {
  calculateDefaultTransferDeadline,
  formatTimeRemaining,
  calculateTransferHit,
} from "./transfers";

describe("Transfer Deadline System", () => {
  describe("calculateDefaultTransferDeadline", () => {
    it("should calculate deadline 1 hour before gameweek start", () => {
      const gameweekStart = new Date("2026-05-22T20:00:00Z");
      const deadline = calculateDefaultTransferDeadline(gameweekStart);

      expect(deadline.getHours()).toBe(gameweekStart.getHours() - 1);
      expect(deadline.getMinutes()).toBe(gameweekStart.getMinutes());
    });

    it("should handle hour boundary correctly", () => {
      const gameweekStart = new Date("2026-05-22T00:30:00Z");
      const deadline = calculateDefaultTransferDeadline(gameweekStart);

      // Should be previous day 23:30
      expect(deadline.getDate()).toBe(gameweekStart.getDate() - 1);
      expect(deadline.getHours()).toBe(23);
      expect(deadline.getMinutes()).toBe(30);
    });
  });

  describe("formatTimeRemaining", () => {
    it("should format time remaining in seconds", () => {
      const milliseconds = 45 * 1000; // 45 seconds
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("45");
      expect(formatted).toContain("ثانية");
    });

    it("should format time remaining in minutes and seconds", () => {
      const milliseconds = (5 * 60 + 30) * 1000; // 5 minutes 30 seconds
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("5");
      expect(formatted).toContain("دقيقة");
    });

    it("should format time remaining in hours and minutes", () => {
      const milliseconds = (2 * 60 * 60 + 30 * 60) * 1000; // 2 hours 30 minutes
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("2");
      expect(formatted).toContain("ساعة");
      expect(formatted).toContain("30");
      expect(formatted).toContain("دقيقة");
    });

    it("should format time remaining in days and hours", () => {
      const milliseconds = (3 * 24 * 60 * 60 + 5 * 60 * 60) * 1000; // 3 days 5 hours
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("3");
      expect(formatted).toContain("يوم");
      expect(formatted).toContain("5");
      expect(formatted).toContain("ساعة");
    });

    it("should handle zero or negative time", () => {
      const formatted = formatTimeRemaining(0);
      expect(formatted).toContain("انتهى");

      const negativeFormatted = formatTimeRemaining(-1000);
      expect(negativeFormatted).toContain("انتهى");
    });

    it("should handle exactly 1 minute", () => {
      const milliseconds = 60 * 1000; // 1 minute
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("1");
      expect(formatted).toContain("دقيقة");
    });

    it("should handle exactly 1 hour", () => {
      const milliseconds = 60 * 60 * 1000; // 1 hour
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("1");
      expect(formatted).toContain("ساعة");
    });

    it("should handle exactly 1 day", () => {
      const milliseconds = 24 * 60 * 60 * 1000; // 1 day
      const formatted = formatTimeRemaining(milliseconds);

      expect(formatted).toContain("1");
      expect(formatted).toContain("يوم");
    });
  });

  describe("calculateTransferHit", () => {
    it("should not deduct points for first transfer", () => {
      const hit = calculateTransferHit(1);
      expect(hit).toBe(0);
    });

    it("should not deduct points for zero transfers", () => {
      const hit = calculateTransferHit(0);
      expect(hit).toBe(0);
    });

    it("should deduct 4 points for second transfer", () => {
      const hit = calculateTransferHit(2);
      expect(hit).toBe(4);
    });

    it("should deduct 8 points for third transfer", () => {
      const hit = calculateTransferHit(3);
      expect(hit).toBe(8);
    });

    it("should deduct 12 points for fourth transfer", () => {
      const hit = calculateTransferHit(4);
      expect(hit).toBe(12);
    });

    it("should deduct 20 points for sixth transfer", () => {
      const hit = calculateTransferHit(6);
      expect(hit).toBe(20);
    });

    it("should handle large number of transfers", () => {
      const hit = calculateTransferHit(10);
      expect(hit).toBe((10 - 1) * 4); // 36 points
    });
  });
});
