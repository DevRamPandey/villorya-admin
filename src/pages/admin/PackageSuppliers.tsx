import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, TrendingUp, Package, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface PackageSupplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  productDescription: string;
  note: string;
  status: "active" | "inactive" | "pending";
  minOrderValue: number;
  pricePerUnit: number;
  minOrderWeight: number; // NEW
  pricePerKg: number; // NEW
  location: string; // NEW
  website: string; // NEW
}

export default function PackageSuppliers() {
  const [suppliers, setSuppliers] = useState<PackageSupplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<PackageSupplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<PackageSupplier | null>(null);

  const { toast } = useToast();
  const { token } = useAuth();

  const [formData, setFormData] = useState<Omit<PackageSupplier, "_id">>({
    name: "",
    email: "",
    phone: "",
    productDescription: "",
    note: "",
    status: "active",
    minOrderValue: 0,
    pricePerUnit: 0,
    minOrderWeight: 0, // NEW
    pricePerKg: 0, // NEW
    location: "", // NEW
    website: "", // NEW
  });

  const API_BASE = "https://villorya-server.vercel.app/api/v1/package-suppliers";

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch suppliers");
      setSuppliers(json.data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const method = editingSupplier ? "PUT" : "POST";
      const url = editingSupplier ? `${API_BASE}/${editingSupplier._id}` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save supplier");

      toast({ title: `Supplier ${editingSupplier ? "updated" : "added"} successfully` });
      fetchSuppliers();
      closeDialog();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
 const confirmDelete = (supplier: PackageSupplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };
 const handleDeleteConfirmed = async () => {
    if (!supplierToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/${supplierToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to delete supplier");

      toast({ title: "Supplier deleted successfully" });
      fetchSuppliers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const openDialog = (supplier?: PackageSupplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData(supplier);
    } else {
      setEditingSupplier(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        productDescription: "",
        note: "",
        status: "active",
        minOrderValue: 0,
        pricePerUnit: 0,
        minOrderWeight: 0,
        pricePerKg: 0,
        location: "",
        website: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Analytics data
  const statusData = [
    { name: "Active", value: suppliers.filter(s => s.status === "active").length, color: "#adfccaff" },
    { name: "Inactive", value: suppliers.filter(s => s.status === "inactive").length, color: "#fb8686ff" },
    { name: "Pending", value: suppliers.filter(s => s.status === "pending").length, color: "#000000ff" },
  ];

  const locationData = suppliers.reduce((acc, supplier) => {
    const location = supplier.location || "Unknown";
    const existing = acc.find(item => item.name === location);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: location, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[])
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  const priceRanges = [
    { range: "0-100", count: suppliers.filter(s => s.pricePerKg > 0 && s.pricePerKg <= 100).length },
    { range: "101-200", count: suppliers.filter(s => s.pricePerKg > 100 && s.pricePerKg <= 200).length },
    { range: "201-300", count: suppliers.filter(s => s.pricePerKg > 200 && s.pricePerKg <= 300).length },
    { range: "301+", count: suppliers.filter(s => s.pricePerKg > 300).length },
  ];

  const avgPricePerKg = suppliers.filter(s => s.pricePerKg > 0).reduce((sum, s) => sum + s.pricePerKg, 0) / suppliers.filter(s => s.pricePerKg > 0).length || 0;
  const avgMinOrderWeight = suppliers.filter(s => s.minOrderWeight > 0).reduce((sum, s) => sum + s.minOrderWeight, 0) / suppliers.filter(s => s.minOrderWeight > 0).length || 0;

  if (loading)
    return <p className="text-center text-muted-foreground">Loading suppliers...</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Package Suppliers</h1>
          <p className="text-muted-foreground">Manage your package suppliers</p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.filter(s => s.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Price/Kg</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgPricePerKg.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Average pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Min Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMinOrderWeight.toFixed(0)} kg</div>
            <p className="text-xs text-muted-foreground">
              Minimum order weight
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationData.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-visible">
  <CardHeader>
    <CardTitle>Status Distribution</CardTitle>
    <CardDescription>Suppliers by status</CardDescription>
  </CardHeader>

  {/* Important: allow overflow for the tooltip */}
  <CardContent className="overflow-visible">
    <div className="relative overflow-visible h-[240px]">
      <ChartContainer
        config={{
          active: { label: "Active", color: "hsl(var(--chart-1))" },
          inactive: { label: "Inactive", color: "hsl(var(--chart-2))" },
          pending: { label: "Pending", color: "hsl(var(--chart-3))" },
        }}
        className="h-full overflow-visible"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 30, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
              wrapperStyle={{
                overflow: "visible",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  </CardContent>
</Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Range Distribution</CardTitle>
            <CardDescription>Suppliers by price per kg (₹)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Count", color: "hsl(var(--chart-1))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
            <CardDescription>Suppliers by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Count", color: "hsl(var(--chart-2))" },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Price/Unit</TableHead>
              <TableHead>Min Weight</TableHead>
              <TableHead>Price/Kg</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier._id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.location}</TableCell>
                <TableCell>
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {supplier.website}
                  </a>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      supplier.status === "active"
                        ? "bg-green-500/20 text-green-500"
                        : supplier.status === "inactive"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {supplier.status}
                  </span>
                </TableCell>
                <TableCell>${supplier.minOrderValue}</TableCell>
                <TableCell>${supplier.pricePerUnit}</TableCell>
                <TableCell>{supplier.minOrderWeight} kg</TableCell>
                <TableCell>${supplier.pricePerKg}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDialog(supplier)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => confirmDelete(supplier)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit" : "Add"} Package Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productDescription">Product Description</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minOrderValue">Min Order Value</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minOrderWeight">Min Order Weight (kg)</Label>
                <Input
                  id="minOrderWeight"
                  type="number"
                  value={formData.minOrderWeight}
                  onChange={(e) => setFormData({ ...formData, minOrderWeight: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerKg">Price Per Kg</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingSupplier ? "Update" : "Add"} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
       {/* 🔻 Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{supplierToDelete?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
        
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
