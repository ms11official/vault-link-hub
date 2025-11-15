-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments on their items" 
ON public.comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.items 
    WHERE items.id = comments.item_id 
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments on their items" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.items 
    WHERE items.id = item_id 
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage_usage table
CREATE TABLE public.storage_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  limit_bytes BIGINT NOT NULL DEFAULT 52428800, -- 50MB default
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for storage_usage
ALTER TABLE public.storage_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_usage
CREATE POLICY "Users can view their own storage usage" 
ON public.storage_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage usage" 
ON public.storage_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for comments updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for storage_usage updated_at
CREATE TRIGGER update_storage_usage_updated_at
BEFORE UPDATE ON public.storage_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_comments_item_id ON public.comments(item_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_storage_usage_user_id ON public.storage_usage(user_id);