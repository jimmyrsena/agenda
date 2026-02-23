/**
 * Mentor Offline Fallback v4 — Intelligent local + web search system.
 * 
 * Architecture:
 * 1. Conversational intents (date, greeting, progress, tasks) → answer locally
 * 2. Knowledge base topics (matched by keyword) → answer from TOPIC_KNOWLEDGE
 * 3. General knowledge questions → search web, synthesize intelligently
 * 4. Never returns random/irrelevant content
 */

import { QUESTIONS, Question } from "@/data/questionBank";
import { KanbanTask, Flashcard, Note, StudentContext, MentorMode, EnemArea, ENEM_AREAS } from "@/types/study";
import {
  TOPIC_KNOWLEDGE, MODE_RESPONSES, getTimeBasedTip, getFollowUpSuggestions,
  generateWeeklyAnalysis, getInterdisciplinaryConnections,
} from "./MentorKnowledgeBase";

// ── Helpers ──

function pick<T>(arr: T[], n = 1): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function template(text: string, name: string): string {
  return text.replace(/\{name\}/g, name);
}

// ── Web search result type ──
export interface WebSearchResult {
  title: string;
  snippet: string;
  url?: string;
  source: string;
}

// ══════════ INTENT DETECTION v4 ══════════

type Intent =
  | 'greeting' | 'conversational' | 'farewell'
  | 'exercise' | 'explain' | 'tips' | 'motivation'
  | 'progress' | 'tasks' | 'study_plan' | 'compare'
  | 'summary' | 'weekly_report' | 'memorize'
  | 'math_calc' | 'opinion' | 'creative'
  | 'general';

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();

  // Greeting
  if (/^(oi|ol[áa]|e a[íi]|fala|bom dia|boa tarde|boa noite|hey|hello|hi|tudo bem|tudo certo|beleza|salve)\b/i.test(lower)) return 'greeting';

  // Farewell
  if (/^(tchau|at[ée] (mais|logo|amanhã)|flw|falou|valeu|obrigad[oa]|vlw|bye)\b/i.test(lower)) return 'farewell';

  // Conversational meta-questions (date, time, identity, math)
  if (/\b(que data|qual.*data|que dia|qual.*dia|que horas?|qual.*hora|que m[êe]s|qual.*m[êe]s|que ano|qual.*ano)\b/i.test(lower)) return 'conversational';
  if (/^(que data|qual [ée] a data|que dia [ée] hoje|que horas s[ãa]o)/i.test(lower)) return 'conversational';
  if (/\b(seu nome|quem [ée] voc[êe]|como voc[êe] se chama|voc[êe] [ée] quem|o que voc[êe] [ée]|o que voc[êe] faz)\b/i.test(lower)) return 'conversational';

  // Simple math calculations
  if (/^[\d\s+\-*/().^%=x×÷]+$/.test(lower)) return 'math_calc';
  if (/\b(quanto [ée]|calcul[ea]|raiz quadrada|fatorial|elev|ao quadrado|ao cubo)\b/i.test(lower) && /\d/.test(lower)) return 'math_calc';

  // Exercise/quiz
  if (/\b(quest[ãa]o|exerc[íi]c|simul|treina|me d[êe]|pratique|quiz|me fa[çc]a)\b.*\b(quest|exerc|simul|perg)/i.test(lower)) return 'exercise';
  if (/\b(quest[ãõ][eo]s?|exerc[íi]cios?|simulad[oa]s?)\b/i.test(lower)) return 'exercise';
  if (/\bme d[êe]\b.*\b(quest|exerc|perg)/i.test(lower)) return 'exercise';

  // Progress/stats
  if (/\b(progresso|como (estou|tô|to)|meu desempenho|minhas notas|estat[íi]st)\b/i.test(lower)) return 'progress';
  if (/\b(tarefa|pendente|atrasad|afazer|to.do|kanban)\b/i.test(lower)) return 'tasks';

  // Study plan
  if (/\b(plano|cronograma|roteiro|organizar.*estud|rotina.*estud)\b/i.test(lower)) return 'study_plan';

  // Weekly report
  if (/\b(relat[óo]rio|an[áa]lise).*\b(semanal|semana)\b/i.test(lower)) return 'weekly_report';
  if (/\bsemanal\b/i.test(lower)) return 'weekly_report';

  // Memorization
  if (/\b(memoriz|decorar|macete|mnem[ôo]nic)\b/i.test(lower)) return 'memorize';

  // Compare
  if (/\b(compar|diferen[çc]a entre|versus|vs\b|semelhan[çc]a)\b/i.test(lower)) return 'compare';

  // Summary
  if (/\b(resum[aoe]|sintetiz|em poucas palavras)\b/i.test(lower)) return 'summary';

  // Tips
  if (/\b(dica|conselho|sugest|recomend|como estud|t[ée]cnica|m[ée]todo)\b/i.test(lower)) return 'tips';

  // Motivation
  if (/\b(motiv|desanim|cansa|desist|n[ãa]o consigo|dif[íi]cil|triste|sozinh|chateado)\b/i.test(lower)) return 'motivation';

  // Opinion/creative
  if (/\b(o que voc[êe] acha|na sua opini[ãa]o|voc[êe] gosta|voc[êe] prefere)\b/i.test(lower)) return 'opinion';
  if (/\b(crie|invente|escreva|componha|fa[çc]a uma|monte uma)\b/i.test(lower)) return 'creative';

  // Explain intent (broad — matches most knowledge questions)
  if (/\b(expli|ensine|o que [ée]|como funciona|defin[ia]|me fala|me conta|por que|porque|qual [ée]|quem (foi|[ée]|era)|quando (foi|[ée])|onde (fica|[ée])|como [ée]|conte.*sobre|fale.*sobre|o que s[ãa]o|quais s[ãa]o|pra que serve|qual a import[âa]ncia)\b/i.test(lower)) return 'explain';

  return 'general';
}

// ══════════ TOPIC DETECTION v4 ══════════

function detectTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const topics: string[] = [];
  const patterns: [RegExp, string][] = [
    [/\b(reda[çc][ãa]o|dissertat|compet[êe]ncia|proposta de interven)\b/i, 'redacao'],
    [/\b(produtiv|pomodoro|h[áa]bito.*estud|foco|deep work|feynman|active recall)\b/i, 'produtividade'],
    [/\b(sa[úu]de|sono|dormir|alimenta[çc]|nutri[çc]|exerc[íi]cio f[íi]sic|hidrata[çc])\b/i, 'saude'],
    [/\b(ansie|estresse|nervo|press[ãa]o|p[âa]nico|preocup|depress|burnout)\b/i, 'ansiedade'],
    [/\b(matem[áa]t|equa[çc]|fun[çc][ãa]o|geometr|c[áa]lcul|probabilid|estat[íi]st|porcentag|logarit|trigonometr|combinator|arranjo|permuta[çc]|juro[s ]|fra[çc][ãa]o|derivad|integral|matriz|determin)\b/i, 'matematica'],
    [/\b(hist[óo]ri|era vargas|revolu[çc]|ditadura|colonial|imp[ée]rio|rep[úu]blica|guerra mundial|medieval|feudal|iluminism|napoleon|independ[êe]ncia|aboliç)\b/i, 'historia'],
    [/\b(biolog|c[ée]lul|mitose|meiose|dna|rna|gen[ée]t|ecolog|fotoss[íi]nt|evolu[çc]|fisiolog|imunol|biotecnolog|ecossistem|sistema nervoso|sistema circulat|sistema digest|sistema respirat|anatomia|corpo humano|[óo]rg[ãa]o|tecido|sangue|cora[çc][ãa]o|pulm[ãa]o|rim|f[íi]gado|c[ée]rebro|osso|m[úu]scul)\b/i, 'biologia'],
    [/\b(qu[íi]mic|[áa]tomo|mol[ée]cul|liga[çc][ãa]o qu[íi]m|estequi|pH|[áa]cid[oa]|org[âa]nic|tabela peri|rea[çc][ãa]o qu[íi]m|oxirredu|eletroqu[íi]m|termoqu[íi]m|equil[íi]brio qu[íi]m)\b/i, 'quimica'],
    [/\b(f[íi]sica|newton|cinem[áa]t|din[âa]mic|energia cin|eletric|[óo]ptic|onda|termodin[âa]m|hidrost[áa]t|gravita|eletromagn|calorim|for[çc]a|velocid|acelera[çc]|pot[êe]ncia el)\b/i, 'fisica'],
    [/\b(geograf|urbaniz|globaliz|clima|agroneg|desmat|cartograf|hidrog|migra[çc]|relevo|solo|vegeta[çc])\b/i, 'geografia'],
    [/\b(filosof|s[óo]crates|plat[ãa]o|arist[óo]tel|descartes|kant|nietzsche|marx|foucault|hegel|sartre|epicuro|exist[êe]ncial|[ée]tica|moral|metaf[íi]sic)\b/i, 'filosofia'],
    [/\b(sociolog|durkheim|weber|bourdieu|moviment.*social|desiguald|racis|capital.*cultural|anomia|ind[úu]stria cultural)\b/i, 'sociologia'],
    [/\b(ingl[êe]s|english|cognato|phrasal.*verb)\b/i, 'ingles'],
    [/\b(atualidad|fake.*news|intelig[êe]ncia.*artif|mudan[çc].*clim[áa]t|lgpd)\b/i, 'atualidades'],
    [/\b(enem|vestibular|sisu|nota.*corte|prouni|fies)\b/i, 'enem'],
    [/\b(literat|machado.*assis|clarice|drummond|guimar[ãa]es.*rosa|modernism|romantism|barroco|arcadism|realismo|naturalismo|parnasian)\b/i, 'literatura'],
    [/\b(portugu[êe]s|gram[áa]t|crase|concord[âa]nc|reg[êe]nc|coloca[çc].*pronom|sintax|semântic|morfolog)\b/i, 'portugues'],
    [/\b(financ|investim|poupan[çc]|tesouro.*direto|a[çc][ãõ]es|infla[çc]|or[çc]amento)\b/i, 'financeiro'],
    [/\b(program|c[óo]digo|algoritm|python|javascript|java\b|sql|software|html|css|react|api)\b/i, 'programacao'],
    [/\b(concurso|direito.*constituc|direito.*admin|racioc[íi]nio.*l[óo]gic|servidor.*p[úu]blic|edital)\b/i, 'concursos'],
    [/\b(arte|renasciment|impressionism|cubism|surrealism|tarsila|semana.*22|barroc.*art)\b/i, 'artes'],
    [/\b(direito.*human|constitui[çc]|eca\b|estatuto.*idoso|lei.*maria|direito.*ind[íi]gen)\b/i, 'direitos'],
  ];
  
  for (const [regex, topic] of patterns) {
    if (regex.test(lower)) topics.push(topic);
  }

  // Special: detect biology-related body/health questions that don't match keywords above
  if (topics.length === 0 && /\b(cora[çc][ãa]o|pulm[ãa]o|rim|f[íi]gado|c[ée]rebro|sangue|osso|m[úu]scul|est[ôo]mago|intestin|p[âa]ncreas|tire[óo]ide|nerv|veia|art[ée]ria)\b/i.test(lower)) {
    topics.push('biologia');
  }

  return topics;
}

function detectArea(text: string): EnemArea | null {
  const topics = detectTopics(text);
  const areaMap: Record<string, EnemArea> = {
    redacao: 'linguagens', portugues: 'linguagens', literatura: 'linguagens', ingles: 'linguagens', artes: 'linguagens',
    historia: 'humanas', geografia: 'humanas', filosofia: 'humanas', sociologia: 'humanas', direitos: 'humanas',
    biologia: 'natureza', quimica: 'natureza', fisica: 'natureza',
    matematica: 'matematica', financeiro: 'matematica',
  };
  for (const t of topics) {
    if (areaMap[t]) return areaMap[t];
  }
  return null;
}

// ══════════ INTELLIGENT WEB SYNTHESIS v4 ══════════

/**
 * Extract the most relevant snippet from web results based on the query.
 * Filters out irrelevant results and constructs a coherent answer.
 */
function synthesizeWebResults(query: string, results: WebSearchResult[], name: string): string {
  const parts: string[] = [];
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  // Score each result by relevance to the query
  const scored = results
    .filter(r => r.snippet && r.snippet.length > 30)
    .map(r => {
      const snippetLower = r.snippet.toLowerCase();
      const titleLower = r.title.toLowerCase();
      let score = 0;
      
      // Score by query word matches in snippet
      for (const w of queryWords) {
        if (snippetLower.includes(w)) score += 2;
        if (titleLower.includes(w)) score += 3;
      }
      
      // Penalize very short or very generic snippets
      if (r.snippet.length < 80) score -= 2;
      
      // Boost Wikipedia and educational sources
      if (r.source.includes('Wikipedia')) score += 3;
      if (r.source.includes('WikiBooks')) score += 2;
      
      // Penalize snippets about completely different topics
      const querySubject = extractQuerySubject(query);
      if (querySubject && !snippetLower.includes(querySubject) && !titleLower.includes(querySubject)) {
        score -= 5;
      }
      
      return { ...r, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // No relevant results found
    return `Não encontrei informações relevantes sobre "${query}", ${name}. Tente reformular a pergunta ou pergunte sobre outra coisa! 😊`;
  }

  // Build natural response
  const isWho = /quem (foi|[ée]|era)/i.test(query);
  const isWhat = /o que [ée]|o que s[ãa]o|defin/i.test(query);
  const isHow = /como funciona|como [ée]|por que|porque|pra que serve/i.test(query);
  const isWhere = /onde (fica|[ée]|est[áa])/i.test(query);
  const isWhen = /quando (foi|[ée]|acontec)/i.test(query);

  if (isWho) parts.push(`Boa pergunta, ${name}! Veja o que encontrei:\n`);
  else if (isWhat) parts.push(`Vou te explicar, ${name}!\n`);
  else if (isHow) parts.push(`Ótima curiosidade, ${name}! Olha só:\n`);
  else if (isWhere) parts.push(`Vou te mostrar, ${name}!\n`);
  else if (isWhen) parts.push(`Encontrei a resposta, ${name}!\n`);
  else parts.push(`Pesquisei sobre isso pra você, ${name}!\n`);

  // Use the best result's content, trimmed and cleaned
  const best = scored[0];
  let mainContent = best.snippet.replace(/\n{3,}/g, '\n\n').trim();
  
  // If the main content is very long, extract the most relevant paragraph
  if (mainContent.length > 800) {
    const paragraphs = mainContent.split(/\n\n+/);
    const relevantParagraphs = paragraphs.filter(p => {
      const pLower = p.toLowerCase();
      return queryWords.some(w => pLower.includes(w));
    });
    if (relevantParagraphs.length > 0) {
      mainContent = relevantParagraphs.slice(0, 3).join('\n\n');
    } else {
      mainContent = paragraphs.slice(0, 3).join('\n\n');
    }
    if (mainContent.length > 800) mainContent = mainContent.slice(0, 800) + '...';
  }

  parts.push(mainContent);
  
  // Add secondary results if they add value
  const secondary = scored.slice(1, 3).filter(r => r.score > 2);
  if (secondary.length > 0) {
    parts.push('');
    for (const r of secondary) {
      let extra = r.snippet;
      if (extra.length > 300) extra = extra.slice(0, 300) + '...';
      // Only add if it's meaningfully different from main content
      if (!mainContent.includes(extra.slice(0, 50))) {
        parts.push(`📖 **${r.title}**`);
        parts.push(extra);
        parts.push('');
      }
    }
  }

  // Sources
  const sources = scored.slice(0, 3).filter(r => r.url).map(r => `[${r.source}](${r.url})`);
  if (sources.length > 0) {
    parts.push(`\n🔗 **Fontes:** ${sources.join(' · ')}`);
  }

  // Study connections
  const topics = detectTopics(query);
  if (topics.length > 0) {
    const connections = getInterdisciplinaryConnections(topics[0]);
    if (connections) parts.push(`\n${connections}`);
  }

  parts.push(`\n💬 *Quer que eu explique melhor, dê exemplos ou crie questões sobre isso?*`);

  return parts.join('\n');
}

/** Extract the core subject from a question (removing stop words) */
function extractQuerySubject(query: string): string {
  return query
    .toLowerCase()
    .replace(/^(como|o que|qual|quais|quem|quando|onde|por que|porque|me (fala|explica|conta|diz|ensina)|explique|defina|descreva|fale sobre|ensine|conte sobre)\s+(é|são|funciona|foi|era|fica|serve|significa|acontece)?\s*/gi, '')
    .replace(/\?+$/, '')
    .replace(/\b(no enem|pra prova|pro vestibular|de forma simples|pra mim|humano|humana)\b/gi, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3)
    .join(' ');
}

// ══════════ LOCAL RESPONSE GENERATORS ══════════

const GREETINGS = [
  "E aí, {name}!",
  "Fala, {name}! Tudo certo?",
  "Opa, {name}! Bom te ver por aqui!",
  "{name}! Que bom que voltou!",
  "Salve, {name}! Bora estudar?",
  "Olá, {name}! Pronto pra mais uma sessão de estudos?",
];

const FAREWELLS = [
  "Até mais, {name}! Bons estudos!",
  "Tchau, {name}! Qualquer dúvida, é só voltar!",
  "Valeu, {name}! Descansa bem e volta com tudo!",
  "Falou, {name}! Boa sorte nos estudos!",
];

const ENCOURAGEMENT = [
  "Você tá mandando bem, {name}! Continue assim!",
  "Cada dia de estudo é um passo mais perto do objetivo, {name}!",
  "Não desista, {name}! Os resultados aparecem quando a gente menos espera.",
  "Confio em você, {name}. Você é mais capaz do que imagina!",
  "Se tá difícil, é sinal de que você tá crescendo! Mantém o foco!",
  "A diferença entre quem passa e quem não passa? Consistência. E você tá aqui, {name}!",
  "Quando a vontade de desistir bater, lembre do motivo que te fez começar.",
];

const TRANSITIONS = [
  "Olha só o que eu separei pra você:",
  "Dá uma olhada nisso:",
  "Aqui vai algo que pode te ajudar:",
  "Vou te mostrar algo interessante:",
];

function solveMath(text: string): string | null {
  // Pure expression
  const exprMatch = text.match(/^[\d\s+\-*/().^%×÷]+$/);
  if (exprMatch) {
    try {
      const expr = text.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**').replace(/%/g, '/100');
      const result = new Function(`return ${expr}`)();
      if (typeof result === 'number' && isFinite(result)) return `${text} = **${result}**`;
    } catch { /* ignore */ }
  }

  // "quanto é X + Y"
  const quantoMatch = text.match(/quanto [ée]\s*([\d\s+\-*/().^%×÷]+)/i);
  if (quantoMatch) {
    try {
      const expr = quantoMatch[1].replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
      const result = new Function(`return ${expr}`)();
      if (typeof result === 'number' && isFinite(result)) return `${quantoMatch[1].trim()} = **${result}**`;
    } catch { /* ignore */ }
  }

  // Special patterns
  const patterns: { regex: RegExp; fn: (m: RegExpMatchArray) => string }[] = [
    { regex: /raiz.*quadrada.*?(\d+)/i, fn: m => `raiz(${m[1]}) = **${Math.sqrt(parseInt(m[1])).toFixed(4)}**` },
    { regex: /(\d+)\s*(?:ao quadrado|²|elevado a 2)/i, fn: m => `${m[1]}² = **${Math.pow(parseInt(m[1]), 2)}**` },
    { regex: /(\d+)\s*(?:ao cubo|³|elevado a 3)/i, fn: m => `${m[1]}³ = **${Math.pow(parseInt(m[1]), 3)}**` },
    { regex: /fatorial.*?(\d+)|(\d+)\s*!/i, fn: m => {
      const n = parseInt(m[1] || m[2]);
      if (n > 20) return `${n}! é um numero muito grande!`;
      let f = 1; for (let i = 2; i <= n; i++) f *= i;
      return `${n}! = **${f}**`;
    }},
    { regex: /(\d+)\s*%\s*(?:de|of)\s*(\d+)/i, fn: m => `${m[1]}% de ${m[2]} = **${(parseInt(m[1]) / 100 * parseInt(m[2])).toFixed(2)}**` },
  ];

  for (const { regex, fn } of patterns) {
    const match = text.match(regex);
    if (match) return fn(match);
  }

  return null;
}

// ── Study plan generator ──
function generateStudyPlan(context: StudentContext, tasks: KanbanTask[], name: string): string {
  const parts: string[] = [];
  parts.push(`📅 **Plano de estudo personalizado pra você, ${name}:**\n`);

  if (context.weakAreas.length > 0) {
    parts.push(`⚠️ **Prioridade (areas fracas):** ${context.weakAreas.map(a => ENEM_AREAS[a as EnemArea]?.label || a).join(', ')}`);
    parts.push(`→ Dedique 40% do tempo a essas areas!\n`);
  }

  const hour = new Date().getHours();
  parts.push(`🕐 **Rotina sugerida (começando agora — ${hour}h):**`);
  
  if (hour < 12) {
    parts.push(`- ☀️ **${hour}h-${hour+2}h:** Matéria difícil (foco total, Deep Work)`);
    parts.push(`- 📝 **${hour+2}h-${hour+3}h:** Exercícios práticos + questões`);
    parts.push(`- 🍽️ **${hour+3}h-${hour+4}h:** Pausa para almoço/descanso`);
    parts.push(`- 📚 **${hour+4}h-${hour+5}h30:** Matéria diferente + flashcards`);
    parts.push(`- 🌅 **${hour+6}h-${hour+6}h30:** Revisão leve`);
  } else {
    parts.push(`- 📚 **${hour}h-${hour+1}h30:** Revisão ativa (questões)`);
    parts.push(`- 🧠 **${hour+2}h-${hour+3}h:** Flashcards + resumos`);
    parts.push(`- 🌙 **Antes de dormir:** 20min revisão leve`);
  }

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done');
  if (overdue.length > 0) {
    parts.push(`\n🚨 **${overdue.length} tarefa(s) atrasada(s):**`);
    overdue.slice(0, 3).forEach(t => parts.push(`  - ❌ ${t.title}`));
  }

  parts.push(`\n🎯 **Recomendações:**`);
  if (context.flashcardsTotal > 0 && (context.flashcardsMastered || 0) < context.flashcardsTotal * 0.5) {
    parts.push(`- Revise seus ${context.flashcardsTotal - (context.flashcardsMastered || 0)} flashcards pendentes`);
  }
  if (context.simuladosDone < 3) parts.push(`- Faça mais simulados! Você só fez ${context.simuladosDone}. Meta: 1 por semana`);
  parts.push(`\n${getTimeBasedTip()}`);
  parts.push(`\nQuer que eu detalhe alguma parte do plano?`);

  return parts.join('\n');
}

function generateMemorizationTips(topics: string[], name: string): string {
  const parts: string[] = [];
  parts.push(`🧠 **Técnicas de memorização, ${name}!**\n`);
  parts.push(`**1. Repetição Espaçada** — Revise: Hoje → Amanhã → 3 dias → 7 dias → 30 dias`);
  parts.push(`**2. Mnemônicos** — Ex: LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência)`);
  parts.push(`**3. Palácio da Memória** — Associe conceitos a cômodos da casa`);
  parts.push(`**4. Método Feynman** — Explique como se ensinasse a uma criança`);
  parts.push(`**5. Mapas Mentais** — Tema central → ramos → sub-ramos com cores`);
  
  if (topics.length > 0) {
    const k = TOPIC_KNOWLEDGE[topics[0]];
    if (k) {
      parts.push(`\n📌 **Exemplo prático de ${topics[0]}:**`);
      parts.push(template(pick(k)[0], name));
    }
  }
  
  return parts.join('\n');
}

// ══════════ MAIN RESPONSE GENERATOR ══════════

export function generateOfflineResponse(
  userText: string,
  mode: MentorMode,
  context: StudentContext,
  tasks: KanbanTask[],
  flashcards: Flashcard[],
  notes: Note[],
  userName: string,
  webResults?: WebSearchResult[],
): string {
  const topics = detectTopics(userText);
  const area = detectArea(userText);
  const intent = detectIntent(userText);
  const name = userName || 'Estudante';
  const parts: string[] = [];

  // ═══ 1. CONVERSATIONAL — answer locally, no search needed ═══

  if (intent === 'conversational') {
    const lower = userText.toLowerCase();
    const now = new Date();
    if (/data|dia/i.test(lower)) {
      parts.push(`Hoje é **${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**, ${name}! 📅`);
    } else if (/hora/i.test(lower)) {
      parts.push(`Agora são **${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}**, ${name}! ⏰`);
    } else if (/m[êe]s/i.test(lower)) {
      parts.push(`Estamos em **${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}**, ${name}! 📅`);
    } else if (/ano/i.test(lower)) {
      parts.push(`Estamos no ano de **${now.getFullYear()}**, ${name}!`);
    } else if (/nome|quem|chama|o que voc/i.test(lower)) {
      parts.push(`Eu sou o **Mentor**, seu assistente de estudos! Posso te ajudar em qualquer matéria, tirar dúvidas, criar exercícios e muito mais, ${name}.`);
    } else {
      parts.push(`${name}, agora são **${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}** de **${now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}**! 📅`);
    }
    parts.push(`\n${getTimeBasedTip()}`);
    return parts.join('\n');
  }

  if (intent === 'greeting') {
    parts.push(template(pick(GREETINGS)[0], name));
    parts.push('');
    parts.push(getTimeBasedTip());
    if (context.studyStreak > 0) parts.push(`\n🔥 **${context.studyStreak} dia(s)** de ofensiva!`);
    const pending = tasks.filter(t => t.column !== 'done' && !t.archived);
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done');
    if (overdue.length > 0) parts.push(`⚠️ **${overdue.length}** tarefa(s) atrasada(s)!`);
    else if (pending.length > 0) parts.push(`📋 **${pending.length}** tarefa(s) pendente(s).`);
    if (context.weakAreas.length > 0) parts.push(`\n💡 Que tal estudar **${context.weakAreas[0]}** hoje?`);
    parts.push(`\nPergunte qualquer coisa — matéria, exercícios, dicas ou até desabafar!`);
    return parts.join('\n');
  }

  if (intent === 'farewell') {
    return template(pick(FAREWELLS)[0], name);
  }

  // ═══ 2. META — student context questions ═══

  if (intent === 'math_calc') {
    const result = solveMath(userText);
    if (result) {
      parts.push(`🧮 ${result}`);
      parts.push(`\nQuer mais cálculos ou exercícios de matemática?`);
      return parts.join('\n');
    }
    // If we can't solve it, fall through to web search
  }

  if (intent === 'motivation') {
    parts.push(template(pick(ENCOURAGEMENT)[0], name));
    parts.push('');
    parts.push(`📊 Seus números:`);
    parts.push(`- ⭐ **${context.totalXP} XP** — Nível ${context.level} (${context.levelTitle})`);
    parts.push(`- 🔥 **${context.studyStreak} dia(s)** de ofensiva`);
    parts.push(`- 🍅 **${context.pomodorosDone}** Pomodoros`);
    if (context.strongAreas.length > 0) parts.push(`\n💪 Áreas fortes: **${context.strongAreas.map(a => ENEM_AREAS[a as EnemArea]?.label || a).join(', ')}**`);
    if (/ansie|estress|nervo|medo/i.test(userText)) {
      const tips = TOPIC_KNOWLEDGE.ansiedade;
      if (tips) parts.push(`\n${template(pick(tips)[0], name)}`);
    }
    parts.push(`\n${getTimeBasedTip()}`);
    return parts.join('\n');
  }

  if (intent === 'progress') {
    parts.push(`📊 **Seu Progresso, ${name}:**`);
    parts.push(`- ⭐ XP: **${context.totalXP}** — Nível ${context.level} (${context.levelTitle})`);
    parts.push(`- 🔥 Ofensiva: **${context.studyStreak} dias**`);
    parts.push(`- 🍅 Pomodoros: **${context.pomodorosDone}**`);
    parts.push(`- 🃏 Flashcards: **${context.flashcardsMastered}/${context.flashcardsTotal}** dominados`);
    if (context.simuladosDone > 0) parts.push(`- 📝 Simulados: **${context.simuladosDone}** (média: ${context.simuladoAvgScore || 0}%)`);
    parts.push(`- 📒 Notas: **${context.notesCount}**`);
    if (context.weakAreas.length > 0) parts.push(`\n⚠️ **Precisa atenção:** ${context.weakAreas.join(', ')}`);
    if (context.strongAreas.length > 0) parts.push(`💪 **Mandando bem:** ${context.strongAreas.join(', ')}`);
    return parts.join('\n');
  }

  if (intent === 'weekly_report') return generateWeeklyAnalysis(context, name);

  if (intent === 'tasks') {
    const pending = tasks.filter(t => t.column !== 'done' && !t.archived);
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.column !== 'done');
    const inProgress = tasks.filter(t => t.column === 'doing');
    parts.push(`📋 **Suas tarefas, ${name}:**\n`);
    if (overdue.length > 0) {
      parts.push(`⚠️ **${overdue.length} atrasada(s):**`);
      overdue.slice(0, 5).forEach(t => parts.push(`  - ❌ ${t.title}${t.dueDate ? ` (prazo: ${new Date(t.dueDate).toLocaleDateString('pt-BR')})` : ''}`));
    }
    if (inProgress.length > 0) {
      parts.push(`\n🔄 **${inProgress.length} em andamento:**`);
      inProgress.slice(0, 5).forEach(t => parts.push(`  - 🔄 ${t.title}`));
    }
    const notStarted = pending.filter(t => t.column === 'todo');
    if (notStarted.length > 0) {
      parts.push(`\n📌 **${notStarted.length} não iniciada(s):**`);
      notStarted.slice(0, 5).forEach(t => parts.push(`  - ⬜ ${t.title}`));
    }
    if (pending.length === 0 && overdue.length === 0) parts.push(`✅ Tudo em dia! Parabéns!`);
    return parts.join('\n');
  }

  if (intent === 'study_plan') return generateStudyPlan(context, tasks, name);
  if (intent === 'memorize') return generateMemorizationTips(topics, name);

  // ═══ 3. EXERCISES ═══

  if (mode === 'exercicios' || intent === 'exercise') {
    const pool = area ? QUESTIONS.filter(q => q.area === area) : (topics.length > 0 ? QUESTIONS.filter(q => topics.some(t => q.subject?.toLowerCase().includes(t))) : QUESTIONS);
    const selected = pick(pool.length > 0 ? pool : QUESTIONS, 3);
    parts.push(`Bora treinar, ${name}! 📝\n`);
    selected.forEach((q, i) => {
      parts.push(`**Questão ${i + 1}** *(${q.subject} — ${q.difficulty})*\n`);
      parts.push(`${q.question}\n`);
      q.options.forEach((opt, j) => parts.push(`  **${'ABCDE'[j]})** ${opt}`));
      parts.push(`\n||**Gabarito:** ${'ABCDE'[q.correctIndex]} — ${q.explanation}||\n`);
    });
    parts.push(`Quer mais questões? Tenho **${QUESTIONS.length}** no banco!`);
    return parts.join('\n');
  }

  // ═══ 4. MODE-SPECIFIC (revision, socratic, brainstorm, debate, etc.) ═══

  if (mode === 'revisao') {
    const due = flashcards.filter(f => f.status !== 'mastered').slice(0, 5);
    if (due.length > 0) {
      parts.push(`Hora da revisão, ${name}! 🔄\n`);
      due.forEach((fc, i) => { parts.push(`**${i + 1}.** ${fc.question}`); parts.push(`||${fc.answer}||\n`); });
      parts.push(`Tente responder antes de ver a resposta!`);
    } else {
      parts.push(`🎉 Todos os flashcards dominados, ${name}! Crie novos na aba Flashcards.`);
    }
    return parts.join('\n');
  }

  if (mode === 'socratico') {
    const q = area ? pick(QUESTIONS.filter(q => q.area === area), 1)[0] : pick(QUESTIONS, 1)[0];
    if (q) {
      parts.push(`Hmm, boa pergunta, ${name}! Vamos pensar juntos... 🤔\n`);
      parts.push(`Antes de eu responder, reflita sobre isto:\n`);
      parts.push(`> *${q.question}*\n`);
      parts.push(`O que você já sabe sobre **${q.subject}**? Me conta seu raciocínio!`);
    }
    return parts.join('\n');
  }

  if (mode === 'brainstorm') {
    const themes = [
      { t: 'A influência das redes sociais na saúde mental dos jovens', tip: 'Cite Bauman e dados do IBGE/OMS' },
      { t: 'Inteligência artificial e o futuro do mercado de trabalho', tip: 'Use "destruição criativa" de Schumpeter' },
      { t: 'Fake news e seus impactos na democracia brasileira', tip: 'Cite Hannah Arendt sobre verdade e política' },
      { t: 'Racismo estrutural e seus impactos na educação', tip: 'Use dados do IBGE + Silvio Almeida' },
      { t: 'Privacidade digital e vigilância na era dos dados', tip: 'Use Foucault (panóptico), LGPD, 1984 de Orwell' },
    ];
    const selected = pick(themes, 2);
    parts.push(`Bora brainstorm, ${name}! 💡\n`);
    selected.forEach(({ t, tip }) => {
      parts.push(`📌 **Tema:** ${t}`);
      parts.push(`  - 💡 *Repertório:* ${tip}\n`);
    });
    parts.push(`Escolhe um tema e me manda sua tese!`);
    return parts.join('\n');
  }

  if (mode === 'debate' || mode === 'entrevista' || mode === 'aula' || mode === 'redacao') {
    const modeResps = MODE_RESPONSES[mode];
    if (modeResps) {
      parts.push(template(pick(modeResps)[0], name));
      return parts.join('\n');
    }
  }

  // ═══ 5. WEB SEARCH RESULTS — if available, always use them for knowledge questions ═══

  if (webResults && webResults.length > 0) {
    return synthesizeWebResults(userText, webResults, name);
  }

  // ═══ 6. KNOWLEDGE BASE — match topics from local database ═══

  if (topics.length > 0) {
    const matchedTopics = topics.filter(t => TOPIC_KNOWLEDGE[t]);
    if (matchedTopics.length > 0) {
      // For 'explain' intent, give more focused content
      if (intent === 'explain' || intent === 'general') {
        parts.push(`${pick(TRANSITIONS)[0]}\n`);
        for (const topic of matchedTopics.slice(0, 2)) {
          const knowledge = TOPIC_KNOWLEDGE[topic];
          if (knowledge) {
            // Try to find the most relevant entry
            const queryLower = userText.toLowerCase();
            const relevant = knowledge.filter(k => {
              const kLower = k.toLowerCase();
              return queryLower.split(/\s+/).filter(w => w.length > 3).some(w => kLower.includes(w));
            });
            const items = relevant.length > 0 ? relevant.slice(0, 2) : pick(knowledge, 2);
            items.forEach(item => parts.push(template(item, name)));
            parts.push('');
          }
        }
      } else {
        parts.push(`${pick(TRANSITIONS)[0]}\n`);
        for (const topic of matchedTopics.slice(0, 2)) {
          const knowledge = TOPIC_KNOWLEDGE[topic];
          if (knowledge) {
            pick(knowledge, 2).forEach(item => parts.push(template(item, name)));
            parts.push('');
          }
        }
      }

      const connections = getInterdisciplinaryConnections(matchedTopics[0]);
      if (connections) parts.push(connections);

      const followUps = getFollowUpSuggestions(matchedTopics[0], intent);
      if (followUps.length > 0) {
        parts.push(`\n💬 **Quer continuar?**`);
        followUps.forEach(s => parts.push(`  - *"${s}"*`));
      }

      return parts.join('\n');
    }
  }

  // ═══ 7. COMPARE / SUMMARY with knowledge ═══

  if (intent === 'compare') {
    parts.push(`Vou te ajudar a comparar, ${name}! 📊\n`);
    if (topics.length > 0) {
      const k = TOPIC_KNOWLEDGE[topics[0]];
      if (k) pick(k, 3).forEach(item => parts.push(template(item, name) + '\n'));
    }
    parts.push(`Me diz os dois itens que quer comparar!`);
    return parts.join('\n');
  }

  if (intent === 'summary' && topics.length > 0) {
    parts.push(`📝 **Resumo rápido, ${name}:**\n`);
    for (const topic of topics.slice(0, 2)) {
      const k = TOPIC_KNOWLEDGE[topic];
      if (k) pick(k, 3).forEach(item => parts.push(`• ${template(item, name)}`));
    }
    parts.push(`\nQuer mais detalhes?`);
    return parts.join('\n');
  }

  if (intent === 'tips') {
    parts.push(`${pick(TRANSITIONS)[0]}\n`);
    const tipTopics = topics.length > 0 ? topics : ['produtividade', 'enem'];
    for (const t of tipTopics.slice(0, 2)) {
      const k = TOPIC_KNOWLEDGE[t];
      if (k) { parts.push(template(pick(k)[0], name)); parts.push(''); }
    }
    parts.push(getTimeBasedTip());
    parts.push(`\nQuer dicas mais específicas? Me diz a matéria!`);
    return parts.join('\n');
  }

  if (intent === 'opinion') {
    parts.push(`Como Mentor, não tenho opinião pessoal, ${name}! Mas posso te ajudar a analisar diferentes perspectivas sobre qualquer tema.`);
    parts.push(`\nMe diz o assunto e eu te apresento argumentos a favor e contra!`);
    return parts.join('\n');
  }

  if (intent === 'creative') {
    parts.push(`Vamos criar juntos, ${name}! ✨ Me conta mais sobre o que quer que eu crie e eu monto pra você.`);
    return parts.join('\n');
  }

  // ═══ 8. NEEDS WEB SEARCH — return special marker ═══
  // This response signals MentorChat to trigger a web search
  return `__NEEDS_WEB_SEARCH__`;
}

// ═══ Fallback when web search also fails ═══
export function generateFallbackResponse(userText: string, userName: string): string {
  const name = userName || 'Estudante';
  return `Desculpe, ${name}, não consegui encontrar informações sobre isso agora. Tente reformular a pergunta ou pergunte sobre outra coisa!\n\nPosso te ajudar com:\n- 📝 Questões e exercícios\n- ✍️ Redação e gramática\n- 📊 Seu progresso nos estudos\n- 📅 Plano de estudo\n- 💡 Dicas de qualquer matéria\n- 🧮 Cálculos\n\nÉ só perguntar!`;
}
