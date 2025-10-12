import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface QuestionWithAnswers {
  _id?: string;
  question: string;
  answers: string[];
}

interface Questions {
  packageSuppliers: QuestionWithAnswers[];
  rawSuppliers: QuestionWithAnswers[];
  packageFAQs: QuestionWithAnswers[];
  rawFAQs: QuestionWithAnswers[];
}

export default function Questions() {
  const { toast } = useToast();
  const { token } = useAuth();

  const API_URL = "https://api.villorya.com/api/v1";
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [questions, setQuestions] = useState<Questions>({
    packageSuppliers: [],
    rawSuppliers: [],
    packageFAQs: [],
    rawFAQs: [],
  });

  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null);
  const [editAnswer, setEditAnswer] = useState("");

  // Fetch all questions from API
 useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/questions`, axiosConfig);

      const apiData = res.data?.data;

      // Normalize shape in case API returns [] or null
      const normalized: Questions = {
        packageSuppliers: Array.isArray(apiData?.packageSuppliers)
          ? apiData.packageSuppliers
          : [],
        rawSuppliers: Array.isArray(apiData?.rawSuppliers)
          ? apiData.rawSuppliers
          : [],
        packageFAQs: Array.isArray(apiData?.packageFAQs)
          ? apiData.packageFAQs
          : [],
        rawFAQs: Array.isArray(apiData?.rawFAQs)
          ? apiData.rawFAQs
          : [],
      };

      setQuestions(normalized);
    } catch (error: any) {
      toast({
        title: "Failed to fetch questions",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchData();
}, [token]);

  // Add question
  const addQuestion = async (category: keyof Questions) => {
    if (!newQuestion.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/questions`,
        { category, question: newQuestion },
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: [...prev[category], res.data.data],
      }));
      setNewQuestion("");
      toast({ title: "Question added successfully" });
    } catch (error: any) {
      toast({
        title: "Error adding question",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update question
  const updateQuestion = async (category: keyof Questions, id: string) => {
    if (!editQuestion.trim()) return;
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/questions/${id}`,
        { question: editQuestion },
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].map((q) =>
          q._id === id ? res.data.data : q
        ),
      }));
      setEditingQuestionId(null);
      setEditQuestion("");
      toast({ title: "Question updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error updating question",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete question
  const removeQuestion = async (category: keyof Questions, id: string) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/questions/${id}`, axiosConfig);
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].filter((q) => q._id !== id),
      }));
      toast({ title: "Question removed successfully" });
    } catch (error: any) {
      toast({
        title: "Error deleting question",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add answer
  const addAnswer = async (category: keyof Questions, questionId: string) => {
    if (!newAnswer.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/questions/${questionId}/answers`,
        { answer: newAnswer },
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].map((q) =>
          q._id === questionId ? res.data.data : q
        ),
      }));
      setNewAnswer("");
      toast({ title: "Answer added successfully" });
    } catch (error: any) {
      toast({
        title: "Error adding answer",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update answer
  const updateAnswer = async (
    category: keyof Questions,
    questionId: string,
    answerIndex: number
  ) => {
    if (!editAnswer.trim()) return;
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/questions/${questionId}/answers/${answerIndex}`,
        { answer: editAnswer },
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].map((q) =>
          q._id === questionId ? res.data.data : q
        ),
      }));
      setEditingAnswerIndex(null);
      setEditAnswer("");
      toast({ title: "Answer updated successfully" });
    } catch (error: any) {
      toast({
        title: "Error updating answer",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove answer
  const removeAnswer = async (
    category: keyof Questions,
    questionId: string,
    answerIndex: number
  ) => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_URL}/questions/${questionId}/answers/${answerIndex}`,
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].map((q) =>
          q._id === questionId ? res.data.data : q
        ),
      }));
      toast({ title: "Answer removed successfully" });
    } catch (error: any) {
      toast({
        title: "Error removing answer",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionList = (category: keyof Questions, title: string) => (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {title}
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </h3>
        <div className="space-y-2">
          <Label htmlFor="newQuestion">Add New Question</Label>
          <div className="flex gap-2">
            <Input
              id="newQuestion"
              placeholder="Enter question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              disabled={loading}
            />
            <Button onClick={() => addQuestion(category)} className="gap-2" disabled={loading}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Question List */}
      <div className="space-y-3">
        {questions[category].length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No questions added yet
          </p>
        ) : (
          questions[category].map((question) => (
            <Card key={question._id} className="p-4">
              <div className="space-y-4">
                {/* Question Header */}
                {editingQuestionId === question._id ? (
                  <div className="space-y-2">
                    <Input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateQuestion(category, question._id!)}
                        size="sm"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditQuestion("");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{question.question}</h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingQuestionId(question._id!);
                          setEditQuestion(question.question);
                        }}
                        size="sm"
                        variant="outline"
                        disabled={loading}
                      >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => removeQuestion(category, question._id!)}
                        size="sm"
                        variant="destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Answers */}
                <div className="space-y-3 pl-4 border-l-2 border-muted">
                  <Label className="text-sm font-medium">Answers</Label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      onClick={() => addAnswer(category, question._id!)}
                      size="sm"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>

                  {question.answers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No answers yet
                    </p>
                  ) : (
                    question.answers.map((answer, i) => (
                      <div key={i} className="bg-muted/30 p-3 rounded-lg flex justify-between">
                        {editingAnswerIndex === i &&
                        editingQuestionId === question._id ? (
                          <div className="flex-1 space-y-2">
                            <Textarea
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              disabled={loading}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() =>
                                  updateAnswer(category, question._id!, i)
                                }
                                size="sm"
                                disabled={loading}
                              >
                                <Check className="h-4 w-4 mr-1" /> Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingAnswerIndex(null);
                                  setEditingQuestionId(null);
                                  setEditAnswer("");
                                }}
                                size="sm"
                                variant="outline"
                              >
                                <X className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="flex-1 text-sm">{answer}</p>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => {
                                  setEditingAnswerIndex(i);
                                  setEditingQuestionId(question._id!);
                                  setEditAnswer(answer);
                                }}
                                size="sm"
                                variant="ghost"
                                disabled={loading}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  removeAnswer(category, question._id!, i)
                                }
                                size="sm"
                                variant="ghost"
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Supplier Questions
        </h1>
        <p className="text-muted-foreground">
          Manage questions for suppliers and FAQs
        </p>
      </div>

      <Card className="glass-panel p-6">
        <Tabs defaultValue="packageQuestions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packageQuestions">
              Package Questions
            </TabsTrigger>
            <TabsTrigger value="rawQuestions">Raw Material Questions</TabsTrigger>
            <TabsTrigger value="packageFAQs">Package FAQs</TabsTrigger>
            <TabsTrigger value="rawFAQs">Raw Material FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="packageQuestions" className="mt-6">
            {renderQuestionList("packageSuppliers", "Questions for Package Suppliers")}
          </TabsContent>
          <TabsContent value="rawQuestions" className="mt-6">
            {renderQuestionList("rawSuppliers", "Questions for Raw Material Suppliers")}
          </TabsContent>
          <TabsContent value="packageFAQs" className="mt-6">
            {renderQuestionList("packageFAQs", "FAQs - Package Suppliers")}
          </TabsContent>
          <TabsContent value="rawFAQs" className="mt-6">
            {renderQuestionList("rawFAQs", "FAQs - Raw Material Suppliers")}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
