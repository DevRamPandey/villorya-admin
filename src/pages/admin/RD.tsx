import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, Upload, Search, Filter, Eye, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RDVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileData: string;
  uploadedAt: string;
}

interface RDEntry {
  id: string;
  title: string;
  description: string;
  tags: string[];
  versions: RDVersion[];
  createdAt: string;
  updatedAt: string;
}

export default function RD() {
  const [entries, setEntries] = useState<RDEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<RDEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<RDEntry | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [isAddingVersion, setIsAddingVersion] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    file: null as File | null,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const stored = localStorage.getItem("rd_entries");
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  };

  const saveEntries = (newEntries: RDEntry[]) => {
    localStorage.setItem("rd_entries", JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, file });
    } else {
      toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || (!formData.file && !currentEntry && !isAddingVersion)) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      if (isAddingVersion && currentEntry) {
        // Adding a new version
        if (!formData.file) {
          toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" });
          return;
        }

        const fileData = await fileToBase64(formData.file);
        const newVersion: RDVersion = {
          id: Date.now().toString(),
          versionNumber: currentEntry.versions.length + 1,
          fileName: formData.file.name,
          fileData,
          uploadedAt: new Date().toISOString(),
        };

        const updatedEntry = {
          ...currentEntry,
          versions: [...currentEntry.versions, newVersion],
          updatedAt: new Date().toISOString(),
        };

        const updatedEntries = entries.map((e) => (e.id === currentEntry.id ? updatedEntry : e));
        saveEntries(updatedEntries);
        toast({ title: "Success", description: "New version added successfully" });
      } else if (currentEntry) {
        // Editing existing entry
        const updatedEntry = {
          ...currentEntry,
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          updatedAt: new Date().toISOString(),
        };

        if (formData.file) {
          const fileData = await fileToBase64(formData.file);
          updatedEntry.versions[0] = {
            ...updatedEntry.versions[0],
            fileName: formData.file.name,
            fileData,
          };
        }

        const updatedEntries = entries.map((e) => (e.id === currentEntry.id ? updatedEntry : e));
        saveEntries(updatedEntries);
        toast({ title: "Success", description: "R&D updated successfully" });
      } else {
        // Creating new entry
        if (!formData.file) {
          toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" });
          return;
        }

        const fileData = await fileToBase64(formData.file);
        const newEntry: RDEntry = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          versions: [
            {
              id: Date.now().toString(),
              versionNumber: 1,
              fileName: formData.file.name,
              fileData,
              uploadedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveEntries([...entries, newEntry]);
        toast({ title: "Success", description: "R&D created successfully" });
      }

      closeDialog();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save R&D", variant: "destructive" });
    }
  };

  const openDialog = (entry: RDEntry | null = null, addVersion = false) => {
    setCurrentEntry(entry);
    setIsAddingVersion(addVersion);
    if (entry && !addVersion) {
      setFormData({
        title: entry.title,
        description: entry.description,
        tags: entry.tags.join(", "),
        file: null,
      });
    } else {
      setFormData({ title: "", description: "", tags: "", file: null });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentEntry(null);
    setIsAddingVersion(false);
    setFormData({ title: "", description: "", tags: "", file: null });
  };

  const confirmDelete = (entry: RDEntry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!entryToDelete) return;
    const updatedEntries = entries.filter((e) => e.id !== entryToDelete.id);
    saveEntries(updatedEntries);
    toast({ title: "Success", description: "R&D deleted successfully" });
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const viewPdf = (fileData: string) => {
    setViewingPdf(fileData);
    setIsViewerOpen(true);
  };

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags)));

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterTag === "all" || entry.tags.includes(filterTag);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">R&D Management</h1>
          <p className="text-muted-foreground mt-1">Manage research and development documents</p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add R&D
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="line-clamp-1">{entry.title}</span>
                <Badge variant="secondary">{entry.versions.length} version{entry.versions.length > 1 ? 's' : ''}</Badge>
              </CardTitle>
              <CardDescription className="line-clamp-2">{entry.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Versions:</p>
                {entry.versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">
                        v{version.versionNumber} - {version.fileName}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewPdf(version.fileData)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog(entry, true)}
                  className="flex-1 gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add Version
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openDialog(entry)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => confirmDelete(entry)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No R&D entries found</p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchQuery || filterTag !== "all" ? "Try adjusting your filters" : "Click 'Add R&D' to create your first entry"}
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddingVersion ? `Add Version ${currentEntry?.versions.length ? currentEntry.versions.length + 1 : 2}` : currentEntry ? "Edit R&D" : "Add New R&D"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!isAddingVersion && (
              <>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter R&D title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter R&D description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. research, development, innovation"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="file">PDF File {!currentEntry || isAddingVersion ? "*" : "(optional)"}</Label>
              <Input
                id="file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              {formData.file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isAddingVersion ? "Add Version" : currentEntry ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete R&D Entry</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold">{entryToDelete?.title}</span>? This will delete all versions and cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>PDF Viewer</span>
              <Button variant="ghost" size="icon" onClick={() => setIsViewerOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-hidden">
            <iframe
              src={viewingPdf}
              className="w-full h-full border-0 rounded-md"
              title="PDF Viewer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
