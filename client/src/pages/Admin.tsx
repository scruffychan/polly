import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [questionForm, setQuestionForm] = useState({
    text: "",
    options: ["", "", "", ""],
    startDate: "",
    endDate: ""
  });

  const [paperForm, setPaperForm] = useState({
    questionId: "",
    title: "",
    summary: "",
    source: "",
    type: "",
    url: "",
    year: new Date().getFullYear(),
    credibilityBadge: "Non-partisan"
  });

  const [actionForm, setActionForm] = useState({
    questionId: "",
    title: "",
    description: "",
    url: "",
    icon: "fas fa-link"
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questions/history"],
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/feedback"],
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      toast({ title: "Question created successfully!" });
      setQuestionForm({
        text: "",
        options: ["", "", "", ""],
        startDate: "",
        endDate: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createPaperMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/research-papers", data);
    },
    onSuccess: () => {
      toast({ title: "Research paper added successfully!" });
      setPaperForm({
        questionId: "",
        title: "",
        summary: "",
        source: "",
        type: "",
        url: "",
        year: new Date().getFullYear(),
        credibilityBadge: "Non-partisan"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add research paper",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createActionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/action-items", data);
    },
    onSuccess: () => {
      toast({ title: "Action item added successfully!" });
      setActionForm({
        questionId: "",
        title: "",
        description: "",
        url: "",
        icon: "fas fa-link"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add action item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const activateQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      await apiRequest("POST", `/api/questions/${questionId}/activate`, {});
    },
    onSuccess: () => {
      toast({ title: "Question activated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to activate question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-lock text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You need admin privileges to access this page.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredOptions = questionForm.options.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      toast({
        title: "Invalid question",
        description: "Please provide at least 2 answer options",
        variant: "destructive"
      });
      return;
    }

    createQuestionMutation.mutate({
      ...questionForm,
      options: filteredOptions,
      startDate: new Date(questionForm.startDate),
      endDate: new Date(questionForm.endDate)
    });
  };

  const handleSubmitPaper = (e: React.FormEvent) => {
    e.preventDefault();
    createPaperMutation.mutate(paperForm);
  };

  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    createActionMutation.mutate(actionForm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Manage questions, research papers, and action items for Polly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Question */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Text</label>
                  <Textarea
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter the question..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Answer Options</label>
                  {questionForm.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[index] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <Input
                      type="datetime-local"
                      value={questionForm.startDate}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <Input
                      type="datetime-local"
                      value={questionForm.endDate}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Research Paper */}
          <Card>
            <CardHeader>
              <CardTitle>Add Research Paper</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPaper} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <select
                    value={paperForm.questionId}
                    onChange={(e) => setPaperForm(prev => ({ ...prev, questionId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a question...</option>
                    {questions?.map((q: any) => (
                      <option key={q.id} value={q.id}>
                        {q.text.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  value={paperForm.title}
                  onChange={(e) => setPaperForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Paper title"
                  required
                />

                <Textarea
                  value={paperForm.summary}
                  onChange={(e) => setPaperForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Summary (50-100 words)"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={paperForm.source}
                    onChange={(e) => setPaperForm(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Source (e.g., Pew Research)"
                    required
                  />
                  <Input
                    value={paperForm.type}
                    onChange={(e) => setPaperForm(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Type (e.g., Policy Report)"
                    required
                  />
                </div>

                <Input
                  value={paperForm.url}
                  onChange={(e) => setPaperForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL to full paper"
                  type="url"
                  required
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createPaperMutation.isPending}
                >
                  {createPaperMutation.isPending ? "Adding..." : "Add Paper"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Action Item */}
          <Card>
            <CardHeader>
              <CardTitle>Add Action Item</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <select
                    value={actionForm.questionId}
                    onChange={(e) => setActionForm(prev => ({ ...prev, questionId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a question...</option>
                    {questions?.map((q: any) => (
                      <option key={q.id} value={q.id}>
                        {q.text.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  value={actionForm.title}
                  onChange={(e) => setActionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Action title"
                  required
                />

                <Textarea
                  value={actionForm.description}
                  onChange={(e) => setActionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  required
                />

                <Input
                  value={actionForm.url}
                  onChange={(e) => setActionForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL"
                  type="url"
                  required
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createActionMutation.isPending}
                >
                  {createActionMutation.isPending ? "Adding..." : "Add Action Item"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Manage Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions?.map((question: any) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-2">
                            {question.text.substring(0, 80)}...
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{new Date(question.startDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={question.isActive ? "text-green-600" : "text-gray-500"}>
                              {question.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        {!question.isActive && (
                          <Button
                            size="sm"
                            onClick={() => activateQuestionMutation.mutate(question.id)}
                            disabled={activateQuestionMutation.isPending}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Feedback Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>User Feedback & Topic Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : feedback && feedback.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedback.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {item.user.firstName} {item.user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{item.topicSuggestion}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No feedback received yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
