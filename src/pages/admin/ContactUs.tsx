import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  MessageSquare, Clock, CheckCircle2, Mail, Calendar, Loader2, AlertCircle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

type TicketStatus = "received" | "pending" | "done";

interface ContactTicket {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  movedToPendingAt?: string;
  completedAt?: string;
  adminComment?: string;
}

const API_URL = "https://api.villorya.com/api/v1/contact";

const ContactUs = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [draggedTicket, setDraggedTicket] = useState<ContactTicket | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadTickets = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      debugger;
      const res = await fetch(`${API_URL}/`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to fetch tickets from server");
      const data = await res.json();
 
      setTickets(data.data||[]);
    } catch (err: any) {
      setError(err.message || "Unable to connect to server");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [token]);

  const handleDragStart = (ticket: ContactTicket) => setDraggedTicket(ticket);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (status: TicketStatus) => {
    if (!draggedTicket) return;

    if (draggedTicket.status === "received" && status === "pending") {
      await moveToPending(draggedTicket._id);
    } else if (draggedTicket.status === "pending" && status === "done") {
      toast({
        title: "Comment required",
        description: "Add a comment before completing the ticket.",
        variant: "destructive",
      });
    }

    setDraggedTicket(null);
  };

  const moveToPending = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}/move-to-pending`, {
        method: "PATCH",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Failed to move ticket to pending");
      toast({ title: "Moved to Pending", description: "Ticket is now being processed." });
      await loadTickets();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const submitComment = async () => {
    if (!selectedTicket || !comment.trim()) {
      toast({
        title: "Error",
        description: "Please add a comment.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/${selectedTicket._id}/complete`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ adminComment: comment }),
      });
      if (!res.ok) throw new Error("Failed to complete ticket");

      toast({ title: "Ticket completed", description: "Moved to Done." });
      await loadTickets();
      setIsCommentDialogOpen(false);
      setSelectedTicket(null);
      setComment("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const openCommentDialog = (ticket: ContactTicket) => {
    if (ticket.status !== "pending") {
      toast({
        title: "Not allowed",
        description: "Only pending tickets can be completed.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTicket(ticket);
    setComment("");
    setIsCommentDialogOpen(true);
  };

  const getTicketsByStatus = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status);

  const totalTickets = tickets.length;
  const receivedTickets = getTicketsByStatus("received").length;
  const pendingTickets = getTicketsByStatus("pending").length;
  const completedTickets = getTicketsByStatus("done").length;

  const completedToday = tickets.filter(
    (t) =>
      t.status === "done" &&
      t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const avgResponseTime = () => {
    const completed = tickets.filter((t) => t.completedAt && t.createdAt);
    if (!completed.length) return 0;
    const total = completed.reduce((acc, t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.completedAt!).getTime();
      return acc + (end - start);
    }, 0);
    return Math.round(total / completed.length / (1000 * 60 * 60));
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Contact Us Management</h1>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <Card className="bg-red-50 border-red-200 p-4 flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <p className="text-red-700">{error}</p>
          <Button onClick={loadTickets}>Try Again</Button>
        </Card>
      )}

      {!loading && !error && tickets.length === 0 && (
        <Card className="bg-yellow-50 border-yellow-200 p-4 flex flex-col items-center gap-2">
          <p>No tickets available.</p>
          <Button onClick={loadTickets}>Refresh</Button>
        </Card>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Tickets", icon: MessageSquare, value: totalTickets },
              { title: "Completed Today", icon: CheckCircle2, value: completedToday },
              { title: "Pending", icon: Clock, value: pendingTickets },
              { title: "Avg Response Time", icon: Calendar, value: `${avgResponseTime()}h` },
            ].map(({ title, icon: Icon, value }) => (
              <Card key={title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="grid gap-4 md:grid-cols-3">
            {(["received", "pending", "done"] as TicketStatus[]).map((status) => (
              <Card
                key={status}
                className="border-2 border-dashed"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <CardHeader>
                  <CardTitle className="capitalize flex gap-2 items-center">
                    {status === "received" && <Mail className="w-5 h-5" />}
                    {status === "pending" && <Clock className="w-5 h-5" />}
                    {status === "done" && <CheckCircle2 className="w-5 h-5" />}
                    {status}
                  </CardTitle>
                  <CardDescription>
                    {getTicketsByStatus(status).length} tickets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getTicketsByStatus(status).map((t) => (
                    <Card
                      key={t._id}
                      className={`cursor-${status === "received" ? "grab" : "pointer"}`}
                      draggable={status === "received"}
                      onDragStart={() => handleDragStart(t)}
                      onClick={() => status === "pending" && openCommentDialog(t)}
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">{t.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{t.email}</p>
                        <p className="text-sm mt-2">{t.message}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {format(new Date(t.createdAt), "MMM d, yyyy")}
                        </Badge>
                        {t.adminComment && (
                          <div className="mt-2 text-xs bg-muted p-2 rounded">
                            <strong>Admin Comment:</strong> {t.adminComment}
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                  {getTicketsByStatus(status).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {status} tickets
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Ticket</DialogTitle>
            <DialogDescription>Add your resolution comment below.</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <>
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>{selectedTicket.name}</strong> – {selectedTicket.email}
                </p>
                <p className="text-sm bg-muted p-2 rounded">{selectedTicket.message}</p>
                <Textarea
                  placeholder="Add comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitComment} disabled={actionLoading}>
                  {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Ticket
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactUs;
