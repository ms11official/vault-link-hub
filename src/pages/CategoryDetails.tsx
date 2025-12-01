import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AddItemDialog from "@/components/AddItemDialog";
import DraggableItemCard from "@/components/DraggableItemCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, MoreVertical, Trash2, FolderOpen, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

interface Item {
  id: string;
  title: string;
  content: string;
  created_at: string;
  type: string;
  metadata?: any;
  category_id?: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  password: string | null;
  parent_category_id: string | null;
}

const CategoryDetails = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [createSubCategoryOpen, setCreateSubCategoryOpen] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState({ name: "", icon: "" });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .eq("user_id", user.id)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch items for this category
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("category_id", categoryId)
        .order("order", { ascending: true })
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Fetch sub-categories
      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("parent_category_id", categoryId)
        .order("created_at", { ascending: false });

      if (subCategoriesError) throw subCategoriesError;
      setSubCategories(subCategoriesData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch category details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update order in database
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("items")
          .update({ order: update.order })
          .eq("id", update.id);
      }

      toast({
        title: "Success",
        description: "Items reordered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder items",
        variant: "destructive",
      });
      fetchData(); // Refresh on error
    }
  };

  const createSubCategory = async () => {
    if (!newSubCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sub-category name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: newSubCategory.name,
        icon: newSubCategory.icon || "FolderOpen",
        parent_category_id: categoryId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });

      setNewSubCategory({ name: "", icon: "" });
      setCreateSubCategoryOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-category",
        variant: "destructive",
      });
    }
  };

  const deleteSubCategory = async (subCategoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", subCategoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sub-category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/categories")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold flex-1">{category.name}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem onClick={() => setAddItemOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Add Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateSubCategoryOpen(true)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Add Sub-category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Item Dialog */}
        {addItemOpen && (
          <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item to {category.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <AddItemDialog 
                  type="link" 
                  categoryId={categoryId} 
                  onSuccess={() => {
                    setAddItemOpen(false);
                    fetchData();
                  }} 
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Sub-category Dialog */}
        <Dialog open={createSubCategoryOpen} onOpenChange={setCreateSubCategoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sub-category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subname">Sub-category Name</Label>
                <Input
                  id="subname"
                  value={newSubCategory.name}
                  onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                  placeholder="Enter sub-category name"
                />
              </div>
              <div>
                <Label htmlFor="subicon">Icon Name (optional)</Label>
                <Input
                  id="subicon"
                  value={newSubCategory.icon}
                  onChange={(e) => setNewSubCategory({ ...newSubCategory, icon: e.target.value })}
                  placeholder="e.g., FolderOpen"
                />
              </div>
              <Button onClick={createSubCategory} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sub-categories Section */}
        {subCategories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Sub-categories</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {subCategories.map((subCategory) => (
                <Card key={subCategory.id} className="hover:shadow-lg transition-shadow cursor-pointer relative">
                  <div onClick={() => navigate(`/categories/${subCategory.id}`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <h3 className="text-lg font-medium">{subCategory.name}</h3>
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">Sub-category</p>
                    </CardContent>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover z-50">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubCategory(subCategory.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">No items yet. Add your first item!</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
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
                    onDelete={fetchData}
                    onUpdate={fetchData}
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

export default CategoryDetails;
