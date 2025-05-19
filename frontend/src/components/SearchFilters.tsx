"use client";

import { useState, useEffect } from "react";

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  horizontal?: boolean;
  reset?: boolean;
}

export interface SearchFilters {
  year: string;
  caseType: string;
  summarization: string;
}

// Enhanced case types with more impact
const enhancedCaseTypes = [
  "Environmental Justice",
  "Corporate Liability",
  "Human Rights",
  "Constitutional Law",
  "International Law",
  "Criminal Appeals",
  "Regulatory Compliance",
  "Civil Rights",
  "Intellectual Property",
  "Class Action",
];

// Summarization options
const summarizationOptions = [
  "None",
  "Brief Summary",
  "Detailed Summary",
  "Key Points Only",
  "Legal Analysis"
];

export default function SearchFilters({
  onFilterChange,
  horizontal,
  reset,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    year: "",
    caseType: "",
    summarization: "",
  });

  useEffect(() => {
    if (reset) {
      setFilters({
        year: "",
        caseType: "",
        summarization: "",
      });
      onFilterChange({
        year: "",
        caseType: "",
        summarization: "",
      });
    }
  }, [reset]);

  const handleChange = (name: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div
      className={
        horizontal
          ? "flex flex-row flex-wrap gap-x-4 gap-y-2 items-end w-full"
          : "space-y-4"
      }
    >
      <div className={horizontal ? "w-40" : ""}>
        <label className="block text-sm font-medium text-white mb-1">
          Year
        </label>
        <select
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-[#CD9A3C]/30 bg-black/70 text-gray-200 focus:outline-none focus:ring-[#E3B448] focus:border-[#E3B448] rounded-md"
        >
          <option value="">All Years</option>
          {Array.from(
            { length: 10 },
            (_, i) => new Date().getFullYear() - i
          ).map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className={horizontal ? "w-64" : ""}>
        <label className="block text-sm font-medium text-white mb-1">
          Case Type
        </label>
        <select
          value={filters.caseType}
          onChange={(e) => handleChange("caseType", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-[#CD9A3C]/30 bg-black/70 text-gray-200 focus:outline-none focus:ring-[#E3B448] focus:border-[#E3B448] rounded-md"
        >
          <option value="">All Case Types</option>
          {enhancedCaseTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className={horizontal ? "w-64" : ""}>
        <label className="block text-sm font-medium text-white mb-1">
          Summarization
        </label>
        <select
          value={filters.summarization}
          onChange={(e) => handleChange("summarization", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-[#CD9A3C]/30 bg-black/70 text-gray-200 focus:outline-none focus:ring-[#E3B448] focus:border-[#E3B448] rounded-md"
        >
          <option value="">No Summarization</option>
          {summarizationOptions.filter(option => option !== "None").map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
