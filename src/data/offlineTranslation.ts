// Local offline translation using word/phrase dictionaries
// This provides basic translation when the AI server is unavailable

const DICTIONARIES: Record<string, Record<string, string>> = {
  "portuguese-english": {
    "olá": "hello", "oi": "hi", "bom dia": "good morning", "boa tarde": "good afternoon",
    "boa noite": "good night", "tchau": "bye", "adeus": "goodbye", "obrigado": "thank you",
    "obrigada": "thank you", "por favor": "please", "sim": "yes", "não": "no",
    "como vai": "how are you", "como você está": "how are you", "eu": "I", "você": "you",
    "ele": "he", "ela": "she", "nós": "we", "eles": "they", "elas": "they",
    "ser": "to be", "estar": "to be", "ter": "to have", "fazer": "to do/make",
    "ir": "to go", "vir": "to come", "dizer": "to say", "poder": "can",
    "querer": "to want", "saber": "to know", "ver": "to see", "dar": "to give",
    "casa": "house", "escola": "school", "trabalho": "work", "família": "family",
    "amigo": "friend", "amiga": "friend", "livro": "book", "água": "water",
    "comida": "food", "tempo": "time/weather", "dia": "day", "noite": "night",
    "amor": "love", "vida": "life", "mundo": "world", "cidade": "city",
    "país": "country", "nome": "name", "pessoa": "person", "homem": "man",
    "mulher": "woman", "criança": "child", "filho": "son", "filha": "daughter",
    "pai": "father", "mãe": "mother", "irmão": "brother", "irmã": "sister",
    "grande": "big", "pequeno": "small", "bom": "good", "mau": "bad",
    "novo": "new", "velho": "old", "bonito": "beautiful", "feliz": "happy",
    "triste": "sad", "rápido": "fast", "lento": "slow", "muito": "very/much",
    "hoje": "today", "amanhã": "tomorrow", "ontem": "yesterday", "agora": "now",
    "sempre": "always", "nunca": "never", "aqui": "here", "ali": "there",
    "comer": "to eat", "beber": "to drink", "dormir": "to sleep", "falar": "to speak",
    "escrever": "to write", "ler": "to read", "estudar": "to study", "aprender": "to learn",
    "entender": "to understand", "ajudar": "to help", "precisar": "to need",
    "gostar": "to like", "com": "with", "sem": "without", "para": "for/to",
    "de": "of/from", "em": "in/at", "por": "by/for", "entre": "between",
    "sobre": "about/on", "até": "until", "mas": "but", "ou": "or",
    "e": "and", "porque": "because", "quando": "when", "onde": "where",
    "como": "how", "quanto": "how much", "qual": "which", "quem": "who",
    "o que": "what", "desculpe": "sorry", "com licença": "excuse me",
  },
  "portuguese-spanish": {
    "olá": "hola", "oi": "hola", "bom dia": "buenos días", "boa tarde": "buenas tardes",
    "boa noite": "buenas noches", "tchau": "chao", "adeus": "adiós", "obrigado": "gracias",
    "obrigada": "gracias", "por favor": "por favor", "sim": "sí", "não": "no",
    "como vai": "cómo estás", "eu": "yo", "você": "tú/usted", "ele": "él", "ela": "ella",
    "nós": "nosotros", "casa": "casa", "escola": "escuela", "trabalho": "trabajo",
    "família": "familia", "amigo": "amigo", "livro": "libro", "água": "agua",
    "comida": "comida", "dia": "día", "noite": "noche", "amor": "amor", "vida": "vida",
    "grande": "grande", "pequeno": "pequeño", "bom": "bueno", "bonito": "bonito",
    "feliz": "feliz", "triste": "triste", "hoje": "hoy", "amanhã": "mañana",
    "ontem": "ayer", "agora": "ahora", "sempre": "siempre", "nunca": "nunca",
    "comer": "comer", "beber": "beber", "dormir": "dormir", "falar": "hablar",
    "estudar": "estudiar", "aprender": "aprender", "entender": "entender",
    "com": "con", "sem": "sin", "para": "para", "mas": "pero", "ou": "o",
    "e": "y", "porque": "porque", "quando": "cuando", "onde": "donde",
  },
  "portuguese-german": {
    "olá": "hallo", "bom dia": "guten Morgen", "boa tarde": "guten Tag",
    "boa noite": "gute Nacht", "tchau": "tschüss", "obrigado": "danke",
    "por favor": "bitte", "sim": "ja", "não": "nein", "eu": "ich", "você": "du/Sie",
    "ele": "er", "ela": "sie", "nós": "wir", "casa": "Haus", "escola": "Schule",
    "trabalho": "Arbeit", "família": "Familie", "amigo": "Freund", "livro": "Buch",
    "água": "Wasser", "comida": "Essen", "dia": "Tag", "noite": "Nacht",
    "amor": "Liebe", "vida": "Leben", "grande": "groß", "pequeno": "klein",
    "bom": "gut", "bonito": "schön", "feliz": "glücklich", "triste": "traurig",
    "hoje": "heute", "amanhã": "morgen", "ontem": "gestern", "agora": "jetzt",
    "comer": "essen", "beber": "trinken", "dormir": "schlafen", "falar": "sprechen",
    "estudar": "studieren", "aprender": "lernen", "com": "mit", "sem": "ohne",
    "e": "und", "mas": "aber", "ou": "oder", "porque": "weil",
  },
  "portuguese-italian": {
    "olá": "ciao", "bom dia": "buongiorno", "boa tarde": "buon pomeriggio",
    "boa noite": "buonanotte", "tchau": "ciao", "obrigado": "grazie",
    "por favor": "per favore", "sim": "sì", "não": "no", "eu": "io", "você": "tu/Lei",
    "ele": "lui", "ela": "lei", "nós": "noi", "casa": "casa", "escola": "scuola",
    "trabalho": "lavoro", "família": "famiglia", "amigo": "amico", "livro": "libro",
    "água": "acqua", "comida": "cibo", "dia": "giorno", "noite": "notte",
    "amor": "amore", "vida": "vita", "grande": "grande", "pequeno": "piccolo",
    "bom": "buono", "bonito": "bello", "feliz": "felice", "triste": "triste",
    "hoje": "oggi", "amanhã": "domani", "ontem": "ieri", "agora": "adesso",
    "comer": "mangiare", "beber": "bere", "dormir": "dormire", "falar": "parlare",
    "estudar": "studiare", "aprender": "imparare", "com": "con", "sem": "senza",
    "e": "e", "mas": "ma", "ou": "o", "porque": "perché",
  },
  "portuguese-mandarin": {
    "olá": "你好 (nǐ hǎo)", "bom dia": "早上好 (zǎoshang hǎo)", "boa tarde": "下午好 (xiàwǔ hǎo)",
    "boa noite": "晚安 (wǎn'ān)", "tchau": "再见 (zàijiàn)", "obrigado": "谢谢 (xièxie)",
    "por favor": "请 (qǐng)", "sim": "是 (shì)", "não": "不 (bù)/没 (méi)",
    "eu": "我 (wǒ)", "você": "你 (nǐ)", "ele": "他 (tā)", "ela": "她 (tā)",
    "nós": "我们 (wǒmen)", "casa": "家 (jiā)", "escola": "学校 (xuéxiào)",
    "trabalho": "工作 (gōngzuò)", "família": "家庭 (jiātíng)", "amigo": "朋友 (péngyou)",
    "livro": "书 (shū)", "água": "水 (shuǐ)", "comida": "食物 (shíwù)",
    "dia": "天 (tiān)", "noite": "夜 (yè)", "amor": "爱 (ài)", "vida": "生活 (shēnghuó)",
    "grande": "大 (dà)", "pequeno": "小 (xiǎo)", "bom": "好 (hǎo)", "bonito": "漂亮 (piàoliang)",
    "feliz": "快乐 (kuàilè)", "triste": "难过 (nánguò)", "hoje": "今天 (jīntiān)",
    "amanhã": "明天 (míngtiān)", "ontem": "昨天 (zuótiān)", "agora": "现在 (xiànzài)",
    "comer": "吃 (chī)", "beber": "喝 (hē)", "dormir": "睡觉 (shuìjiào)",
    "falar": "说 (shuō)", "estudar": "学习 (xuéxí)", "aprender": "学 (xué)",
  },
};

// Build reverse dictionaries
function getReverseDictKey(key: string): string {
  const [a, b] = key.split("-");
  return `${b}-${a}`;
}

function getDictionary(source: string, target: string): Record<string, string> {
  const key = `${source}-${target}`;
  if (DICTIONARIES[key]) return DICTIONARIES[key];
  
  // Try reverse
  const reverseKey = `${target}-${source}`;
  if (DICTIONARIES[reverseKey]) {
    const reversed: Record<string, string> = {};
    for (const [k, v] of Object.entries(DICTIONARIES[reverseKey])) {
      // For multi-meaning entries like "to be", take first part
      const cleanV = v.split("/")[0].replace(/^to /, "").trim();
      reversed[cleanV] = k;
    }
    return reversed;
  }
  
  // Try via portuguese as pivot
  const toPt = DICTIONARIES[`${source}-portuguese`] ? null : getDictViaReverse(source);
  const fromPt = DICTIONARIES[`portuguese-${target}`];
  
  if (fromPt) {
    // Build a bridge: source -> portuguese -> target
    const sourceToPortuguese = DICTIONARIES[`${source}-portuguese`] || buildReverse(`portuguese-${source}`);
    if (sourceToPortuguese && Object.keys(sourceToPortuguese).length > 0) {
      const bridged: Record<string, string> = {};
      for (const [srcWord, ptWord] of Object.entries(sourceToPortuguese)) {
        const ptNorm = ptWord.toLowerCase().trim();
        if (fromPt[ptNorm]) {
          bridged[srcWord] = fromPt[ptNorm];
        }
      }
      return bridged;
    }
  }
  
  return {};
}

function buildReverse(key: string): Record<string, string> {
  const dict = DICTIONARIES[key];
  if (!dict) return {};
  const reversed: Record<string, string> = {};
  for (const [k, v] of Object.entries(dict)) {
    const cleanV = v.split("/")[0].split("(")[0].trim().toLowerCase();
    reversed[cleanV] = k;
  }
  return reversed;
}

function getDictViaReverse(lang: string): Record<string, string> | null {
  const key = `portuguese-${lang}`;
  if (!DICTIONARIES[key]) return null;
  return buildReverse(key);
}

/**
 * Translate text locally using dictionaries.
 * Uses word-by-word replacement with phrase priority.
 */
export function translateLocally(text: string, sourceLang: string, targetLang: string): string {
  if (!text.trim()) return "";
  if (sourceLang === targetLang) return text;
  
  const dict = getDictionary(sourceLang, targetLang);
  if (Object.keys(dict).length === 0) {
    return `[Tradução local indisponível para ${sourceLang} → ${targetLang}]\n\n${text}`;
  }
  
  // Sort phrases by length (longest first) to match multi-word phrases before single words
  const phrases = Object.keys(dict).sort((a, b) => b.length - a.length);
  
  // Process text paragraph by paragraph
  const paragraphs = text.split(/\n+/);
  const translated = paragraphs.map(paragraph => {
    let result = paragraph.toLowerCase();
    
    // Replace phrases first, then words
    for (const phrase of phrases) {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, `{{${dict[phrase]}}}`);
    }
    
    // Remove markers
    result = result.replace(/\{\{/g, '').replace(/\}\}/g, '');
    
    // Capitalize first letter of sentences
    result = result.replace(/(^|[.!?]\s+)([a-záéíóúàèìòùâêîôûãõñäëïöü])/gi, 
      (_, prefix, letter) => prefix + letter.toUpperCase());
    
    return result;
  });
  
  return translated.join("\n\n");
}

/**
 * Check if a language pair has local translation support
 */
export function hasLocalTranslation(sourceLang: string, targetLang: string): boolean {
  const key = `${sourceLang}-${targetLang}`;
  const reverseKey = `${targetLang}-${sourceLang}`;
  return !!(DICTIONARIES[key] || DICTIONARIES[reverseKey] || 
    (DICTIONARIES[`portuguese-${targetLang}`] && DICTIONARIES[`portuguese-${sourceLang}`]));
}
