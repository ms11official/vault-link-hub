import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/PasswordInput";
import { Plus, Upload, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AIActionButton from "@/components/AIActionButton";

type ItemType = "link" | "email" | "message" | "password" | "contact" | "weburl";

interface AddItemDialogProps {
  type: ItemType;
  onSuccess: () => void;
  categoryId?: string;
  triggerButton?: React.ReactNode;
}

const AddItemDialog = ({ type, onSuccess, categoryId, triggerButton }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add items",
          variant: "destructive",
        });
        return;
      }

      let fileUrl = "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
      }

      const metadata: any = {};
      if (emailPassword && type === "email") metadata.emailPassword = emailPassword;
      if (fileUrl) metadata.fileUrl = fileUrl;
      if (file) metadata.fileName = file.name;

      const { error } = await supabase.from("items").insert({
        user_id: user.id,
        type,
        title,
        content: fileUrl || content,
        metadata,
        category_id: categoryId || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully",
      });

      setTitle("");
      setContent("");
      setEmailPassword("");
      setFile(null);
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "link":
        return "https://example.com";
      case "email":
        return "email@example.com";
      case "password":
        return "Enter password";
      case "contact":
        return "+1234567890";
      case "weburl":
        return "https://website.com";
      default:
        return "Enter content";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="icon" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <AIActionButton
                action="generate-title"
                content={content || type}
                label="AI Title"
                size="sm"
                onResult={(result) => setTitle(result.trim())}
              />
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>

          {type === "contact" && (
            <div className="space-y-2">
              <Label htmlFor="file">Import Contact File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".vcf,.csv"
                  onChange={handleFileChange}
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          {type !== "contact" && (
            <div className="space-y-2">
              <Label htmlFor="file">Import File (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              {type === "email" && (
                <AIActionButton action="draft-email" content={title || "professional email"} label="AI Draft" size="sm" onResult={(r) => setContent(r)} />
              )}
              {type === "message" && (
                <AIActionButton action="draft-message" content={title || "message"} label="AI Draft" size="sm" onResult={(r) => setContent(r)} />
              )}
              {type === "password" && (
                <AIActionButton action="generate-password" content="" label="Generate" size="sm" onResult={(r) => setContent(r.trim())} />
              )}
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              required={!file}
            />
          </div>
          {type === "email" && (
            <div className="space-y-2">
              <Label htmlFor="emailPassword">Email Password (Optional)</Label>
              <PasswordInput
                id="emailPassword"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Enter email password"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
export type { ItemType };
