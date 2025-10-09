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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  GripVertical,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Ticket {
  _id?: string;
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

const API_URL = "https://villorya-server.vercel.app/api/v1/kanban";

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

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

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL,{
        headers: { Authorization: "Bearer " + token },
      });
        const data = await res.json();
        if (data.success) setTickets(data.data);
        else throw new Error(data.message);
      } catch (err: any) {
        toast({
          title: "Error fetching tickets",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

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

  const handleCreateTicket = async () => {
    if (
      !formData.title ||
      !formData.assignedTo ||
      !formData.startDate ||
      !formData.dueDate
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" , "Authorization": "Bearer " + token },
        body: JSON.stringify({ ...formData, status: "todo" }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);
      setTickets((prev) => [...prev, data.data]);
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Ticket created successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!editingTicket || !editingTicket._id) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${editingTicket._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" , "Authorization": "Bearer " + token },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setTickets((prev) =>
        prev.map((t) => (t._id === editingTicket._id ? data.data : t))
      );
      setIsDialogOpen(false);
      setEditingTicket(null);
      resetForm();
      toast({ title: "Success", description: "Ticket updated successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" , headers: { "Authorization": "Bearer " + token },});
      const data = await res.json();

      if (!data.success) throw new Error(data.message);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      toast({ title: "Deleted", description: "Ticket deleted successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (ticket: Ticket) => setDraggedTicket(ticket);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (status: Ticket["status"]) => {
    if (!draggedTicket || !draggedTicket._id) return;

    try {
      const res = await fetch(`${API_URL}/${draggedTicket._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" , "Authorization": "Bearer " + token,},
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setTickets((prev) =>
        prev.map((t) => (t._id === draggedTicket._id ? data.data : t))
      );
      setDraggedTicket(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
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

  const getTicketsByStatus = (status: Ticket["status"]) =>
    tickets.filter((ticket) => ticket.status === status);

  // Analytics calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const completedToday = tickets.filter(
    (t) =>
      t.status === "done" &&
      new Date(t.dueDate) >= today &&
      new Date(t.dueDate) < tomorrow
  ).length;

  const overdueTasks = tickets.filter(
    (t) => new Date(t.dueDate) < today && t.status !== "done"
  );

  const dueThisWeek = tickets.filter(
    (t) =>
      new Date(t.dueDate) >= today &&
      new Date(t.dueDate) <= weekFromNow &&
      t.status !== "done"
  );

  const upcomingTasks = tickets
    .filter((t) => t.status !== "done" && new Date(t.dueDate) >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Status distribution for pie chart
  const statusData = COLUMNS.map((col) => ({
    name: col.title,
    value: getTicketsByStatus(col.id as Ticket["status"]).length,
  })).filter((d) => d.value > 0);

  // Priority distribution
  const priorityData = PRIORITIES.map((priority) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: tickets.filter((t) => t.priority === priority).length,
  })).filter((d) => d.value > 0);

  // Tasks by assignee
  const assigneeData = Object.entries(
    tickets.reduce((acc, ticket) => {
      acc[ticket.assignedTo] = (acc[ticket.assignedTo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Analytics Section */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tickets.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {tickets.filter((t) => t.status === "done").length} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Today
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Tasks finished today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overdue Tasks
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overdueTasks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Past due date
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Due This Week
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dueThisWeek.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Next 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Status Distribution */}
              {statusData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Status Distribution</CardTitle>
                    <CardDescription>Tasks by workflow stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: { label: "Tasks", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={60}
                            fill="hsl(var(--chart-1))"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Priority Distribution */}
              {priorityData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                    <CardDescription>Tasks by priority level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: { label: "Tasks", color: "hsl(var(--chart-2))" },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Tasks by Assignee */}
              {assigneeData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Assignees</CardTitle>
                    <CardDescription>Tasks per team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        count: { label: "Tasks", color: "hsl(var(--chart-3))" },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={assigneeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="hsl(var(--chart-3))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Tasks
                  </CardTitle>
                  <CardDescription>
                    Next {upcomingTasks.length} tasks by due date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {task.assignedTo}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <div className="text-sm text-muted-foreground text-right">
                            <div className="font-medium">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs">
                              {Math.ceil(
                                (new Date(task.dueDate).getTime() -
                                  today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Kanban Board */}
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
                {getTicketsByStatus(column.id as Ticket["status"]).map(
                  (ticket) => (
                    <Card
                      key={ticket._id}
                      draggable
                      onDragStart={() => handleDragStart(ticket)}
                      className="cursor-move hover:shadow-lg transition-shadow"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold line-clamp-2">
                            {ticket.title}
                          </CardTitle>
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
                          <Badge
                            variant={getPriorityColor(ticket.priority)}
                            className="text-xs"
                          >
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
                            <strong>Start:</strong>{" "}
                            {new Date(ticket.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Due:</strong>{" "}
                            {new Date(ticket.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          {ticket.externalLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() =>
                                window.open(ticket.externalLink!, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => {
                              setEditingTicket(ticket);
                              setFormData({
                                title: ticket.title,
                                description: ticket.description || "",
                                category: ticket.category || "",
                                priority: ticket.priority,
                                externalLink: ticket.externalLink || "",
                                assignedTo: ticket.assignedTo,
                                dueDate: ticket.dueDate,
                                startDate: ticket.startDate,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTicket(ticket._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTicket ? "Edit Ticket" : "Create New Ticket"}
            </DialogTitle>
          </DialogHeader>

          {/* Form */}
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            {/* Description */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      priority: v as Ticket["priority"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Assigned To *</Label>
              <Input
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
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
            <Button
              onClick={editingTicket ? handleUpdateTicket : handleCreateTicket}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              {editingTicket ? "Update" : "Create"} Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
