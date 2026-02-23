import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, topics, pdfText, questionCount, area } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt = "";
    const count = Math.min(questionCount || 10, 30);

    if (type === "custom-topics") {
      prompt = `Você é um especialista em elaboração de questões no estilo ENEM. Crie ${count} questões de múltipla escolha (5 alternativas cada) sobre os seguintes assuntos específicos:

ASSUNTOS: ${topics}

${area && area !== 'misto' ? `ÁREA PRINCIPAL: ${area}` : 'Distribua as questões entre as áreas do ENEM conforme os assuntos.'}

Cada questão DEVE ter:
- Enunciado contextualizado no estilo ENEM (com situação-problema, texto base quando cabível)
- 5 alternativas (A a E), sendo apenas 1 correta
- Indicação da alternativa correta (índice 0 a 4)
- Área do ENEM (linguagens, humanas, natureza, matematica, redacao)
- Disciplina específica
- Dificuldade (facil, medio, dificil) — variada
- Explicação detalhada da resposta correta

Retorne APENAS JSON válido:
{
  "questions": [
    {
      "question": "Enunciado da questão",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "correctIndex": 0,
      "area": "natureza",
      "subject": "Biologia - Genética",
      "difficulty": "medio",
      "explanation": "Explicação detalhada"
    }
  ]
}`;
    } else if (type === "from-pdf") {
      const textPreview = (pdfText || "").slice(0, 15000);
      prompt = `Você é um especialista em elaboração de questões no estilo ENEM. Analise o seguinte conteúdo de um material de estudo enviado pelo aluno e crie ${count} questões de múltipla escolha baseadas nesse material.

CONTEÚDO DO MATERIAL:
---
${textPreview}
---

${topics ? `FOCO ADICIONAL: ${topics}` : ''}
${area && area !== 'misto' ? `ÁREA PRINCIPAL: ${area}` : ''}

Cada questão DEVE:
- Ser baseada diretamente no conteúdo fornecido
- Ter enunciado contextualizado no estilo ENEM
- Ter 5 alternativas (A a E), sendo apenas 1 correta
- Incluir exemplos, dados ou referências do material quando possível
- Ter explicação detalhada citando trechos relevantes do material

Retorne APENAS JSON válido:
{
  "questions": [
    {
      "question": "Enunciado",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "correctIndex": 0,
      "area": "natureza",
      "subject": "Disciplina",
      "difficulty": "medio",
      "explanation": "Explicação detalhada"
    }
  ],
  "summary": "Resumo do material em 3-5 frases para uso do Mentor"
}`;
    } else if (type === "analyze-pdf") {
      const textPreview = (pdfText || "").slice(0, 20000);
      prompt = `Você é um especialista em educação. Analise profundamente o seguinte material de estudo e crie uma análise completa e estruturada para que um mentor de estudos possa ENSINAR TODO o conteúdo ao aluno.

CONTEÚDO DO MATERIAL:
---
${textPreview}
---

Sua análise deve ser EXTREMAMENTE detalhada. Extraia TODO o conhecimento possível.

Retorne APENAS JSON válido:
{
  "title": "Título descritivo do material",
  "summary": "Resumo abrangente e detalhado em 10-20 frases, cobrindo todos os principais conceitos, teorias e informações do material. Inclua definições, fórmulas, datas e dados importantes.",
  "keyTopics": ["Tópico detalhado 1", "Tópico detalhado 2", "...até 20 tópicos"],
  "keyFacts": ["Fato/definição/fórmula importante 1", "Fato 2", "...até 30 fatos"],
  "examples": ["Exemplo prático ou exercício resolvido 1", "Exemplo 2", "...até 15 exemplos"],
  "connections": "Conexões interdisciplinares detalhadas com outras áreas do conhecimento e do ENEM",
  "classroom": {
    "subject": "Nome da disciplina/assunto principal",
    "level": "Nível de dificuldade (básico, intermediário, avançado)",
    "modules": [
      {
        "id": "modulo-1",
        "title": "Título do módulo/capítulo",
        "topics": ["Subtópico 1", "Subtópico 2", "Subtópico 3"],
        "keyContent": "Resumo detalhado do conteúdo deste módulo específico com definições, exemplos e explicações"
      }
    ],
    "studyGuide": "Guia de estudo sugerido: ordem de estudos, pré-requisitos, dicas de como abordar o material",
    "practiceQuestions": ["Pergunta de prática 1 que o mentor pode usar", "Pergunta 2", "Pergunta 3"]
  }
}`;
    } else {
      throw new Error("Tipo de operação desconhecido");
    }

    // Try multiple models in order — fallback if credits exhausted (402)
    const MODELS = [
      "google/gemini-3-flash-preview",
      "google/gemini-2.5-flash",
      "google/gemini-2.5-flash-lite",
      "openai/gpt-5-nano",
    ];

    let response: Response | null = null;
    for (const model of MODELS) {
      console.log(`Trying model: ${model}`);
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Você é um especialista em educação e elaboração de questões ENEM. Retorne APENAS JSON válido, sem markdown, sem blocos de código." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (response.ok) break;
      if (response.status === 402 || response.status === 429) {
        console.warn(`Model ${model} returned ${response.status}, trying next...`);
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      const status = response?.status || 500;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Todos os modelos de IA estão indisponíveis no momento. Tente novamente mais tarde." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = response ? await response.text() : "No response";
      console.error("AI error:", status, t);
      throw new Error("Erro ao gerar questões com IA");
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enem-simulado error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
