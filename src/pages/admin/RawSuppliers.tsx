import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

interface RawSupplier {
  _id: string; // use _id from MongoDB
  name: string;
  email: string;
  phone: string;
  productDescription: string;
  note: string;
  status: "active" | "inactive" | "pending";
  minOrderValue: number;
  pricePerGram: number;
}

export default function RawSuppliers() {
  const [suppliers, setSuppliers] = useState<RawSupplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<RawSupplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
const { token } = useAuth();
  const [formData, setFormData] = useState<Omit<RawSupplier, "_id">>({
    name: "",
    email: "",
    phone: "",
    productDescription: "",
    note: "",
    status: "active",
    minOrderValue: 0,
    pricePerGram: 0,
  });

  const API_URL = "https://villorya-server.vercel.app/api/v1/raw-suppliers";

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const fetchSuppliers = async () => {
  try {
    setLoading(true);
    const res = await axios.get(API_URL, axiosConfig);
    setSuppliers(res.data.data);
  } catch (error: any) {
    toast({ title: "Failed to load suppliers", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

const handleSubmit = async () => {
  try {
    setLoading(true);
    if (editingSupplier) {
      const res = await axios.put(`${API_URL}/${editingSupplier._id}`, formData, axiosConfig);
      setSuppliers((prev) =>
        prev.map((s) => (s._id === editingSupplier._id ? res.data.data : s))
      );
      toast({ title: "Supplier updated successfully" });
    } else {
      const res = await axios.post(API_URL, formData, axiosConfig);
      setSuppliers((prev) => [res.data.data, ...prev]);
      toast({ title: "Supplier added successfully" });
    }
    closeDialog();
  } catch (error: any) {
    toast({ title: "Operation failed", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (_id: string) => {
  try {
    setLoading(true);
    await axios.delete(`${API_URL}/${_id}`, axiosConfig);
    setSuppliers((prev) => prev.filter((s) => s._id !== _id));
    toast({ title: "Supplier deleted successfully" });
  } catch (error: any) {
    toast({ title: "Delete failed", description: error.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSuppliers();
  }, []);



 
  const openDialog = (supplier?: RawSupplier) => {
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
        pricePerGram: 0,
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Raw Material Suppliers
          </h1>
          <p className="text-muted-foreground">
            Manage your raw material suppliers
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2" disabled={loading}>
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
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

        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Price/Gram</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier._id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
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
                  <TableCell>${supplier.pricePerGram}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDialog(supplier)}
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(supplier._id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit" : "Add"} Raw Material Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productDescription">Product Description</Label>
              <Textarea
                id="productDescription"
                value={formData.productDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productDescription: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderValue: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pricePerGram">Price Per Gram</Label>
                <Input
                  id="pricePerGram"
                  type="number"
                  step="0.01"
                  value={formData.pricePerGram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerGram: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {editingSupplier ? "Update" : "Add"} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
