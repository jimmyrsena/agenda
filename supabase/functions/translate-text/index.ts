import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = {
  english: "English", en: "English",
  spanish: "Español", es: "Español",
  german: "Deutsch", de: "Deutsch",
  italian: "Italiano", it: "Italiano",
  mandarin: "中文 (Mandarim)", zh: "中文 (Mandarim)",
  portuguese: "Português Brasileiro", pt: "Português Brasileiro",
  french: "Français", fr: "Français",
  japanese: "日本語", ja: "日本語",
  korean: "한국어", ko: "한국어",
};

// MyMemory language codes mapping
const MYMEMORY_CODES: Record<string, string> = {
  english: "en", en: "en",
  spanish: "es", es: "es",
  german: "de", de: "de",
  italian: "it", it: "it",
  mandarin: "zh-CN", zh: "zh-CN",
  portuguese: "pt-BR", pt: "pt-BR",
  french: "fr", fr: "fr",
  japanese: "ja", ja: "ja",
  korean: "ko", ko: "ko",
};

/**
 * Strategy 1: AI translation via Lovable Gateway (best quality)
 */
async function translateWithAI(text: string, srcName: string, tgtName: string): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return null;

  try {
    const prompt = `Translate the following text from ${srcName} to ${tgtName}.

STRICT RULES:
- Output ONLY the direct translation of the provided text. Nothing more, nothing less.
- Do NOT add any extra sentences, examples, explanations, notes, or commentary.
- Do NOT create new content or extend the original text.
- Do NOT add greetings, sign-offs, or filler phrases that are not in the original.
- Preserve the exact structure and formatting of the original text.
- If the input is a single word, output only a single word (or short equivalent).
- If the input is a phrase, output only the translated phrase.

TEXT TO TRANSLATE:
${text}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `You are a strict translation engine. You translate text from ${srcName} to ${tgtName}. You output ONLY the translated version of the input — no additions, no extra sentences, no explanations, no creative content. Never invent or add text that was not in the original.` },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const result = data.choices?.[0]?.message?.content?.trim();
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Strategy 2: MyMemory free API (no key needed, decent quality)
 * Free tier: 5000 chars/day, supports 200+ languages
 */
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  const srcCode = MYMEMORY_CODES[sourceLang];
  const tgtCode = MYMEMORY_CODES[targetLang];
  if (!srcCode || !tgtCode) return null;

  try {
    // MyMemory has a 500 char limit per request, split if needed
    const chunks = splitText(text, 450);
    const translations: string[] = [];

    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${srcCode}|${tgtCode}`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "StudyApp/1.0" },
      });
      if (!resp.ok) return null;
      const data = await resp.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        let translated = data.responseData.translatedText;
        // MyMemory sometimes returns UPPERCASE when unsure, check matches array
        if (data.matches && data.matches.length > 0) {
          const bestMatch = data.matches.find((m: any) => m.quality && parseInt(m.quality) > 70);
          if (bestMatch?.translation) {
            translated = bestMatch.translation;
          }
        }
        translations.push(translated);
      } else {
        return null;
      }
    }

    return translations.join("\n\n");
  } catch {
    return null;
  }
}

/**
 * Strategy 3: LibreTranslate mirrors (free, open-source)
 */
async function translateWithLibre(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  const LIBRE_CODES: Record<string, string> = {
    english: "en", en: "en",
    spanish: "es", es: "es",
    german: "de", de: "de",
    italian: "it", it: "it",
    mandarin: "zh", zh: "zh",
    portuguese: "pt", pt: "pt",
    french: "fr", fr: "fr",
    japanese: "ja", ja: "ja",
    korean: "ko", ko: "ko",
  };

  const src = LIBRE_CODES[sourceLang];
  const tgt = LIBRE_CODES[targetLang];
  if (!src || !tgt) return null;

  const mirrors = [
    "https://libretranslate.de",
    "https://translate.argosopentech.com",
    "https://translate.terraprint.co",
  ];

  for (const mirror of mirrors) {
    try {
      const resp = await fetch(`${mirror}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text.slice(0, 3000), source: src, target: tgt, format: "text" }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.translatedText) return data.translatedText;
    } catch {
      continue;
    }
  }
  return null;
}

function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxLen && current) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // If any chunk is still too long, split by sentences
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxLen) {
      finalChunks.push(chunk);
    } else {
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let cur = "";
      for (const s of sentences) {
        if ((cur + s).length > maxLen && cur) {
          finalChunks.push(cur.trim());
          cur = s;
        } else {
          cur += s;
        }
      }
      if (cur.trim()) finalChunks.push(cur.trim());
    }
  }
  return finalChunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, sourceLang, targetLang } = await req.json();

    if (!text || !sourceLang || !targetLang) {
      return new Response(JSON.stringify({ error: "Texto, idioma de origem e idioma de destino são obrigatórios." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const srcName = LANG_NAMES[sourceLang] || sourceLang;
    const tgtName = LANG_NAMES[targetLang] || targetLang;

    let translation: string | null = null;
    let method = "ai";

    // Strategy 1: AI (best quality)
    translation = await translateWithAI(text.slice(0, 5000), srcName, tgtName);

    // Strategy 2: MyMemory free API
    if (!translation) {
      method = "mymemory";
      translation = await translateWithMyMemory(text.slice(0, 3000), sourceLang, targetLang);
    }

    // Strategy 3: LibreTranslate
    if (!translation) {
      method = "libre";
      translation = await translateWithLibre(text.slice(0, 3000), sourceLang, targetLang);
    }

    if (!translation) {
      return new Response(JSON.stringify({ 
        error: "Nenhum serviço de tradução disponível. Use o modo offline local.",
        fallback: true,
      }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ translation: translation.trim(), method }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
