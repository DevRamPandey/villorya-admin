import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Package Suppliers",
      value: "24",
      change: "+12%",
      icon: Package,
    },
    {
      title: "Raw Material Suppliers",
      value: "18",
      change: "+8%",
      icon: ShoppingBag,
    },
    {
      title: "CMS Pages",
      value: "5",
      change: "0%",
      icon: FileText,
    },
    {
      title: "Total Questions",
      value: "32",
      change: "+5%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin panel overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="glass-panel animate-slide-up hover:shadow-elegant transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New supplier added
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i} hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="p-4 text-left rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                <p className="font-medium">Add Package Supplier</p>
                <p className="text-sm opacity-90">Create a new supplier entry</p>
              </button>
              <button className="p-4 text-left rounded-lg bg-muted hover:bg-muted/80 transition-all">
                <p className="font-medium">Add Raw Material Supplier</p>
                <p className="text-sm text-muted-foreground">
                  Create a new material supplier
                </p>
              </button>
              <button className="p-4 text-left rounded-lg bg-muted hover:bg-muted/80 transition-all">
                <p className="font-medium">Update CMS Content</p>
                <p className="text-sm text-muted-foreground">
                  Edit website content
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
