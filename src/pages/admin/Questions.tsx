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
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [questions, setQuestions] = useState<Questions>({
    packageSuppliers: [],
    rawSuppliers: [],
    packageFAQs: [],
    rawFAQs: [],
  });

  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");

  // ✅ Each question gets its own "Add Answer" field
  const [newAnswers, setNewAnswers] = useState<Record<string, string>>({});

  // ✅ Each answer edit field is tracked by questionId + index
  const [editingAnswer, setEditingAnswer] = useState<{
    questionId: string | null;
    index: number | null;
    text: string;
  }>({ questionId: null, index: null, text: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/questions`, axiosConfig);
        const apiData = res.data?.data || {};
        setQuestions({
          packageSuppliers: apiData.packageSuppliers || [],
          rawSuppliers: apiData.rawSuppliers || [],
          packageFAQs: apiData.packageFAQs || [],
          rawFAQs: apiData.rawFAQs || [],
        });
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
    fetchData();
  }, [token]);

  // Add question
  const addQuestion = async (category: keyof Questions) => {
    if (!newQuestion.trim()) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/questions`, { category, question: newQuestion }, axiosConfig);
      setQuestions((prev) => ({
        ...prev,
        [category]: [...prev[category], res.data.data],
      }));
      setNewQuestion("");
      toast({ title: "Question added" });
    } catch (e: any) {
      toast({ title: "Error adding question", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Add answer
  const addAnswer = async (category: keyof Questions, questionId: string) => {
    const newAnswer = newAnswers[questionId];
    if (!newAnswer?.trim()) return;
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
      setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
      toast({ title: "Answer added" });
    } catch (e: any) {
      toast({ title: "Error adding answer", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Update answer
  const updateAnswer = async (
    category: keyof Questions,
    questionId: string,
    answerIndex: number,
    newText: string
  ) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_URL}/questions/${questionId}/answers/${answerIndex}`,
        { answer: newText },
        axiosConfig
      );
      setQuestions((prev) => ({
        ...prev,
        [category]: prev[category].map((q) =>
          q._id === questionId ? res.data.data : q
        ),
      }));
      setEditingAnswer({ questionId: null, index: null, text: "" });
      toast({ title: "Answer updated" });
    } catch (e: any) {
      toast({ title: "Error updating answer", description: e.message, variant: "destructive" });
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
      toast({ title: "Answer removed" });
    } catch (e: any) {
      toast({ title: "Error removing answer", description: e.message, variant: "destructive" });
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
      toast({ title: "Question deleted" });
    } catch (e: any) {
      toast({ title: "Error deleting question", description: e.message, variant: "destructive" });
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
        <div className="flex gap-2">
          <Input
            placeholder="Enter question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <Button onClick={() => addQuestion(category)} disabled={loading}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </Card>

      {questions[category].length === 0 ? (
        <p className="text-sm text-center text-muted-foreground py-6">
          No questions yet
        </p>
      ) : (
        questions[category].map((question) => (
          <Card key={question._id} className="p-4 space-y-3">
            {/* Question */}
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">{question.question}</h4>
              <Button
                onClick={() => removeQuestion(category, question._id!)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>

            {/* Add Answer */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add answer..."
                value={newAnswers[question._id!] || ""}
                onChange={(e) =>
                  setNewAnswers((prev) => ({
                    ...prev,
                    [question._id!]: e.target.value,
                  }))
                }
              />
              <Button
                onClick={() => addAnswer(category, question._id!)}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Answers */}
            {question.answers.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-2">No answers yet</p>
            ) : (
              question.answers.map((answer, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-3 flex justify-between items-start">
                  {editingAnswer.questionId === question._id && editingAnswer.index === i ? (
                    <div className="w-full space-y-2">
                      <Textarea
                        value={editingAnswer.text}
                        onChange={(e) =>
                          setEditingAnswer((prev) => ({ ...prev, text: e.target.value }))
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAnswer(category, question._id!, i, editingAnswer.text)
                          }
                        >
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingAnswer({ questionId: null, index: null, text: "" })
                          }
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
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingAnswer({
                              questionId: question._id!,
                              index: i,
                              text: answer,
                            })
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAnswer(category, question._id!, i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supplier Questions</h1>
        <p className="text-muted-foreground">
          Manage supplier questions and FAQs.
        </p>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="packageSuppliers" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="packageSuppliers">Package Questions</TabsTrigger>
            <TabsTrigger value="rawSuppliers">Raw Questions</TabsTrigger>
            <TabsTrigger value="packageFAQs">Package FAQs</TabsTrigger>
            <TabsTrigger value="rawFAQs">Raw FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="packageSuppliers">{renderQuestionList("packageSuppliers", "Package Questions")}</TabsContent>
          <TabsContent value="rawSuppliers">{renderQuestionList("rawSuppliers", "Raw Questions")}</TabsContent>
          <TabsContent value="packageFAQs">{renderQuestionList("packageFAQs", "Package FAQs")}</TabsContent>
          <TabsContent value="rawFAQs">{renderQuestionList("rawFAQs", "Raw FAQs")}</TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
