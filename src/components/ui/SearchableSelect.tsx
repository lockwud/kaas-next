"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Search, ChevronLeft, ChevronRight, X } from "lucide-react";

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  enableSearch?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  error,
  enableSearch = true,
  enablePagination = true,
  pageSize = 10,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPageState, setCurrentPageState] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search query - use useMemo to avoid cascading renders
  const filteredOptions = useMemo(() => {
    if (!enableSearch) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, enableSearch]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredOptions.length / pageSize);
  }, [filteredOptions.length, pageSize]);

  // Paginate filtered options
  const paginatedOptions = useMemo(() => {
    if (!enablePagination) return filteredOptions;
    return filteredOptions.slice(
      (currentPageState - 1) * pageSize,
      currentPageState * pageSize
    );
  }, [filteredOptions, currentPageState, pageSize, enablePagination]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPageState(newPage);
    }
  };

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={label || placeholder}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <span className={selectedOption ? "text-slate-900" : "text-slate-400"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
            {/* Search input */}
            {enableSearch && (
              <div className="border-b border-slate-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPageState(1);
                    }}
                    placeholder={searchPlaceholder}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {/* Options list - no scroll, pagination controls navigation */}
            <div className="py-1">
              {paginatedOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No options found
                </div>
              ) : (
                paginatedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-all ${
                      option.value === value
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>

            {/* Pagination */}
            {enablePagination && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 bg-slate-50 rounded-b-xl">
                <span className="text-xs font-medium text-slate-500">
                  {currentPageState} / {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(currentPageState - 1);
                    }}
                    disabled={currentPageState === 1}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePageChange(currentPageState + 1);
                    }}
                    disabled={currentPageState === totalPages}
                    className="flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
};
