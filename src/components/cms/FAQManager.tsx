import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQManagerProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

export function FAQManager({ faqs, onChange }: FAQManagerProps) {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer,
    };

    onChange([...faqs, newFAQ]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleSaveEdit = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;

    onChange(
      faqs.map((faq) =>
        faq.id === editingId
          ? { ...faq, question: editQuestion, answer: editAnswer }
          : faq
      )
    );
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const handleDelete = (id: string) => {
    onChange(faqs.filter((faq) => faq.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Add New FAQ */}
      <Card className="p-4 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Add New FAQ</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newQuestion">Question</Label>
            <Input
              id="newQuestion"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter question..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newAnswer">Answer</Label>
            <Textarea
              id="newAnswer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter answer..."
              rows={4}
            />
          </div>
          <Button onClick={handleAdd} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add FAQ
          </Button>
        </div>
      </Card>

      {/* FAQ List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Existing FAQs ({faqs.length})</h3>
        {faqs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No FAQs yet. Add your first FAQ above.
          </p>
        ) : (
          faqs.map((faq) => (
            <Card key={faq.id} className="p-4">
              {editingId === faq.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer</Label>
                    <Textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
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
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{faq.question}</h4>
                    <p className="text-muted-foreground mt-2">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(faq)}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteId(faq.id)}
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
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this FAQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
