'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

/**
 * Reusable searchable dropdown selector
 * @param {Array<{value: string, label: string, subtitle?: string}>} options
 * @param {string} value - Selected value
 * @param {function(string): void} onChange - Callback when selected
 * @param {string} placeholder - Displayed when nothing selected
 * @param {string} searchPlaceholder - Placeholder for the search input
 * @param {boolean} allowClear - Show clear button if a value is selected
 * @param {string} className - Extra classes for the trigger
 */
export function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  allowClear = true,
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close and reset when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      if (prev) setSearchTerm('');
      return !prev;
    });
  };

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase();
    const labelMatch = opt.label?.toLowerCase().includes(term);
    const subMatch = opt.subtitle?.toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-[#E6E1DA] bg-white text-xs text-[#151515] transition-all duration-150 hover:border-[#151515] focus:outline-none focus:ring-1 focus:ring-[#151515] disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'ring-1 ring-[#151515] border-[#151515]' : ''
        } ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate text-left font-medium ${!selectedOption ? 'text-[#8E8B85]' : 'text-[#151515]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {allowClear && selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClear(e);
              }}
              className="p-0.5 rounded-full hover:bg-[#F6F2EC] text-[#8E8B85] hover:text-[#151515] transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#8E8B85] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E6E1DA] rounded-xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          {/* Search Bar inside Dropdown */}
          <div className="p-2 border-b border-[#E6E1DA] bg-[#FBF9F5]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8B85] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E6E1DA] rounded-lg text-xs text-[#151515] placeholder:text-[#8E8B85] focus:outline-none focus:border-[#151515]"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-[#F6F2EC]/60">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between hover:bg-[#F6F2EC] ${
                  !value ? 'bg-[#F6F2EC] font-semibold text-[#151515]' : 'text-[#6B6B6B]'
                }`}
              >
                <span>{placeholder}</span>
                {!value && <Check className="w-3.5 h-3.5 text-[#151515]" />}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#8E8B85]">
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors flex items-center justify-between hover:bg-[#F6F2EC] ${
                      isSelected
                        ? 'bg-[#F6F2EC] font-semibold text-[#151515]'
                        : 'text-[#151515]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span className="text-[10px] text-[#8E8B85] truncate font-normal">
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#151515] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
