import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Briefcase, Home, ShoppingCart, FileText, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  icon: any;
  description: string;
  categories: {
    name: string;
    icon: string;
    subCategories?: string[];
  }[];
}

const templates: Template[] = [
  {
    id: "work",
    name: "Work Organization",
    icon: Briefcase,
    description: "Organize your work-related items",
    categories: [
      {
        name: "Projects",
        icon: "FolderOpen",
        subCategories: ["Active", "Completed", "On Hold"]
      },
      {
        name: "Meetings",
        icon: "Calendar",
        subCategories: ["Scheduled", "Notes", "Action Items"]
      }
    ]
  },
  {
    id: "personal",
    name: "Personal Life",
    icon: Home,
    description: "Manage your personal activities",
    categories: [
      {
        name: "Health",
        icon: "Heart",
        subCategories: ["Medical", "Fitness", "Nutrition"]
      },
      {
        name: "Finance",
        icon: "DollarSign",
        subCategories: ["Bills", "Investments", "Budgets"]
      }
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    icon: ShoppingCart,
    description: "Manage online business operations",
    categories: [
      {
        name: "Products",
        icon: "Package",
        subCategories: ["Active", "Draft", "Archive"]
      },
      {
        name: "Orders",
        icon: "ShoppingBag",
        subCategories: ["Pending", "Processing", "Completed"]
      }
    ]
  },
  {
    id: "documents",
    name: "Document Management",
    icon: FileText,
    description: "Organize documents and files",
    categories: [
      {
        name: "Legal",
        icon: "Scale",
        subCategories: ["Contracts", "Agreements", "Certificates"]
      },
      {
        name: "Personal",
        icon: "User",
        subCategories: ["Identification", "Education", "Other"]
      }
    ]
  }
];

interface CategoryTemplatesDialogProps {
  onSuccess: () => void;
}

const CategoryTemplatesDialog = ({ onSuccess }: CategoryTemplatesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();

  const createFromTemplate = async (template: Template) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      // Create each category and its sub-categories
      for (const category of template.categories) {
        const { data: parentCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: category.name,
            icon: category.icon,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Create sub-categories if they exist
        if (category.subCategories && parentCategory) {
          for (const subCategoryName of category.subCategories) {
            const { error: subCategoryError } = await supabase
              .from("categories")
              .insert({
                user_id: user.id,
                name: subCategoryName,
                icon: "FolderOpen",
                parent_category_id: parentCategory.id,
              });

            if (subCategoryError) throw subCategoryError;
          }
        }
      }

      toast({
        title: "Success",
        description: `${template.name} template created successfully`,
      });

      setOpen(false);
      setSelectedTemplate(null);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Templates</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {template.name}
                    {isSelected && <Check className="h-5 w-5 ml-auto text-primary" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {template.categories.map((cat, idx) => (
                        <li key={idx}>
                          • {cat.name}
                          {cat.subCategories && cat.subCategories.length > 0 && (
                            <span className="text-xs">
                              {" "}({cat.subCategories.length} sub-categories)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const template = templates.find((t) => t.id === selectedTemplate);
              if (template) createFromTemplate(template);
            }}
            disabled={!selectedTemplate || loading}
          >
            {loading ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryTemplatesDialog;
