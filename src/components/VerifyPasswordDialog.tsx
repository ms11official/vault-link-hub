import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";

interface VerifyPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  correctPassword: string;
  onSuccess: () => void;
}

export const VerifyPasswordDialog = ({
  open,
  onOpenChange,
  categoryName,
  correctPassword,
  onSuccess,
}: VerifyPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleVerify = () => {
    if (password === correctPassword) {
      toast({
        title: "Success",
        description: "Access granted",
      });
      setPassword("");
      onOpenChange(false);
      onSuccess();
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Password for {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVerify();
                }
              }}
            />
          </div>
          <Button onClick={handleVerify} className="w-full">
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
