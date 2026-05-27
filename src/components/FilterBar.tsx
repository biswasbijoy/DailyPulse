'use client';

import { useState } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface FilterValues {
  search: string;
  priority: string;
  status: string;
  category: string;
  dateFrom: string;
  dateTo: string;
}

interface FilterBarProps {
  onFilter: (filters: FilterValues) => void;
  showDateFilter?: boolean;
}

export function FilterBar({ onFilter, showDateFilter }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleApply = () => {
    onFilter({ search, priority, status, category, dateFrom, dateTo });
  };

  const handleClear = () => {
    setSearch('');
    setPriority('');
    setStatus('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    onFilter({ search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '' });
  };

  const hasFilters = search || priority || status || category || dateFrom || dateTo;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Search tasks..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          <Filter className="w-4 h-4 mr-1" />
          Filters
          {hasFilters && <span className="ml-1 w-2 h-2 rounded-full bg-blue-500" />}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {open && (
        <div className="flex flex-wrap gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work"
              className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {showDateFilter && (
            <>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <Button variant="gradient" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
