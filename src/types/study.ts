export type EnemArea = 'linguagens' | 'humanas' | 'natureza' | 'matematica' | 'redacao';

export const ENEM_AREAS: Record<EnemArea, { label: string; color: string }> = {
  linguagens: { label: 'Linguagens', color: 'bg-enem-linguagens' },
  humanas: { label: 'Humanas', color: 'bg-enem-humanas' },
  natureza: { label: 'Natureza', color: 'bg-enem-natureza' },
  matematica: { label: 'Matemática', color: 'bg-enem-matematica' },
  redacao: { label: 'Redação', color: 'bg-enem-redacao' },
};

// Mapeamento de matérias por área do ENEM
export const SUBJECTS_BY_AREA: Record<EnemArea, string[]> = {
  linguagens: [
    'Português - Gramática', 'Português - Morfologia', 'Português - Sintaxe',
    'Português - Semântica', 'Português - Fonologia', 'Interpretação de Texto',
    'Figuras de Linguagem', 'Funções da Linguagem', 'Variação Linguística',
    'Gêneros Textuais', 'Tipologia Textual',
    'Literatura - Quinhentismo', 'Literatura - Barroco', 'Literatura - Arcadismo',
    'Literatura - Romantismo', 'Literatura - Realismo/Naturalismo',
    'Literatura - Parnasianismo', 'Literatura - Simbolismo',
    'Literatura - Pré-Modernismo', 'Literatura - Modernismo 1ª fase',
    'Literatura - Modernismo 2ª fase', 'Literatura - Modernismo 3ª fase',
    'Literatura - Contemporânea', 'Literatura - Autores Canônicos',
    'Inglês - Interpretação', 'Inglês - Vocabulário', 'Inglês - Gramática',
    'Espanhol - Interpretação', 'Espanhol - Vocabulário',
    'Artes - História da Arte', 'Artes - Música', 'Artes - Teatro',
    'Educação Física - Corpo e Movimento', 'Comunicação e Tecnologias Digitais',
  ],
  humanas: [
    'História Geral - Antiguidade', 'História Geral - Idade Média',
    'História Geral - Idade Moderna', 'História Geral - Idade Contemporânea',
    'História Geral - Revoluções', 'História Geral - Guerras Mundiais',
    'História Geral - Guerra Fria', 'História Geral - Globalização',
    'História do Brasil - Colonização', 'História do Brasil - Império',
    'História do Brasil - República Velha', 'História do Brasil - Era Vargas',
    'História do Brasil - Ditadura Militar', 'História do Brasil - Redemocratização',
    'História do Brasil - Brasil Contemporâneo',
    'Geografia - Cartografia', 'Geografia - Geopolítica',
    'Geografia - Globalização', 'Geografia - Urbanização',
    'Geografia - Meio Ambiente', 'Geografia - Clima e Biomas',
    'Geografia - Questão Agrária', 'Geografia - Indústria',
    'Geografia - População e Demografia', 'Geografia - Recursos Naturais',
    'Geografia - Hidrografia', 'Geografia - Geologia e Relevo',
    'Filosofia - Antiga', 'Filosofia - Medieval', 'Filosofia - Moderna',
    'Filosofia - Contemporânea', 'Filosofia - Ética e Moral',
    'Filosofia - Política', 'Filosofia - Epistemologia',
    'Sociologia - Clássica (Durkheim, Weber, Marx)',
    'Sociologia - Estratificação Social', 'Sociologia - Movimentos Sociais',
    'Sociologia - Cultura e Identidade', 'Sociologia - Cidadania e Direitos',
    'Sociologia - Desigualdade', 'Sociologia - Trabalho',
  ],
  natureza: [
    'Biologia - Citologia', 'Biologia - Genética', 'Biologia - Evolução',
    'Biologia - Ecologia', 'Biologia - Fisiologia Humana',
    'Biologia - Fisiologia Vegetal', 'Biologia - Zoologia',
    'Biologia - Botânica', 'Biologia - Biotecnologia',
    'Biologia - Microbiologia', 'Biologia - Parasitologia',
    'Biologia - Histologia', 'Biologia - Embriologia',
    'Química - Modelos Atômicos', 'Química - Tabela Periódica',
    'Química - Ligações Químicas', 'Química - Funções Inorgânicas',
    'Química - Funções Orgânicas', 'Química - Estequiometria',
    'Química - Soluções', 'Química - Termoquímica',
    'Química - Cinética Química', 'Química - Equilíbrio Químico',
    'Química - Eletroquímica', 'Química - Radioatividade',
    'Química - Reações Orgânicas', 'Química - Polímeros',
    'Física - Cinemática', 'Física - Dinâmica (Leis de Newton)',
    'Física - Energia e Trabalho', 'Física - Hidrostática',
    'Física - Termologia', 'Física - Óptica',
    'Física - Ondas e Acústica', 'Física - Eletricidade',
    'Física - Magnetismo', 'Física - Eletromagnetismo',
    'Física - Física Moderna', 'Física - Gravitação',
  ],
  matematica: [
    'Conjuntos e Operações', 'Funções - 1° Grau', 'Funções - 2° Grau',
    'Funções - Exponencial', 'Funções - Logarítmica',
    'Equações e Inequações', 'PA e PG',
    'Matrizes e Determinantes', 'Sistemas Lineares',
    'Geometria Plana - Áreas e Perímetros', 'Geometria Plana - Triângulos',
    'Geometria Plana - Circunferência', 'Geometria Plana - Polígonos',
    'Geometria Espacial - Prismas', 'Geometria Espacial - Pirâmides',
    'Geometria Espacial - Cilindros e Cones', 'Geometria Espacial - Esferas',
    'Geometria Analítica - Reta', 'Geometria Analítica - Circunferência',
    'Geometria Analítica - Cônicas',
    'Trigonometria - Triângulo Retângulo', 'Trigonometria - Ciclo Trigonométrico',
    'Trigonometria - Funções Trigonométricas',
    'Estatística - Média, Mediana, Moda', 'Estatística - Desvio Padrão',
    'Estatística - Gráficos e Tabelas',
    'Probabilidade', 'Análise Combinatória - Permutação',
    'Análise Combinatória - Combinação', 'Análise Combinatória - Arranjo',
    'Matemática Financeira - Juros Simples', 'Matemática Financeira - Juros Compostos',
    'Matemática Financeira - Porcentagem',
    'Razão e Proporção', 'Regra de Três',
    'Números Complexos', 'Polinômios',
  ],
  redacao: [
    'Dissertação Argumentativa', 'Proposta de Intervenção',
    'Competência 1 - Norma Culta', 'Competência 2 - Compreensão do Tema',
    'Competência 3 - Argumentação', 'Competência 4 - Coesão',
    'Competência 5 - Intervenção', 'Repertório Sociocultural',
    'Conectivos e Operadores Argumentativos', 'Estrutura do Parágrafo',
    'Citações e Referências', 'Temas Contemporâneos',
  ],
};

export type Priority = 'baixa' | 'media' | 'alta';
export type RecurrenceType = 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'none';

export interface KanbanSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanLabel {
  id: string;
  name: string;
  color: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  area: EnemArea;
  priority: Priority;
  dueDate: string;
  column: string;
  createdAt: string;
  subtasks?: KanbanSubtask[];
  tags?: string[];
  labels?: KanbanLabel[];
  coverColor?: string;
  estimatedMinutes?: number;
  trackedMinutes?: number;
  favorite?: boolean;
  archived?: boolean;
  recurrence?: RecurrenceType;
  completedAt?: string;
  history?: { date: string; from: string; to: string }[];
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'aula' | 'revisao' | 'simulado' | 'descanso' | 'prova' | 'tarefa';
  area?: EnemArea;
  description?: string;
  completed?: boolean;
}

// ============= FLASHCARD TYPES (ENHANCED) =============

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

export interface FlashcardReview {
  date: string;
  correct: boolean;
  responseTimeMs?: number;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  area: EnemArea;
  subject: string;
  status: 'new' | 'reviewing' | 'mastered';
  createdAt: string;
  // SRS fields
  difficulty?: FlashcardDifficulty;
  nextReview?: string;
  interval?: number; // days until next review
  easeFactor?: number; // SM-2 ease factor (default 2.5)
  reviewCount?: number;
  reviews?: FlashcardReview[];
  // Organization
  deckId?: string;
  tags?: string[];
  favorite?: boolean;
  archived?: boolean;
  // Content
  hint?: string;
  imageUrl?: string;
  sourceNoteId?: string;
}

// SRS Algorithm (SM-2 inspired)
export function calculateNextReview(card: Flashcard, quality: number): { interval: number; easeFactor: number; nextReview: string } {
  const ease = card.easeFactor ?? 2.5;
  const count = (card.reviewCount ?? 0) + 1;
  let interval: number;
  let newEase: number;

  if (quality < 3) {
    // Failed: reset
    interval = 1;
    newEase = Math.max(1.3, ease - 0.2);
  } else {
    if (count === 1) interval = 1;
    else if (count === 2) interval = 3;
    else interval = Math.round((card.interval ?? 1) * ease);
    newEase = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return { interval, easeFactor: newEase, nextReview: next.toISOString() };
}

export function isDueForReview(card: Flashcard): boolean {
  if (card.status === 'mastered' && card.archived) return false;
  if (!card.nextReview) return true;
  return new Date(card.nextReview) <= new Date();
}

// ============= NOTE TYPES (ENHANCED) =============

export interface NoteTag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  area: EnemArea;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  tags?: string[];
  favorite?: boolean;
  folder?: string;
  linkedFlashcards?: string[];
  template?: string;
  versions?: { content: string; savedAt: string }[];
}

export type TemplateCategory = 'estudo' | 'academico' | 'profissional' | 'planilha';

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; icon: string }> = {
  estudo: { label: 'Estudo', icon: '📚' },
  academico: { label: 'Acadêmico (ABNT)', icon: '🎓' },
  profissional: { label: 'Profissional', icon: '💼' },
  planilha: { label: 'Planilha / Tabela', icon: '📊' },
};

export const NOTE_TEMPLATES: { id: string; name: string; icon: string; category: TemplateCategory; content: string }[] = [
  // === ESTUDO ===
  { id: 'resumo', name: 'Resumo', icon: '📝', category: 'estudo', content: '# Título do Resumo\n\n## Conceitos-chave\n- \n\n## Detalhes importantes\n- \n\n## Exemplos\n- \n\n## Conclusão\n' },
  { id: 'fichamento', name: 'Fichamento', icon: '📋', category: 'estudo', content: '# Fichamento\n\n**Fonte:** \n**Autor:** \n**Página:** \n\n## Citação\n> \n\n## Comentário\n\n## Palavras-chave\n' },
  { id: 'mapa-mental', name: 'Mapa Mental', icon: '🧠', category: 'estudo', content: '# Tema Central\n\n## Ramo 1\n- Sub-tópico\n  - Detalhe\n\n## Ramo 2\n- Sub-tópico\n  - Detalhe\n\n## Ramo 3\n- Sub-tópico\n  - Detalhe\n\n## Conexões\n- Ramo 1 ↔ Ramo 2: \n' },
  { id: 'cornell', name: 'Cornell', icon: '📐', category: 'estudo', content: '# Notas Cornell\n\n## Perguntas / Palavras-chave\n- \n\n## Anotações\n\n\n## Resumo\n\n' },
  { id: 'causa-efeito', name: 'Causa e Efeito', icon: '🔗', category: 'estudo', content: '# Análise Causa e Efeito\n\n## Fenômeno / Evento\n\n\n## Causas\n1. \n2. \n\n## Efeitos / Consequências\n1. \n2. \n\n## Relações\n- Causa 1 → Efeito: \n' },
  { id: 'flashcard-note', name: 'Nota para Flashcards', icon: '🃏', category: 'estudo', content: '# Tema\n\n## Pergunta 1\n**R:** \n\n## Pergunta 2\n**R:** \n\n## Pergunta 3\n**R:** \n\n## Pergunta 4\n**R:** \n\n## Pergunta 5\n**R:** \n' },

  // === ACADÊMICO (ABNT) ===
  { id: 'abnt-artigo', name: 'Artigo Científico (ABNT)', icon: '🎓', category: 'academico', content: `# TÍTULO DO ARTIGO EM CAIXA ALTA

**Autor(a):** Nome Completo  
**Instituição:** Nome da Universidade  
**E-mail:** email@instituicao.edu.br  
**Orientador(a):** Prof(a). Dr(a). Nome  

---

## RESUMO

Texto do resumo com no máximo 250 palavras. Deve conter objetivo, metodologia, resultados e conclusões.

**Palavras-chave:** Palavra 1. Palavra 2. Palavra 3. Palavra 4. Palavra 5.

---

## ABSTRACT

English version of the abstract.

**Keywords:** Word 1. Word 2. Word 3. Word 4. Word 5.

---

## 1 INTRODUÇÃO

Contextualização do tema, problema de pesquisa, justificativa e objetivos.

## 2 REFERENCIAL TEÓRICO

### 2.1 Subtópico

Revisão da literatura com citações (AUTOR, ano, p. X).

### 2.2 Subtópico

Continuação do referencial.

## 3 METODOLOGIA

Tipo de pesquisa, abordagem, população/amostra, instrumentos de coleta e análise de dados.

## 4 RESULTADOS E DISCUSSÃO

Apresentação e análise dos dados coletados.

## 5 CONSIDERAÇÕES FINAIS

Retomada dos objetivos, principais achados e sugestões para pesquisas futuras.

## REFERÊNCIAS

SOBRENOME, Nome. **Título da obra**. Edição. Cidade: Editora, ano.

SOBRENOME, Nome. Título do artigo. **Nome da Revista**, v. X, n. X, p. XX-XX, ano.
` },
  { id: 'abnt-monografia', name: 'Monografia / TCC (ABNT)', icon: '📖', category: 'academico', content: `# TÍTULO DA MONOGRAFIA

---

## FOLHA DE ROSTO

**Título:** TÍTULO DA MONOGRAFIA  
**Autor(a):** Nome Completo  
**Orientador(a):** Prof(a). Dr(a). Nome  
**Instituição:** Nome da Universidade  
**Curso:** Nome do Curso  
**Ano:** ${new Date().getFullYear()}

Trabalho de Conclusão de Curso apresentado como requisito parcial para obtenção do grau de Bacharel/Licenciado em [Curso], pela [Universidade].

---

## DEDICATÓRIA

*Texto opcional de dedicatória.*

---

## AGRADECIMENTOS

Agradeço a...

---

## EPÍGRAFE

> "Citação inspiradora" (Autor, ano)

---

## RESUMO

Resumo de até 500 palavras contendo contextualização, objetivo, metodologia, resultados e conclusão.

**Palavras-chave:** Palavra 1. Palavra 2. Palavra 3.

---

## ABSTRACT

English abstract.

**Keywords:** Word 1. Word 2. Word 3.

---

## LISTA DE FIGURAS

- Figura 1 — Descrição .............. p. XX
- Figura 2 — Descrição .............. p. XX

## LISTA DE TABELAS

- Tabela 1 — Descrição .............. p. XX

## LISTA DE ABREVIATURAS

- ABNT — Associação Brasileira de Normas Técnicas
- TCC — Trabalho de Conclusão de Curso

---

## SUMÁRIO

1. INTRODUÇÃO
2. REFERENCIAL TEÓRICO
3. METODOLOGIA
4. RESULTADOS E DISCUSSÃO
5. CONSIDERAÇÕES FINAIS
6. REFERÊNCIAS
7. APÊNDICES
8. ANEXOS

---

## 1 INTRODUÇÃO

### 1.1 Contextualização
### 1.2 Problema de Pesquisa
### 1.3 Objetivos
#### 1.3.1 Objetivo Geral
#### 1.3.2 Objetivos Específicos
### 1.4 Justificativa
### 1.5 Estrutura do Trabalho

## 2 REFERENCIAL TEÓRICO

### 2.1 Subtópico
### 2.2 Subtópico

## 3 METODOLOGIA

### 3.1 Tipo de Pesquisa
### 3.2 Abordagem
### 3.3 População e Amostra
### 3.4 Instrumentos de Coleta de Dados
### 3.5 Análise de Dados

## 4 RESULTADOS E DISCUSSÃO

### 4.1 Apresentação dos Dados
### 4.2 Análise e Discussão

## 5 CONSIDERAÇÕES FINAIS

## REFERÊNCIAS

SOBRENOME, Nome. **Título**. Edição. Cidade: Editora, ano.

## APÊNDICES

## ANEXOS
` },
  { id: 'abnt-resenha', name: 'Resenha Crítica (ABNT)', icon: '📰', category: 'academico', content: `# RESENHA CRÍTICA

**Obra resenhada:** SOBRENOME, Nome. **Título da Obra**. Edição. Cidade: Editora, ano. XX p.

**Resenhista:** Nome Completo  
**Instituição:** Nome da Universidade  
**Disciplina:** Nome da Disciplina  

---

## 1 APRESENTAÇÃO DA OBRA

Breve apresentação do autor e da obra (contexto de publicação, tema central).

## 2 SÍNTESE DO CONTEÚDO

Resumo dos principais pontos abordados na obra, capítulo por capítulo ou por temas.

## 3 ANÁLISE CRÍTICA

Avaliação pessoal fundamentada: pontos fortes, pontos fracos, contribuições para a área, comparação com outras obras.

## 4 CONSIDERAÇÕES FINAIS

Recomendação (ou não) da obra e para qual público.

## REFERÊNCIAS

SOBRENOME, Nome. **Título da Obra Resenhada**. Edição. Cidade: Editora, ano.
` },
  { id: 'abnt-relatorio', name: 'Relatório Técnico (ABNT)', icon: '📑', category: 'academico', content: `# RELATÓRIO TÉCNICO

**Título:** Relatório de [atividade/projeto]  
**Autor(a):** Nome Completo  
**Instituição:** Nome  
**Data:** ${new Date().toLocaleDateString('pt-BR')}  

---

## 1 OBJETIVO

Descrever o objetivo deste relatório.

## 2 INTRODUÇÃO

Contextualização da atividade ou projeto relatado.

## 3 DESENVOLVIMENTO

### 3.1 Materiais e Métodos

Descrição dos materiais utilizados e métodos aplicados.

### 3.2 Procedimentos Realizados

Descrição detalhada das etapas executadas.

### 3.3 Resultados Obtidos

| Parâmetro | Valor Obtido | Valor Esperado | Status |
|-----------|-------------|----------------|--------|
|           |             |                |        |
|           |             |                |        |

### 3.4 Discussão

Análise dos resultados obtidos em comparação com o esperado.

## 4 CONCLUSÃO

Síntese dos principais achados e recomendações.

## REFERÊNCIAS

## ANEXOS
` },
  { id: 'abnt-projeto', name: 'Projeto de Pesquisa (ABNT)', icon: '🔬', category: 'academico', content: `# PROJETO DE PESQUISA

**Título:** Título do Projeto  
**Pesquisador(a):** Nome  
**Orientador(a):** Prof(a). Dr(a). Nome  
**Linha de Pesquisa:** Nome da Linha  
**Instituição:** Nome  

---

## 1 TEMA E DELIMITAÇÃO

## 2 PROBLEMA DE PESQUISA

## 3 HIPÓTESE(S)

## 4 OBJETIVOS

### 4.1 Objetivo Geral
### 4.2 Objetivos Específicos

## 5 JUSTIFICATIVA

## 6 REFERENCIAL TEÓRICO

## 7 METODOLOGIA

### 7.1 Tipo de Pesquisa
### 7.2 Universo e Amostra
### 7.3 Instrumentos de Coleta
### 7.4 Análise dos Dados

## 8 CRONOGRAMA

| Etapa | Mês 1 | Mês 2 | Mês 3 | Mês 4 | Mês 5 | Mês 6 |
|-------|-------|-------|-------|-------|-------|-------|
| Revisão bibliográfica | ✅ | ✅ | | | | |
| Coleta de dados | | ✅ | ✅ | | | |
| Análise | | | ✅ | ✅ | | |
| Redação | | | | ✅ | ✅ | |
| Revisão final | | | | | ✅ | ✅ |

## 9 ORÇAMENTO (se aplicável)

| Item | Quantidade | Valor Unit. | Total |
|------|-----------|-------------|-------|
|      |           |             |       |

## REFERÊNCIAS
` },
  { id: 'redacao-enem', name: 'Redação ENEM', icon: '✍️', category: 'academico', content: `# Redação — Tema: [TEMA]

---

## 📋 Planejamento

**Tese:** 

**Argumento 1:** 
**Repertório 1:** 

**Argumento 2:** 
**Repertório 2:** 

**Proposta de Intervenção:**
- **Agente:** 
- **Ação:** 
- **Meio:** 
- **Finalidade:** 
- **Detalhamento:** 

---

## ✍️ Texto

### Introdução
[Contextualização + Tese]



### Desenvolvimento 1
[Tópico frasal + Argumento + Repertório + Análise]



### Desenvolvimento 2
[Tópico frasal + Argumento + Repertório + Análise]



### Conclusão
[Retomada da tese + Proposta de intervenção completa (agente + ação + meio + finalidade + detalhamento)]


` },

  // === PROFISSIONAL ===
  { id: 'carta-formal', name: 'Carta Formal', icon: '✉️', category: 'profissional', content: `# CARTA FORMAL

**Local e data:** ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}

**Destinatário:**  
Ilmo(a). Sr(a). [Nome]  
[Cargo]  
[Empresa/Instituição]  
[Endereço]  

---

**Assunto:** [Assunto da carta]

Prezado(a) Senhor(a),

[Primeiro parágrafo: apresentação e motivo da carta]

[Segundo parágrafo: desenvolvimento do assunto]

[Terceiro parágrafo: conclusão e expectativas]

Atenciosamente,

**[Seu Nome]**  
[Seu Cargo/Função]  
[Contato]
` },
  { id: 'ata-reuniao', name: 'Ata de Reunião', icon: '📄', category: 'profissional', content: `# ATA DE REUNIÃO

**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Horário:** ___:___ às ___:___  
**Local:** [Local/Plataforma]  
**Participantes:**  
- Nome — Cargo  
- Nome — Cargo  
- Nome — Cargo  

---

## PAUTA

1. [Item 1]
2. [Item 2]
3. [Item 3]

## DELIBERAÇÕES

### 1. [Item 1]
Discussão e decisão tomada.

### 2. [Item 2]
Discussão e decisão tomada.

## ENCAMINHAMENTOS

| Ação | Responsável | Prazo |
|------|------------|-------|
|      |            |       |
|      |            |       |

## PRÓXIMA REUNIÃO

**Data:** ___/___/___  
**Horário:** ___:___  
**Pauta prevista:** 

---

*Nada mais havendo a tratar, encerrou-se a reunião.*
` },
  { id: 'curriculo', name: 'Currículo / CV', icon: '👤', category: 'profissional', content: `# NOME COMPLETO

📧 email@exemplo.com | 📱 (XX) XXXXX-XXXX | 📍 Cidade, Estado  
🔗 linkedin.com/in/seuperfil | 🌐 seuportfolio.com

---

## OBJETIVO PROFISSIONAL

Breve descrição do objetivo profissional em 1-2 linhas.

## FORMAÇÃO ACADÊMICA

**Curso** — Instituição  
*Período: Ano - Ano*

**Curso** — Instituição  
*Período: Ano - Ano*

## EXPERIÊNCIA PROFISSIONAL

### Cargo — Empresa
*Período: Mês/Ano - Mês/Ano*
- Atividade 1
- Atividade 2
- Resultado alcançado

### Cargo — Empresa
*Período: Mês/Ano - Mês/Ano*
- Atividade 1
- Atividade 2

## HABILIDADES

| Habilidade | Nível |
|-----------|-------|
|           | ⭐⭐⭐⭐⭐ |
|           | ⭐⭐⭐⭐ |
|           | ⭐⭐⭐ |

## IDIOMAS

| Idioma | Nível |
|--------|-------|
|        | Nativo |
|        | Avançado |

## CERTIFICAÇÕES

- Certificação — Instituição (Ano)

## ATIVIDADES COMPLEMENTARES

- Voluntariado, projetos, etc.
` },
  { id: 'proposta-comercial', name: 'Proposta Comercial', icon: '💰', category: 'profissional', content: `# PROPOSTA COMERCIAL

**De:** [Sua Empresa]  
**Para:** [Empresa Cliente]  
**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Validade:** 30 dias  

---

## 1. APRESENTAÇÃO

Breve apresentação da empresa e experiência.

## 2. ESCOPO DO PROJETO

### 2.1 Objetivo
### 2.2 Entregas

- [ ] Entrega 1
- [ ] Entrega 2
- [ ] Entrega 3

## 3. CRONOGRAMA

| Fase | Descrição | Prazo |
|------|----------|-------|
| 1    |          | X dias |
| 2    |          | X dias |
| 3    |          | X dias |

## 4. INVESTIMENTO

| Item | Valor |
|------|-------|
|      | R$ |
|      | R$ |
| **Total** | **R$** |

**Condições de pagamento:** 

## 5. TERMOS E CONDIÇÕES

## 6. CONTATO

**Nome** — Cargo  
📧 email | 📱 telefone
` },

  // === PLANILHA / TABELA ===
  { id: 'planilha-orcamento', name: 'Orçamento / Finanças', icon: '💵', category: 'planilha', content: `# 💵 ORÇAMENTO

**Período:** Mês/Ano  

## RECEITAS

| Descrição | Valor (R$) | Status |
|-----------|-----------|--------|
| Salário   |           | ✅ Recebido |
| Freelance |           | ⏳ Pendente |
| Outros    |           |        |
| **Total Receitas** | **R$** | |

## DESPESAS FIXAS

| Descrição | Valor (R$) | Vencimento | Pago |
|-----------|-----------|------------|------|
| Aluguel   |           |            | ☐ |
| Luz       |           |            | ☐ |
| Água      |           |            | ☐ |
| Internet  |           |            | ☐ |
| Transporte|           |            | ☐ |
| **Total Fixas** | **R$** | | |

## DESPESAS VARIÁVEIS

| Descrição | Valor (R$) | Categoria |
|-----------|-----------|-----------|
|           |           |           |
|           |           |           |
| **Total Variáveis** | **R$** | |

## RESUMO

| Item | Valor |
|------|-------|
| Total Receitas | R$ |
| Total Despesas | R$ |
| **Saldo** | **R$** |
` },
  { id: 'planilha-notas', name: 'Planilha de Notas/Conceitos', icon: '📊', category: 'planilha', content: `# 📊 BOLETIM / PLANILHA DE NOTAS

**Aluno(a):** Nome  
**Curso/Série:** 
**Período:** Semestre/Ano

## DISCIPLINAS

| Disciplina | Nota 1 | Nota 2 | Nota 3 | Nota 4 | Média | Status |
|-----------|--------|--------|--------|--------|-------|--------|
|           |        |        |        |        |       | ✅/❌ |
|           |        |        |        |        |       | ✅/❌ |
|           |        |        |        |        |       | ✅/❌ |
|           |        |        |        |        |       | ✅/❌ |
|           |        |        |        |        |       | ✅/❌ |
|           |        |        |        |        |       | ✅/❌ |

## RESUMO

| Métrica | Valor |
|---------|-------|
| Média Geral | |
| Maior Nota | |
| Menor Nota | |
| Aprovações | |
| Reprovações | |
` },
  { id: 'planilha-controle', name: 'Controle de Atividades', icon: '✅', category: 'planilha', content: `# ✅ CONTROLE DE ATIVIDADES

**Projeto/Disciplina:** 
**Responsável:** 
**Período:** 

## ATIVIDADES

| # | Atividade | Responsável | Início | Prazo | Status | Prioridade |
|---|----------|------------|--------|-------|--------|------------|
| 1 |          |            |        |       | 🔴 A fazer | 🔴 Alta |
| 2 |          |            |        |       | 🟡 Em andamento | 🟡 Média |
| 3 |          |            |        |       | 🟢 Concluído | 🟢 Baixa |
| 4 |          |            |        |       |        |            |
| 5 |          |            |        |       |        |            |

## LEGENDA

| Status | Prioridade |
|--------|-----------|
| 🔴 A fazer | 🔴 Alta / Urgente |
| 🟡 Em andamento | 🟡 Média |
| 🟢 Concluído | 🟢 Baixa |
| ⚪ Cancelado | |
` },
  { id: 'planilha-horarios', name: 'Grade de Horários', icon: '📅', category: 'planilha', content: `# 📅 GRADE DE HORÁRIOS

**Período:** Semestre/Ano

| Horário | Segunda | Terça | Quarta | Quinta | Sexta | Sábado |
|---------|---------|-------|--------|--------|-------|--------|
| 07:00-08:00 | | | | | | |
| 08:00-09:00 | | | | | | |
| 09:00-10:00 | | | | | | |
| 10:00-11:00 | | | | | | |
| 11:00-12:00 | | | | | | |
| 12:00-13:00 | *Almoço* | *Almoço* | *Almoço* | *Almoço* | *Almoço* | |
| 13:00-14:00 | | | | | | |
| 14:00-15:00 | | | | | | |
| 15:00-16:00 | | | | | | |
| 16:00-17:00 | | | | | | |
| 17:00-18:00 | | | | | | |
| 18:00-19:00 | | | | | | |
` },
];

// ============= EXISTING TYPES =============

export interface StudySession {
  id: string;
  area: EnemArea;
  duration: number;
  date: string;
  notes?: string;
}

export interface WeeklyGoal {
  id: string;
  area: EnemArea;
  targetHours: number;
  weekStart: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  reactions?: Record<string, number>;
  pinned?: boolean;
  timestamp?: string;
  sentiment?: string;
}

export type MentorMode = 'livre' | 'aula' | 'socratico' | 'redacao' | 'debate' | 'revisao' | 'exercicios' | 'entrevista' | 'brainstorm';

export const MENTOR_MODES: Record<MentorMode, { label: string; icon: string; desc: string }> = {
  livre: { label: 'Livre', icon: '💬', desc: 'Conversa aberta sobre qualquer tema' },
  aula: { label: 'Aula', icon: '📚', desc: 'Teoria → Exemplo → Exercício → Resumo' },
  socratico: { label: 'Socrático', icon: '🤔', desc: 'Mentor só faz perguntas para guiar' },
  redacao: { label: 'Redação', icon: '✍️', desc: 'Correção por competências ENEM' },
  debate: { label: 'Debate', icon: '🎭', desc: 'Mentor defende posição contrária' },
  revisao: { label: 'Revisão', icon: '🧠', desc: 'Quiz de revisão espaçada' },
  exercicios: { label: 'Exercícios', icon: '🎯', desc: 'Resolução guiada passo a passo' },
  entrevista: { label: 'Entrevista', icon: '🎤', desc: 'Simula entrevista de vestibular/emprego' },
  brainstorm: { label: 'Brainstorm', icon: '💡', desc: 'Construir argumentos para redação' },
};

export interface StudentContext {
  studyStreak: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  pomodorosDone: number;
  flashcardsTotal: number;
  flashcardsMastered: number;
  simuladosDone: number;
  simuladoAvgScore?: number;
  weakAreas: string[];
  strongAreas: string[];
  notesCount: number;
  tasksOverdue: number;
  tasksPending: number;
  recentStudyAreas: string[];
  neglectedAreas: string[];
  goalsProgress: { title: string; progress: number }[];
  achievements: string[];
}
