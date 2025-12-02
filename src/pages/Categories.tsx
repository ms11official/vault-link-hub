import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Mail, MessageSquare, Lock, User, Globe, Plus, MoreVertical, Trash2, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CategoryPasswordDialog } from "@/components/CategoryPasswordDialog";
import { ForgotCategoryPasswordDialog } from "@/components/ForgotCategoryPasswordDialog";
import { VerifyPasswordDialog } from "@/components/VerifyPasswordDialog";
import CategoryTemplatesDialog from "@/components/CategoryTemplatesDialog";
import { IconPicker, getIconComponent } from "@/components/IconPicker";

const Categories = () => {
  const [stats, setStats] = useState({
    links: 0,
    emails: 0,
    messages: 0,
    passwords: 0,
    contacts: 0,
    weburls: 0,
  });
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [defaultCategoriesPasswords, setDefaultCategoriesPasswords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password dialogs state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [verifyPasswordDialogOpen, setVerifyPasswordDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    password?: string;
    path?: string;
    isDefault?: boolean;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get user email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUserEmail(profile.email);
    }

    // Fetch default categories stats
    const types = ["link", "email", "message", "password", "contact", "weburl"];
    const counts: any = {};

    for (const type of types) {
      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("type", type);
      
      counts[type + "s"] = count || 0;
    }

    setStats(counts);

    // Fetch default categories passwords
    const { data: categorySettings } = await supabase
      .from("user_category_settings")
      .select("*")
      .eq("user_id", user.id);

    const passwordsMap: Record<string, string> = {};
    categorySettings?.forEach((setting) => {
      if (setting.password) {
        passwordsMap[setting.category_type] = setting.password;
      }
    });
    setDefaultCategoriesPasswords(passwordsMap);

    // Fetch custom categories
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    setCustomCategories(categories || []);
    setLoading(false);
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("categories").insert({
      user_id: user.id,
      name: newCategory.name,
      icon: newCategory.icon || "FolderOpen",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Category created successfully",
    });

    setNewCategory({ name: "", icon: "" });
    setOpen(false);
    fetchData();
  };

  const deleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
    fetchData();
  };

  const handleCategoryClick = (category: any, path: string, isDefault: boolean = false) => {
    const categoryType = isDefault ? path.replace("/", "") : category.id;
    const password = isDefault ? defaultCategoriesPasswords[categoryType] : category.password;

    if (password) {
      setSelectedCategory({
        id: categoryType,
        name: category.title || category.name,
        password,
        path,
        isDefault,
      });
      setVerifyPasswordDialogOpen(true);
    } else {
      navigate(path);
    }
  };

  const defaultCategories = [
    { title: "Links", icon: Link2, count: stats.links, path: "/links", color: "text-blue-500", type: "links" },
    { title: "Emails", icon: Mail, count: stats.emails, path: "/emails", color: "text-green-500", type: "emails" },
    { title: "Messages", icon: MessageSquare, count: stats.messages, path: "/messages", color: "text-purple-500", type: "messages" },
    { title: "Passwords", icon: Lock, count: stats.passwords, path: "/passwords", color: "text-red-500", type: "passwords" },
    { title: "Contacts", icon: User, count: stats.contacts, path: "/contacts", color: "text-orange-500", type: "contacts" },
    { title: "Web URLs", icon: Globe, count: stats.weburls, path: "/weburls", color: "text-cyan-500", type: "weburls" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage your storage categories</p>
          </div>
          <div className="flex gap-2">
            <CategoryTemplatesDialog onSuccess={fetchData} />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </DialogTrigger>
              <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
              <div>
                  <Label>Icon</Label>
                  <IconPicker
                    value={newCategory.icon || "FolderOpen"}
                    onChange={(icon) => setNewCategory({ ...newCategory, icon })}
                  />
                </div>
                <Button onClick={createCategory} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Default Categories</h2>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-20 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {defaultCategories.map((category) => {
                  const Icon = category.icon;
                  const hasPassword = !!defaultCategoriesPasswords[category.type];
                  return (
                    <Card key={category.path} className="hover:shadow-lg transition-shadow cursor-pointer relative">
                      <div onClick={() => handleCategoryClick(category, category.path, true)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">{category.title}</CardTitle>
                          <Icon className={`h-5 w-5 ${category.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{category.count}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.count === 1 ? "item" : "items"} stored
                          </p>
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
                          {!hasPassword ? (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory({
                                  id: category.type,
                                  name: category.title,
                                  isDefault: true,
                                });
                                setPasswordDialogOpen(true);
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Add Password
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory({
                                  id: category.type,
                                  name: category.title,
                                  isDefault: true,
                                });
                                setForgotPasswordDialogOpen(true);
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Forgot Password
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {customCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Custom Categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customCategories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer relative">
                    <div onClick={() => handleCategoryClick(category, `/categories/${category.id}`, false)}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
                        {(() => {
                          const CategoryIcon = getIconComponent(category.icon || "FolderOpen");
                          return <CategoryIcon className="h-5 w-5 text-primary" />;
                        })()}
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">items stored</p>
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
                        {!category.password ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory({
                                id: category.id,
                                name: category.name,
                                isDefault: false,
                              });
                              setPasswordDialogOpen(true);
                            }}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Add Password
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory({
                                id: category.id,
                                name: category.name,
                                isDefault: false,
                              });
                              setForgotPasswordDialogOpen(true);
                            }}
                          >
                            <KeyRound className="mr-2 h-4 w-4" />
                            Forgot Password
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCategory(category.id);
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
        </div>
      </div>

      {/* Password Management Dialogs */}
      {selectedCategory && (
        <>
          <CategoryPasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
            isDefaultCategory={selectedCategory.isDefault}
            onSuccess={fetchData}
          />
          <ForgotCategoryPasswordDialog
            open={forgotPasswordDialogOpen}
            onOpenChange={setForgotPasswordDialogOpen}
            categoryId={selectedCategory.id}
            categoryName={selectedCategory.name}
            userEmail={userEmail}
            isDefaultCategory={selectedCategory.isDefault}
            onSuccess={fetchData}
          />
          <VerifyPasswordDialog
            open={verifyPasswordDialogOpen}
            onOpenChange={setVerifyPasswordDialogOpen}
            categoryName={selectedCategory.name}
            correctPassword={selectedCategory.password || ""}
            onSuccess={() => {
              if (selectedCategory.path) {
                navigate(selectedCategory.path);
              }
            }}
          />
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default Categories;