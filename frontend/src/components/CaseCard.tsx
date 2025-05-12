"use client";

import { LegalCase } from "@/utils/mockData";
import Link from "next/link";
import { Bookmark, ExternalLink } from "lucide-react";

interface CaseCardProps {
  case: LegalCase;
}

export default function CaseCard({ case: legalCase }: CaseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {legalCase.title}
          </h3>
          <button className="text-gray-400 hover:text-emerald-600">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{legalCase.summary}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {legalCase.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {legalCase.jurisdiction}
            </span>
            <span className="text-sm text-gray-500">{legalCase.year}</span>
            <span
              className={`text-sm font-medium ${
                legalCase.outcome === "favorable"
                  ? "text-green-600"
                  : legalCase.outcome === "unfavorable"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {legalCase.outcome.charAt(0).toUpperCase() +
                legalCase.outcome.slice(1)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-600">
              {legalCase.predictionScore}% match
            </span>
            <Link
              href={`/case/${legalCase.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-primary rounded-lg shadow-modern hover:shadow-modern-hover transition-all duration-200"
            >
              View Details
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
