import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import DailyQuestion from "@/components/DailyQuestion";
import ResearchPapers from "@/components/ResearchPapers";
import PublicChat from "@/components/PublicChat";
import GetInvolvedSection from "@/components/GetInvolvedSection";

export default function Home() {
  const { data: activeQuestion, isLoading } = useQuery({
    queryKey: ["/api/questions/active"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-lg h-64"></div>
            <div className="bg-white rounded-lg h-48"></div>
            <div className="bg-white rounded-lg h-96"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-clock text-gray-400 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-text mb-4">
              No Active Question
            </h2>
            <p className="text-gray-600">
              Check back soon for today's question, or explore previous discussions in the history section.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DailyQuestion question={activeQuestion} />
        
        <PublicChat questionId={activeQuestion.id} />
        
        {activeQuestion.researchPapers && activeQuestion.researchPapers.length > 0 && (
          <ResearchPapers papers={activeQuestion.researchPapers} />
        )}
        
        {activeQuestion.actionItems && activeQuestion.actionItems.length > 0 && (
          <GetInvolvedSection actionItems={activeQuestion.actionItems} />
        )}
      </main>
    </div>
  );
}
