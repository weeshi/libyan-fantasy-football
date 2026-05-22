/**
 * Chips System Tests
 */

import { describe, it, expect } from "vitest";
import {
  CHIP_CONFIGS,
  getChipPointsMultiplier,
  calculatePointsWithChip,
  canChipBeUsedMultipleTimes,
  getChipInfo,
  getAllChipInfo,
} from "./chips-system";

describe("Chips System", () => {
  // Test 1: Chip configurations
  describe("Chip Configurations", () => {
    it("should have all 4 chip types configured", () => {
      expect(Object.keys(CHIP_CONFIGS)).toHaveLength(4);
      expect(CHIP_CONFIGS).toHaveProperty("TRIPLE_CAPTAIN");
      expect(CHIP_CONFIGS).toHaveProperty("WILDCARD");
      expect(CHIP_CONFIGS).toHaveProperty("BENCH_BOOST");
      expect(CHIP_CONFIGS).toHaveProperty("FREE_HIT");
    });

    it("should have correct chip names in Arabic", () => {
      expect(CHIP_CONFIGS.TRIPLE_CAPTAIN.name).toBe("الكابتن الثلاثي");
      expect(CHIP_CONFIGS.WILDCARD.name).toBe("البطاقة البرية");
      expect(CHIP_CONFIGS.BENCH_BOOST.name).toBe("تعزيز البدلاء");
      expect(CHIP_CONFIGS.FREE_HIT.name).toBe("الضربة الحرة");
    });

    it("should have descriptions for all chips", () => {
      Object.values(CHIP_CONFIGS).forEach((chip) => {
        expect(chip.description).toBeTruthy();
        expect(chip.description.length).toBeGreaterThan(0);
      });
    });

    it("should have effects for all chips", () => {
      Object.values(CHIP_CONFIGS).forEach((chip) => {
        expect(chip.effect).toBeTruthy();
        expect(chip.effect.length).toBeGreaterThan(0);
      });
    });

    it("should have correct uses per season", () => {
      expect(CHIP_CONFIGS.TRIPLE_CAPTAIN.usesPerSeason).toBe(1);
      expect(CHIP_CONFIGS.WILDCARD.usesPerSeason).toBe(2);
      expect(CHIP_CONFIGS.BENCH_BOOST.usesPerSeason).toBe(1);
      expect(CHIP_CONFIGS.FREE_HIT.usesPerSeason).toBe(1);
    });

    it("should have all chips active", () => {
      Object.values(CHIP_CONFIGS).forEach((chip) => {
        expect(chip.isActive).toBe(true);
      });
    });
  });

  // Test 2: Triple Captain multiplier
  describe("Triple Captain Multiplier", () => {
    it("should apply 3x multiplier to captain", () => {
      const multiplier = getChipPointsMultiplier("TRIPLE_CAPTAIN", "captain");
      expect(multiplier).toBe(3);
    });

    it("should apply 1x multiplier to regular players", () => {
      const multiplier = getChipPointsMultiplier("TRIPLE_CAPTAIN", "regular");
      expect(multiplier).toBe(1);
    });

    it("should apply 1x multiplier to bench players", () => {
      const multiplier = getChipPointsMultiplier("TRIPLE_CAPTAIN", "bench");
      expect(multiplier).toBe(1);
    });

    it("should calculate captain points correctly with Triple Captain", () => {
      const basePoints = 10;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(30);
    });

    it("should not affect regular player points", () => {
      const basePoints = 10;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "regular");
      expect(points).toBe(10);
    });

    it("should handle decimal points correctly", () => {
      const basePoints = 7.5;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(23); // 7.5 * 3 = 22.5, rounded to 23
    });

    it("should handle zero points", () => {
      const basePoints = 0;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(0);
    });

    it("should handle negative points", () => {
      const basePoints = -3;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(-9);
    });
  });

  // Test 3: Bench Boost
  describe("Bench Boost", () => {
    it("should have 1x multiplier for all players", () => {
      expect(getChipPointsMultiplier("BENCH_BOOST", "captain")).toBe(1);
      expect(getChipPointsMultiplier("BENCH_BOOST", "regular")).toBe(1);
      expect(getChipPointsMultiplier("BENCH_BOOST", "bench")).toBe(1);
    });

    it("should not change point calculation", () => {
      const basePoints = 15;
      const points = calculatePointsWithChip(basePoints, "BENCH_BOOST", "bench");
      expect(points).toBe(15);
    });

    it("should affect all player types equally", () => {
      const basePoints = 20;
      const captainPoints = calculatePointsWithChip(basePoints, "BENCH_BOOST", "captain");
      const regularPoints = calculatePointsWithChip(basePoints, "BENCH_BOOST", "regular");
      const benchPoints = calculatePointsWithChip(basePoints, "BENCH_BOOST", "bench");

      expect(captainPoints).toBe(regularPoints);
      expect(regularPoints).toBe(benchPoints);
    });
  });

  // Test 4: Wildcard and Free Hit
  describe("Wildcard and Free Hit", () => {
    it("should have 1x multiplier", () => {
      expect(getChipPointsMultiplier("WILDCARD", "captain")).toBe(1);
      expect(getChipPointsMultiplier("FREE_HIT", "captain")).toBe(1);
    });

    it("should not affect point calculation", () => {
      const basePoints = 25;
      expect(calculatePointsWithChip(basePoints, "WILDCARD", "captain")).toBe(25);
      expect(calculatePointsWithChip(basePoints, "FREE_HIT", "regular")).toBe(25);
    });
  });

  // Test 5: No chip
  describe("No Chip", () => {
    it("should return 1x multiplier when no chip is active", () => {
      const multiplier = getChipPointsMultiplier(null, "captain");
      expect(multiplier).toBe(1);
    });

    it("should not affect points when no chip", () => {
      const basePoints = 50;
      const points = calculatePointsWithChip(basePoints, null, "captain");
      expect(points).toBe(50);
    });

    it("should handle all player roles without chip", () => {
      const basePoints = 30;
      expect(calculatePointsWithChip(basePoints, null, "captain")).toBe(30);
      expect(calculatePointsWithChip(basePoints, null, "regular")).toBe(30);
      expect(calculatePointsWithChip(basePoints, null, "bench")).toBe(30);
    });
  });

  // Test 6: Multiple uses per season
  describe("Multiple Uses Per Season", () => {
    it("should identify Wildcard as multi-use chip", () => {
      expect(canChipBeUsedMultipleTimes("WILDCARD")).toBe(true);
    });

    it("should identify other chips as single-use", () => {
      expect(canChipBeUsedMultipleTimes("TRIPLE_CAPTAIN")).toBe(false);
      expect(canChipBeUsedMultipleTimes("BENCH_BOOST")).toBe(false);
      expect(canChipBeUsedMultipleTimes("FREE_HIT")).toBe(false);
    });

    it("should have correct use counts", () => {
      expect(CHIP_CONFIGS.WILDCARD.usesPerSeason).toBe(2);
      expect(CHIP_CONFIGS.TRIPLE_CAPTAIN.usesPerSeason).toBe(1);
      expect(CHIP_CONFIGS.BENCH_BOOST.usesPerSeason).toBe(1);
      expect(CHIP_CONFIGS.FREE_HIT.usesPerSeason).toBe(1);
    });
  });

  // Test 7: Chip info retrieval
  describe("Chip Info Retrieval", () => {
    it("should get chip info by type", () => {
      const info = getChipInfo("TRIPLE_CAPTAIN");
      expect(info.type).toBe("TRIPLE_CAPTAIN");
      expect(info.name).toBe("الكابتن الثلاثي");
    });

    it("should get all chip info", () => {
      const allInfo = getAllChipInfo();
      expect(allInfo).toHaveLength(4);
      expect(allInfo.map((c) => c.type)).toContain("TRIPLE_CAPTAIN");
      expect(allInfo.map((c) => c.type)).toContain("WILDCARD");
      expect(allInfo.map((c) => c.type)).toContain("BENCH_BOOST");
      expect(allInfo.map((c) => c.type)).toContain("FREE_HIT");
    });

    it("should have all required fields in chip info", () => {
      const info = getChipInfo("WILDCARD");
      expect(info).toHaveProperty("type");
      expect(info).toHaveProperty("name");
      expect(info).toHaveProperty("description");
      expect(info).toHaveProperty("effect");
      expect(info).toHaveProperty("usesPerSeason");
      expect(info).toHaveProperty("isActive");
    });
  });

  // Test 8: Point calculations with different values
  describe("Point Calculations with Different Values", () => {
    it("should handle large point values", () => {
      const basePoints = 100;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(300);
    });

    it("should handle small point values", () => {
      const basePoints = 1;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(3);
    });

    it("should handle fractional points", () => {
      const basePoints = 2.5;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(8); // 2.5 * 3 = 7.5, rounded to 8
    });

    it("should round correctly", () => {
      const basePoints = 3.3;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(10); // 3.3 * 3 = 9.9, rounded to 10
    });

    it("should round down for .4", () => {
      const basePoints = 3.1;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(9); // 3.1 * 3 = 9.3, rounded to 9
    });

    it("should round up for .5", () => {
      const basePoints = 3.5;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(11); // 3.5 * 3 = 10.5, rounded to 11
    });
  });

  // Test 9: Chip effects on different player types
  describe("Chip Effects on Different Player Types", () => {
    const testCases = [
      { role: "captain" as const, basePoints: 20, chipType: "TRIPLE_CAPTAIN" as const, expected: 60 },
      { role: "regular" as const, basePoints: 15, chipType: "TRIPLE_CAPTAIN" as const, expected: 15 },
      { role: "bench" as const, basePoints: 10, chipType: "TRIPLE_CAPTAIN" as const, expected: 10 },
      { role: "captain" as const, basePoints: 20, chipType: "BENCH_BOOST" as const, expected: 20 },
      { role: "bench" as const, basePoints: 10, chipType: "BENCH_BOOST" as const, expected: 10 },
    ];

    testCases.forEach(({ role, basePoints, chipType, expected }) => {
      it(`should calculate ${chipType} for ${role} with ${basePoints} base points`, () => {
        const points = calculatePointsWithChip(basePoints, chipType, role);
        expect(points).toBe(expected);
      });
    });
  });

  // Test 10: Chip combinations (what shouldn't happen)
  describe("Chip Combinations", () => {
    it("should not combine Triple Captain with Bench Boost", () => {
      // Only one chip can be active at a time
      const captainPoints = calculatePointsWithChip(10, "TRIPLE_CAPTAIN", "captain");
      const benchPoints = calculatePointsWithChip(10, "BENCH_BOOST", "bench");

      // They should not multiply each other
      expect(captainPoints).toBe(30);
      expect(benchPoints).toBe(10);
    });

    it("should handle switching chips", () => {
      // First chip
      const firstChip = calculatePointsWithChip(10, "TRIPLE_CAPTAIN", "captain");
      expect(firstChip).toBe(30);

      // Switch to different chip
      const secondChip = calculatePointsWithChip(10, "BENCH_BOOST", "captain");
      expect(secondChip).toBe(10);
    });
  });

  // Test 11: Edge cases
  describe("Edge Cases", () => {
    it("should handle very large multipliers", () => {
      const basePoints = 1000;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(3000);
    });

    it("should handle zero multiplier effect", () => {
      const basePoints = 0;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(0);
    });

    it("should handle negative multiplier effect", () => {
      const basePoints = -5;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(-15);
    });

    it("should handle very small decimal values", () => {
      const basePoints = 0.1;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(0); // 0.1 * 3 = 0.3, rounded to 0
    });

    it("should handle NaN gracefully", () => {
      const basePoints = NaN;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(isNaN(points)).toBe(true);
    });

    it("should handle Infinity", () => {
      const basePoints = Infinity;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(Infinity);
    });
  });

  // Test 12: Chip descriptions and names
  describe("Chip Descriptions and Names", () => {
    it("should have meaningful descriptions", () => {
      const descriptions = Object.values(CHIP_CONFIGS).map((c) => c.description);
      descriptions.forEach((desc) => {
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(5);
      });
    });

    it("should have descriptions in Arabic", () => {
      const descriptions = Object.values(CHIP_CONFIGS).map((c) => c.description);
      descriptions.forEach((desc) => {
        // Check for Arabic characters
        expect(/[\u0600-\u06FF]/.test(desc)).toBe(true);
      });
    });

    it("should have names in Arabic", () => {
      const names = Object.values(CHIP_CONFIGS).map((c) => c.name);
      names.forEach((name) => {
        // Check for Arabic characters
        expect(/[\u0600-\u06FF]/.test(name)).toBe(true);
      });
    });
  });

  // Test 13: Real-world scenarios
  describe("Real-World Scenarios", () => {
    it("should handle captain scoring 20 points with Triple Captain", () => {
      const basePoints = 20;
      const points = calculatePointsWithChip(basePoints, "TRIPLE_CAPTAIN", "captain");
      expect(points).toBe(60);
    });

    it("should handle bench player with Bench Boost", () => {
      const basePoints = 8;
      const points = calculatePointsWithChip(basePoints, "BENCH_BOOST", "bench");
      expect(points).toBe(8); // Bench Boost doesn't change points, just includes them
    });

    it("should handle multiple players with same chip", () => {
      const captain = calculatePointsWithChip(20, "TRIPLE_CAPTAIN", "captain");
      const regular = calculatePointsWithChip(15, "TRIPLE_CAPTAIN", "regular");
      const bench = calculatePointsWithChip(10, "TRIPLE_CAPTAIN", "bench");

      expect(captain).toBe(60);
      expect(regular).toBe(15);
      expect(bench).toBe(10);

      const total = captain + regular + bench;
      expect(total).toBe(85);
    });

    it("should handle gameweek with no chip active", () => {
      const captain = calculatePointsWithChip(20, null, "captain");
      const regular = calculatePointsWithChip(15, null, "regular");
      const bench = calculatePointsWithChip(10, null, "bench");

      expect(captain).toBe(20);
      expect(regular).toBe(15);
      expect(bench).toBe(10);

      const total = captain + regular + bench;
      expect(total).toBe(45);
    });

    it("should show chip impact on total score", () => {
      const withoutChip = 20 + 15 + 10; // 45
      const withTripleCaptain = 60 + 15 + 10; // 85
      const impact = withTripleCaptain - withoutChip;

      expect(impact).toBe(40);
    });
  });

  // Test 14: Chip type validation
  describe("Chip Type Validation", () => {
    it("should have valid chip types", () => {
      const validTypes = ["TRIPLE_CAPTAIN", "WILDCARD", "BENCH_BOOST", "FREE_HIT"];
      Object.keys(CHIP_CONFIGS).forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it("should not have duplicate chip types", () => {
      const types = Object.keys(CHIP_CONFIGS);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });
  });

  // Test 15: Chip effect strings
  describe("Chip Effect Strings", () => {
    it("should have meaningful effect descriptions", () => {
      const effects = Object.values(CHIP_CONFIGS).map((c) => c.effect);
      effects.forEach((effect) => {
        expect(effect).toBeTruthy();
        expect(effect.length).toBeGreaterThan(0);
      });
    });

    it("should have unique effects", () => {
      const effects = Object.values(CHIP_CONFIGS).map((c) => c.effect);
      const uniqueEffects = new Set(effects);
      expect(effects.length).toBe(uniqueEffects.size);
    });
  });
});
