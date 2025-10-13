import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, Download, Users, TrendingUp, Calendar, Send, Eye, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
}

interface SentNewsletter {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  sentAt: string;
  recipientType: "all" | "custom";
}

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sentNewsletters, setSentNewsletters] = useState<SentNewsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<SentNewsletter | null>(null);
  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
    recipientType: "all" as "all" | "custom",
    customEmails: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSubscribers();
    loadSentNewsletters();
  }, []);

  const loadSubscribers = () => {
    const stored = localStorage.getItem("newsletter-subscribers");
    if (stored) {
      setSubscribers(JSON.parse(stored));
    }
  };

  const loadSentNewsletters = () => {
    const stored = localStorage.getItem("sent-newsletters");
    if (stored) {
      setSentNewsletters(JSON.parse(stored));
    }
  };

  const sendNewsletter = () => {
    if (!newsletterForm.subject || !newsletterForm.content) {
      toast({
        title: "Error",
        description: "Please fill in subject and content.",
        variant: "destructive",
      });
      return;
    }

    let recipients: string[] = [];
    
    if (newsletterForm.recipientType === "all") {
      recipients = subscribers
        .filter((sub) => sub.status === "active")
        .map((sub) => sub.email);
    } else {
      recipients = newsletterForm.customEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email);
    }

    if (recipients.length === 0) {
      toast({
        title: "Error",
        description: "No recipients found.",
        variant: "destructive",
      });
      return;
    }

    const newNewsletter: SentNewsletter = {
      id: Date.now().toString(),
      subject: newsletterForm.subject,
      content: newsletterForm.content,
      recipients,
      sentAt: new Date().toISOString(),
      recipientType: newsletterForm.recipientType,
    };

    const updated = [...sentNewsletters, newNewsletter];
    setSentNewsletters(updated);
    localStorage.setItem("sent-newsletters", JSON.stringify(updated));

    toast({
      title: "Newsletter sent!",
      description: `Sent to ${recipients.length} recipient(s).`,
    });

    setNewsletterForm({
      subject: "",
      content: "",
      recipientType: "all",
      customEmails: "",
    });
    setIsComposeOpen(false);
  };

  const deleteSubscriber = (id: string) => {
    const updated = subscribers.filter((sub) => sub.id !== id);
    setSubscribers(updated);
    localStorage.setItem("newsletter-subscribers", JSON.stringify(updated));
    toast({
      title: "Subscriber deleted",
      description: "The subscriber has been removed from the list.",
    });
  };

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed At", "Status"];
    const rows = subscribers.map((sub) => [
      sub.email,
      format(new Date(sub.subscribedAt), "PPP"),
      sub.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Subscriber list has been exported to CSV.",
    });
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics calculations
  const totalSubscribers = subscribers.filter((s) => s.status === "active").length;
  const totalUnsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length;
  const last7Days = subscribers.filter(
    (s) => new Date(s.subscribedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const last30Days = subscribers.filter(
    (s) => new Date(s.subscribedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  // Status distribution
  const statusData = [
    { name: "Active", value: totalSubscribers, fill: "hsl(var(--primary))" },
    { name: "Unsubscribed", value: totalUnsubscribed, fill: "hsl(var(--destructive))" },
  ];

  // Monthly growth data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (5 - i));
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const count = subscribers.filter(
      (s) =>
        new Date(s.subscribedAt) >= monthStart && new Date(s.subscribedAt) < monthEnd
    ).length;

    return {
      month: format(monthStart, "MMM"),
      subscribers: count,
    };
  });

  // Weekly growth data
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = subscribers.filter(
      (s) =>
        new Date(s.subscribedAt) >= weekStart && new Date(s.subscribedAt) < weekEnd
    ).length;

    return {
      week: `Week ${4 - i}`,
      subscribers: count,
    };
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">Manage your email subscribers and campaigns</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Compose Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Newsletter</DialogTitle>
                <DialogDescription>
                  Create and send a newsletter to your subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Newsletter subject..."
                    value={newsletterForm.subject}
                    onChange={(e) =>
                      setNewsletterForm({ ...newsletterForm, subject: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Newsletter content..."
                    value={newsletterForm.content}
                    onChange={(e) =>
                      setNewsletterForm({ ...newsletterForm, content: e.target.value })
                    }
                    rows={10}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Recipients</label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      variant={newsletterForm.recipientType === "all" ? "default" : "outline"}
                      onClick={() =>
                        setNewsletterForm({ ...newsletterForm, recipientType: "all" })
                      }
                    >
                      All Subscribers ({subscribers.filter((s) => s.status === "active").length})
                    </Button>
                    <Button
                      variant={newsletterForm.recipientType === "custom" ? "default" : "outline"}
                      onClick={() =>
                        setNewsletterForm({ ...newsletterForm, recipientType: "custom" })
                      }
                    >
                      Custom Emails
                    </Button>
                  </div>
                </div>
                {newsletterForm.recipientType === "custom" && (
                  <div>
                    <label className="text-sm font-medium">Email Addresses (comma-separated)</label>
                    <Textarea
                      placeholder="email1@example.com, email2@example.com"
                      value={newsletterForm.customEmails}
                      onChange={(e) =>
                        setNewsletterForm({ ...newsletterForm, customEmails: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendNewsletter}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Newsletter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={exportToCSV} disabled={subscribers.length === 0} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last7Days}</div>
            <p className="text-xs text-muted-foreground">New subscribers this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last30Days}</div>
            <p className="text-xs text-muted-foreground">New subscribers this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnsubscribed}</div>
            <p className="text-xs text-muted-foreground">Inactive subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Active vs Unsubscribed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="subscribers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Growth</CardTitle>
            <CardDescription>Last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="subscribers" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Subscribers and Sent Newsletters */}
      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="sent">Sent Newsletters ({sentNewsletters.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Subscribers</CardTitle>
              <CardDescription>Manage your newsletter subscribers</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 mb-4" />
                  <p>No subscribers found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{format(new Date(subscriber.subscribedAt), "PPP")}</TableCell>
                        <TableCell>
                          <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this subscriber? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSubscriber(subscriber.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Newsletters</CardTitle>
              <CardDescription>View all newsletters you've sent</CardDescription>
            </CardHeader>
            <CardContent>
              {sentNewsletters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Send className="mx-auto h-12 w-12 mb-4" />
                  <p>No newsletters sent yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentNewsletters
                      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                      .map((newsletter) => (
                        <TableRow key={newsletter.id}>
                          <TableCell className="font-medium">{newsletter.subject}</TableCell>
                          <TableCell>{newsletter.recipients.length}</TableCell>
                          <TableCell>
                            <Badge variant={newsletter.recipientType === "all" ? "default" : "secondary"}>
                              {newsletter.recipientType === "all" ? "All Subscribers" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(newsletter.sentAt), "PPP p")}</TableCell>
                          <TableCell className="text-right">
                            <Dialog open={isViewOpen && selectedNewsletter?.id === newsletter.id} onOpenChange={(open) => {
                              setIsViewOpen(open);
                              if (!open) setSelectedNewsletter(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedNewsletter(newsletter)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{newsletter.subject}</DialogTitle>
                                  <DialogDescription>
                                    Sent to {newsletter.recipients.length} recipient(s) on{" "}
                                    {format(new Date(newsletter.sentAt), "PPP p")}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Content:</h4>
                                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                                      {newsletter.content}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Recipients:</h4>
                                    <div className="bg-muted p-4 rounded-md max-h-48 overflow-y-auto">
                                      {newsletter.recipients.map((email, idx) => (
                                        <div key={idx} className="text-sm">
                                          {email}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Newsletter;
