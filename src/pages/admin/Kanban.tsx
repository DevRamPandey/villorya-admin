import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  externalLink?: string;
  assignedTo: string;
  dueDate: string;
  startDate: string;
  status: "todo" | "in-progress" | "uat" | "qa" | "done";
}

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "uat", title: "UAT" },
  { id: "qa", title: "QA" },
  { id: "done", title: "Done" },
] as const;

const PRIORITIES = ["low", "medium", "high"] as const;

export default function Kanban() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as Ticket["priority"],
    externalLink: "",
    assignedTo: "",
    dueDate: "",
    startDate: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("kanban-tickets");
    if (stored) {
      setTickets(JSON.parse(stored));
    }
  }, []);

  const saveTickets = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
    localStorage.setItem("kanban-tickets", JSON.stringify(updatedTickets));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      externalLink: "",
      assignedTo: "",
      dueDate: "",
      startDate: "",
    });
  };

  const handleCreateTicket = () => {
    if (!formData.title || !formData.assignedTo || !formData.startDate || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTicket: Ticket = {
      id: Date.now().toString(),
      ...formData,
      status: "todo",
    };

    saveTickets([...tickets, newTicket]);
    setIsDialogOpen(false);
    resetForm();
    toast({
      title: "Success",
      description: "Ticket created successfully",
    });
  };

  const handleUpdateTicket = () => {
    if (!editingTicket) return;

    if (!formData.title || !formData.assignedTo || !formData.startDate || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === editingTicket.id
        ? { ...ticket, ...formData }
        : ticket
    );

    saveTickets(updatedTickets);
    setIsDialogOpen(false);
    setEditingTicket(null);
    resetForm();
    toast({
      title: "Success",
      description: "Ticket updated successfully",
    });
  };

  const handleDeleteTicket = (id: string) => {
    const updatedTickets = tickets.filter((ticket) => ticket.id !== id);
    saveTickets(updatedTickets);
    toast({
      title: "Success",
      description: "Ticket deleted successfully",
    });
  };

  const handleEditClick = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      externalLink: ticket.externalLink || "",
      assignedTo: ticket.assignedTo,
      dueDate: ticket.dueDate,
      startDate: ticket.startDate,
    });
    setIsDialogOpen(true);
  };

  const handleDragStart = (ticket: Ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Ticket["status"]) => {
    if (!draggedTicket) return;

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === draggedTicket.id ? { ...ticket, status } : ticket
    );

    saveTickets(updatedTickets);
    setDraggedTicket(null);
  };

  const getPriorityColor = (priority: Ticket["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
    }
  };

  const getTicketsByStatus = (status: Ticket["status"]) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <Button
          onClick={() => {
            setEditingTicket(null);
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="bg-muted/50 rounded-lg p-4 min-h-[600px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id as Ticket["status"])}
          >
            <h2 className="font-semibold mb-4 text-lg flex items-center justify-between">
              {column.title}
              <Badge variant="outline">
                {getTicketsByStatus(column.id as Ticket["status"]).length}
              </Badge>
            </h2>
            <div className="space-y-3">
              {getTicketsByStatus(column.id as Ticket["status"]).map((ticket) => (
                <Card
                  key={ticket.id}
                  draggable
                  onDragStart={() => handleDragStart(ticket)}
                  className="cursor-move hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold line-clamp-2">
                          {ticket.title}
                        </CardTitle>
                      </div>
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    {ticket.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                        {ticket.priority}
                      </Badge>
                      {ticket.category && (
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        <strong>Assigned:</strong> {ticket.assignedTo}
                      </div>
                      <div>
                        <strong>Start:</strong> {new Date(ticket.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Due:</strong> {new Date(ticket.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {ticket.externalLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => window.open(ticket.externalLink, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEditClick(ticket)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Edit Ticket" : "Create New Ticket"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter ticket title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter ticket description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Bug, Feature"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value as Ticket["priority"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="externalLink">External Link</Label>
              <Input
                id="externalLink"
                type="url"
                value={formData.externalLink}
                onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">
                Assigned To <span className="text-destructive">*</span>
              </Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Enter assignee name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingTicket(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}>
              {editingTicket ? "Update" : "Create"} Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
