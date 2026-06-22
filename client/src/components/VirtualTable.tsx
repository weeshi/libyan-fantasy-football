/**
 * Virtual Table Component
 * Optimized table rendering for large datasets using virtual scrolling
 */

import React, { useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface VirtualTableProps<T> {
  items: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  itemHeight?: number;
  visibleRows?: number;
  onScroll?: (startIndex: number, endIndex: number) => void;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
}

/**
 * Virtual Table Component
 * Renders only visible rows to optimize performance with large datasets
 */
export const VirtualTable = React.memo(function VirtualTableComponent<T extends Record<string, any>>({
  items,
  columns,
  itemHeight = 48,
  visibleRows = 10,
  onScroll,
  className,
  rowClassName,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight));
    const end = Math.min(items.length, start + visibleRows + 1);
    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
    };
  }, [scrollTop, itemHeight, visibleRows, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);
      onScroll?.(startIndex, endIndex);
    },
    [startIndex, endIndex, onScroll]
  );

  const totalHeight = items.length * itemHeight;

  return (
    <div
      className={cn('overflow-y-auto border rounded-lg', className)}
      style={{ height: visibleRows * itemHeight }}
      onScroll={handleScroll}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  'text-right' === column.align && 'text-right',
                  'center' === column.align && 'text-center',
                  'left' === column.align && 'text-left'
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Spacer for scrolled items */}
          {startIndex > 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ height: offsetY }} className="p-0" />
            </TableRow>
          )}

          {/* Visible items */}
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <TableRow
                key={actualIndex}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  rowClassName?.(item, actualIndex)
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${actualIndex}-${column.key}`}
                    style={{ width: column.width }}
                    className={cn(
                      'text-right' === column.align && 'text-right',
                      'center' === column.align && 'text-center',
                      'left' === column.align && 'text-left'
                    )}
                  >
                    {column.render ? column.render(item, actualIndex) : String(item[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* Spacer for remaining items */}
          {endIndex < items.length && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                style={{ height: (items.length - endIndex) * itemHeight }}
                className="p-0"
              />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

VirtualTable.displayName = 'VirtualTable';
