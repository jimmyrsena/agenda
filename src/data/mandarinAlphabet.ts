// Comprehensive Mandarin Pinyin alphabet, tones, radicals — fully offline
// Each entry has pinyin, character examples, and pronunciation guide in Portuguese

export interface PinyinInitial {
  pinyin: string;
  ipa: string;
  description: string;
  examples: { char: string; pinyin: string; meaning: string }[];
  tip: string;
}

export interface PinyinFinal {
  pinyin: string;
  ipa: string;
  description: string;
  examples: { char: string; pinyin: string; meaning: string }[];
}

export interface ToneInfo {
  number: number;
  name: string;
  symbol: string;
  description: string;
  example: { char: string; pinyin: string; meaning: string };
  tip: string;
}

export interface RadicalInfo {
  radical: string;
  pinyin: string;
  meaning: string;
  strokes: number;
  examples: { char: string; pinyin: string; meaning: string }[];
}

export interface BasicCharacter {
  char: string;
  pinyin: string;
  meaning: string;
  strokes: number;
  radical: string;
  example: string;
  examplePinyin: string;
  exampleMeaning: string;
}

export interface NumberChar {
  number: number;
  char: string;
  pinyin: string;
  financial?: string;
}

// ==================== 4 TONS + NEUTRO ====================
export const TONES: ToneInfo[] = [
  { number: 1, name: "1º Tom — Alto e plano (阴平)", symbol: "ā", description: "Voz alta e constante, como quando o médico pede para dizer 'aaa'. Mantenha a voz no mesmo nível, sem subir nem descer.", example: { char: "妈", pinyin: "mā", meaning: "mãe" }, tip: "Imagine que está cantando uma nota musical longa e aguda." },
  { number: 2, name: "2º Tom — Ascendente (阳平)", symbol: "á", description: "A voz sobe, como quando você faz uma pergunta em português: 'Hã?' ou 'O quê?'", example: { char: "麻", pinyin: "má", meaning: "linho/cânhamo" }, tip: "Pense na entonação de surpresa: 'É mesmo?!'" },
  { number: 3, name: "3º Tom — Descendente-ascendente (上声)", symbol: "ǎ", description: "A voz desce até o ponto mais grave e depois sobe. É o tom mais difícil. Muitas vezes, na fala rápida, ele só desce (meio-terceiro tom).", example: { char: "马", pinyin: "mǎ", meaning: "cavalo" }, tip: "Imagine que está resmungando 'hmm...' pensativo, com a voz indo para baixo e voltando." },
  { number: 4, name: "4º Tom — Descendente rápido (去声)", symbol: "à", description: "A voz cai bruscamente do agudo ao grave, como uma ordem firme ou quando se diz 'Não!' com firmeza.", example: { char: "骂", pinyin: "mà", meaning: "xingar" }, tip: "Diga 'NÃO!' com firmeza — essa é a entonação do 4º tom." },
  { number: 5, name: "Tom Neutro (轻声)", symbol: "a", description: "Tom leve e curto, sem ênfase. Usado em partículas e sufixos. A altura depende do tom anterior.", example: { char: "吗", pinyin: "ma", meaning: "partícula de pergunta" }, tip: "Diga a sílaba de forma leve e rápida, como se fosse um eco." },
];

// ==================== 21 INICIAIS ====================
export const INITIALS: PinyinInitial[] = [
  { pinyin: "b", ipa: "[p]", description: "Como 'b' em português, mas sem vibração das cordas vocais (não aspirado)", examples: [{ char: "爸", pinyin: "bà", meaning: "pai" }, { char: "八", pinyin: "bā", meaning: "oito" }], tip: "Sopre menos ar que o 'p'" },
  { pinyin: "p", ipa: "[pʰ]", description: "Como 'p' em português com um sopro forte de ar (aspirado)", examples: [{ char: "怕", pinyin: "pà", meaning: "ter medo" }, { char: "跑", pinyin: "pǎo", meaning: "correr" }], tip: "Segure um papel na frente da boca — ele deve se mover com o sopro" },
  { pinyin: "m", ipa: "[m]", description: "Igual ao 'm' em português", examples: [{ char: "妈", pinyin: "mā", meaning: "mãe" }, { char: "猫", pinyin: "māo", meaning: "gato" }], tip: "Idêntico ao português" },
  { pinyin: "f", ipa: "[f]", description: "Igual ao 'f' em português", examples: [{ char: "飞", pinyin: "fēi", meaning: "voar" }, { char: "风", pinyin: "fēng", meaning: "vento" }], tip: "Idêntico ao português" },
  { pinyin: "d", ipa: "[t]", description: "Como 't' em português sem aspiração — a língua toca atrás dos dentes", examples: [{ char: "大", pinyin: "dà", meaning: "grande" }, { char: "对", pinyin: "duì", meaning: "certo" }], tip: "NÃO é o 'd' sonoro do português — é surdo como 't' suave" },
  { pinyin: "t", ipa: "[tʰ]", description: "Como 't' em português com sopro forte de ar", examples: [{ char: "他", pinyin: "tā", meaning: "ele" }, { char: "天", pinyin: "tiān", meaning: "céu/dia" }], tip: "Solte bastante ar ao pronunciar" },
  { pinyin: "n", ipa: "[n]", description: "Igual ao 'n' em português", examples: [{ char: "你", pinyin: "nǐ", meaning: "você" }, { char: "女", pinyin: "nǚ", meaning: "mulher" }], tip: "Idêntico ao português" },
  { pinyin: "l", ipa: "[l]", description: "Igual ao 'l' em português", examples: [{ char: "来", pinyin: "lái", meaning: "vir" }, { char: "老", pinyin: "lǎo", meaning: "velho" }], tip: "Idêntico ao português" },
  { pinyin: "g", ipa: "[k]", description: "Como 'k' suave, sem aspiração — garganta", examples: [{ char: "国", pinyin: "guó", meaning: "país" }, { char: "高", pinyin: "gāo", meaning: "alto" }], tip: "Como 'c' antes de 'a' em português, mas mais suave" },
  { pinyin: "k", ipa: "[kʰ]", description: "Como 'k' com sopro forte de ar (aspirado)", examples: [{ char: "看", pinyin: "kàn", meaning: "ver/olhar" }, { char: "口", pinyin: "kǒu", meaning: "boca" }], tip: "Solte ar forte ao pronunciar" },
  { pinyin: "h", ipa: "[x]", description: "Mais forte que o 'h' inglês — um som aspirado da garganta, como o 'r' carioca suave", examples: [{ char: "好", pinyin: "hǎo", meaning: "bom" }, { char: "喝", pinyin: "hē", meaning: "beber" }], tip: "Como o 'rr' de 'carro' no sotaque carioca, mas mais suave" },
  { pinyin: "j", ipa: "[tɕ]", description: "Entre 'dj' e 'tch' suave — ponta da língua atrás dos dentes inferiores", examples: [{ char: "几", pinyin: "jǐ", meaning: "quantos" }, { char: "家", pinyin: "jiā", meaning: "casa/família" }], tip: "Diga 'dji' com a língua bem à frente" },
  { pinyin: "q", ipa: "[tɕʰ]", description: "Como 'j' mas com sopro forte de ar — 'tch' aspirado", examples: [{ char: "去", pinyin: "qù", meaning: "ir" }, { char: "钱", pinyin: "qián", meaning: "dinheiro" }], tip: "Diga 'tchi' soltando bastante ar" },
  { pinyin: "x", ipa: "[ɕ]", description: "Entre 's' e 'ch' — como um 'ss' sussurrado com a língua atrás dos dentes inferiores", examples: [{ char: "谢", pinyin: "xiè", meaning: "agradecer" }, { char: "小", pinyin: "xiǎo", meaning: "pequeno" }], tip: "Diga 'ssi' com um leve som de 'ch'" },
  { pinyin: "zh", ipa: "[ʈʂ]", description: "Como 'dj' com a língua enrolada para trás (retroflexo)", examples: [{ char: "中", pinyin: "zhōng", meaning: "meio/China" }, { char: "知", pinyin: "zhī", meaning: "saber" }], tip: "Enrole a ponta da língua para trás e diga 'dj'" },
  { pinyin: "ch", ipa: "[ʈʂʰ]", description: "Como 'zh' mas com sopro forte de ar — 'tch' retroflexo", examples: [{ char: "吃", pinyin: "chī", meaning: "comer" }, { char: "出", pinyin: "chū", meaning: "sair" }], tip: "Enrole a língua para trás e solte ar como 'tch'" },
  { pinyin: "sh", ipa: "[ʂ]", description: "Como 'ch' em português (chapéu) com a língua enrolada para trás", examples: [{ char: "是", pinyin: "shì", meaning: "ser/estar" }, { char: "书", pinyin: "shū", meaning: "livro" }], tip: "Diga 'ch' de 'chapéu' com a língua curvada para cima" },
  { pinyin: "r", ipa: "[ʐ]", description: "Som entre 'r' e 'j' — língua enrolada para trás com vibração", examples: [{ char: "人", pinyin: "rén", meaning: "pessoa" }, { char: "日", pinyin: "rì", meaning: "dia/sol" }], tip: "Diga 'j' suave com a língua curvada para trás, como no inglês 'measure'" },
  { pinyin: "z", ipa: "[ts]", description: "Como 'ts' em 'pizza' — sem aspiração", examples: [{ char: "在", pinyin: "zài", meaning: "estar em" }, { char: "做", pinyin: "zuò", meaning: "fazer" }], tip: "Diga 'ts' rápido como em 'pizza'" },
  { pinyin: "c", ipa: "[tsʰ]", description: "Como 'z' mas com sopro forte de ar — 'ts' aspirado", examples: [{ char: "菜", pinyin: "cài", meaning: "vegetal/prato" }, { char: "从", pinyin: "cóng", meaning: "de/desde" }], tip: "Diga 'ts' soltando bastante ar" },
  { pinyin: "s", ipa: "[s]", description: "Igual ao 's' em português", examples: [{ char: "三", pinyin: "sān", meaning: "três" }, { char: "四", pinyin: "sì", meaning: "quatro" }], tip: "Idêntico ao português" },
];

// ==================== FINAIS PRINCIPAIS ====================
export const FINALS: PinyinFinal[] = [
  { pinyin: "a", ipa: "[a]", description: "Como 'a' aberto em 'pá'", examples: [{ char: "大", pinyin: "dà", meaning: "grande" }] },
  { pinyin: "o", ipa: "[o]", description: "Como 'ô' em 'avô'", examples: [{ char: "我", pinyin: "wǒ", meaning: "eu" }] },
  { pinyin: "e", ipa: "[ɤ]", description: "Som que NÃO existe em português — como um 'â' gutural. Abra a boca como para 'a' mas diga 'ê'", examples: [{ char: "喝", pinyin: "hē", meaning: "beber" }] },
  { pinyin: "i", ipa: "[i]", description: "Como 'i' em 'vida'", examples: [{ char: "你", pinyin: "nǐ", meaning: "você" }] },
  { pinyin: "u", ipa: "[u]", description: "Como 'u' em 'uva'", examples: [{ char: "五", pinyin: "wǔ", meaning: "cinco" }] },
  { pinyin: "ü", ipa: "[y]", description: "NÃO existe em português! Diga 'i' com os lábios arredondados como se dissesse 'u'. Como o 'u' francês ou alemão", examples: [{ char: "女", pinyin: "nǚ", meaning: "mulher" }] },
  { pinyin: "ai", ipa: "[ai]", description: "Como 'ai' em 'pai'", examples: [{ char: "爱", pinyin: "ài", meaning: "amor" }] },
  { pinyin: "ei", ipa: "[ei]", description: "Como 'ei' em 'leite'", examples: [{ char: "北", pinyin: "běi", meaning: "norte" }] },
  { pinyin: "ao", ipa: "[au]", description: "Como 'au' em 'mau'", examples: [{ char: "好", pinyin: "hǎo", meaning: "bom" }] },
  { pinyin: "ou", ipa: "[ou]", description: "Como 'ou' em 'ouro'", examples: [{ char: "都", pinyin: "dōu", meaning: "todos" }] },
  { pinyin: "an", ipa: "[an]", description: "Como 'an' em 'canto' (nasal frontal)", examples: [{ char: "三", pinyin: "sān", meaning: "três" }] },
  { pinyin: "en", ipa: "[ən]", description: "Como 'en' nasalizado", examples: [{ char: "人", pinyin: "rén", meaning: "pessoa" }] },
  { pinyin: "ang", ipa: "[aŋ]", description: "Nasal posterior — como 'ang' abrindo a garganta", examples: [{ char: "忙", pinyin: "máng", meaning: "ocupado" }] },
  { pinyin: "eng", ipa: "[əŋ]", description: "Nasal posterior com som mais fechado", examples: [{ char: "风", pinyin: "fēng", meaning: "vento" }] },
  { pinyin: "ong", ipa: "[uŋ]", description: "Como 'ung' com os lábios arredondados", examples: [{ char: "中", pinyin: "zhōng", meaning: "meio" }] },
  { pinyin: "ia", ipa: "[ia]", description: "Como 'ia' em 'família'", examples: [{ char: "家", pinyin: "jiā", meaning: "casa" }] },
  { pinyin: "ie", ipa: "[iɛ]", description: "Como 'iê' em 'dieta'", examples: [{ char: "谢", pinyin: "xiè", meaning: "agradecer" }] },
  { pinyin: "iao", ipa: "[iau]", description: "Como 'iau' — i+au rápido", examples: [{ char: "小", pinyin: "xiǎo", meaning: "pequeno" }] },
  { pinyin: "iu", ipa: "[iou]", description: "Como 'iôu'", examples: [{ char: "六", pinyin: "liù", meaning: "seis" }] },
  { pinyin: "ian", ipa: "[iɛn]", description: "Como 'ien' (NÃO 'ian'!)", examples: [{ char: "天", pinyin: "tiān", meaning: "céu" }] },
  { pinyin: "in", ipa: "[in]", description: "Como 'in' em 'fim'", examples: [{ char: "今", pinyin: "jīn", meaning: "agora/hoje" }] },
  { pinyin: "iang", ipa: "[iaŋ]", description: "i + ang nasal", examples: [{ char: "两", pinyin: "liǎng", meaning: "dois" }] },
  { pinyin: "ing", ipa: "[iŋ]", description: "Como 'ing' em inglês 'sing'", examples: [{ char: "星", pinyin: "xīng", meaning: "estrela" }] },
  { pinyin: "ua", ipa: "[ua]", description: "Como 'ua' em 'quadro'", examples: [{ char: "花", pinyin: "huā", meaning: "flor" }] },
  { pinyin: "uo", ipa: "[uo]", description: "Como 'uô'", examples: [{ char: "国", pinyin: "guó", meaning: "país" }] },
  { pinyin: "uai", ipa: "[uai]", description: "Como 'uai' mineiro!", examples: [{ char: "快", pinyin: "kuài", meaning: "rápido" }] },
  { pinyin: "ui", ipa: "[uei]", description: "Como 'uei' (escrito ui mas lido uei)", examples: [{ char: "对", pinyin: "duì", meaning: "certo" }] },
  { pinyin: "uan", ipa: "[uan]", description: "Como 'uan'", examples: [{ char: "万", pinyin: "wàn", meaning: "dez mil" }] },
  { pinyin: "un", ipa: "[uən]", description: "Como 'uên'", examples: [{ char: "问", pinyin: "wèn", meaning: "perguntar" }] },
  { pinyin: "uang", ipa: "[uaŋ]", description: "u + ang nasal", examples: [{ char: "王", pinyin: "wáng", meaning: "rei/sobrenome" }] },
  { pinyin: "üe", ipa: "[yɛ]", description: "ü + ê — lábios arredondados", examples: [{ char: "月", pinyin: "yuè", meaning: "lua/mês" }] },
  { pinyin: "üan", ipa: "[yan]", description: "ü + an", examples: [{ char: "元", pinyin: "yuán", meaning: "yuan/origem" }] },
  { pinyin: "ün", ipa: "[yn]", description: "ü + n nasal", examples: [{ char: "云", pinyin: "yún", meaning: "nuvem" }] },
];

// ==================== 30 RADICAIS MAIS COMUNS ====================
export const RADICALS: RadicalInfo[] = [
  { radical: "人/亻", pinyin: "rén", meaning: "pessoa", strokes: 2, examples: [{ char: "你", pinyin: "nǐ", meaning: "você" }, { char: "他", pinyin: "tā", meaning: "ele" }, { char: "们", pinyin: "men", meaning: "plural" }] },
  { radical: "口", pinyin: "kǒu", meaning: "boca", strokes: 3, examples: [{ char: "吃", pinyin: "chī", meaning: "comer" }, { char: "喝", pinyin: "hē", meaning: "beber" }, { char: "叫", pinyin: "jiào", meaning: "chamar" }] },
  { radical: "女", pinyin: "nǚ", meaning: "mulher", strokes: 3, examples: [{ char: "妈", pinyin: "mā", meaning: "mãe" }, { char: "她", pinyin: "tā", meaning: "ela" }, { char: "好", pinyin: "hǎo", meaning: "bom" }] },
  { radical: "水/氵", pinyin: "shuǐ", meaning: "água", strokes: 3, examples: [{ char: "河", pinyin: "hé", meaning: "rio" }, { char: "海", pinyin: "hǎi", meaning: "mar" }, { char: "洗", pinyin: "xǐ", meaning: "lavar" }] },
  { radical: "手/扌", pinyin: "shǒu", meaning: "mão", strokes: 3, examples: [{ char: "打", pinyin: "dǎ", meaning: "bater" }, { char: "拿", pinyin: "ná", meaning: "pegar" }, { char: "找", pinyin: "zhǎo", meaning: "procurar" }] },
  { radical: "心/忄", pinyin: "xīn", meaning: "coração", strokes: 4, examples: [{ char: "想", pinyin: "xiǎng", meaning: "pensar" }, { char: "忙", pinyin: "máng", meaning: "ocupado" }, { char: "快", pinyin: "kuài", meaning: "rápido/feliz" }] },
  { radical: "日", pinyin: "rì", meaning: "sol/dia", strokes: 4, examples: [{ char: "明", pinyin: "míng", meaning: "brilhante" }, { char: "时", pinyin: "shí", meaning: "tempo" }, { char: "早", pinyin: "zǎo", meaning: "cedo" }] },
  { radical: "月", pinyin: "yuè", meaning: "lua/mês", strokes: 4, examples: [{ char: "朋", pinyin: "péng", meaning: "amigo" }, { char: "有", pinyin: "yǒu", meaning: "ter" }, { char: "服", pinyin: "fú", meaning: "roupa" }] },
  { radical: "木", pinyin: "mù", meaning: "árvore/madeira", strokes: 4, examples: [{ char: "林", pinyin: "lín", meaning: "floresta" }, { char: "桌", pinyin: "zhuō", meaning: "mesa" }, { char: "椅", pinyin: "yǐ", meaning: "cadeira" }] },
  { radical: "火/灬", pinyin: "huǒ", meaning: "fogo", strokes: 4, examples: [{ char: "热", pinyin: "rè", meaning: "quente" }, { char: "烧", pinyin: "shāo", meaning: "queimar" }, { char: "煮", pinyin: "zhǔ", meaning: "cozinhar" }] },
  { radical: "土", pinyin: "tǔ", meaning: "terra", strokes: 3, examples: [{ char: "地", pinyin: "dì", meaning: "terra/chão" }, { char: "城", pinyin: "chéng", meaning: "cidade" }, { char: "场", pinyin: "chǎng", meaning: "lugar" }] },
  { radical: "金/钅", pinyin: "jīn", meaning: "metal/ouro", strokes: 8, examples: [{ char: "钱", pinyin: "qián", meaning: "dinheiro" }, { char: "银", pinyin: "yín", meaning: "prata" }, { char: "铁", pinyin: "tiě", meaning: "ferro" }] },
  { radical: "言/讠", pinyin: "yán", meaning: "fala/palavra", strokes: 2, examples: [{ char: "说", pinyin: "shuō", meaning: "falar" }, { char: "话", pinyin: "huà", meaning: "palavra" }, { char: "读", pinyin: "dú", meaning: "ler" }] },
  { radical: "走", pinyin: "zǒu", meaning: "caminhar", strokes: 7, examples: [{ char: "起", pinyin: "qǐ", meaning: "levantar" }, { char: "超", pinyin: "chāo", meaning: "super" }] },
  { radical: "足", pinyin: "zú", meaning: "pé", strokes: 7, examples: [{ char: "跑", pinyin: "pǎo", meaning: "correr" }, { char: "跳", pinyin: "tiào", meaning: "pular" }] },
  { radical: "目", pinyin: "mù", meaning: "olho", strokes: 5, examples: [{ char: "看", pinyin: "kàn", meaning: "ver" }, { char: "眼", pinyin: "yǎn", meaning: "olho" }, { char: "睡", pinyin: "shuì", meaning: "dormir" }] },
  { radical: "耳", pinyin: "ěr", meaning: "orelha", strokes: 6, examples: [{ char: "听", pinyin: "tīng", meaning: "ouvir" }, { char: "闻", pinyin: "wén", meaning: "cheirar/notícia" }] },
  { radical: "食/饣", pinyin: "shí", meaning: "comida", strokes: 3, examples: [{ char: "饭", pinyin: "fàn", meaning: "arroz/refeição" }, { char: "饺", pinyin: "jiǎo", meaning: "dumpling" }, { char: "饿", pinyin: "è", meaning: "faminto" }] },
  { radical: "车", pinyin: "chē", meaning: "veículo", strokes: 4, examples: [{ char: "轮", pinyin: "lún", meaning: "roda" }, { char: "辆", pinyin: "liàng", meaning: "classificador de veículos" }] },
  { radical: "门", pinyin: "mén", meaning: "porta", strokes: 3, examples: [{ char: "们", pinyin: "men", meaning: "plural" }, { char: "问", pinyin: "wèn", meaning: "perguntar" }, { char: "间", pinyin: "jiān", meaning: "entre/quarto" }] },
  { radical: "大", pinyin: "dà", meaning: "grande", strokes: 3, examples: [{ char: "天", pinyin: "tiān", meaning: "céu" }, { char: "太", pinyin: "tài", meaning: "muito" }] },
  { radical: "小", pinyin: "xiǎo", meaning: "pequeno", strokes: 3, examples: [{ char: "少", pinyin: "shǎo", meaning: "pouco" }, { char: "尖", pinyin: "jiān", meaning: "pontudo" }] },
  { radical: "山", pinyin: "shān", meaning: "montanha", strokes: 3, examples: [{ char: "岸", pinyin: "àn", meaning: "margem" }, { char: "岛", pinyin: "dǎo", meaning: "ilha" }] },
  { radical: "雨", pinyin: "yǔ", meaning: "chuva", strokes: 8, examples: [{ char: "雪", pinyin: "xuě", meaning: "neve" }, { char: "电", pinyin: "diàn", meaning: "eletricidade" }, { char: "雷", pinyin: "léi", meaning: "trovão" }] },
  { radical: "竹/⺮", pinyin: "zhú", meaning: "bambu", strokes: 6, examples: [{ char: "笔", pinyin: "bǐ", meaning: "caneta" }, { char: "筷", pinyin: "kuài", meaning: "pauzinho" }] },
  { radical: "衣/衤", pinyin: "yī", meaning: "roupa", strokes: 5, examples: [{ char: "裤", pinyin: "kù", meaning: "calça" }, { char: "被", pinyin: "bèi", meaning: "cobertor/passiva" }] },
  { radical: "力", pinyin: "lì", meaning: "força", strokes: 2, examples: [{ char: "动", pinyin: "dòng", meaning: "mover" }, { char: "办", pinyin: "bàn", meaning: "fazer/resolver" }] },
  { radical: "刀/刂", pinyin: "dāo", meaning: "faca", strokes: 2, examples: [{ char: "到", pinyin: "dào", meaning: "chegar" }, { char: "别", pinyin: "bié", meaning: "não/outro" }] },
  { radical: "田", pinyin: "tián", meaning: "campo", strokes: 5, examples: [{ char: "男", pinyin: "nán", meaning: "homem" }, { char: "思", pinyin: "sī", meaning: "pensar" }] },
  { radical: "马", pinyin: "mǎ", meaning: "cavalo", strokes: 3, examples: [{ char: "吗", pinyin: "ma", meaning: "partícula de pergunta" }, { char: "妈", pinyin: "mā", meaning: "mãe" }] },
];

// ==================== NÚMEROS 1-10 + ESPECIAIS ====================
export const NUMBERS: NumberChar[] = [
  { number: 0, char: "零", pinyin: "líng" },
  { number: 1, char: "一", pinyin: "yī", financial: "壹" },
  { number: 2, char: "二", pinyin: "èr", financial: "贰" },
  { number: 3, char: "三", pinyin: "sān", financial: "叁" },
  { number: 4, char: "四", pinyin: "sì", financial: "肆" },
  { number: 5, char: "五", pinyin: "wǔ", financial: "伍" },
  { number: 6, char: "六", pinyin: "liù", financial: "陆" },
  { number: 7, char: "七", pinyin: "qī", financial: "柒" },
  { number: 8, char: "八", pinyin: "bā", financial: "捌" },
  { number: 9, char: "九", pinyin: "jiǔ", financial: "玖" },
  { number: 10, char: "十", pinyin: "shí", financial: "拾" },
  { number: 100, char: "百", pinyin: "bǎi", financial: "佰" },
  { number: 1000, char: "千", pinyin: "qiān", financial: "仟" },
  { number: 10000, char: "万", pinyin: "wàn" },
];

// ==================== 100 CARACTERES ESSENCIAIS ====================
export const ESSENTIAL_CHARACTERS: BasicCharacter[] = [
  { char: "我", pinyin: "wǒ", meaning: "eu", strokes: 7, radical: "戈", example: "我是学生。", examplePinyin: "Wǒ shì xuéshēng.", exampleMeaning: "Eu sou estudante." },
  { char: "你", pinyin: "nǐ", meaning: "você", strokes: 7, radical: "亻", example: "你好吗？", examplePinyin: "Nǐ hǎo ma?", exampleMeaning: "Como vai?" },
  { char: "他", pinyin: "tā", meaning: "ele", strokes: 5, radical: "亻", example: "他是老师。", examplePinyin: "Tā shì lǎoshī.", exampleMeaning: "Ele é professor." },
  { char: "她", pinyin: "tā", meaning: "ela", strokes: 6, radical: "女", example: "她很好。", examplePinyin: "Tā hěn hǎo.", exampleMeaning: "Ela está bem." },
  { char: "是", pinyin: "shì", meaning: "ser/estar", strokes: 9, radical: "日", example: "这是书。", examplePinyin: "Zhè shì shū.", exampleMeaning: "Isto é um livro." },
  { char: "的", pinyin: "de", meaning: "partícula possessiva", strokes: 8, radical: "白", example: "我的书", examplePinyin: "wǒ de shū", exampleMeaning: "meu livro" },
  { char: "了", pinyin: "le", meaning: "partícula de conclusão", strokes: 2, radical: "乛", example: "我吃了。", examplePinyin: "Wǒ chī le.", exampleMeaning: "Eu comi." },
  { char: "不", pinyin: "bù", meaning: "não", strokes: 4, radical: "一", example: "不好。", examplePinyin: "Bù hǎo.", exampleMeaning: "Não é bom." },
  { char: "在", pinyin: "zài", meaning: "estar em", strokes: 6, radical: "土", example: "我在家。", examplePinyin: "Wǒ zài jiā.", exampleMeaning: "Estou em casa." },
  { char: "有", pinyin: "yǒu", meaning: "ter/haver", strokes: 6, radical: "月", example: "我有书。", examplePinyin: "Wǒ yǒu shū.", exampleMeaning: "Eu tenho um livro." },
  { char: "大", pinyin: "dà", meaning: "grande", strokes: 3, radical: "大", example: "很大。", examplePinyin: "Hěn dà.", exampleMeaning: "Muito grande." },
  { char: "小", pinyin: "xiǎo", meaning: "pequeno", strokes: 3, radical: "小", example: "很小。", examplePinyin: "Hěn xiǎo.", exampleMeaning: "Muito pequeno." },
  { char: "好", pinyin: "hǎo", meaning: "bom", strokes: 6, radical: "女", example: "你好！", examplePinyin: "Nǐ hǎo!", exampleMeaning: "Olá!" },
  { char: "人", pinyin: "rén", meaning: "pessoa", strokes: 2, radical: "人", example: "中国人", examplePinyin: "Zhōngguó rén", exampleMeaning: "pessoa chinesa" },
  { char: "来", pinyin: "lái", meaning: "vir", strokes: 7, radical: "木", example: "你来吗？", examplePinyin: "Nǐ lái ma?", exampleMeaning: "Você vem?" },
  { char: "去", pinyin: "qù", meaning: "ir", strokes: 5, radical: "厶", example: "我去学校。", examplePinyin: "Wǒ qù xuéxiào.", exampleMeaning: "Vou à escola." },
  { char: "吃", pinyin: "chī", meaning: "comer", strokes: 6, radical: "口", example: "吃饭。", examplePinyin: "Chī fàn.", exampleMeaning: "Comer." },
  { char: "喝", pinyin: "hē", meaning: "beber", strokes: 12, radical: "口", example: "喝水。", examplePinyin: "Hē shuǐ.", exampleMeaning: "Beber água." },
  { char: "看", pinyin: "kàn", meaning: "ver/olhar", strokes: 9, radical: "目", example: "看书。", examplePinyin: "Kàn shū.", exampleMeaning: "Ler livro." },
  { char: "听", pinyin: "tīng", meaning: "ouvir", strokes: 7, radical: "口", example: "听音乐。", examplePinyin: "Tīng yīnyuè.", exampleMeaning: "Ouvir música." },
  { char: "说", pinyin: "shuō", meaning: "falar", strokes: 9, radical: "讠", example: "说中文。", examplePinyin: "Shuō zhōngwén.", exampleMeaning: "Falar chinês." },
  { char: "写", pinyin: "xiě", meaning: "escrever", strokes: 5, radical: "冖", example: "写字。", examplePinyin: "Xiě zì.", exampleMeaning: "Escrever caracteres." },
  { char: "读", pinyin: "dú", meaning: "ler", strokes: 10, radical: "讠", example: "读书。", examplePinyin: "Dú shū.", exampleMeaning: "Estudar." },
  { char: "学", pinyin: "xué", meaning: "estudar", strokes: 8, radical: "子", example: "学中文。", examplePinyin: "Xué zhōngwén.", exampleMeaning: "Estudar chinês." },
  { char: "家", pinyin: "jiā", meaning: "casa/família", strokes: 10, radical: "宀", example: "回家。", examplePinyin: "Huí jiā.", exampleMeaning: "Voltar para casa." },
  { char: "水", pinyin: "shuǐ", meaning: "água", strokes: 4, radical: "水", example: "喝水。", examplePinyin: "Hē shuǐ.", exampleMeaning: "Beber água." },
  { char: "火", pinyin: "huǒ", meaning: "fogo", strokes: 4, radical: "火", example: "火车。", examplePinyin: "Huǒchē.", exampleMeaning: "Trem." },
  { char: "山", pinyin: "shān", meaning: "montanha", strokes: 3, radical: "山", example: "大山。", examplePinyin: "Dà shān.", exampleMeaning: "Grande montanha." },
  { char: "天", pinyin: "tiān", meaning: "céu/dia", strokes: 4, radical: "大", example: "今天。", examplePinyin: "Jīntiān.", exampleMeaning: "Hoje." },
  { char: "地", pinyin: "dì", meaning: "terra/chão", strokes: 6, radical: "土", example: "地方。", examplePinyin: "Dìfāng.", exampleMeaning: "Lugar." },
  { char: "中", pinyin: "zhōng", meaning: "meio/China", strokes: 4, radical: "丨", example: "中国。", examplePinyin: "Zhōngguó.", exampleMeaning: "China." },
  { char: "国", pinyin: "guó", meaning: "país", strokes: 8, radical: "囗", example: "中国人。", examplePinyin: "Zhōngguó rén.", exampleMeaning: "Chinês." },
  { char: "年", pinyin: "nián", meaning: "ano", strokes: 6, radical: "干", example: "今年。", examplePinyin: "Jīnnián.", exampleMeaning: "Este ano." },
  { char: "月", pinyin: "yuè", meaning: "lua/mês", strokes: 4, radical: "月", example: "一月。", examplePinyin: "Yī yuè.", exampleMeaning: "Janeiro." },
  { char: "日", pinyin: "rì", meaning: "dia/sol", strokes: 4, radical: "日", example: "生日。", examplePinyin: "Shēngrì.", exampleMeaning: "Aniversário." },
  { char: "上", pinyin: "shàng", meaning: "cima/subir", strokes: 3, radical: "一", example: "上学。", examplePinyin: "Shàng xué.", exampleMeaning: "Ir à escola." },
  { char: "下", pinyin: "xià", meaning: "baixo/descer", strokes: 3, radical: "一", example: "下午。", examplePinyin: "Xiàwǔ.", exampleMeaning: "Tarde." },
  { char: "前", pinyin: "qián", meaning: "frente/antes", strokes: 9, radical: "刂", example: "前面。", examplePinyin: "Qiánmiàn.", exampleMeaning: "Na frente." },
  { char: "后", pinyin: "hòu", meaning: "atrás/depois", strokes: 6, radical: "口", example: "后面。", examplePinyin: "Hòumiàn.", exampleMeaning: "Atrás." },
  { char: "多", pinyin: "duō", meaning: "muito/muitos", strokes: 6, radical: "夕", example: "多少？", examplePinyin: "Duōshǎo?", exampleMeaning: "Quanto?" },
  { char: "少", pinyin: "shǎo", meaning: "pouco", strokes: 4, radical: "小", example: "很少。", examplePinyin: "Hěn shǎo.", exampleMeaning: "Muito pouco." },
  { char: "爱", pinyin: "ài", meaning: "amor/amar", strokes: 10, radical: "爫", example: "我爱你。", examplePinyin: "Wǒ ài nǐ.", exampleMeaning: "Eu te amo." },
  { char: "想", pinyin: "xiǎng", meaning: "pensar/querer", strokes: 13, radical: "心", example: "我想去。", examplePinyin: "Wǒ xiǎng qù.", exampleMeaning: "Quero ir." },
  { char: "要", pinyin: "yào", meaning: "querer/precisar", strokes: 9, radical: "覀", example: "我要水。", examplePinyin: "Wǒ yào shuǐ.", exampleMeaning: "Quero água." },
  { char: "会", pinyin: "huì", meaning: "saber/poder", strokes: 6, radical: "人", example: "我会说中文。", examplePinyin: "Wǒ huì shuō zhōngwén.", exampleMeaning: "Sei falar chinês." },
  { char: "能", pinyin: "néng", meaning: "poder/capacidade", strokes: 10, radical: "月", example: "你能来吗？", examplePinyin: "Nǐ néng lái ma?", exampleMeaning: "Você pode vir?" },
  { char: "很", pinyin: "hěn", meaning: "muito", strokes: 9, radical: "彳", example: "很好。", examplePinyin: "Hěn hǎo.", exampleMeaning: "Muito bom." },
  { char: "也", pinyin: "yě", meaning: "também", strokes: 3, radical: "乙", example: "我也去。", examplePinyin: "Wǒ yě qù.", exampleMeaning: "Eu também vou." },
  { char: "都", pinyin: "dōu", meaning: "todos", strokes: 10, radical: "阝", example: "都好。", examplePinyin: "Dōu hǎo.", exampleMeaning: "Todos estão bem." },
  { char: "这", pinyin: "zhè", meaning: "este/isto", strokes: 7, radical: "辶", example: "这是什么？", examplePinyin: "Zhè shì shénme?", exampleMeaning: "O que é isto?" },
];

// ==================== TONE CHANGE RULES ====================
export const TONE_RULES = [
  { rule: "3º + 3º → 2º + 3º", example: "你好", pinyin: "ní hǎo (escrito nǐ hǎo)", explanation: "Quando dois 3ºs tons se encontram, o primeiro muda para 2º tom. Exemplo: 你好 se pronuncia ní hǎo, mas se escreve nǐ hǎo." },
  { rule: "不 (bù) + 4º tom → bú + 4º tom", example: "不是 → bú shì", pinyin: "bú shì", explanation: "不 (bù, 4º tom) muda para 2º tom (bú) antes de outro 4º tom." },
  { rule: "一 (yī) muda conforme o tom seguinte", example: "一个 → yí gè, 一本 → yì běn", pinyin: "yí gè / yì běn", explanation: "一 muda para 2º tom antes de 4º tom (一个 yí gè), e para 4º tom antes de 1º/2º/3º tom (一本 yì běn)." },
];

// ==================== CLASSIFICADORES COMUNS ====================
export const CLASSIFIERS = [
  { char: "个", pinyin: "gè", usage: "Classificador universal — pessoas, objetos em geral", examples: ["一个人 (yí gè rén) — uma pessoa", "三个苹果 (sān gè píngguǒ) — três maçãs"] },
  { char: "本", pinyin: "běn", usage: "Livros, cadernos, revistas", examples: ["一本书 (yì běn shū) — um livro", "两本杂志 (liǎng běn zázhì) — duas revistas"] },
  { char: "杯", pinyin: "bēi", usage: "Copos, xícaras (bebidas)", examples: ["一杯水 (yì bēi shuǐ) — um copo de água", "一杯咖啡 (yì bēi kāfēi) — um café"] },
  { char: "件", pinyin: "jiàn", usage: "Roupas (parte superior), assuntos", examples: ["一件衣服 (yí jiàn yīfu) — uma peça de roupa", "一件事 (yí jiàn shì) — um assunto"] },
  { char: "条", pinyin: "tiáo", usage: "Objetos longos e finos: ruas, calças, peixes, rios", examples: ["一条路 (yì tiáo lù) — uma rua", "一条鱼 (yì tiáo yú) — um peixe"] },
  { char: "只", pinyin: "zhī", usage: "Animais pequenos, objetos em par (um só)", examples: ["一只猫 (yì zhī māo) — um gato", "一只手 (yì zhī shǒu) — uma mão"] },
  { char: "张", pinyin: "zhāng", usage: "Objetos planos: papel, mesa, foto, cama", examples: ["一张纸 (yì zhāng zhǐ) — uma folha", "一张桌子 (yì zhāng zhuōzi) — uma mesa"] },
  { char: "位", pinyin: "wèi", usage: "Pessoas (formal/respeitoso)", examples: ["一位老师 (yí wèi lǎoshī) — um professor", "三位客人 (sān wèi kèrén) — três convidados"] },
  { char: "块", pinyin: "kuài", usage: "Pedaços, yuan (dinheiro informal)", examples: ["一块钱 (yí kuài qián) — um yuan", "一块蛋糕 (yí kuài dàngāo) — um pedaço de bolo"] },
  { char: "双", pinyin: "shuāng", usage: "Pares: sapatos, meias, pauzinhos", examples: ["一双鞋 (yì shuāng xié) — um par de sapatos", "一双筷子 (yì shuāng kuàizi) — um par de pauzinhos"] },
];
