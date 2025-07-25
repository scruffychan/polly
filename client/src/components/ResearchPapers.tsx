import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResearchPaper {
  id: number;
  title: string;
  summary: string;
  source: string;
  type: string;
  url: string;
  year: number;
  credibilityBadge: string;
}

interface ResearchPapersProps {
  papers: ResearchPaper[];
}

export default function ResearchPapers({ papers }: ResearchPapersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!papers || papers.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <i className="fas fa-book-open text-purple-600 mr-3"></i>
            Research & Evidence
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white/60 hover:bg-white/80 p-3 rounded-full transition-all hover:scale-105"
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-purple-600`}></i>
          </button>
        </div>
        {isExpanded && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book-open text-purple-600 text-xl"></i>
            </div>
            <p className="text-gray-600">No research papers available for this question.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <i className="fas fa-book-open text-purple-600 mr-3"></i>
          Research & Evidence
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white/60 hover:bg-white/80 p-3 rounded-full transition-all hover:scale-105"
        >
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-purple-600`}></i>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {papers.map((paper) => (
            <div key={paper.id} className="glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">
                    {paper.title}
                  </h4>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {paper.summary}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="font-medium">{paper.source} • {paper.year}</span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{paper.type}</span>
                    <a 
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors"
                    >
                      Read Full Report →
                    </a>
                  </div>
                </div>
                <div className="ml-6 flex-shrink-0">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    paper.credibilityBadge === "Peer-reviewed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {paper.credibilityBadge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
