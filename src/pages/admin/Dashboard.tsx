import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingBag,
  FileText,
  TrendingUp,
  Factory,
  Edit,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Stat {
  id: string;
  label: string;
  value: number;
  change: string;
  trend: string;
}

interface Activity {
  id: string;
  message: string;
  timeAgo: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  actionUrl: string;
  icon: string;
}

interface DashboardData {
  overview: { title: string; subtitle: string };
  stats: Stat[];
  recentActivity: Activity[];
  quickActions: QuickAction[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const iconMap: Record<string, any> = {
    package: Package,
    factory: Factory,
    edit: Edit,
    filetext: FileText,
    trendingup: TrendingUp,
    shoppingbag: ShoppingBag,
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          "https://villorya-server.vercel.app/api/v1/dashboard",
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to fetch dashboard data");
        }

        setData(json.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // 🔄 Skeleton shimmer effect while loading
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))}
        </div>

        {/* Recent Activity + Quick Actions Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4 space-y-4">
            <Skeleton className="h-5 w-40 mb-2" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-4 space-y-3">
            <Skeleton className="h-5 w-40 mb-2" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {data.overview.title}
        </h1>
        <p className="text-muted-foreground">{data.overview.subtitle}</p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, index) => {
          const Icon =
            iconMap[stat.label.replace(/\s/g, "").toLowerCase()] || TrendingUp;
          return (
            <Card
              key={stat.id}
              className="glass-panel animate-slide-up hover:shadow-elegant transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-green-500"
                        : stat.trend === "down"
                        ? "text-red-500"
                        : "text-gray-400"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card
          className="glass-panel animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card
          className="glass-panel animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {data.quickActions.map((action) => {
                const ActionIcon = iconMap[action.icon.toLowerCase()] || Edit;
                return (
                  <button
                    key={action.id}
                    className={`p-4 text-left rounded-lg transition-all ${
                      action.icon === "package"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => (window.location.href = action.actionUrl)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{action.title}</p>
                      <ActionIcon className="h-4 w-4 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
