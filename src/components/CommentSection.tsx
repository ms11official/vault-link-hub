import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentSectionProps {
  itemId: string;
}

const CommentSection = ({ itemId }: CommentSectionProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [itemId, showComments]);

  const fetchComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    setComments(data || []);
    setLoading(false);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("comments").insert({
      item_id: itemId,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Comment added",
    });

    setNewComment("");
    fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Comment deleted",
    });

    fetchComments();
  };

  return (
    <div className="mt-4 space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="w-full justify-start"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {showComments ? "Hide" : "Show"} Comments ({comments.length})
      </Button>

      {showComments && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[60px]"
            />
            <Button onClick={addComment} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteComment(comment.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;