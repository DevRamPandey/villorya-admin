import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuestionWithAnswers {
  id: string;
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
  const [questions, setQuestions] = useState<Questions>({
    packageSuppliers: [],
    rawSuppliers: [],
    packageFAQs: [],
    rawFAQs: [],
  });

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null);
  const [editAnswer, setEditAnswer] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("supplierQuestions");
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
  }, []);

  const saveQuestions = (data: Questions) => {
    localStorage.setItem("supplierQuestions", JSON.stringify(data));
    setQuestions(data);
  };

  const addQuestion = (category: keyof Questions) => {
    if (!newQuestion.trim()) return;
    const newQuestionObj: QuestionWithAnswers = {
      id: Date.now().toString(),
      question: newQuestion,
      answers: [],
    };
    const updated = {
      ...questions,
      [category]: [...questions[category], newQuestionObj],
    };
    saveQuestions(updated);
    setNewQuestion("");
    toast({ title: "Question added successfully" });
  };

  const removeQuestion = (category: keyof Questions, id: string) => {
    const updated = {
      ...questions,
      [category]: questions[category].filter((q) => q.id !== id),
    };
    saveQuestions(updated);
    toast({ title: "Question removed successfully" });
  };

  const updateQuestion = (category: keyof Questions, id: string) => {
    if (!editQuestion.trim()) return;
    const updated = {
      ...questions,
      [category]: questions[category].map((q) =>
        q.id === id ? { ...q, question: editQuestion } : q
      ),
    };
    saveQuestions(updated);
    setEditingQuestionId(null);
    setEditQuestion("");
    toast({ title: "Question updated successfully" });
  };

  const addAnswer = (category: keyof Questions, questionId: string) => {
    if (!newAnswer.trim()) return;
    const updated = {
      ...questions,
      [category]: questions[category].map((q) =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      ),
    };
    saveQuestions(updated);
    setNewAnswer("");
    toast({ title: "Answer added successfully" });
  };

  const updateAnswer = (
    category: keyof Questions,
    questionId: string,
    answerIndex: number
  ) => {
    if (!editAnswer.trim()) return;
    const updated = {
      ...questions,
      [category]: questions[category].map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a, i) =>
                i === answerIndex ? editAnswer : a
              ),
            }
          : q
      ),
    };
    saveQuestions(updated);
    setEditingAnswerIndex(null);
    setEditAnswer("");
    toast({ title: "Answer updated successfully" });
  };

  const removeAnswer = (
    category: keyof Questions,
    questionId: string,
    answerIndex: number
  ) => {
    const updated = {
      ...questions,
      [category]: questions[category].map((q) =>
        q.id === questionId
          ? { ...q, answers: q.answers.filter((_, i) => i !== answerIndex) }
          : q
      ),
    };
    saveQuestions(updated);
    toast({ title: "Answer removed successfully" });
  };

  const renderQuestionList = (category: keyof Questions, title: string) => (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-2">
          <Label htmlFor="newQuestion">Add New Question</Label>
          <div className="flex gap-2">
            <Input
              id="newQuestion"
              placeholder="Enter question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addQuestion(category);
                }
              }}
            />
            <Button onClick={() => addQuestion(category)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {questions[category].map((question) => (
          <Card key={question.id} className="p-4">
            <div className="space-y-4">
              {/* Question Header */}
              <div className="space-y-2">
                {editingQuestionId === question.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      className="font-semibold"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateQuestion(category, question.id)}
                        size="sm"
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingQuestionId(null);
                          setEditQuestion("");
                        }}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-lg flex-1">
                      {question.question}
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingQuestionId(question.id);
                          setEditQuestion(question.question);
                        }}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => removeQuestion(category, question.id)}
                        size="sm"
                        variant="destructive"
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Answers Section */}
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                <Label className="text-sm font-medium">Answers</Label>
                
                {/* Add Answer */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add an answer..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => addAnswer(category, question.id)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {/* Answer List */}
                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => (
                    <div
                      key={answerIndex}
                      className="p-3 rounded-lg bg-muted/30 space-y-2"
                    >
                      {editingAnswerIndex === answerIndex &&
                      editingQuestionId === question.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                updateAnswer(category, question.id, answerIndex)
                              }
                              size="sm"
                              className="gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingAnswerIndex(null);
                                setEditingQuestionId(null);
                                setEditAnswer("");
                              }}
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{answer}</p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setEditingAnswerIndex(answerIndex);
                                setEditingQuestionId(question.id);
                                setEditAnswer(answer);
                              }}
                              size="sm"
                              variant="ghost"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                removeAnswer(category, question.id, answerIndex)
                              }
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {question.answers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No answers yet. Add one above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {questions[category].length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No questions added yet
          </p>
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
            {renderQuestionList(
              "packageSuppliers",
              "Questions for Package Suppliers"
            )}
          </TabsContent>

          <TabsContent value="rawQuestions" className="mt-6">
            {renderQuestionList(
              "rawSuppliers",
              "Questions for Raw Material Suppliers"
            )}
          </TabsContent>

          <TabsContent value="packageFAQs" className="mt-6">
            {renderQuestionList(
              "packageFAQs",
              "Frequently Asked Questions - Package Suppliers"
            )}
          </TabsContent>

          <TabsContent value="rawFAQs" className="mt-6">
            {renderQuestionList(
              "rawFAQs",
              "Frequently Asked Questions - Raw Material Suppliers"
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
