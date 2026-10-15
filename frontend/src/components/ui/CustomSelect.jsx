'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect Component
 * 
 * Elegant, accessible dropdown select designed to:
 * 1. ALWAYS open downwards (top-full mt-1.5) without climbing to the top of the viewport.
 * 2. Maintain a capped max-height with sleek scrollable overflow so it never covers the screen.
 * 3. Match the Atelier aesthetic (neutral tones, smooth transitions, font-medium text).
 * 
 * @param {string} value - Current selected value
 * @param {function(string): void} onChange - Callback on selection
 * @param {Array<string | { value: string, label: string, subtitle?: string }>} options - Select options
 * @param {string} placeholder - Placeholder text
 * @param {string} className - Wrapper classes
 * @param {string} buttonClassName - Trigger button classes
 * @param {boolean} disabled - Disabled state
 */
export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  className = '',
  buttonClassName = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isOpen ? 'z-30' : 'z-10'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-[#F6F2EC] text-xs text-[#151515] transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-[#151515] ring-1 ring-[#151515]'
            : 'border-[#E6E1DA] hover:border-[#151515]'
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate text-left font-medium ${!selectedOption && !value ? 'text-[#8E8B85]' : 'text-[#151515]'}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6B6B6B] shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu — Always positioned on bottom side with smooth scrollable overflow */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-[#E6E1DA] rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto py-1 scroll-smooth divide-y divide-[#F6F2EC]/40"
            style={{ scrollbarWidth: 'thin' }}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-xs text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#151515] text-white font-medium hover:bg-[#252525]'
                        : 'text-[#151515] hover:bg-[#F6F2EC]'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className={`truncate ${isSelected ? 'text-white' : 'text-[#151515]'}`}>{opt.label}</span>
                      {opt.subtitle && (
                        <span
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-[#8E8B85]'
                          }`}
                        >
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
