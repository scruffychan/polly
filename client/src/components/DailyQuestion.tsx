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
    <div className="glass-card rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="gradient-button px-4 py-2 rounded-full text-white text-sm font-medium">
            Today's Question
          </div>
          <span className="text-sm text-gray-600">
            {new Date(question.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-full">
          <i className="fas fa-clock text-purple-600"></i>
          <span className="font-medium">{getTimeLeft()}</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
        {question.text}
      </h2>

        {!showResults ? (
          <>
            {/* Voting Interface */}
            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <label 
                  key={index}
                  className={`voting-option flex items-center p-6 rounded-xl cursor-pointer ${
                    selectedOption === option ? "selected" : ""
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  <div className={`w-6 h-6 border-2 rounded-full mr-4 flex items-center justify-center transition-all ${
                    selectedOption === option
                      ? "border-purple-600 bg-purple-600"
                      : "border-gray-300"
                  }`}>
                    {selectedOption === option && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900 text-lg">{option}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={!selectedOption || voteMutation.isPending || hasVoted}
              className="w-full gradient-button text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {voteMutation.isPending ? "Submitting..." : "Submit Your Vote"}
            </button>
          </>
        ) : (
          <>
            {/* Results Display */}
            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Results:</h3>
              {question.options.map((option, index) => {
                const stat = question.voteStats?.find(s => s.option === option);
                const count = stat?.count || 0;
                const percentage = question.totalVotes > 0 
                  ? ((count / question.totalVotes) * 100).toFixed(1)
                  : '0';
                
                const isUserChoice = voteCheck?.vote?.selectedOption === option;
                
                return (
                  <div key={index} className="glass-card p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-semibold text-lg ${isUserChoice ? 'text-purple-600' : 'text-gray-900'}`}>
                        {option} {isUserChoice && '✓ (Your choice)'}
                      </span>
                      <span className="text-lg font-bold text-purple-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1000 ${
                          isUserChoice ? 'purple-gradient' : 'bg-gray-400'
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

        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600 bg-white/60 py-3 px-6 rounded-full">
          <span className="font-medium">{question.totalVotes} votes so far</span>
          <span>•</span>
          <span>One vote per person</span>
        </div>
    </div>
  );
}
