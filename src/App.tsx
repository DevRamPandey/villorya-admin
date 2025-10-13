import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ProductDetails from "./pages/admin/ProductDetails";
import PackageSuppliers from "./pages/admin/PackageSuppliers";
import RawSuppliers from "./pages/admin/RawSuppliers";
import CMS from "./pages/admin/CMS";
import Questions from "./pages/admin/Questions";
import RD from "./pages/admin/RD";
import Kanban from "./pages/admin/Kanban";
import Newsletter from "./pages/admin/Newsletter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="package-suppliers" element={<PackageSuppliers />} />
              <Route path="raw-suppliers" element={<RawSuppliers />} />
              <Route path="cms" element={<CMS />} />
              <Route path="questions" element={<Questions />} />
              <Route path="rd" element={<RD />} />
              <Route path="kanban" element={<Kanban />} />
              <Route path="newsletter" element={<Newsletter />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
