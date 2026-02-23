// Offline fallback lesson content for when AI API is unavailable
// Provides basic lesson, exercise, conversation, text, and oral data for all languages

import type { } from "react";

interface OfflineLesson {
  title: string;
  explanation: string;
  vocabulary: { term: string; translation: string; example: string }[];
  culturalNote: string;
  practicePrompt: string;
}

interface OfflineExercise {
  title: string;
  questions: { id: number; type: string; question: string; options?: string[]; correctAnswer: string; explanation: string }[];
}

interface OfflineConversation {
  title: string;
  scenario: string;
  dialogue: { speaker: string; line: string; translation: string }[];
  keyPhrases: { phrase: string; meaning: string; usage: string }[];
  practiceTask: string;
}

interface OfflineText {
  title: string;
  text: string;
  glossary: { word: string; meaning: string }[];
  comprehensionQuestions: { question: string; answer: string }[];
}

interface OfflineOral {
  title: string;
  readingPassage: string;
  pronunciationTips: string[];
  conversationPrompts: string[];
  vocabularyFocus: { word: string; phonetic: string; tip: string }[];
}

// Generate a lesson based on topic and language
export function generateOfflineLesson(language: string, topic: string, level: string): OfflineLesson {
  const langName = LANG_NAMES[language] || language;
  
  // Try to find a matching pre-built lesson
  const key = `${language}-${normalizeKey(topic)}`;
  if (LESSONS_DB[key]) return LESSONS_DB[key];
  
  // Generate a generic but useful lesson
  return {
    title: `${topic} — ${langName}`,
    explanation: `# ${topic}\n\n## Introducao\n\nEsta licao aborda o tema **${topic}** no nivel **${level}**.\n\n### Conceitos Fundamentais\n\nO tema "${topic}" e essencial para o dominio do ${langName}. Vamos explorar os principais aspectos:\n\n**1. Contexto e Uso**\nEste topico e frequentemente utilizado em situacoes do dia a dia, tanto em contextos formais quanto informais.\n\n**2. Estrutura**\nPara dominar "${topic}", e importante entender a estrutura basica e como ela se aplica em diferentes contextos.\n\n**3. Pratica**\nA melhor forma de aprender e atraves da pratica constante. Use os exercicios e a conversacao para fixar o conteudo.\n\n### Dicas Importantes\n\n- Pratique todos os dias, mesmo que por poucos minutos\n- Ouca musicas e assista videos no idioma\n- Tente pensar diretamente no idioma, sem traduzir do portugues\n- Nao tenha medo de errar — erros fazem parte do aprendizado\n\n> **Resumindo:** Este topico e fundamental para sua progressao. Domine os vocabularios e pratique a conversacao.`,
    vocabulary: generateVocabulary(language, topic),
    culturalNote: `Dica cultural: Ao estudar ${langName}, lembre-se que cada cultura tem suas proprias expressoes e formas de se comunicar. Pratique com falantes nativos sempre que possivel.`,
    practicePrompt: `Tente criar 3 frases usando o vocabulario aprendido nesta licao sobre "${topic}".`
  };
}

export function generateOfflineExercise(language: string, topic: string, level: string): OfflineExercise {
  const vocab = generateVocabulary(language, topic);
  
  const questions = vocab.slice(0, 5).map((v, i) => ({
    id: i + 1,
    type: "multiple_choice" as const,
    question: `Como se diz "${v.translation}" em ${LANG_NAMES[language] || language}?`,
    options: generateOptions(v.term, language, vocab),
    correctAnswer: "A",
    explanation: `A resposta correta e "${v.term}" que significa "${v.translation}". Exemplo: ${v.example}`
  }));

  return {
    title: `Exercicios: ${topic}`,
    questions
  };
}

export function generateOfflineConversation(language: string, topic: string): OfflineConversation {
  const langName = LANG_NAMES[language] || language;
  const greetings = BASIC_DIALOGUES[language] || BASIC_DIALOGUES["english"];
  
  return {
    title: `Conversacao: ${topic}`,
    scenario: `Voce esta praticando ${langName} com um colega sobre o tema "${topic}". Tente usar as frases-chave abaixo.`,
    dialogue: greetings,
    keyPhrases: BASIC_PHRASES[language] || BASIC_PHRASES["english"],
    practiceTask: `Pratique este dialogo em voz alta. Tente responder sem olhar a traducao.`
  };
}

export function generateOfflineText(language: string, topic: string): OfflineText {
  const langName = LANG_NAMES[language] || language;
  const vocab = generateVocabulary(language, topic);
  
  return {
    title: `Texto: ${topic}`,
    text: READING_TEXTS[language] || `Este e um texto de pratica sobre "${topic}" em ${langName}. A leitura e uma das habilidades mais importantes no aprendizado de idiomas. Pratique lendo em voz alta para melhorar sua pronuncia e compreensao.`,
    glossary: vocab.slice(0, 5).map(v => ({ word: v.term, meaning: v.translation })),
    comprehensionQuestions: [
      { question: `Qual e o tema principal do texto?`, answer: topic },
      { question: `Cite dois vocabularios importantes mencionados.`, answer: vocab.slice(0, 2).map(v => v.term).join(", ") },
      { question: `Por que a pratica constante e importante?`, answer: `A pratica constante ajuda a fixar o vocabulario e melhorar a fluencia.` }
    ]
  };
}

export function generateOfflineOral(language: string, topic: string): OfflineOral {
  const vocab = generateVocabulary(language, topic);
  
  return {
    title: `Prova Oral: ${topic}`,
    readingPassage: ORAL_PASSAGES[language] || `Practice reading this passage about "${topic}". Focus on pronunciation and rhythm.`,
    pronunciationTips: PRONUNCIATION_TIPS[language] || ["Focus on clear enunciation", "Pay attention to word stress", "Practice vowel sounds"],
    conversationPrompts: [
      `Fale sobre sua experiencia com "${topic}".`,
      `O que voce acha mais dificil neste assunto?`,
      `Como voce pratica ${LANG_NAMES[language]} no dia a dia?`
    ],
    vocabularyFocus: vocab.slice(0, 4).map(v => ({
      word: v.term,
      phonetic: v.term,
      tip: `Pratique a pronuncia de "${v.term}" em voz alta.`
    }))
  };
}

// ==================== DATA ====================

const LANG_NAMES: Record<string, string> = {
  english: "Ingles",
  spanish: "Espanhol",
  german: "Alemao",
  italian: "Italiano",
  mandarin: "Mandarim",
  portuguese: "Portugues",
};

function normalizeKey(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").slice(0, 40);
}

function generateVocabulary(language: string, topic: string): { term: string; translation: string; example: string }[] {
  const base = VOCABULARY_DB[language];
  if (base) return base;
  
  return [
    { term: "Hello", translation: "Ola", example: "Hello, how are you?" },
    { term: "Thank you", translation: "Obrigado", example: "Thank you very much!" },
    { term: "Please", translation: "Por favor", example: "Please help me." },
    { term: "Yes", translation: "Sim", example: "Yes, I understand." },
    { term: "No", translation: "Nao", example: "No, thank you." },
  ];
}

function generateOptions(correct: string, language: string, vocab: { term: string }[]): string[] {
  const others = vocab.filter(v => v.term !== correct).map(v => v.term);
  const distractors = others.slice(0, 3);
  while (distractors.length < 3) distractors.push("---");
  return [`A) ${correct}`, `B) ${distractors[0]}`, `C) ${distractors[1]}`, `D) ${distractors[2]}`];
}

const VOCABULARY_DB: Record<string, { term: string; translation: string; example: string }[]> = {
  english: [
    { term: "Hello", translation: "Ola", example: "Hello, my name is John." },
    { term: "Goodbye", translation: "Adeus/Tchau", example: "Goodbye, see you tomorrow!" },
    { term: "Please", translation: "Por favor", example: "Please, open the door." },
    { term: "Thank you", translation: "Obrigado(a)", example: "Thank you for your help." },
    { term: "Sorry", translation: "Desculpe", example: "Sorry, I didn't understand." },
    { term: "How are you?", translation: "Como voce esta?", example: "Hi! How are you today?" },
    { term: "I don't understand", translation: "Eu nao entendo", example: "I don't understand this word." },
    { term: "Can you help me?", translation: "Voce pode me ajudar?", example: "Can you help me find the station?" },
  ],
  spanish: [
    { term: "Hola", translation: "Ola", example: "Hola, me llamo Juan." },
    { term: "Adios", translation: "Adeus/Tchau", example: "Adios, hasta manana!" },
    { term: "Por favor", translation: "Por favor", example: "Por favor, abre la puerta." },
    { term: "Gracias", translation: "Obrigado(a)", example: "Muchas gracias por tu ayuda." },
    { term: "Lo siento", translation: "Desculpe/Sinto muito", example: "Lo siento, no entendi." },
    { term: "Como estas?", translation: "Como voce esta?", example: "Hola! Como estas hoy?" },
    { term: "No entiendo", translation: "Nao entendo", example: "No entiendo esta palabra." },
    { term: "Puedes ayudarme?", translation: "Pode me ajudar?", example: "Puedes ayudarme a encontrar la estacion?" },
  ],
  german: [
    { term: "Hallo", translation: "Ola", example: "Hallo, ich heisse Hans." },
    { term: "Tschuss", translation: "Tchau", example: "Tschuss, bis morgen!" },
    { term: "Bitte", translation: "Por favor", example: "Bitte, offne die Tur." },
    { term: "Danke", translation: "Obrigado(a)", example: "Vielen Dank fur deine Hilfe." },
    { term: "Entschuldigung", translation: "Desculpe", example: "Entschuldigung, ich habe nicht verstanden." },
    { term: "Wie geht es Ihnen?", translation: "Como vai?", example: "Hallo! Wie geht es Ihnen heute?" },
    { term: "Ich verstehe nicht", translation: "Nao entendo", example: "Ich verstehe dieses Wort nicht." },
    { term: "Konnen Sie mir helfen?", translation: "Pode me ajudar?", example: "Konnen Sie mir helfen, den Bahnhof zu finden?" },
  ],
  italian: [
    { term: "Ciao", translation: "Ola/Tchau", example: "Ciao, mi chiamo Marco." },
    { term: "Arrivederci", translation: "Ate logo", example: "Arrivederci, a domani!" },
    { term: "Per favore", translation: "Por favor", example: "Per favore, apri la porta." },
    { term: "Grazie", translation: "Obrigado(a)", example: "Grazie mille per il tuo aiuto." },
    { term: "Mi dispiace", translation: "Desculpe/Sinto muito", example: "Mi dispiace, non ho capito." },
    { term: "Come stai?", translation: "Como vai?", example: "Ciao! Come stai oggi?" },
    { term: "Non capisco", translation: "Nao entendo", example: "Non capisco questa parola." },
    { term: "Puoi aiutarmi?", translation: "Pode me ajudar?", example: "Puoi aiutarmi a trovare la stazione?" },
  ],
  mandarin: [
    { term: "你好 (nǐ hǎo)", translation: "Olá", example: "你好，我叫小明。(Nǐ hǎo, wǒ jiào Xiǎo Míng.) — Olá, me chamo Xiao Ming." },
    { term: "再见 (zài jiàn)", translation: "Tchau/Até logo", example: "再见，明天见！(Zài jiàn, míngtiān jiàn!) — Tchau, até amanhã!" },
    { term: "请 (qǐng)", translation: "Por favor", example: "请坐。(Qǐng zuò.) — Por favor, sente-se." },
    { term: "谢谢 (xiè xie)", translation: "Obrigado(a)", example: "非常谢谢！(Fēicháng xiè xie!) — Muito obrigado!" },
    { term: "对不起 (duì bu qǐ)", translation: "Desculpe", example: "对不起，我迟到了。(Duì bu qǐ, wǒ chídào le.) — Desculpe, cheguei atrasado." },
    { term: "没关系 (méi guānxi)", translation: "Não tem problema", example: "没关系，不要紧。(Méi guānxi, bú yào jǐn.) — Não tem problema, relaxa." },
    { term: "你好吗？(nǐ hǎo ma?)", translation: "Como vai?", example: "你好！你好吗？(Nǐ hǎo! Nǐ hǎo ma?) — Olá! Como vai?" },
    { term: "我很好 (wǒ hěn hǎo)", translation: "Estou bem", example: "我很好，谢谢！(Wǒ hěn hǎo, xiè xie!) — Estou bem, obrigado!" },
    { term: "我不懂 (wǒ bù dǒng)", translation: "Não entendo", example: "对不起，我不懂中文。(Duì bu qǐ, wǒ bù dǒng zhōngwén.) — Desculpe, não entendo chinês." },
    { term: "你能帮我吗？(nǐ néng bāng wǒ ma?)", translation: "Pode me ajudar?", example: "请问，你能帮我吗？(Qǐng wèn, nǐ néng bāng wǒ ma?) — Com licença, pode me ajudar?" },
    { term: "多少钱？(duōshǎo qián?)", translation: "Quanto custa?", example: "这个多少钱？(Zhège duōshǎo qián?) — Quanto custa isto?" },
    { term: "我想要 (wǒ xiǎng yào)", translation: "Eu quero/gostaria", example: "我想要一杯咖啡。(Wǒ xiǎng yào yì bēi kāfēi.) — Quero um café." },
    { term: "在哪儿？(zài nǎr?)", translation: "Onde fica?", example: "厕所在哪儿？(Cèsuǒ zài nǎr?) — Onde fica o banheiro?" },
    { term: "我是巴西人 (wǒ shì Bāxī rén)", translation: "Sou brasileiro(a)", example: "你好，我是巴西人。(Nǐ hǎo, wǒ shì Bāxī rén.) — Olá, sou brasileiro." },
    { term: "吃饭 (chī fàn)", translation: "Comer/Refeição", example: "我们去吃饭吧！(Wǒmen qù chī fàn ba!) — Vamos comer!" },
    { term: "喝水 (hē shuǐ)", translation: "Beber água", example: "请给我一杯水。(Qǐng gěi wǒ yì bēi shuǐ.) — Me dê um copo de água, por favor." },
  ],
  portuguese: [
    { term: "Ola", translation: "Hello/Hi", example: "Ola, meu nome e Maria." },
    { term: "Tchau", translation: "Bye", example: "Tchau, ate amanha!" },
    { term: "Por favor", translation: "Please", example: "Por favor, abra a porta." },
    { term: "Obrigado(a)", translation: "Thank you", example: "Muito obrigado pela sua ajuda." },
    { term: "Desculpe", translation: "Sorry", example: "Desculpe, nao entendi." },
    { term: "Como voce esta?", translation: "How are you?", example: "Oi! Como voce esta hoje?" },
    { term: "Nao entendo", translation: "I don't understand", example: "Nao entendo essa palavra." },
    { term: "Pode me ajudar?", translation: "Can you help me?", example: "Pode me ajudar a encontrar a estacao?" },
  ],
};

const BASIC_DIALOGUES: Record<string, { speaker: string; line: string; translation: string }[]> = {
  english: [
    { speaker: "Teacher", line: "Hello! How are you today?", translation: "Ola! Como voce esta hoje?" },
    { speaker: "Student", line: "I'm fine, thank you! And you?", translation: "Estou bem, obrigado! E voce?" },
    { speaker: "Teacher", line: "I'm great! Let's start our lesson.", translation: "Estou otimo! Vamos comecar nossa aula." },
    { speaker: "Student", line: "Sure! I'm ready to learn.", translation: "Claro! Estou pronto para aprender." },
    { speaker: "Teacher", line: "Excellent! Let's practice together.", translation: "Excelente! Vamos praticar juntos." },
  ],
  spanish: [
    { speaker: "Profesor", line: "Hola! Como estas hoy?", translation: "Ola! Como voce esta hoje?" },
    { speaker: "Alumno", line: "Estoy bien, gracias! Y usted?", translation: "Estou bem, obrigado! E o senhor?" },
    { speaker: "Profesor", line: "Muy bien! Empecemos la leccion.", translation: "Muito bem! Vamos comecar a licao." },
    { speaker: "Alumno", line: "Claro! Estoy listo para aprender.", translation: "Claro! Estou pronto para aprender." },
    { speaker: "Profesor", line: "Excelente! Vamos a practicar juntos.", translation: "Excelente! Vamos praticar juntos." },
  ],
  german: [
    { speaker: "Lehrer", line: "Hallo! Wie geht es Ihnen heute?", translation: "Ola! Como vai hoje?" },
    { speaker: "Schuler", line: "Mir geht es gut, danke! Und Ihnen?", translation: "Estou bem, obrigado! E o senhor?" },
    { speaker: "Lehrer", line: "Sehr gut! Fangen wir an.", translation: "Muito bem! Vamos comecar." },
    { speaker: "Schuler", line: "Naturlich! Ich bin bereit.", translation: "Claro! Estou pronto." },
    { speaker: "Lehrer", line: "Ausgezeichnet! Uben wir zusammen.", translation: "Excelente! Vamos praticar juntos." },
  ],
  italian: [
    { speaker: "Professore", line: "Ciao! Come stai oggi?", translation: "Ola! Como vai hoje?" },
    { speaker: "Studente", line: "Sto bene, grazie! E Lei?", translation: "Estou bem, obrigado! E o senhor?" },
    { speaker: "Professore", line: "Benissimo! Cominciamo la lezione.", translation: "Muito bem! Vamos comecar a licao." },
    { speaker: "Studente", line: "Certo! Sono pronto.", translation: "Claro! Estou pronto." },
    { speaker: "Professore", line: "Ottimo! Pratichiamo insieme.", translation: "Otimo! Vamos praticar juntos." },
  ],
  mandarin: [
    { speaker: "老师 (Laoshi)", line: "你好! 你今天怎么样? (Ni hao! Ni jintian zenmeyang?)", translation: "Ola! Como voce esta hoje?" },
    { speaker: "学生 (Xuesheng)", line: "我很好, 谢谢! 您呢? (Wo hen hao, xie xie! Nin ne?)", translation: "Estou bem, obrigado! E o senhor?" },
    { speaker: "老师 (Laoshi)", line: "很好! 我们开始上课吧。(Hen hao! Women kaishi shangke ba.)", translation: "Muito bem! Vamos comecar a aula." },
    { speaker: "学生 (Xuesheng)", line: "好的! 我准备好了。(Hao de! Wo zhunbei hao le.)", translation: "Ok! Estou pronto." },
    { speaker: "老师 (Laoshi)", line: "太好了! 一起练习吧。(Tai hao le! Yiqi lianxi ba.)", translation: "Otimo! Vamos praticar juntos." },
  ],
  portuguese: [
    { speaker: "Professor", line: "Ola! Como voce esta hoje?", translation: "Hello! How are you today?" },
    { speaker: "Aluno", line: "Estou bem, obrigado! E o senhor?", translation: "I'm fine, thank you! And you?" },
    { speaker: "Professor", line: "Muito bem! Vamos comecar a aula.", translation: "Very well! Let's start the class." },
    { speaker: "Aluno", line: "Claro! Estou pronto para aprender.", translation: "Sure! I'm ready to learn." },
    { speaker: "Professor", line: "Excelente! Vamos praticar juntos.", translation: "Excellent! Let's practice together." },
  ],
};

const BASIC_PHRASES: Record<string, { phrase: string; meaning: string; usage: string }[]> = {
  english: [
    { phrase: "How are you?", meaning: "Como voce esta?", usage: "Cumprimento informal comum" },
    { phrase: "Nice to meet you", meaning: "Prazer em conhece-lo", usage: "Ao conhecer alguem pela primeira vez" },
    { phrase: "I would like...", meaning: "Eu gostaria...", usage: "Para fazer pedidos educados" },
    { phrase: "Could you repeat?", meaning: "Poderia repetir?", usage: "Quando nao entendeu algo" },
  ],
  spanish: [
    { phrase: "Como estas?", meaning: "Como voce esta?", usage: "Cumprimento informal" },
    { phrase: "Mucho gusto", meaning: "Muito prazer", usage: "Ao conhecer alguem" },
    { phrase: "Me gustaria...", meaning: "Eu gostaria...", usage: "Pedidos educados" },
    { phrase: "Puede repetir?", meaning: "Pode repetir?", usage: "Quando nao entendeu" },
  ],
  german: [
    { phrase: "Wie geht es Ihnen?", meaning: "Como vai?", usage: "Cumprimento formal" },
    { phrase: "Freut mich", meaning: "Prazer", usage: "Ao conhecer alguem" },
    { phrase: "Ich mochte...", meaning: "Eu gostaria...", usage: "Pedidos educados" },
    { phrase: "Konnen Sie wiederholen?", meaning: "Pode repetir?", usage: "Quando nao entendeu" },
  ],
  italian: [
    { phrase: "Come stai?", meaning: "Como vai?", usage: "Cumprimento informal" },
    { phrase: "Piacere", meaning: "Prazer", usage: "Ao conhecer alguem" },
    { phrase: "Vorrei...", meaning: "Eu gostaria...", usage: "Pedidos educados" },
    { phrase: "Puo ripetere?", meaning: "Pode repetir?", usage: "Quando nao entendeu" },
  ],
  mandarin: [
    { phrase: "你好吗？(Nǐ hǎo ma?)", meaning: "Como vai?", usage: "Cumprimento básico — tom 3+3 muda para 2+3: ní hǎo" },
    { phrase: "认识你很高兴 (Rènshi nǐ hěn gāoxìng)", meaning: "Prazer em conhecê-lo", usage: "Ao conhecer alguém — 认识 = conhecer" },
    { phrase: "我想要... (Wǒ xiǎng yào...)", meaning: "Eu quero/gostaria...", usage: "Para fazer pedidos — 想 = pensar/querer, 要 = querer/precisar" },
    { phrase: "请再说一遍 (Qǐng zài shuō yí biàn)", meaning: "Por favor, repita", usage: "Quando não entendeu — 再 = de novo, 一遍 = uma vez" },
    { phrase: "这个多少钱？(Zhège duōshǎo qián?)", meaning: "Quanto custa isto?", usage: "Essencial para compras — 多少 = quanto, 钱 = dinheiro" },
    { phrase: "太贵了！(Tài guì le!)", meaning: "Muito caro!", usage: "Para pechinchar — 太 = demais, 贵 = caro" },
    { phrase: "我听不懂 (Wǒ tīng bù dǒng)", meaning: "Não entendo (ouvindo)", usage: "听 = ouvir + 不 = não + 懂 = entender — complemento de resultado" },
    { phrase: "厕所在哪儿？(Cèsuǒ zài nǎr?)", meaning: "Onde fica o banheiro?", usage: "Essencial para viagem — 在 = estar em, 哪儿 = onde" },
  ],
  portuguese: [
    { phrase: "Como voce esta?", meaning: "How are you?", usage: "Common informal greeting" },
    { phrase: "Prazer em conhece-lo", meaning: "Nice to meet you", usage: "Meeting someone new" },
    { phrase: "Eu gostaria...", meaning: "I would like...", usage: "Polite requests" },
    { phrase: "Pode repetir?", meaning: "Can you repeat?", usage: "When you didn't understand" },
  ],
};

const READING_TEXTS: Record<string, string> = {
  english: "Learning a new language opens doors to understanding different cultures and perspectives. Every day, millions of people around the world study English as a second language. The key to success is consistency — even 15 minutes of daily practice can lead to significant improvement over time. Reading, listening, speaking, and writing are all essential skills that should be practiced regularly. Don't be afraid to make mistakes; they are a natural part of the learning process.",
  spanish: "Aprender un nuevo idioma abre puertas a la comprension de diferentes culturas y perspectivas. Cada dia, millones de personas en todo el mundo estudian espanol. La clave del exito es la constancia — incluso 15 minutos de practica diaria pueden llevar a mejoras significativas. La lectura, la escucha, el habla y la escritura son habilidades esenciales que deben practicarse regularmente. No tengas miedo de cometer errores; son una parte natural del proceso de aprendizaje.",
  german: "Eine neue Sprache zu lernen offnet Turen zum Verstandnis verschiedener Kulturen und Perspektiven. Jeden Tag lernen Millionen von Menschen auf der ganzen Welt Deutsch. Der Schlussel zum Erfolg ist Bestandigkeit — selbst 15 Minuten tagliches Uben konnen zu deutlichen Verbesserungen fuhren. Lesen, Horen, Sprechen und Schreiben sind wichtige Fahigkeiten, die regelmasig geubt werden sollten.",
  italian: "Imparare una nuova lingua apre le porte alla comprensione di culture e prospettive diverse. Ogni giorno, milioni di persone in tutto il mondo studiano l'italiano. La chiave del successo e la costanza — anche 15 minuti di pratica quotidiana possono portare a miglioramenti significativi. Lettura, ascolto, conversazione e scrittura sono competenze essenziali da praticare regolarmente.",
  mandarin: "学习一门新语言可以打开了解不同文化和视角的大门。(Xuexi yi men xin yuyan keyi dakai liaojie butong wenhua he shijiao de damen.) 每天，世界各地有数百万人在学习中文。(Meitian, shijie gedi you shu bai wan ren zai xuexi zhongwen.) 成功的关键是坚持——即使每天只练习15分钟，也能带来显著的进步。(Chenggong de guanjian shi jianchi — jishi meitian zhi lianxi 15 fenzhong, ye neng dailai xianzhu de jinbu.)",
  portuguese: "Aprender um novo idioma abre portas para a compreensao de diferentes culturas e perspectivas. Todos os dias, milhoes de pessoas ao redor do mundo estudam portugues. A chave para o sucesso e a constancia — mesmo 15 minutos de pratica diaria podem levar a melhorias significativas ao longo do tempo.",
};

const ORAL_PASSAGES: Record<string, string> = {
  english: "Good morning everyone. Today we will discuss the importance of communication in our daily lives. Communication is not just about speaking — it also involves listening carefully, understanding body language, and expressing our thoughts clearly. Let us practice reading aloud with proper intonation and rhythm.",
  spanish: "Buenos dias a todos. Hoy hablaremos sobre la importancia de la comunicacion en nuestra vida diaria. La comunicacion no se trata solo de hablar — tambien implica escuchar atentamente, comprender el lenguaje corporal y expresar nuestros pensamientos con claridad.",
  german: "Guten Morgen zusammen. Heute sprechen wir uber die Bedeutung der Kommunikation in unserem taglichen Leben. Kommunikation bedeutet nicht nur Sprechen — sie umfasst auch aufmerksames Zuhoren, das Verstehen der Korpersprache und das klare Ausdrucken unserer Gedanken.",
  italian: "Buongiorno a tutti. Oggi parleremo dell'importanza della comunicazione nella nostra vita quotidiana. Comunicare non significa solo parlare — include anche ascoltare attentamente, comprendere il linguaggio del corpo ed esprimere chiaramente i nostri pensieri.",
  mandarin: "大家早上好。(Dajia zaoshang hao.) 今天我们要讨论沟通在日常生活中的重要性。(Jintian women yao taolun goutong zai richang shenghuo zhong de zhongyaoxing.) 沟通不仅仅是说话——还包括仔细倾听、理解肢体语言，以及清晰地表达我们的想法。(Goutong bu jinjin shi shuohua — hai baokuo zixi qingting, lijie zhiti yuyan, yiji qingxi de biaoda women de xiangfa.)",
  portuguese: "Bom dia a todos. Hoje vamos discutir a importancia da comunicacao em nossa vida diaria. Comunicacao nao e apenas falar — tambem envolve ouvir com atencao, compreender a linguagem corporal e expressar nossos pensamentos com clareza.",
};

const PRONUNCIATION_TIPS: Record<string, string[]> = {
  english: [
    "Pay attention to the 'th' sound: place your tongue between your teeth for words like 'the', 'this', 'that'.",
    "Practice the difference between short and long vowels: 'ship' vs 'sheep', 'bit' vs 'beat'.",
    "Word stress is crucial: 'REcord' (noun) vs 'reCORD' (verb).",
  ],
  spanish: [
    "A letra 'r' em espanhol e vibrada (como em 'rato' em portugues). O 'rr' e fortemente vibrado.",
    "A letra 'j' tem som de 'r' aspirado (como o 'ch' alemao): 'Juan', 'jugar'.",
    "O 'z' e o 'c' (antes de 'e/i') na Espanha soam como 'th' ingles (ceceo): 'zapato', 'cielo'.",
  ],
  german: [
    "O 'ch' apos 'a/o/u' tem som gutural (ach-Laut): 'Buch', 'Nacht'. Apos 'e/i' e mais suave (ich-Laut): 'ich', 'nicht'.",
    "O 'u' (com trema) tem um som que nao existe em portugues. Faca 'i' com os labios arredondados como 'u'.",
    "O 'r' alemao e gutural, produzido na garganta: 'rot', 'Reise'.",
  ],
  italian: [
    "As consoantes duplas devem ser pronunciadas com mais forca e duracao: 'palla' vs 'pala'.",
    "O 'gli' tem som de 'lhi' em portugues: 'famiglia', 'figlio'.",
    "O 'gn' tem som de 'nh' em portugues: 'gnocchi', 'bagno'.",
  ],
  mandarin: [
    "O mandarim tem 4 tons + 1 neutro. O MESMO som com tons diferentes tem significados diferentes: mā (妈 mãe), má (麻 linho), mǎ (马 cavalo), mà (骂 xingar), ma (吗 partícula).",
    "O 'x' em pinyin soa entre 's' e 'ch': xiè xie (谢谢 obrigado). Posicione a ponta da língua atrás dos dentes inferiores e sopre.",
    "O 'zh' soa como 'dj' com a língua enrolada para trás (retroflexo): zhōng (中 meio/China). Diferente do 'j' que é frontal.",
    "O 'q' soa como 'tch' com sopro de ar: qù (去 ir), qián (钱 dinheiro). Coloque a ponta da língua atrás dos dentes inferiores.",
    "O 'ü' NÃO existe em português! Diga 'i' com os lábios arredondados como 'u'. Aparece em: nǚ (女 mulher), lǜ (绿 verde).",
    "Regra do 3º tom: quando dois 3ºs tons se encontram, o primeiro vira 2º tom. 你好 se escreve nǐ hǎo mas se diz ní hǎo.",
    "O 'r' chinês NÃO é vibrante como em português. Enrole a língua para trás e produza um som suave, como o 'r' em 'measure' no inglês.",
    "O 'c' em pinyin soa como 'ts' com sopro de ar: cài (菜 vegetal). NÃO como o 'c' de 'casa' em português!",
    "Finais nasais: -n (frontal, como 'an' em 'canto') vs -ng (posterior, como 'ang' de 'gang'). 三 sān vs 上 shàng.",
    "O 'e' sozinho em pinyin NÃO soa como 'e' em português! É um som gutural, como um 'â' dito com a garganta relaxada: 喝 hē (beber).",
  ],
  portuguese: [
    "The nasal sounds 'ao', 'am', 'an' are unique to Portuguese. Practice with 'pao', 'mao', 'nao'.",
    "The 'lh' sound is similar to Italian 'gli' or Spanish 'll': 'filho', 'trabalho'.",
    "The 'r' at the beginning of words sounds like 'h' in English: 'Rio', 'rua'.",
  ],
};

// Pre-built lessons for common topics
const LESSONS_DB: Record<string, OfflineLesson> = {};

// ==================== OFFLINE EVALUATION ====================

export function evaluateTextOffline(
  questions: { question: string; expectedAnswer: string; studentAnswer: string }[]
): { score: number; feedback: string; corrections: { original: string; corrected: string; explanation: string }[]; tips: string[]; encouragement: string } {
  let correct = 0;
  const corrections: { original: string; corrected: string; explanation: string }[] = [];

  for (const q of questions) {
    const student = q.studentAnswer.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const expected = q.expectedAnswer.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!student) continue;

    // Word-level similarity
    const sWords = student.split(/\s+/).filter(Boolean);
    const eWords = expected.split(/\s+/).filter(Boolean);
    let matches = 0;
    eWords.forEach(w => { if (sWords.includes(w)) matches++; });
    const similarity = eWords.length > 0 ? matches / Math.max(sWords.length, eWords.length) : 0;

    if (similarity >= 0.6) {
      correct++;
    } else {
      corrections.push({
        original: q.studentAnswer,
        corrected: q.expectedAnswer,
        explanation: `A resposta esperada era: "${q.expectedAnswer}". Sua resposta cobriu ${Math.round(similarity * 100)}% do conteúdo.`
      });
    }
  }

  const answered = questions.filter(q => q.studentAnswer.trim()).length;
  const score = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return {
    score,
    feedback: score >= 80 ? "Excelente compreensão do texto!" : score >= 60 ? "Boa compreensão, mas revise alguns pontos." : "Releia o texto com atenção e tente novamente.",
    corrections,
    tips: [
      "Releia o texto sublinhando as palavras-chave",
      "Tente responder com suas próprias palavras",
      "Consulte o glossário para termos desconhecidos"
    ],
    encouragement: score >= 60 ? "Continue assim! Você está progredindo! 🎉" : "Não desanime! Cada tentativa é um passo no aprendizado. 💪"
  };
}

export function evaluateSpeechOffline(
  spokenText: string,
  language: string,
  level: string
): {
  score: number; transcription: string; feedback: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  pronunciation_tips: string[]; vocabulary_suggestions: string[];
  encouragement: string; fluency_level: string; next_challenge: string;
} {
  const wordCount = spokenText.trim().split(/\s+/).length;
  const hasBasicStructure = spokenText.includes(" ");
  const langName = LANG_NAMES[language] || language;

  // Simple heuristic scoring
  let score = 50;
  if (wordCount >= 3) score += 10;
  if (wordCount >= 8) score += 10;
  if (wordCount >= 15) score += 10;
  if (hasBasicStructure) score += 5;
  if (/[.!?]/.test(spokenText)) score += 5;
  score = Math.min(score, 90); // Cap at 90 for offline

  const tips = PRONUNCIATION_TIPS[language] || PRONUNCIATION_TIPS["english"] || [];

  return {
    score,
    transcription: spokenText,
    feedback: score >= 70
      ? `Boa pronúncia! Você se expressou bem em ${langName}. Continue praticando para melhorar a fluência.`
      : `Continue praticando ${langName}! Tente falar frases mais completas e com entonação natural.`,
    corrections: [],
    pronunciation_tips: tips.slice(0, 3),
    vocabulary_suggestions: (VOCABULARY_DB[language] || []).slice(0, 3).map(v => `${v.term} — ${v.translation}`),
    encouragement: "Falar em voz alta é o melhor exercício! Continue assim! 🎤",
    fluency_level: score >= 80 ? "Bom" : score >= 60 ? "Em desenvolvimento" : "Iniciante",
    next_challenge: `Tente agora descrever sua rotina diária em ${langName}. Use pelo menos 5 frases completas.`
  };
}
