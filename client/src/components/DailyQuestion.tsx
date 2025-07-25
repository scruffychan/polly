import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface DailyQuestionProps {
  question: {
    id: number;
    text: string;
    options: string[];
    endDate: string;
    totalVotes: number;
    voteStats?: { option: string; count: number }[];
  };
}

export default function DailyQuestion({ question }: DailyQuestionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const { data: voteCheck } = useQuery({
    queryKey: ["/api/votes/check", question.id],
    enabled: !!user,
  });

  const hasVoted = voteCheck?.hasVoted;
  const isExpired = new Date() > new Date(question.endDate);

  const voteMutation = useMutation({
    mutationFn: async (data: { questionId: number; selectedOption: string }) => {
      await apiRequest("POST", "/api/votes", data);
    },
    onSuccess: () => {
      toast({
        title: "Vote submitted successfully!",
        description: "Thank you for participating in today's discussion."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/votes/check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/active"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit vote",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmitVote = () => {
    if (!selectedOption) {
      toast({
        title: "Please select an option",
        description: "You must select an answer before submitting your vote.",
        variant: "destructive"
      });
      return;
    }

    voteMutation.mutate({
      questionId: question.id,
      selectedOption
    });
  };

  const getTimeLeft = () => {
    const endTime = new Date(question.endDate);
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m left`;
  };

  const showResults = hasVoted || isExpired;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              Today's Question
            </span>
            <span className="text-sm text-gray-500">
              {new Date(question.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <i className="fas fa-clock"></i>
            <span>{getTimeLeft()}</span>
          </div>
        </div>

        <h2 className="text-2xl font-medium text-text mb-6 leading-relaxed">
          {question.text}
        </h2>

        {!showResults ? (
          <>
            {/* Voting Interface */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <label 
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all group ${
                    selectedOption === option
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-primary hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className={`w-5 h-5 border-2 rounded-full mr-4 flex items-center justify-center ${
                    selectedOption === option
                      ? "border-primary"
                      : "border-gray-300 group-hover:border-primary"
                  }`}>
                    {selectedOption === option && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>

            <Button
              onClick={handleSubmitVote}
              disabled={!selectedOption || voteMutation.isPending || hasVoted}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {voteMutation.isPending ? "Submitting..." : "Submit Your Vote"}
            </Button>
          </>
        ) : (
          <>
            {/* Results Display */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Results:</h3>
              {question.options.map((option, index) => {
                const stat = question.voteStats?.find(s => s.option === option);
                const count = stat?.count || 0;
                const percentage = question.totalVotes > 0 
                  ? ((count / question.totalVotes) * 100).toFixed(1)
                  : '0';
                
                const isUserChoice = voteCheck?.vote?.selectedOption === option;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isUserChoice ? 'text-primary' : 'text-text'}`}>
                        {option} {isUserChoice && '(Your choice)'}
                      </span>
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isUserChoice ? 'bg-primary' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>{question.totalVotes} votes so far</span>
          <span>•</span>
          <span>One vote per person</span>
        </div>
      </CardContent>
    </Card>
  );
}
