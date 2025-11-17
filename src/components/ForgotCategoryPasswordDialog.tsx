import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ForgotCategoryPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  userEmail: string;
  isDefaultCategory?: boolean;
  onSuccess: () => void;
}

export const ForgotCategoryPasswordDialog = ({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  userEmail,
  isDefaultCategory = false,
  onSuccess,
}: ForgotCategoryPasswordDialogProps) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('send-category-password-otp', {
        body: { 
          email: userEmail,
          categoryId,
          isDefaultCategory 
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter OTP and new password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('verify-category-password-otp', {
        body: { 
          email: userEmail,
          otp,
          categoryId,
          newPassword,
          isDefaultCategory 
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password reset successfully",
      });
      setOtp("");
      setNewPassword("");
      setOtpSent(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please check your OTP.",
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
          <DialogTitle>Reset Password for {categoryName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={userEmail}
              disabled
              className="bg-muted"
            />
          </div>

          {!otpSent ? (
            <Button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <Button
                onClick={handleVerifyAndReset}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
