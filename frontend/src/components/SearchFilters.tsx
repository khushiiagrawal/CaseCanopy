"use client";

import { useState, useEffect } from "react";
import { jurisdictions, caseTypes, tags } from "@/utils/mockData";

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  horizontal?: boolean;
  reset?: boolean;
}

export interface SearchFilters {
  jurisdiction: string;
  year: string;
  caseType: string;
  outcome: string;
  tags: string[];
}

export default function SearchFilters({
  onFilterChange,
  horizontal,
  reset,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    jurisdiction: "",
    year: "",
    caseType: "",
    outcome: "",
    tags: [],
  });

  useEffect(() => {
    if (reset) {
      setFilters({
        jurisdiction: "",
        year: "",
        caseType: "",
        outcome: "",
        tags: [],
      });
      onFilterChange({
        jurisdiction: "",
        year: "",
        caseType: "",
        outcome: "",
        tags: [],
      });
    }
  }, [reset]);

  const handleChange = (
    name: keyof SearchFilters,
    value: string | string[]
  ) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    handleChange("tags", newTags);
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
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Jurisdiction
        </label>
        <select
          value={filters.jurisdiction}
          onChange={(e) => handleChange("jurisdiction", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">All Jurisdictions</option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction} value={jurisdiction}>
              {jurisdiction}
            </option>
          ))}
        </select>
      </div>
      <div className={horizontal ? "w-28" : ""}>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Year
        </label>
        <select
          value={filters.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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
      <div className={horizontal ? "w-40" : ""}>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Case Type
        </label>
        <select
          value={filters.caseType}
          onChange={(e) => handleChange("caseType", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">All Case Types</option>
          {caseTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className={horizontal ? "w-40" : ""}>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Outcome
        </label>
        <select
          value={filters.outcome}
          onChange={(e) => handleChange("outcome", e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
        >
          <option value="">All Outcomes</option>
          <option value="favorable">Favorable</option>
          <option value="unfavorable">Unfavorable</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <div className={horizontal ? "flex-1 min-w-[120px]" : ""}>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Tags
        </label>
        <div
          className={
            horizontal ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"
          }
        >
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filters.tags.includes(tag)
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
