import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import CommentSection from "./CommentSection";
import ItemDetailsDialog from "./ItemDetailsDialog";

interface ItemCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  type: string;
  metadata?: any;
  category_id?: string | null;
  onDelete: () => void;
  onUpdate: () => void;
}

const ItemCard = ({ id, title, content, createdAt, type, metadata, category_id, onDelete, onUpdate }: ItemCardProps) => {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      onDelete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground break-all">{content}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(createdAt).toLocaleDateString()}
          </p>
          <CommentSection itemId={id} />
        </CardContent>
      </Card>

      <ItemDetailsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={{ id, title, content, type, metadata, category_id }}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default ItemCard;