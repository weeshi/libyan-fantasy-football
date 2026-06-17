import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: Array<{ label: string; value: string }>;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  onAddClick: () => void;
  addButtonLabel?: string;
}

export function SearchFilterBar({
  searchPlaceholder = 'ابحث...',
  searchValue,
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
  onAddClick,
  addButtonLabel = 'إضافة جديد'
}: SearchFilterBarProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>

      {filterOptions && onFilterChange && (
        <Select value={filterValue || 'all'} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button onClick={onAddClick}>
        <Plus className="w-4 h-4 ml-2" />
        {addButtonLabel}
      </Button>
    </div>
  );
}
