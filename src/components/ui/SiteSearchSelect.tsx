'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { Site } from '@/lib/sites-service';

export interface SiteSearchSelectProps {
  /** Full list of sites (unsorted – this component sorts them internally) */
  sites: Site[];
  /** Currently selected site_id, or '' / 'all' for "All Sites" */
  value: string;
  /** Called with the selected site_id, or 'all' */
  onValueChange: (value: string) => void;
  /** Whether to include an "All Sites" option (default true) */
  includeAll?: boolean;
  /** Label for the "all" option (default "All Sites") */
  allLabel?: string;
  /** Placeholder shown when nothing is selected */
  placeholder?: string;
  /** Extra className for the trigger button */
  className?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * A searchable site-name dropdown.
 * - Sorts sites alphabetically by site_name.
 * - Filters the list as the user types.
 * - Fully keyboard-accessible (Escape to close, Enter/Space to open).
 */
export const SiteSearchSelect: React.FC<SiteSearchSelectProps> = ({
  sites,
  value,
  onValueChange,
  includeAll = true,
  allLabel = 'All Sites',
  placeholder = 'Select site',
  className = '',
  disabled = false,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sort sites alphabetically
  const sortedSites = [...sites].sort((a, b) =>
    a.site_name.localeCompare(b.site_name, undefined, { sensitivity: 'base' })
  );

  // Filter by search term
  const filtered = sortedSites.filter((s) =>
    s.site_name.toLowerCase().includes(search.toLowerCase())
  );

  // Resolve display label for the current value
  const displayLabel = (() => {
    if (!value || value === 'all') return includeAll ? allLabel : '';
    const found = sites.find((s) => s.site_id === value);
    return found ? found.site_name : '';
  })();

  const handleSelect = (siteId: string) => {
    onValueChange(siteId);
    setOpen(false);
    setSearch('');
  };

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // Auto-focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && setOpen((prev) => !prev);
          }
          if (e.key === 'Escape') setOpen(false);
        }}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={displayLabel ? 'text-foreground' : 'text-muted-foreground'}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          {/* Search input */}
          <div className="flex items-center border-b border-border px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search site..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                  setSearch('');
                }
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {includeAll && (
              <li
                role="option"
                aria-selected={!value || value === 'all'}
                onClick={() => handleSelect('all')}
                className={`cursor-pointer select-none px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  (!value || value === 'all') ? 'bg-accent text-accent-foreground font-medium' : ''
                }`}
              >
                {allLabel}
              </li>
            )}

            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No sites found
              </li>
            )}

            {filtered.map((site) => (
              <li
                key={site.site_id}
                role="option"
                aria-selected={value === site.site_id}
                onClick={() => handleSelect(site.site_id)}
                className={`cursor-pointer select-none px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  value === site.site_id ? 'bg-accent text-accent-foreground font-medium' : ''
                }`}
              >
                {site.site_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SiteSearchSelect;
