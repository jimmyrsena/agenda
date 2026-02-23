import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractJsonFromResponse(response: string): unknown {
  let cleaned = response
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find outermost JSON object or array
  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");

  // Find matching closing bracket by counting depth
  const openChar = cleaned[jsonStart];
  const closeChar = openChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escape = false;
  let jsonEnd = -1;

  for (let i = jsonStart; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) { jsonEnd = i; break; }
    }
  }

  if (jsonEnd === -1) jsonEnd = cleaned.lastIndexOf(closeChar);
  if (jsonEnd <= jsonStart) throw new Error("No valid JSON boundaries found");

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  // Attempt 1: direct parse
  try { return JSON.parse(cleaned); } catch (_) { /* continue */ }

  // Cleanup: trailing commas, control chars
  let fixed = cleaned
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Attempt 2: after basic cleanup
  try { return JSON.parse(fixed); } catch (_) { /* continue */ }

  // Attempt 3: fix unescaped newlines/tabs inside strings
  // Walk through and escape control chars inside string values
  let result = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < fixed.length; i++) {
    const c = fixed[i];
    if (esc) { result += c; esc = false; continue; }
    if (c === '\\' && inStr) { result += c; esc = true; continue; }
    if (c === '"') { inStr = !inStr; result += c; continue; }
    if (inStr) {
      if (c === '\n') { result += '\\n'; continue; }
      if (c === '\r') { result += '\\r'; continue; }
      if (c === '\t') { result += '\\t'; continue; }
    }
    result += c;
  }
  try { return JSON.parse(result); } catch (_) { /* continue */ }

  // Attempt 4: collapse all whitespace inside strings
  fixed = cleaned
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ");
  try { return JSON.parse(fixed); } catch (_) { /* continue */ }

  // Attempt 5: repair truncated JSON — close unmatched braces/brackets
  let repaired = result || fixed;
  // Remove trailing incomplete key-value (e.g., `"key": "unterminated...`)
  repaired = repaired.replace(/,?\s*"[^"]*":\s*"[^"]*$/g, '');
  repaired = repaired.replace(/,?\s*"[^"]*":\s*$/g, '');
  repaired = repaired.replace(/,?\s*"[^"]*$/g, '');
  // Remove trailing comma
  repaired = repaired.replace(/,\s*$/, '');
  // Count and close unmatched braces/brackets
  let braces = 0, brackets = 0;
  let inS = false, es = false;
  for (const ch of repaired) {
    if (es) { es = false; continue; }
    if (ch === '\\' && inS) { es = true; continue; }
    if (ch === '"') { inS = !inS; continue; }
    if (inS) continue;
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  while (brackets > 0) { repaired += ']'; brackets--; }
  while (braces > 0) { repaired += '}'; braces--; }
  try { return JSON.parse(repaired); } catch (_) { /* continue */ }

  console.error("JSON parse failed. First 500 chars:", cleaned.substring(0, 500));
  console.error("JSON parse failed. Last 200 chars:", cleaned.substring(cleaned.length - 200));
  throw new Error("Failed to parse JSON response after multiple attempts");
}

const LANGUAGE_CONFIGS: Record<string, { name: string; systemPrompt: string }> = {
  english: {
    name: "English",
    systemPrompt: `You are a world-class English teacher trained at the best American language institutes (EF Education, Kaplan International, and top US university Intensive English Programs). Your teaching methodology combines Communicative Language Teaching (CLT), Task-Based Learning (TBL), and the Natural Approach.

Your approach:
- Follow CEFR levels strictly (A1-C2) with clear learning objectives for each lesson.
- Integrate all four skills: Reading, Writing, Listening, and Speaking in every lesson.
- Use the PPP method (Presentation, Practice, Production) for grammar topics.
- Include authentic materials: real-world texts, dialogues that native speakers actually use.
- Teach pronunciation using IPA (International Phonetic Alphabet) when relevant.
- Highlight American English usage, idioms, phrasal verbs, and cultural context.
- For TOEFL/IELTS topics, follow official test strategies and scoring rubrics.
- Use Portuguese explanations when introducing complex concepts, but progressively increase English-only instruction as the student advances.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- For oral assessments, provide passages with phonetic guidance and evaluate pronunciation.
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
  spanish: {
    name: "Español",
    systemPrompt: `You are a world-class Spanish teacher trained at the Instituto Cervantes and top language academies in Spain and Latin America. Your methodology combines the Communicative Approach, Task-Based Learning, and the Enfoque por Tareas used in official DELE preparation.

Your approach:
- Follow CEFR levels strictly (A1-C2) with clear learning objectives.
- Integrate all four skills: Comprensión Lectora, Expresión Escrita, Comprensión Auditiva, Expresión Oral.
- Address both Peninsular Spanish and Latin American variants, highlighting differences in vocabulary, pronunciation, and grammar (voseo, leísmo, seseo/ceceo).
- Teach the Subjuntivo systematically — the #1 challenge for Portuguese speakers.
- Highlight false friends (falsos amigos) between Spanish and Portuguese.
- For DELE preparation topics, follow official Instituto Cervantes exam formats and scoring criteria.
- Use Portuguese explanations when introducing complex concepts, leveraging cognates.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- For oral assessments, provide passages with pronunciation guidance.
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
  german: {
    name: "Deutsch",
    systemPrompt: `You are a world-class German teacher trained at the Goethe-Institut and leading German language academies. Your methodology follows the Goethe-Institut's communicative approach combined with the structural precision required for TestDaF and Goethe-Zertifikat exams.

Your approach:
- Follow CEFR levels strictly (A1-C2) with clear learning objectives.
- Integrate all four skills: Leseverstehen, Schreiben, Hörverstehen, Sprechen.
- Teach the German case system (Nominativ, Akkusativ, Dativ, Genitiv) systematically with clear rules and examples.
- Cover word order rules meticulously: V2 position, Satzklammer, Nebensatz word order.
- Address Adjektivdeklination with all three declension types.
- Include DACH variations (Deutschland, Österreich, Schweiz).
- For Goethe-Zertifikat and TestDaF topics, follow official exam formats and assessment criteria.
- Use Portuguese explanations for complex grammar, but progressively increase German-only instruction.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- For oral assessments, provide passages with pronunciation guidance for difficult sounds (ü, ö, ä, ch, r).
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
  portuguese: {
    name: "Português Brasileiro",
    systemPrompt: `You are a world-class Portuguese language teacher, specialist in Brazilian Portuguese, trained at the best Brazilian universities (USP, UNICAMP, UFRJ) and aligned with ENEM, vestibular, and CELPE-Bras standards.

Your approach:
- Cover the full spectrum: Ensino Fundamental to Concursos Públicos and CELPE-Bras.
- Teach grammar rigorously: norma culta, concordância verbal/nominal, regência verbal/nominal, crase, colocação pronominal.
- Literature: cover all Brazilian and Portuguese literary movements with author analysis.
- Redação ENEM: teach the 5 competencies explicitly with model texts and scoring criteria.
- Address variação linguística (diatópica, diastrática, diafásica) without prejudice.
- For CELPE-Bras topics, follow the official INEP exam format (oral + written tasks).
- Use clear, didactic Portuguese throughout. Explain grammar rules with everyday analogies.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- Include literary text analysis with authorial context and historical period.
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
  italian: {
    name: "Italiano",
    systemPrompt: `You are a world-class Italian teacher trained at the Università per Stranieri di Siena (CILS) and Università per Stranieri di Perugia (CELI). Your methodology combines the communicative approach of Italian language academies with rigorous grammar instruction.

Your approach:
- Follow CEFR levels strictly (A1-C2) with clear learning objectives.
- Integrate all four skills: Comprensione della lettura, Produzione scritta, Comprensione dell'ascolto, Produzione orale.
- Teach the Congiuntivo systematically — essential for proper Italian and exam success.
- Cover regional variations in pronunciation and vocabulary (Nord vs Centro vs Sud).
- Highlight the rich cultural context: arte, cinema, letteratura, gastronomia, moda.
- Address false friends between Italian and Portuguese (many cognates but important differences).
- For CILS/CELI preparation topics, follow official exam formats and assessment criteria.
- Use Portuguese explanations when introducing complex concepts, leveraging cognates.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- For oral assessments, provide passages with pronunciation guidance (double consonants, open/closed vowels).
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
  mandarin: {
    name: "中文 (Mandarim)",
    systemPrompt: `You are a world-class Mandarin Chinese teacher trained at the Confucius Institute and top Chinese language programs (Beijing Language and Culture University - BLCU). Your methodology follows the HSK (Hanyu Shuiping Kaoshi) framework with communicative and immersive techniques.

Your approach:
- Follow HSK levels (1-6) mapped to CEFR equivalents, with clear learning objectives.
- ALWAYS include Pinyin romanization alongside Chinese characters (汉字) for every Chinese word/phrase.
- Teach tones rigorously — they change meaning entirely. Include tone marks in all Pinyin.
- Cover simplified characters (简体字) as standard, mentioning traditional (繁体字) when relevant.
- Teach radicals and character components to help students learn characters systematically.
- Include cultural context: festivals, philosophy, etiquette (guanxi, mianzi, keqi).
- For HSK preparation topics, follow the official Hanban exam format and word lists.
- Use Portuguese explanations extensively since Chinese is very different from Portuguese.
- For exercises, provide clear rubrics and evaluate answers with scores (0-100).
- For oral assessments, include tone practice and provide Pinyin with tone marks.
- Address practical modern Chinese: WeChat, Alipay, apps, internet slang.
- DO NOT use emojis. Keep content clean and professional for printing.
- NEVER use LaTeX notation. Write math in plain text.
Always respond in JSON format as specified.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, language, level, module, topic, userAnswer, exerciseType, spokenText } = await req.json();

    if (action === "get-curriculum") {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const langConfig = LANGUAGE_CONFIGS[language];
    if (!langConfig) {
      return new Response(JSON.stringify({ error: "Idioma não suportado" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let prompt = "";

    if (action === "lesson") {
      prompt = `Create a comprehensive lesson about "${topic}" for ${langConfig.name} at ${level} level, module "${module}".

CRITICAL TEACHING STYLE:
- Explain EVERYTHING as if teaching a child or complete beginner. Use simple, everyday language.
- Start each concept with a relatable analogy or real-life example before the technical explanation.
- Use "Imagine que..." or "Pense assim..." to introduce concepts.
- After each rule or concept, immediately show 2-3 practical examples with translations.
- DO NOT use emojis anywhere in the response. Keep the text clean and professional for printing.
- NEVER use LaTeX notation ($, \\mathbb, \\frac, etc). Write math in plain text: "x squared", "square root of 2", etc.
- Highlight common mistakes and how to avoid them ("Cuidado! Muitos alunos erram aqui...").
- End each section with a simple summary ("Resumindo: ...").
- End each section with a simple summary ("Resumindo: ...").
- The student must finish this lesson understanding the topic COMPLETELY.

Include:
1. A crystal-clear explanation with analogies, examples, and step-by-step breakdown (use Portuguese for explanations)
2. Key vocabulary with translations and example sentences
3. Common mistakes to avoid
4. A cultural note or practical tip

Respond in this exact JSON format:
{
  "title": "lesson title",
  "explanation": "detailed explanation in markdown format with headers, bold, examples",
  "vocabulary": [{"term": "word", "translation": "tradução", "example": "example sentence"}],
  "culturalNote": "interesting cultural fact",
  "practicePrompt": "a simple practice suggestion"
}`;
    } else if (action === "exercise") {
      const exType = exerciseType || "mixed";
      prompt = `Create a ${exType} exercise set about "${topic}" for ${langConfig.name} at ${level} level.
Create exactly 5 questions. Types can include: multiple_choice, fill_blank, translate, reorder.

Respond in this exact JSON format:
{
  "title": "exercise title",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "the question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "A",
      "explanation": "why this is correct"
    }
  ]
}
For fill_blank type, use ___ in the question. For translate, ask to translate a sentence. For reorder, provide jumbled words.`;
    } else if (action === "evaluate") {
      if (exerciseType === "text-comprehension") {
        prompt = `You are evaluating a student's text comprehension answers for ${langConfig.name} at ${level} level about "${topic}".

The student answered the following questions (in JSON format):
${userAnswer}

Evaluate EACH answer independently. For each answer, check if it has at least 90% coherence with the expected answer (meaning captures the essential meaning, not necessarily word-for-word).

Provide detailed feedback in Portuguese. Respond in this exact JSON format:
{
  "score": 75,
  "feedback": "Avaliacao geral detalhada em portugues, mencionando cada pergunta",
  "corrections": [
    "Pergunta 1: Sua resposta esta correta/incorreta. Resposta esperada: [resposta correta completa]. Explicacao...",
    "Pergunta 2: Sua resposta esta correta/incorreta. Resposta esperada: [resposta correta completa]. Explicacao..."
  ],
  "tips": ["dica de melhoria 1", "dica de melhoria 2"],
  "encouragement": "mensagem motivacional"
}

IMPORTANT: For EACH correction, ALWAYS include the full expected correct answer as an example so the student can compare.`;
      } else {
        prompt = `Evaluate the following answer for a ${langConfig.name} ${exerciseType || "exercise"} at ${level} level about "${topic}".

Student's answer: "${userAnswer}"

Provide detailed feedback. Respond in this exact JSON format:
{
  "score": 85,
  "feedback": "detailed feedback in Portuguese",
  "corrections": ["specific correction 1", "specific correction 2"],
  "tips": ["improvement tip 1", "improvement tip 2"],
  "encouragement": "motivational message"
}`;
      }
    } else if (action === "oral-assessment") {
      prompt = `Create an oral assessment exercise for ${langConfig.name} at ${level} level about "${topic}".
Include a text passage for reading practice and conversation prompts.

Respond in this exact JSON format:
{
  "title": "assessment title",
  "readingPassage": "A paragraph in ${langConfig.name} for the student to read aloud (appropriate for ${level} level)",
  "pronunciationTips": ["tip about specific sounds", "tip about intonation"],
  "conversationPrompts": ["Question 1 for oral practice?", "Question 2?", "Question 3?"],
  "vocabularyFocus": [{"word": "word", "phonetic": "pronunciation guide", "tip": "pronunciation tip"}]
}`;
    } else if (action === "text") {
      prompt = `Create an engaging reading text in ${langConfig.name} appropriate for ${level} level about a current/interesting topic related to "${topic}".

Respond in this exact JSON format:
{
  "title": "text title",
  "text": "The full text (2-3 paragraphs, appropriate vocabulary for ${level})",
  "glossary": [{"word": "difficult word", "meaning": "meaning in Portuguese"}],
  "comprehensionQuestions": [
    {"question": "Question about the text?", "answer": "Expected answer"}
  ]
}`;
    } else if (action === "conversation") {
      prompt = `Create a realistic, practical conversation/dialogue in ${langConfig.name} at ${level} level about "${topic}".
This should be a real-life scenario that someone living abroad would encounter. Make it practical and immediately useful.
Include natural, authentic language that native speakers actually use (not textbook-perfect).

Respond in this exact JSON format:
{
  "title": "conversation title",
  "scenario": "Brief description of the situation in Portuguese (where it happens, who is talking)",
  "dialogue": [
    {"speaker": "A", "line": "dialogue line in ${langConfig.name}", "translation": "translation in Portuguese"},
    {"speaker": "B", "line": "response in ${langConfig.name}", "translation": "translation in Portuguese"}
  ],
  "keyPhrases": [
    {"phrase": "useful phrase", "meaning": "meaning in Portuguese", "usage": "when/how to use this phrase"}
  ],
  "practiceTask": "A practical task for the student to practice (in Portuguese)"
}
Create at least 8 dialogue lines and 5 key phrases. Make the dialogue feel natural and include common expressions.`;
    } else if (action === "evaluate-speech") {
      prompt = `You are evaluating a student's spoken ${langConfig.name} at ${level} level.
The student was asked to speak about or respond to: "${topic}".
The speech recognition captured the following text from the student: "${spokenText}"

Analyze the student's speech for:
1. Grammar accuracy
2. Vocabulary usage
3. Sentence structure
4. Appropriateness for the context
5. Fluency indicators (from the text)

Be encouraging but honest. The student speaks Portuguese natively.

Respond in this exact JSON format:
{
  "score": 75,
  "transcription": "${spokenText}",
  "feedback": "Detailed feedback in Portuguese about their speech quality",
  "corrections": [
    {"original": "what they said wrong", "corrected": "correct version", "explanation": "explanation in Portuguese"}
  ],
  "pronunciation_tips": ["specific pronunciation tip 1", "tip 2"],
  "vocabulary_suggestions": ["better word/phrase they could use"],
  "encouragement": "motivational message in Portuguese",
  "fluency_level": "Iniciante|Intermediário|Avançado",
  "next_challenge": "A follow-up prompt in ${langConfig.name} for the student to try next"
}`;
    } else {
      return new Response(JSON.stringify({ error: "Ação não reconhecida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const callAI = async (msgs: { role: string; content: string }[], maxTokens = 16000) => {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: msgs,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`AI error: ${errText}`);
      }
      const data = await resp.json();
      return data.choices?.[0]?.message?.content || data.content || "";
    };

    const messages = [
      { role: "system", content: langConfig.systemPrompt },
      { role: "user", content: prompt },
    ];

    let parsed: unknown;
    try {
      const content = await callAI(messages);
      parsed = extractJsonFromResponse(content);
    } catch (firstErr) {
      console.error("First attempt failed, retrying with stricter prompt...", firstErr.message);
      // Retry: ask the model to fix/simplify its own output
      try {
        const retryMessages = [
          { role: "system", content: langConfig.systemPrompt + "\n\nCRITICAL: Your response MUST be valid JSON. Do NOT use backticks, markdown code fences, or unescaped special characters inside string values. Keep explanations concise (under 3000 characters). Escape all newlines as \\n inside strings." },
          { role: "user", content: prompt + "\n\nIMPORTANT: Keep your response concise and ensure it is valid, parseable JSON. Do not exceed 3000 characters for the explanation field." },
        ];
        const retryContent = await callAI(retryMessages, 8000);
        parsed = extractJsonFromResponse(retryContent);
      } catch (retryErr) {
        console.error("Retry also failed:", retryErr.message);
        throw new Error("Failed to parse JSON response after multiple attempts");
      }
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
