import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt = "";
    let systemPrompt = "Você é um assistente educacional especializado. Retorne APENAS JSON válido, sem markdown.";

    if (type === "study-plan") {
      const { tasks, sessions, goals } = data;
      prompt = `Gere um plano de estudos semanal para um estudante do ensino médio preparando para o ENEM.

CONTEXTO:
- Tarefas pendentes: ${JSON.stringify(tasks || [])}
- Sessões de estudo recentes: ${JSON.stringify(sessions || [])}  
- Metas semanais: ${JSON.stringify(goals || [])}

Crie um plano de segunda a sábado com blocos de estudo de 1-2 horas cada, respeitando pausas.
Priorize matérias com tarefas atrasadas ou menos estudadas.

Retorne APENAS JSON:
{
  "plan": [
    {
      "day": "Segunda",
      "blocks": [
        { "time": "08:00-09:30", "area": "matematica", "subject": "Funções", "activity": "Resolver exercícios de funções do 2° grau", "priority": "alta" },
        { "time": "10:00-11:30", "area": "linguagens", "subject": "Redação", "activity": "Praticar dissertação argumentativa", "priority": "media" }
      ]
    }
  ],
  "tips": ["Dica 1", "Dica 2"]
}`;
    } else if (type === "summarize-notes") {
      const { notes } = data;
      prompt = `Transforme estas anotações de estudo em flashcards de revisão.

ANOTAÇÕES:
${notes.map((n: any) => `### ${n.title} (${n.area})\n${n.content}`).join('\n\n')}

Para cada anotação, extraia os conceitos-chave e crie flashcards com pergunta e resposta.

Retorne APENAS JSON:
{
  "flashcards": [
    {
      "question": "Pergunta sobre o conceito",
      "answer": "Resposta concisa e clara",
      "area": "area_enem",
      "subject": "Assunto específico"
    }
  ]
}

Áreas válidas: linguagens, humanas, natureza, matematica, redacao`;
    } else if (type === "generate-room") {
      const { title, description, area } = data;
      systemPrompt = `Você é um especialista em educação e curadoria de conteúdo. Pesquise e gere informações robustas sobre o tema solicitado. Retorne APENAS JSON válido, sem markdown.`;
      prompt = `Crie uma sala de conhecimento completa e robusta sobre o tema: "${title}"${description ? ` (${description})` : ''}.
Área: ${area || 'geral'}.

Pesquise profundamente e gere:
1. Uma descrição rica e detalhada (2-3 frases) sobre o tema
2. Uma lista de 15 a 25 tópicos essenciais e abrangentes, organizados do básico ao avançado
3. Cada tópico deve ser específico e ensinável (não genérico)

Exemplos de bons tópicos: "Princípio da Legalidade", "Lei de Ohm e Circuitos", "Concordância Verbal e Nominal"
Exemplos de tópicos ruins: "Introdução", "Conceitos", "Outros"

Retorne APENAS JSON:
{
  "description": "Descrição rica e informativa do tema",
  "topics": ["Tópico 1", "Tópico 2", "..."]
}`;
    } else if (type === "generate-flashcards") {
      const { topic, area, count, sourceText } = data;
      prompt = `Gere ${count || 5} flashcards de estudo sobre o tema: "${topic}" na área: ${area || 'geral'}.
${sourceText ? `\nTexto de referência:\n${sourceText.slice(0, 3000)}` : ''}

Cada flashcard deve ter:
- Uma pergunta clara e objetiva
- Uma resposta concisa mas completa
- O assunto específico dentro do tema

Retorne APENAS JSON:
{
  "flashcards": [
    {
      "question": "Pergunta objetiva",
      "answer": "Resposta clara e concisa",
      "area": "${area || 'linguagens'}",
      "subject": "Assunto específico"
    }
  ]
}

Áreas válidas: linguagens, humanas, natureza, matematica, redacao`;
    } else if (type === "note-ai-action") {
      const { action, title, content, area, chatQuestion, chatHistory } = data;
      const actionPrompts: Record<string, string> = {
        summarize: `Resuma a seguinte nota de estudo em 3 níveis:\n1. Ultra-curto (1 frase)\n2. Médio (3-4 frases)\n3. Detalhado (1 parágrafo)\n\nFormato:\n**Ultra-curto:** ...\n**Médio:** ...\n**Detalhado:** ...`,
        questions: `Gere 5 perguntas estilo ENEM baseadas nesta nota. Para cada questão, forneça 4 alternativas (A-D) e indique a correta com explicação.\n\nFormato:\n**Questão 1:**\n(texto da questão)\n\nA) ...\nB) ...\nC) ...\nD) ...\n\n**Gabarito:** Letra X — Explicação breve.`,
        explain: `Explique o conteúdo desta nota como se eu tivesse 5 anos de idade. Use analogias simples, exemplos do cotidiano e linguagem acessível.`,
        expand: `Aprofunde e expanda o conteúdo desta nota. Adicione informações relevantes, exemplos, conexões com outros temas e detalhes que estão faltando. Mantenha o formato organizado.`,
        simplify: `Reescreva o conteúdo desta nota de forma mais simples e clara. Remova jargões desnecessários, use frases curtas e organize melhor as ideias.`,
        formalize: `Reescreva o conteúdo desta nota em tom acadêmico formal. Use linguagem técnica apropriada, estrutura argumentativa clara, citações quando relevante e formatação acadêmica. Mantenha a precisão do conteúdo.`,
        correct: `Corrija todos os erros gramaticais, ortográficos e de pontuação desta nota. Liste cada correção feita no formato:\n\n**Correção 1:** "erro" → "correção" (explicação)\n\nDepois, mostre o texto corrigido completo.`,
        gaps: `Analise esta nota e identifique lacunas de conteúdo — tópicos que deveriam ser abordados mas não foram. Para cada lacuna:\n\n**Lacuna 1:** Tema que falta\n**Por que é importante:** Explicação breve\n**Sugestão:** O que adicionar`,
        exercises: `Gere uma lista de 5 exercícios práticos baseados no conteúdo desta nota. Inclua exercícios de diferentes níveis (fácil, médio, difícil). Para cada exercício:\n\n**Exercício 1:** (enunciado)\n**Nível:** Fácil/Médio/Difícil\n**Resposta:** ...`,
        redacao: `Com base no conteúdo desta nota, gere um rascunho de redação estilo ENEM (dissertativa-argumentativa). Estruture em:\n\n**Tema proposto:** ...\n\n**Introdução** (contextualização + tese)\n\n**Desenvolvimento 1** (argumento + repertório)\n\n**Desenvolvimento 2** (argumento + repertório)\n\n**Conclusão** (proposta de intervenção com agente, ação, meio, finalidade e detalhamento)`,
        translate: `Traduza o conteúdo desta nota para inglês. Mantenha a formatação original (markdown). Após a tradução, liste 10 termos técnicos importantes com tradução e explicação.`,
        chat: `Contexto da nota "${title}" (${area}):\n${content}\n\nHistórico do chat:\n${(chatHistory || []).map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nPergunta do aluno: ${chatQuestion}\n\nResponda de forma clara e didática, usando o conteúdo da nota como referência. Se a pergunta não estiver relacionada à nota, responda normalmente mas mencione a relação.`,
        spellcheck: `Verifique o texto abaixo e encontre TODOS os erros de ortografia, gramática e pontuação em português brasileiro. Para cada erro encontrado, use EXATAMENTE este formato em uma linha:\n"palavra errada" → "correção" (explicação breve)\n\nSe não houver erros, responda: "Nenhum erro encontrado."\n\nTexto para verificar:\n${content}`,
        'rewrite-formal': `Reescreva o texto abaixo em tom formal e acadêmico. Mantenha o significado mas use linguagem técnica e profissional. Retorne APENAS o texto reescrito, sem explicações:\n\n${content}`,
        'rewrite-informal': `Reescreva o texto abaixo em tom informal e acessível, como se estivesse explicando para um amigo. Retorne APENAS o texto reescrito, sem explicações:\n\n${content}`,
        'rewrite-concise': `Reescreva o texto abaixo de forma mais concisa e direta, removendo redundâncias e mantendo apenas o essencial. Reduza o tamanho em pelo menos 30%. Retorne APENAS o texto reescrito, sem explicações:\n\n${content}`,
        'rewrite-creative': `Reescreva o texto abaixo de forma mais criativa e envolvente, usando metáforas, analogias e linguagem expressiva. Retorne APENAS o texto reescrito, sem explicações:\n\n${content}`,
        autocomplete: `Você é um assistente de escrita. Dado o texto abaixo, sugira uma continuação natural de NO MÁXIMO 1 frase curta (15-30 palavras). A continuação deve fluir naturalmente do texto existente. Retorne APENAS a continuação, sem explicações, aspas ou prefixos:\n\n${content}`,
        'plagiarism-check': `Analise o texto abaixo quanto à originalidade. Avalie:\n1. Se o texto parece ser escrito originalmente ou copiado\n2. Se há trechos que parecem citações sem referência\n3. Se há padrões comuns de plágio (texto muito genérico, mudanças bruscas de estilo)\n\nDê uma nota de originalidade de 0 a 100% e explique sua análise.\n\nFormato:\nOriginalidade: XX%\n\nAnálise: (explicação detalhada)\n\nSugestões: (se houver trechos suspeitos, sugira como melhorar)\n\nTexto:\n${content}`,
        'auto-summary': `Resuma automaticamente o seguinte texto em 3-5 frases concisas, capturando os pontos principais. Retorne APENAS o resumo, sem prefixos:\n\n${content}`,
      };
      systemPrompt = "Você é um tutor educacional especializado. Responda de forma clara e organizada em português brasileiro.";
      prompt = `NOTA: "${title}" (Área: ${area})\n\nCONTEÚDO:\n${content}\n\nINSTRUÇÃO:\n${actionPrompts[action] || 'Analise esta nota.'}`;

      // For note AI actions, return plain text instead of JSON
      const response2 = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response2.ok) {
        if (response2.status === 429) {
          return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response2.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Erro ao processar com IA");
      }

      const aiData2 = await response2.json();
      const resultText = aiData2.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ result: resultText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "ping") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      throw new Error("Tipo de operação desconhecido");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Erro ao processar com IA");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mentor-tools error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
