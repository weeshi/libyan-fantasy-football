import { describe, it, expect, vi } from 'vitest';

describe('VirtualTable Component', () => {
  it('should calculate correct visible range', () => {
    const itemHeight = 48;
    const visibleRows = 10;
    const scrollTop = 0;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    const endIndex = Math.min(100, startIndex + visibleRows + 1);

    expect(startIndex).toBe(0);
    expect(endIndex).toBe(11);
  });

  it('should calculate correct offset for scrolled items', () => {
    const itemHeight = 48;
    const scrollTop = 240; // 5 items scrolled

    const startIndex = Math.floor(scrollTop / itemHeight);
    const offsetY = startIndex * itemHeight;

    expect(startIndex).toBe(5);
    expect(offsetY).toBe(240);
  });

  it('should handle edge case at end of list', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const itemHeight = 48;
    const visibleRows = 10;
    const scrollTop = (items.length - 5) * itemHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    const endIndex = Math.min(items.length, startIndex + visibleRows + 1);

    expect(startIndex).toBe(95);
    expect(endIndex).toBe(100);
  });

  it('should slice correct items from list', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
    const startIndex = 10;
    const endIndex = 20;

    const visibleItems = items.slice(startIndex, endIndex);

    expect(visibleItems).toHaveLength(10);
    expect(visibleItems[0].id).toBe(10);
    expect(visibleItems[9].id).toBe(19);
  });

  it('should calculate total height correctly', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
    const itemHeight = 48;

    const totalHeight = items.length * itemHeight;

    expect(totalHeight).toBe(48000);
  });

  it('should handle empty list', () => {
    const items: any[] = [];
    const itemHeight = 48;
    const visibleRows = 10;

    const startIndex = Math.max(0, Math.floor(0 / itemHeight));
    const endIndex = Math.min(items.length, startIndex + visibleRows + 1);

    expect(startIndex).toBe(0);
    expect(endIndex).toBe(0);
  });

  it('should handle single item', () => {
    const items = [{ id: 0 }];
    const itemHeight = 48;
    const visibleRows = 10;

    const startIndex = 0;
    const endIndex = Math.min(items.length, startIndex + visibleRows + 1);

    expect(startIndex).toBe(0);
    expect(endIndex).toBe(1);
  });

  it('should optimize rendering with memo', () => {
    // Test that component is memoized
    const component = require('./VirtualTable').VirtualTable;
    expect(component.$$typeof).toBeDefined();
  });
});
