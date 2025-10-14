import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
}

const dummyInventory: InventoryItem[] = [
  { id: "1", name: "Premium Cardboard Box (Large)", sku: "PKG-001", category: "Boxes", quantity: 150, reorderLevel: 50, unitPrice: 2.99, supplier: "PackPro Inc.", lastRestocked: "2024-10-01" },
  { id: "2", name: "Eco-Friendly Bubble Wrap", sku: "PKG-002", category: "Protective", quantity: 30, reorderLevel: 40, unitPrice: 12.99, supplier: "EcoWrap Co.", lastRestocked: "2024-09-28" },
  { id: "3", name: "Custom Label Sheets (100pk)", sku: "PKG-003", category: "Labels", quantity: 200, reorderLevel: 75, unitPrice: 8.99, supplier: "LabelMax", lastRestocked: "2024-10-05" },
  { id: "4", name: "Kraft Paper Roll", sku: "PKG-004", category: "Paper", quantity: 80, reorderLevel: 30, unitPrice: 15.99, supplier: "PaperWorld", lastRestocked: "2024-10-10" },
  { id: "5", name: "Shipping Tape Dispenser", sku: "PKG-005", category: "Tools", quantity: 25, reorderLevel: 20, unitPrice: 6.99, supplier: "OfficeSupplies", lastRestocked: "2024-09-15" },
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    supplier: "",
  });

  useEffect(() => {
    const storedInventory = localStorage.getItem("inventory");
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      localStorage.setItem("inventory", JSON.stringify(dummyInventory));
      setInventory(dummyInventory);
    }
  }, []);

  const saveInventory = (updatedInventory: InventoryItem[]) => {
    localStorage.setItem("inventory", JSON.stringify(updatedInventory));
    setInventory(updatedInventory);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku) {
      toast({
        title: "Error",
        description: "Name and SKU are required",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString().split("T")[0];

    if (editingItem) {
      const updatedInventory = inventory.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      );
      saveInventory(updatedInventory);
      toast({ title: "Item updated successfully" });
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        ...formData,
        lastRestocked: now,
      };
      saveInventory([...inventory, newItem]);
      toast({ title: "Item added successfully" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      reorderLevel: 0,
      unitPrice: 0,
      supplier: "",
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      unitPrice: item.unitPrice,
      supplier: item.supplier,
    });
    setIsDialogOpen(true);
  };

  const updateStock = (itemId: string, newQuantity: number) => {
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity, lastRestocked: new Date().toISOString().split("T")[0] } : item
    );
    saveInventory(updatedInventory);
    toast({ title: "Stock updated successfully" });
  };

  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
  const outOfStock = inventory.filter(item => item.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your inventory</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage stock levels and item details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.quantity <= item.reorderLevel ? (
                        <Badge variant="destructive">{item.quantity}</Badge>
                      ) : (
                        <Badge variant="default">{item.quantity}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.reorderLevel}</TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>{item.lastRestocked}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        className="w-20"
                        value={item.quantity}
                        onChange={(e) => updateStock(item.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
            <DialogDescription>Fill in the details for the inventory item</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label>SKU</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., PKG-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Boxes"
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
