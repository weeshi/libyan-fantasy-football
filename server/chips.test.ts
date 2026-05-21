/**
 * Tests for Chips System
 */

import { describe, it, expect } from "vitest";
import { applyChipMultiplier, CHIP_DEFINITIONS } from "./chips";

describe("Chips System", () => {
  describe("applyChipMultiplier", () => {
    it("should double points for captain chip", () => {
      const basePoints = 10;
      const result = applyChipMultiplier(basePoints, "captain");
      expect(result).toBe(20);
    });

    it("should triple points for triple captain chip", () => {
      const basePoints = 10;
      const result = applyChipMultiplier(basePoints, "triple_captain");
      expect(result).toBe(30);
    });

    it("should not modify points for wildcard chip", () => {
      const basePoints = 10;
      const result = applyChipMultiplier(basePoints, "wildcard");
      expect(result).toBe(10);
    });

    it("should not modify points for bench boost chip", () => {
      const basePoints = 10;
      const result = applyChipMultiplier(basePoints, "bench_boost");
      expect(result).toBe(10);
    });

    it("should not modify points for free hit chip", () => {
      const basePoints = 10;
      const result = applyChipMultiplier(basePoints, "free_hit");
      expect(result).toBe(10);
    });

    it("should handle zero points", () => {
      const basePoints = 0;
      const result = applyChipMultiplier(basePoints, "captain");
      expect(result).toBe(0);
    });

    it("should handle negative points", () => {
      const basePoints = -5;
      const result = applyChipMultiplier(basePoints, "triple_captain");
      expect(result).toBe(-15);
    });

    it("should handle large point values", () => {
      const basePoints = 100;
      const result = applyChipMultiplier(basePoints, "captain");
      expect(result).toBe(200);
    });
  });

  describe("CHIP_DEFINITIONS", () => {
    it("should have all chip types defined", () => {
      const chipTypes = ["captain", "triple_captain", "wildcard", "bench_boost", "free_hit"];
      chipTypes.forEach((type) => {
        expect(CHIP_DEFINITIONS[type as any]).toBeDefined();
      });
    });

    it("should have correct max uses for captain", () => {
      expect(CHIP_DEFINITIONS.captain.maxUsesPerSeason).toBe(38);
    });

    it("should have correct max uses for triple captain", () => {
      expect(CHIP_DEFINITIONS.triple_captain.maxUsesPerSeason).toBe(1);
    });

    it("should have correct max uses for wildcard", () => {
      expect(CHIP_DEFINITIONS.wildcard.maxUsesPerSeason).toBe(2);
    });

    it("should have correct max uses for bench boost", () => {
      expect(CHIP_DEFINITIONS.bench_boost.maxUsesPerSeason).toBe(1);
    });

    it("should have correct max uses for free hit", () => {
      expect(CHIP_DEFINITIONS.free_hit.maxUsesPerSeason).toBe(1);
    });

    it("should have descriptions for all chips", () => {
      Object.values(CHIP_DEFINITIONS).forEach((chip) => {
        expect(chip.description).toBeTruthy();
        expect(chip.description.length).toBeGreaterThan(0);
      });
    });

    it("should have Arabic descriptions", () => {
      Object.values(CHIP_DEFINITIONS).forEach((chip) => {
        expect(/[\u0600-\u06FF]/.test(chip.description)).toBe(true);
      });
    });
  });

  describe("Chip multiplier edge cases", () => {
    it("should handle decimal points", () => {
      const basePoints = 7.5;
      const result = applyChipMultiplier(basePoints, "captain");
      expect(result).toBe(15);
    });

    it("should handle very large numbers", () => {
      const basePoints = 1000000;
      const result = applyChipMultiplier(basePoints, "triple_captain");
      expect(result).toBe(3000000);
    });

    it("should maintain precision for captain", () => {
      const basePoints = 3.33;
      const result = applyChipMultiplier(basePoints, "captain");
      expect(result).toBe(6.66);
    });
  });
});
