import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AddItemDialog, { ItemType } from "@/components/AddItemDialog";
import DraggableItemCard from "@/components/DraggableItemCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, FolderPlus, FilePlus, ChevronRight, Folder } from "lucide-react";
import IconPicker from "@/components/IconPicker";
import { useDefaultCategorySubcategories } from "@/hooks/useDefaultCategorySubcategories";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import * as LucideIcons from "lucide-react";

interface Item {
  id: string;
  title: string;
  content: string;
  created_at: string;
  type: string;
  metadata?: any;
  category_id?: string | null;
}

interface DefaultCategoryPageProps {
  title: string;
  itemType: ItemType;
  categoryType: string;
  emptyMessage: string;
}

const getIconComponent = (iconName: string | null) => {
  if (!iconName) return <Folder className="h-5 w-5" />;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? <IconComponent className="h-5 w-5" /> : <Folder className="h-5 w-5" />;
};

const DefaultCategoryPage = ({ title, itemType, categoryType, emptyMessage }: DefaultCategoryPageProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    subCategories,
    isSubCategoryDialogOpen,
    setIsSubCategoryDialogOpen,
    newSubCategoryName,
    setNewSubCategoryName,
    newSubCategoryIcon,
    setNewSubCategoryIcon,
    createSubCategory,
  } = useDefaultCategorySubcategories(categoryType);

  const fetchItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("type", itemType)
        .is("category_id", null)
        .order("order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch ${title.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      for (let i = 0; i < newItems.length; i++) {
        await supabase
          .from("items")
          .update({ order: i })
          .eq("id", newItems[i].id);
      }
      toast({ title: "Success", description: "Items reordered successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reorder items", variant: "destructive" });
      fetchItems();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold flex-1">{title}</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsAddDialogOpen(true)}>
                <FilePlus className="h-4 w-4 mr-2" />
                Add Item
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsSubCategoryDialogOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Sub-category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
            </DialogHeader>
            <AddItemDialogContent 
              type={itemType} 
              onSuccess={() => {
                fetchItems();
                setIsAddDialogOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>

        {/* Sub-categories Section */}
        {subCategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Sub-categories</h2>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {subCategories.map((subCat) => (
                <Card
                  key={subCat.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/categories/${subCat.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="text-primary">{getIconComponent(subCat.icon)}</div>
                    <span className="font-medium flex-1 truncate">{subCat.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sub-category Dialog */}
        <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sub-category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Enter sub-category name"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker value={newSubCategoryIcon} onChange={setNewSubCategoryIcon} />
              </div>
              <Button onClick={createSubCategory} className="w-full">
                Create Sub-category
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 && subCategories.length === 0 ? (
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground mt-4">No items in root. Add items or check sub-categories.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <DraggableItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    content={item.content}
                    createdAt={item.created_at}
                    type={item.type}
                    metadata={item.metadata}
                    category_id={item.category_id}
                    onDelete={fetchItems}
                    onUpdate={fetchItems}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

// Inline form component for adding items
const AddItemDialogContent = ({ type, onSuccess }: { type: ItemType; onSuccess: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("items").insert({
        user_id: user.id,
        type,
        title,
        content,
        category_id: null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Item added successfully" });
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "link": return "https://example.com";
      case "email": return "email@example.com";
      case "password": return "Enter password";
      case "contact": return "+1234567890";
      case "weburl": return "https://website.com";
      default: return "Enter content";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" required />
      </div>
      <div className="space-y-2">
        <Label>Content</Label>
        <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder={getPlaceholder()} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Item"}
      </Button>
    </form>
  );
};

export default DefaultCategoryPage;
