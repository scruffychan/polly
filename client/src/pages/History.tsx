import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

interface HistoryQuestion {
  id: number;
  text: string;
  options: string[];
  endDate: string;
  voteStats?: { option: string; count: number }[];
  totalVotes: number;
}

export default function History() {
  const { data: questions, isLoading } = useQuery<HistoryQuestion[]>({
    queryKey: ["/api/questions/history"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Question History</h1>
          <p className="text-gray-600">
            Explore past questions and their results from our community discussions.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !questions || questions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-history text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">No History Available</h3>
              <p className="text-gray-600">
                No previous questions found. Check back after participating in some discussions!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {questions.map((question: any) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Completed
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(question.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-medium text-text mb-4 leading-relaxed">
                    {question.text}
                  </h3>
                  
                  {question.voteStats && question.voteStats.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700 mb-2">Results:</h4>
                      {question.options.map((option: string, index: number) => {
                        const stat = question.voteStats.find((s: any) => s.option === option);
                        const count = stat?.count || 0;
                        const percentage = question.totalVotes > 0 
                          ? ((count / question.totalVotes) * 100).toFixed(1)
                          : '0';
                        
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-text">{option}</span>
                                <span className="text-sm text-gray-600">{percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-sm text-gray-500 mt-3">
                        Total votes: {question.totalVotes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
