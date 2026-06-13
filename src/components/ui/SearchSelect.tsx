'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchSelectOption {
  value: string;
  label: string;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  sortAlphabetically?: boolean;
}

/**
 * A reusable, searchable dropdown component.
 * - Filters options based on search query.
 * - Sorts options alphabetically if specified.
 * - Fully keyboard-accessible (Escape to close, Enter/Space to open).
 */
export const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  noResultsLabel = 'No options found',
  className = '',
  disabled = false,
  id,
  sortAlphabetically = true,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Process and sort options
  const processedOptions = (() => {
    let list = [...options];
    if (sortAlphabetically) {
      list.sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
      );
    }
    return list;
  })();

  // Filter options based on search
  const filtered = processedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Find label for active value
  const activeOption = options.find((opt) => opt.value === value);
  const displayLabel = activeOption ? activeOption.label : '';

  const handleSelect = (val: string) => {
    onValueChange(val);
    setOpen(false);
    setSearch('');
  };

  // Close when clicking outside
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

  // Focus search input when open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
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
        <span className={displayLabel ? 'text-foreground truncate' : 'text-muted-foreground truncate'}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-72 flex flex-col bg-white">
          {/* Search Header */}
          <div className="flex items-center border-b border-border px-3 py-2 gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground border-none focus:ring-0 focus:outline-none"
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

          {/* Options List */}
          <ul
            role="listbox"
            className="overflow-y-auto py-1 max-h-56 flex-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                {noResultsLabel}
              </li>
            )}

            {filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`cursor-pointer select-none px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  value === opt.value ? 'bg-accent text-accent-foreground font-medium' : ''
                }`}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchSelect;
