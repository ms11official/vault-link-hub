import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { callAI } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

interface AIActionButtonProps {
  action: string;
  content: string;
  label: string;
  onResult: (result: string) => void;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "icon" | "default";
  className?: string;
}

const AIActionButton = ({ action, content, label, onResult, variant = "ghost", size = "sm", className }: AIActionButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    const { content: result, error } = await callAI({ action: action as any, content });
    if (error) {
      toast({ title: "AI Error", description: error, variant: "destructive" });
    } else if (result) {
      onResult(result);
    }
    setLoading(false);
  };

  return (
    <Button variant={variant} size={size} onClick={handleClick} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
      {label}
    </Button>
  );
};

export default AIActionButton;
