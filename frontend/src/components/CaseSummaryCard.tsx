import { ICaseSummary } from "@/models/CaseSummary";
import { FileText, ThumbsUp, Eye, Tag } from "lucide-react";
import Link from "next/link";

interface CaseSummaryCardProps {
  summary: ICaseSummary & {
    author: {
      name: string;
      email: string;
    };
  };
}

export default function CaseSummaryCard({ summary }: CaseSummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-modern overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {summary.title}
          </h3>
          {summary.pdfUrl && (
            <a
              href={summary.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <FileText className="h-5 w-5" />
            </a>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {summary.content}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {summary.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              {summary.likes}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {summary.views}
            </div>
          </div>

          <Link
            href={`/case/${summary.caseId}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-primary rounded-lg shadow-modern hover:shadow-modern-hover transition-all duration-200"
          >
            View Case
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By {summary.author.name} •{" "}
            {new Date(summary.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
