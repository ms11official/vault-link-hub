import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Wrench, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserTool {
  id: string;
  name: string;
  description: string;
  link: string;
  category: string;
  user_id: string;
}

const categories = [
  "Math & Finance",
  "Documents",
  "Design",
  "Utilities",
  "Time & Date",
  "Security",
  "Network",
  "Text",
  "Developer",
  "Other"
];

const UserToolsSection = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [tools, setTools] = useState<UserTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<UserTool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    link: "",
    category: "Other"
  });

  useEffect(() => {
    fetchTools();
  }, [userId]);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .eq("type", "user_tool")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedTools: UserTool[] = (data || []).map((item) => {
        const metadata = item.metadata as Record<string, unknown> || {};
        return {
          id: item.id,
          name: item.title,
          description: item.content,
          link: metadata.link as string || "",
          category: metadata.category as string || "Other",
          user_id: item.user_id,
        };
      });

      setTools(mappedTools);
    } catch (error: any) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.link) {
      toast({
        title: "Error",
        description: "Name and link are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingTool) {
        const { error } = await supabase
          .from("items")
          .update({
            title: formData.name,
            content: formData.description,
            metadata: { link: formData.link, category: formData.category },
          })
          .eq("id", editingTool.id);

        if (error) throw error;
        toast({ title: "Success", description: "Tool updated successfully" });
      } else {
        const { error } = await supabase
          .from("items")
          .insert({
            user_id: userId,
            type: "user_tool",
            title: formData.name,
            content: formData.description,
            metadata: { link: formData.link, category: formData.category },
          });

        if (error) throw error;
        toast({ title: "Success", description: "Tool added successfully" });
      }

      setDialogOpen(false);
      setEditingTool(null);
      setFormData({ name: "", description: "", link: "", category: "Other" });
      fetchTools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save tool",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tool: UserTool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      link: tool.link,
      category: tool.category,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (toolId: string) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", toolId);
      if (error) throw error;
      toast({ title: "Success", description: "Tool deleted successfully" });
      fetchTools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tool",
        variant: "destructive",
      });
    }
  };

  const openDialog = () => {
    setEditingTool(null);
    setFormData({ name: "", description: "", link: "", category: "Other" });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          My Tools
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tool Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Favorite Editor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Link *</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the tool"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingTool ? "Update" : "Add Tool"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tools.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No custom tools yet. Click "Add Tool" to create your first one.
          </p>
        ) : (
          <div className="space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{tool.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{tool.description || tool.link}</p>
                  <span className="text-xs text-primary">{tool.category}</span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(tool.link, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(tool)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserToolsSection;
