import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX, Edit, Package, ShoppingCart, Heart, MapPin } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "blocked";
  joinedDate: string;
  address: string;
  city: string;
  country: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const dummyUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+1234567890", status: "active", joinedDate: "2024-01-15", address: "123 Main St", city: "New York", country: "USA" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", status: "active", joinedDate: "2024-02-20", address: "456 Oak Ave", city: "Los Angeles", country: "USA" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", phone: "+1234567892", status: "blocked", joinedDate: "2024-03-10", address: "789 Pine Rd", city: "Chicago", country: "USA" },
];

const dummyOrders: { [key: string]: Order[] } = {
  "1": [
    { id: "ORD-001", date: "2024-10-01", total: 299.99, status: "Delivered", items: 3 },
    { id: "ORD-002", date: "2024-10-10", total: 149.99, status: "Shipped", items: 2 },
  ],
  "2": [
    { id: "ORD-003", date: "2024-10-05", total: 499.99, status: "Processing", items: 5 },
  ],
  "3": [],
};

const dummyWishlist: { [key: string]: WishlistItem[] } = {
  "1": [
    { id: "W1", name: "Premium Package Design", price: 99.99, image: "/placeholder.svg" },
    { id: "W2", name: "Eco-Friendly Material", price: 149.99, image: "/placeholder.svg" },
  ],
  "2": [
    { id: "W3", name: "Custom Label Pack", price: 79.99, image: "/placeholder.svg" },
  ],
  "3": [],
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem("users", JSON.stringify(dummyUsers));
      setUsers(dummyUsers);
    }
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, status: (user.status === "active" ? "blocked" : "active") as "active" | "blocked" }
        : user
    );
    saveUsers(updatedUsers);
    toast({
      title: "User status updated",
      description: `User has been ${updatedUsers.find(u => u.id === userId)?.status === "blocked" ? "blocked" : "unblocked"}`,
    });
  };

  const saveUserEdit = () => {
    if (!editedUser) return;
    const updatedUsers = users.map(user => user.id === editedUser.id ? editedUser : user);
    saveUsers(updatedUsers);
    setSelectedUser(editedUser);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "User profile has been updated successfully",
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users, view details, and control access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Search and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditedUser(user);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === "active" ? "destructive" : "default"}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setIsEditing(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
            <DialogDescription>View and manage user information</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="cart">Cart</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={saveUserEdit} size="sm">Save</Button>
                    <Button onClick={() => { setIsEditing(false); setEditedUser(selectedUser); }} variant="outline" size="sm">Cancel</Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editedUser?.name || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, name: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editedUser?.email || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, email: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editedUser?.phone || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, phone: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={editedUser?.status === "active" ? "default" : "destructive"}>
                    {editedUser?.status}
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order History
              </h3>
              {dummyOrders[selectedUser?.id || ""]?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dummyOrders[selectedUser?.id || ""]?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No orders found</p>
              )}
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Wishlist Items
              </h3>
              {dummyWishlist[selectedUser?.id || ""]?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {dummyWishlist[selectedUser?.id || ""]?.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No wishlist items</p>
              )}
            </TabsContent>

            <TabsContent value="cart" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </h3>
              <p className="text-muted-foreground">Cart is empty</p>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="font-medium">Primary Address</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.address}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.city}, {selectedUser?.country}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
