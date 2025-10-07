import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 animate-fade-in">
        <h1 className="text-6xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-xl text-muted-foreground">
          Manage suppliers and content
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/admin")}
          className="mt-8"
        >
          Enter Admin Panel
        </Button>
      </div>
    </div>
  );
};

export default Index;
