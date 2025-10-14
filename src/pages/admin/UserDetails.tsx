import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Package, ShoppingCart, Heart, MapPin } from "lucide-react";

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

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        setEditedUser(foundUser);
      } else {
        navigate("/admin/users");
      }
    } else {
      navigate("/admin/users");
    }
  }, [userId, navigate]);

  const saveUserEdit = () => {
    if (!editedUser) return;
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const updatedUsers = users.map(u => u.id === editedUser.id ? editedUser : u);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUser(editedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="cart">Cart</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>View and edit user profile details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={saveUserEdit}>Save</Button>
                    <Button onClick={() => { setIsEditing(false); setEditedUser(user); }} variant="outline">Cancel</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editedUser?.name || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, name: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editedUser?.email || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, email: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editedUser?.phone || ""}
                    onChange={(e) => setEditedUser(editedUser ? { ...editedUser, phone: e.target.value } : null)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge variant={editedUser?.status === "active" ? "default" : "destructive"}>
                      {editedUser?.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Joined Date</Label>
                  <Input value={user.joinedDate} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order History
              </CardTitle>
              <CardDescription>View all orders placed by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {dummyOrders[user.id]?.length > 0 ? (
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
                    {dummyOrders[user.id]?.map((order) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Wishlist Items
              </CardTitle>
              <CardDescription>Items saved by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {dummyWishlist[user.id]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dummyWishlist[user.id]?.map((item) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
              <CardDescription>Current cart items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cart is empty</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Saved Addresses
              </CardTitle>
              <CardDescription>Delivery addresses saved by this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Primary Address</p>
                  <p className="text-sm text-muted-foreground">{user.address}</p>
                  <p className="text-sm text-muted-foreground">{user.city}, {user.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
