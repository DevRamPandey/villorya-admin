import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { RichTextEditor } from "@/components/cms/RichTextEditor";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
}

const dummyBlogs: Blog[] = [
  {
    id: "1",
    title: "The Future of Sustainable Packaging",
    slug: "future-sustainable-packaging",
    content: "<p>Sustainable packaging is revolutionizing the industry...</p>",
    excerpt: "Discover how sustainable packaging is changing the game in 2024",
    author: "Admin",
    status: "published",
    createdAt: "2024-10-01",
    updatedAt: "2024-10-01",
    category: "Sustainability",
    tags: ["packaging", "eco-friendly", "innovation"],
  },
  {
    id: "2",
    title: "Top 10 Packaging Trends for 2024",
    slug: "top-10-packaging-trends-2024",
    content: "<p>Here are the top packaging trends to watch...</p>",
    excerpt: "Stay ahead with these cutting-edge packaging trends",
    author: "Admin",
    status: "published",
    createdAt: "2024-09-15",
    updatedAt: "2024-09-20",
    category: "Trends",
    tags: ["trends", "design", "innovation"],
  },
  {
    id: "3",
    title: "How to Choose the Right Packaging Material",
    slug: "choose-right-packaging-material",
    content: "<p>Selecting the perfect packaging material requires...</p>",
    excerpt: "A comprehensive guide to selecting packaging materials",
    author: "Admin",
    status: "draft",
    createdAt: "2024-10-10",
    updatedAt: "2024-10-12",
    category: "Guide",
    tags: ["materials", "guide", "selection"],
  },
];

export default function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    const storedBlogs = localStorage.getItem("blogs");
    if (storedBlogs) {
      setBlogs(JSON.parse(storedBlogs));
    } else {
      localStorage.setItem("blogs", JSON.stringify(dummyBlogs));
      setBlogs(dummyBlogs);
    }
  }, []);

  const saveBlogs = (updatedBlogs: Blog[]) => {
    localStorage.setItem("blogs", JSON.stringify(updatedBlogs));
    setBlogs(updatedBlogs);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString().split("T")[0];
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean);

    if (editingBlog) {
      const updatedBlogs = blogs.map(blog =>
        blog.id === editingBlog.id
          ? {
              ...blog,
              ...formData,
              tags: tagsArray,
              updatedAt: now,
            }
          : blog
      );
      saveBlogs(updatedBlogs);
      toast({ title: "Blog updated successfully" });
    } else {
      const newBlog: Blog = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
        author: "Admin",
        createdAt: now,
        updatedAt: now,
      };
      saveBlogs([...blogs, newBlog]);
      toast({ title: "Blog created successfully" });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "",
      tags: "",
      status: "draft",
    });
    setEditingBlog(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags.join(", "),
      status: blog.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (blogId: string) => {
    const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
    saveBlogs(updatedBlogs);
    toast({ title: "Blog deleted successfully" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Blog Post
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.filter(b => b.status === "published").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blogs.filter(b => b.status === "draft").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>Manage your blog content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.createdAt}</TableCell>
                  <TableCell>{blog.updatedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(blog)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(blog.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            <DialogDescription>Fill in the details for your blog post</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog title"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short description of the blog post"
                rows={2}
              />
            </div>

            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Sustainability"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="packaging, eco-friendly, innovation"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.status === "draft"}
                    onChange={() => setFormData({ ...formData, status: "draft" })}
                  />
                  Draft
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.status === "published"}
                    onChange={() => setFormData({ ...formData, status: "published" })}
                  />
                  Published
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingBlog ? "Update" : "Create"} Blog Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
