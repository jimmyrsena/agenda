
CREATE TABLE public.mentor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT 'Usuário',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

-- Public access since there's no auth
CREATE POLICY "Allow all operations on mentor_conversations"
  ON public.mentor_conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);
