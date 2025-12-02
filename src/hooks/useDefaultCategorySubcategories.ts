import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubCategory {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export const useDefaultCategorySubcategories = (categoryType: string) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [newSubCategoryIcon, setNewSubCategoryIcon] = useState("Folder");
  const { toast } = useToast();

  const fetchSubCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get parent category for this type
      const { data: parentCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", `default_${categoryType}_parent`)
        .single();

      if (!parentCategory) {
        setSubCategories([]);
        return;
      }

      const { data: subs, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("parent_category_id", parentCategory.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubCategories(subs || []);
    } catch (error) {
      console.error("Failed to fetch sub-categories:", error);
    }
  };

  const createSubCategory = async () => {
    if (!newSubCategoryName.trim()) {
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

      // Get or create parent category
      let { data: parentCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", `default_${categoryType}_parent`)
        .single();

      if (!parentCategory) {
        const { data: newParent, error: parentError } = await supabase
          .from("categories")
          .insert({
            name: `default_${categoryType}_parent`,
            user_id: user.id,
            icon: categoryType === "links" ? "Link" : 
                  categoryType === "emails" ? "Mail" :
                  categoryType === "messages" ? "MessageSquare" :
                  categoryType === "passwords" ? "Lock" :
                  categoryType === "contacts" ? "Users" : "Globe",
          })
          .select()
          .single();

        if (parentError) throw parentError;
        parentCategory = newParent;
      }

      const { error } = await supabase
        .from("categories")
        .insert({
          name: newSubCategoryName,
          user_id: user.id,
          icon: newSubCategoryIcon,
          parent_category_id: parentCategory.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sub-category created successfully",
      });

      setNewSubCategoryName("");
      setNewSubCategoryIcon("Folder");
      setIsSubCategoryDialogOpen(false);
      fetchSubCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-category",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [categoryType]);

  return {
    subCategories,
    isSubCategoryDialogOpen,
    setIsSubCategoryDialogOpen,
    newSubCategoryName,
    setNewSubCategoryName,
    newSubCategoryIcon,
    setNewSubCategoryIcon,
    createSubCategory,
    fetchSubCategories,
  };
};
