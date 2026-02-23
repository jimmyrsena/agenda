
-- Notes table for cloud persistence
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT 'linguagens',
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT false,
  folder TEXT DEFAULT '',
  icon TEXT DEFAULT '📝',
  cover_color TEXT DEFAULT NULL,
  word_count INTEGER DEFAULT 0,
  user_name TEXT NOT NULL DEFAULT 'Usuário',
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth in this app)
CREATE POLICY "Allow all operations on notes"
  ON public.notes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast filtering
CREATE INDEX idx_notes_area ON public.notes(area);
CREATE INDEX idx_notes_favorite ON public.notes(favorite) WHERE favorite = true;
CREATE INDEX idx_notes_deleted_at ON public.notes(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_notes_folder ON public.notes(folder) WHERE folder != '';

-- Storage bucket for note attachments (images, files)
INSERT INTO storage.buckets (id, name, public) VALUES ('note-attachments', 'note-attachments', true);

-- Storage policies
CREATE POLICY "Anyone can view note attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'note-attachments');

CREATE POLICY "Anyone can upload note attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'note-attachments');

CREATE POLICY "Anyone can update note attachments"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'note-attachments');

CREATE POLICY "Anyone can delete note attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'note-attachments');
