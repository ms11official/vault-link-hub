import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, LogIn, UserPlus, Sparkles } from "lucide-react";

const AuthSuggestionBanner = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      // Show banner only if not logged in and not dismissed recently
      if (!session) {
        const dismissed = localStorage.getItem("auth-banner-dismissed");
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        
        if (hoursSinceDismissed > 24) {
          setTimeout(() => setShow(true), 3000);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session) setShow(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("auth-banner-dismissed", Date.now().toString());
  };

  if (isLoggedIn !== false || !show) return null;

  return (
    <Card className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[500px] z-50 shadow-xl border-primary/30 bg-gradient-to-r from-background to-primary/5 animate-in slide-in-from-top-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Unlock Full Features</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to save your data, sync across devices, and access premium features.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => navigate("/auth")} className="gap-1">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")} className="gap-1">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthSuggestionBanner;
