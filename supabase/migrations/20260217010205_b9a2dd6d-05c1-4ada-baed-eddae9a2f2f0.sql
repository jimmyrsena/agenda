
-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create knowledge_rooms table
CREATE TABLE public.knowledge_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL DEFAULT 'geral',
  icon TEXT DEFAULT '📚',
  cover_color TEXT DEFAULT 'from-primary to-accent',
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on knowledge_rooms"
  ON public.knowledge_rooms FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_knowledge_rooms_updated_at
  BEFORE UPDATE ON public.knowledge_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.knowledge_rooms (title, description, area, icon, cover_color, topics) VALUES
('Direito Administrativo', 'Princípios, licitações (Lei 14.133/2021), atos administrativos, contratos e servidores públicos.', 'direito', '⚖️', 'from-blue-600 to-indigo-700', '["Princípios da Administração Pública","Atos Administrativos","Licitações e Contratos","Servidores Públicos","Responsabilidade Civil do Estado","Controle da Administração"]'::jsonb),
('Direito Constitucional', 'Direitos fundamentais, organização do Estado, controle de constitucionalidade e poderes.', 'direito', '📜', 'from-emerald-600 to-teal-700', '["Direitos e Garantias Fundamentais","Organização do Estado","Poder Legislativo","Poder Executivo","Poder Judiciário","Controle de Constitucionalidade"]'::jsonb),
('Matemática Financeira', 'Juros simples, compostos, descontos, amortização e análise de investimentos.', 'exatas', '📊', 'from-amber-500 to-orange-600', '["Juros Simples","Juros Compostos","Descontos","Amortização","Porcentagem","Taxas Equivalentes"]'::jsonb),
('Português e Redação', 'Gramática, interpretação de texto, redação oficial e discursiva para concursos.', 'linguagens', '✍️', 'from-rose-500 to-pink-600', '["Gramática","Interpretação de Texto","Redação Oficial","Redação Discursiva","Figuras de Linguagem","Coesão e Coerência"]'::jsonb),
('Raciocínio Lógico', 'Proposições, tabelas-verdade, sequências lógicas, diagramas e análise combinatória.', 'exatas', '🧠', 'from-violet-500 to-purple-600', '["Proposições Lógicas","Tabelas-Verdade","Sequências e Padrões","Diagramas Lógicos","Análise Combinatória","Probabilidade"]'::jsonb),
('Informática', 'Sistemas operacionais, redes, segurança, pacote Office e conceitos de TI para concursos.', 'tecnologia', '💻', 'from-cyan-500 to-blue-600', '["Sistemas Operacionais","Redes de Computadores","Segurança da Informação","Pacote Office","Navegadores e Internet","Hardware e Software"]'::jsonb);
