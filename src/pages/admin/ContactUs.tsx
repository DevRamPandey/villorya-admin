import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, CheckCircle2, Users, Mail, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

type TicketStatus = "received" | "pending" | "done";

interface ContactTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  movedToPendingAt?: string;
  completedAt?: string;
  adminComment?: string;
}

const ContactUs = () => {
  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [draggedTicket, setDraggedTicket] = useState<ContactTicket | null>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(null);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const stored = localStorage.getItem("contact-tickets");
    if (stored) {
      setTickets(JSON.parse(stored));
    } else {
      // Initialize with dummy data
      const dummyTickets: ContactTicket[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          message: "I have a question about your product delivery times.",
          status: "received",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          message: "Can I get a bulk discount for orders over 100 units?",
          status: "received",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike@example.com",
          message: "I need help with my recent order #12345.",
          status: "pending",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          movedToPendingAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          name: "Sarah Wilson",
          email: "sarah@example.com",
          message: "What are your shipping options to Europe?",
          status: "done",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          movedToPendingAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          adminComment: "Responded with detailed shipping information and pricing.",
        },
        {
          id: "5",
          name: "Tom Brown",
          email: "tom@example.com",
          message: "I would like to return an item from my recent purchase.",
          status: "done",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          movedToPendingAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          adminComment: "Processed return request and sent return label.",
        },
      ];
      setTickets(dummyTickets);
      localStorage.setItem("contact-tickets", JSON.stringify(dummyTickets));
    }
  };

  const handleDragStart = (ticket: ContactTicket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TicketStatus) => {
    if (!draggedTicket) return;

    // Only allow dragging from received to pending
    if (draggedTicket.status === "received" && status === "pending") {
      const updatedTickets = tickets.map((ticket) =>
        ticket.id === draggedTicket.id
          ? { ...ticket, status, movedToPendingAt: new Date().toISOString() }
          : ticket
      );
      setTickets(updatedTickets);
      localStorage.setItem("contact-tickets", JSON.stringify(updatedTickets));
      toast({
        title: "Ticket moved to Pending",
        description: "You can now add a comment to complete this ticket.",
      });
    } else if (draggedTicket.status === "pending" && status === "done") {
      // Don't allow direct drag to done, must add comment
      toast({
        title: "Comment required",
        description: "Please add a comment before completing the ticket.",
        variant: "destructive",
      });
    }

    setDraggedTicket(null);
  };

  const openCommentDialog = (ticket: ContactTicket) => {
    if (ticket.status !== "pending") {
      toast({
        title: "Not allowed",
        description: "Only pending tickets can be completed with comments.",
        variant: "destructive",
      });
      return;
    }
    setSelectedTicket(ticket);
    setComment("");
    setIsCommentDialogOpen(true);
  };

  const submitComment = () => {
    if (!selectedTicket || !comment.trim()) {
      toast({
        title: "Error",
        description: "Please add a comment.",
        variant: "destructive",
      });
      return;
    }

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === selectedTicket.id
        ? {
            ...ticket,
            status: "done" as TicketStatus,
            adminComment: comment,
            completedAt: new Date().toISOString(),
          }
        : ticket
    );

    setTickets(updatedTickets);
    localStorage.setItem("contact-tickets", JSON.stringify(updatedTickets));
    
    toast({
      title: "Ticket completed",
      description: "The ticket has been moved to Done.",
    });

    setIsCommentDialogOpen(false);
    setSelectedTicket(null);
    setComment("");
  };

  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  // Analytics calculations
  const totalTickets = tickets.length;
  const receivedTickets = tickets.filter((t) => t.status === "received").length;
  const pendingTickets = tickets.filter((t) => t.status === "pending").length;
  const completedTickets = tickets.filter((t) => t.status === "done").length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = tickets.filter(
    (t) => t.status === "done" && t.completedAt && new Date(t.completedAt) >= today
  ).length;

  const avgResponseTime = () => {
    const completed = tickets.filter((t) => t.completedAt && t.createdAt);
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((acc, ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const done = new Date(ticket.completedAt!).getTime();
      return acc + (done - created);
    }, 0);
    
    const avgMs = totalTime / completed.length;
    return Math.round(avgMs / (1000 * 60 * 60)); // Convert to hours
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Us Management</h1>
          <p className="text-muted-foreground">Manage customer inquiries and support tickets</p>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">All time inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Resolved today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTickets}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime()}h</div>
            <p className="text-xs text-muted-foreground">Average time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Received Column */}
        <Card
          className="border-2 border-dashed"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("received")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Received
            </CardTitle>
            <CardDescription>{receivedTickets} tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTicketsByStatus("received").map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={() => handleDragStart(ticket)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">{ticket.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{ticket.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {getTicketsByStatus("received").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No new tickets</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Column */}
        <Card
          className="border-2 border-dashed border-yellow-500/50"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("pending")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending
            </CardTitle>
            <CardDescription>{pendingTickets} tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTicketsByStatus("pending").map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openCommentDialog(ticket)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">{ticket.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    </div>
                    <Badge variant="secondary">Click to complete</Badge>
                  </div>
                  <p className="text-sm mt-2">{ticket.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </Badge>
                    {ticket.movedToPendingAt && (
                      <Badge variant="outline" className="text-xs bg-yellow-500/10">
                        In progress: {format(new Date(ticket.movedToPendingAt), "MMM d")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
            {getTicketsByStatus("pending").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No pending tickets</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card className="border-2 border-dashed border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Done
            </CardTitle>
            <CardDescription>{completedTickets} tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getTicketsByStatus("done").map((ticket) => (
              <Card key={ticket.id} className="opacity-75">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">{ticket.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{ticket.email}</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{ticket.message}</p>
                  {ticket.adminComment && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Admin Comment:</p>
                      <p className="text-xs text-muted-foreground">{ticket.adminComment}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Created: {format(new Date(ticket.createdAt), "MMM d")}
                    </Badge>
                    {ticket.completedAt && (
                      <Badge variant="outline" className="text-xs bg-green-500/10">
                        Completed: {format(new Date(ticket.completedAt), "MMM d")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
            {getTicketsByStatus("done").length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No completed tickets</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Ticket</DialogTitle>
            <DialogDescription>
              Add a comment to complete this ticket and move it to Done
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Customer: {selectedTicket.name}</p>
                <p className="text-sm text-muted-foreground">Email: {selectedTicket.email}</p>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{selectedTicket.message}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Comment</label>
                <Textarea
                  placeholder="Add your response or resolution notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitComment}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactUs;
