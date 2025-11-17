import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CategoryPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  isDefaultCategory?: boolean;
  onSuccess: () => void;
}

export const CategoryPasswordDialog = ({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  isDefaultCategory = false,
  onSuccess,
}: CategoryPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSavePassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isDefaultCategory) {
        // Save to user_category_settings for default categories
        const { data: existingSetting } = await supabase
          .from('user_category_settings')
          .select('*')
          .eq('user_id', user.id)
          .eq('category_type', categoryId)
          .maybeSingle();

        if (existingSetting) {
          await supabase
            .from('user_category_settings')
            .update({ password })
            .eq('id', existingSetting.id);
        } else {
          await supabase
            .from('user_category_settings')
            .insert({
              user_id: user.id,
              category_type: categoryId,
              password,
            });
        }
      } else {
        // Save to categories table for custom categories
        await supabase
          .from('categories')
          .update({ password })
          .eq('id', categoryId)
          .eq('user_id', user.id);
      }

      toast({
        title: "Success",
        description: "Password set successfully",
      });
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error setting password:", error);
      toast({
        title: "Error",
        description: "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Password for {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <Button
            onClick={handleSavePassword}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Saving..." : "Save Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
