import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Enhanced free web search: DuckDuckGo + Wikipedia (PT & EN) + Wiktionary + WikiBooks.
 * No API keys required. All sources are free and open.
 */

interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  source: string;
}

// Extract key subject from natural language query (PT + EN)
function extractSubject(query: string): string {
  let clean = query
    .replace(/^(como|o que|qual|quais|quem|quando|onde|por que|porque|pra que|para que|me (fala|explica|conta|diz|ensina|ajuda)|explique|defina|descreva|resuma|fale sobre|ensine sobre|o que significa|qual o significado|qual a diferen[çc]a)\s+(é|são|funciona|foi|era|fica|significa|acontece|aconteceu|serve|surgiu|entre)?\s*/gi, '')
    .replace(/^(what|who|when|where|why|how|tell me about|explain|define|describe|what does|what is|what are)\s+(is|are|was|were|does|do|did|the|a|an)?\s*/gi, '')
    .replace(/\?+$/, '')
    .replace(/\bno enem\b|\bpra prova\b|\bpro vestibular\b|\bde forma simples\b|\bpra mim\b/gi, '')
    .trim();
  return clean || query;
}

// DuckDuckGo Instant Answer API (free, no key)
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "StudyMentor/3.0" },
    });
    if (!resp.ok) return results;
    const data = await resp.json();

    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        snippet: data.Abstract,
        url: data.AbstractURL,
        source: data.AbstractSource || "DuckDuckGo",
      });
    }

    if (data.Answer) {
      results.push({
        title: "Resposta rápida",
        snippet: typeof data.Answer === "string" ? data.Answer : JSON.stringify(data.Answer),
        source: "DuckDuckGo",
      });
    }

    if (data.Definition) {
      results.push({
        title: `Definição: ${data.Heading || query}`,
        snippet: data.Definition,
        url: data.DefinitionURL,
        source: data.DefinitionSource || "DuckDuckGo",
      });
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.slice(0, 100),
            snippet: topic.Text,
            url: topic.FirstURL,
            source: "DuckDuckGo",
          });
        }
        if (topic.Topics) {
          for (const sub of topic.Topics.slice(0, 2)) {
            if (sub.Text) {
              results.push({
                title: sub.Text.slice(0, 100),
                snippet: sub.Text,
                url: sub.FirstURL,
                source: "DuckDuckGo",
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("DuckDuckGo error:", e);
  }
  return results;
}

// Wikipedia API (free, no key) - enhanced with sections and fallback
async function searchWikipedia(query: string, lang = "pt"): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const subject = extractSubject(query);
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(subject)}&srnamespace=0&srlimit=3&format=json&origin=*`;
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) return results;
    const searchData = await searchResp.json();

    const pages = searchData?.query?.search || [];
    if (pages.length === 0 && lang === "pt") {
      return searchWikipedia(query, "en");
    }

    const pageIds = pages.map((p: any) => p.pageid).join("|");
    if (!pageIds) return results;

    const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts&exintro=false&explaintext=true&exlimit=3&exsectionformat=plain&format=json&origin=*`;
    const extractResp = await fetch(extractUrl);
    if (!extractResp.ok) return results;
    const extractData = await extractResp.json();

    const extractPages = extractData?.query?.pages || {};
    for (const pid of Object.keys(extractPages)) {
      const page = extractPages[pid];
      if (page.extract) {
        const snippet = page.extract.length > 1000
          ? page.extract.slice(0, 1000) + "..."
          : page.extract;
        results.push({
          title: page.title,
          snippet,
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
          source: `Wikipedia (${lang.toUpperCase()})`,
        });
      }
    }
  } catch (e) {
    console.error("Wikipedia error:", e);
  }
  return results;
}

// Wiktionary for definitions (free, no key)
async function searchWiktionary(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const subject = extractSubject(query);
  if (subject.split(' ').length > 3) return results;
  
  try {
    const url = `https://pt.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(subject)}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
    const resp = await fetch(url);
    if (!resp.ok) return results;
    const data = await resp.json();

    const pages = data?.query?.pages || {};
    for (const pid of Object.keys(pages)) {
      if (pid === "-1") continue;
      const page = pages[pid];
      if (page.extract) {
        results.push({
          title: `Definição: ${page.title}`,
          snippet: page.extract.length > 400 ? page.extract.slice(0, 400) + "..." : page.extract,
          url: `https://pt.wiktionary.org/wiki/${encodeURIComponent(page.title)}`,
          source: "Wikcionário",
        });
      }
    }
  } catch (e) {
    console.error("Wiktionary error:", e);
  }
  return results;
}

// WikiBooks for educational content (free, no key)
async function searchWikiBooks(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const subject = extractSubject(query);
  try {
    const searchUrl = `https://pt.wikibooks.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(subject)}&srnamespace=0&srlimit=2&format=json&origin=*`;
    const resp = await fetch(searchUrl);
    if (!resp.ok) return results;
    const data = await resp.json();
    
    const pages = data?.query?.search || [];
    if (pages.length === 0) return results;
    
    const pageIds = pages.map((p: any) => p.pageid).join("|");
    const extractUrl = `https://pt.wikibooks.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts&exintro=true&explaintext=true&exlimit=2&format=json&origin=*`;
    const extractResp = await fetch(extractUrl);
    if (!extractResp.ok) return results;
    const extractData = await extractResp.json();
    
    const extractPages = extractData?.query?.pages || {};
    for (const pid of Object.keys(extractPages)) {
      const page = extractPages[pid];
      if (page.extract && page.extract.length > 50) {
        results.push({
          title: `📚 ${page.title}`,
          snippet: page.extract.length > 500 ? page.extract.slice(0, 500) + "..." : page.extract,
          url: `https://pt.wikibooks.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
          source: "WikiBooks",
        });
      }
    }
  } catch (e) {
    console.error("WikiBooks error:", e);
  }
  return results;
}

// Simple math evaluation for basic calculations
function tryMathAnswer(query: string): SearchResult | null {
  const mathMatch = query.match(/^[\d\s+\-*/().^%]+$/);
  if (mathMatch) {
    try {
      const expr = query.replace(/\^/g, '**').replace(/%/g, '/100');
      const result = new Function(`return ${expr}`)();
      if (typeof result === 'number' && isFinite(result)) {
        return {
          title: "Cálculo",
          snippet: `${query} = **${result}**`,
          source: "Calculadora",
        };
      }
    } catch { /* not a valid expression */ }
  }
  
  // Unit conversions and simple math questions
  const calcPatterns = [
    { regex: /(\d+)\s*(?:km|quilômetro).*(?:em|para|pra)\s*(?:m|metro)/i, fn: (m: RegExpMatchArray) => `${m[1]} km = **${parseInt(m[1]) * 1000} metros**` },
    { regex: /(\d+)\s*(?:m|metro).*(?:em|para|pra)\s*(?:cm|centímetro)/i, fn: (m: RegExpMatchArray) => `${m[1]} m = **${parseInt(m[1]) * 100} cm**` },
    { regex: /(\d+)\s*(?:kg|quilo).*(?:em|para|pra)\s*(?:g|grama)/i, fn: (m: RegExpMatchArray) => `${m[1]} kg = **${parseInt(m[1]) * 1000} gramas**` },
    { regex: /raiz.*(?:quadrada|de)\s*(\d+)/i, fn: (m: RegExpMatchArray) => `√${m[1]} = **${Math.sqrt(parseInt(m[1])).toFixed(4)}**` },
    { regex: /(\d+)\s*(?:ao quadrado|²|elevado a 2)/i, fn: (m: RegExpMatchArray) => `${m[1]}² = **${Math.pow(parseInt(m[1]), 2)}**` },
    { regex: /(\d+)\s*(?:ao cubo|³|elevado a 3)/i, fn: (m: RegExpMatchArray) => `${m[1]}³ = **${Math.pow(parseInt(m[1]), 3)}**` },
    { regex: /fatorial.*?(\d+)|(\d+)\s*!/i, fn: (m: RegExpMatchArray) => {
      const n = parseInt(m[1] || m[2]);
      if (n > 20) return `${n}! é um número muito grande!`;
      let f = 1; for (let i = 2; i <= n; i++) f *= i;
      return `${n}! = **${f}**`;
    }},
  ];
  
  for (const { regex, fn } of calcPatterns) {
    const match = query.match(regex);
    if (match) {
      return { title: "Cálculo", snippet: fn(match), source: "Calculadora" };
    }
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required (min 2 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmed = query.trim().slice(0, 200);

    // Try math first
    const mathResult = tryMathAnswer(trimmed);

    // Search all sources in parallel
    const [ddgResults, wikiResults, wiktResults, wikibookResults] = await Promise.all([
      searchDuckDuckGo(trimmed),
      searchWikipedia(trimmed),
      searchWiktionary(trimmed),
      searchWikiBooks(trimmed),
    ]);

    // Combine: math first, then Wikipedia (most reliable), WikiBooks, Wiktionary, DDG
    const allResults = [
      ...(mathResult ? [mathResult] : []),
      ...wikiResults,
      ...wikibookResults,
      ...wiktResults,
      ...ddgResults,
    ];
    
    const seen = new Set<string>();
    const unique = allResults.filter((r) => {
      const key = r.snippet.slice(0, 80).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);

    return new Response(
      JSON.stringify({ success: true, results: unique, query: trimmed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("web-search error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
