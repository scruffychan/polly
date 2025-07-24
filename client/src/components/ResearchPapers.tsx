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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!papers || papers.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text flex items-center">
            <i className="fas fa-book-open text-primary mr-2"></i>
            Research & Evidence
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-blue-600"
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {papers.map((paper) => (
              <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-text mb-2">
                      {paper.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {paper.summary}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{paper.source} • {paper.year}</span>
                      <span>{paper.type}</span>
                      <a 
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Read Full Report
                      </a>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
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
      </CardContent>
    </Card>
  );
}
