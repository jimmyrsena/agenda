// Comprehensive alphabet, phonetics, and essential content for English, German, Italian, Portuguese
// Each entry has pronunciation guides in Portuguese and example words with audio support

export interface AlphabetLetter {
  letter: string;
  name: string;
  ipa: string;
  pronunciation: string;
  examples: { word: string; meaning: string }[];
  tip?: string;
}

export interface PhoneticSound {
  sound: string;
  ipa: string;
  description: string;
  examples: { word: string; meaning: string }[];
  tip: string;
}

export interface EssentialPhrase {
  phrase: string;
  pronunciation: string;
  meaning: string;
  context: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  examples: { original: string; translation: string }[];
}

export interface LanguageAlphabetData {
  langId: string;
  langName: string;
  alphabetTitle: string;
  alphabetDescription: string;
  alphabet: AlphabetLetter[];
  specialSounds: PhoneticSound[];
  essentialPhrases: EssentialPhrase[];
  grammarBasics: GrammarPoint[];
  funFacts: string[];
}

// ==================== ENGLISH (AMERICAN) ====================
export const ENGLISH_DATA: LanguageAlphabetData = {
  langId: "english",
  langName: "English",
  alphabetTitle: "The English Alphabet",
  alphabetDescription: "O alfabeto inglês tem 26 letras. Muitas letras têm sons diferentes dependendo da palavra — diferente do português!",
  alphabet: [
    { letter: "A", name: "ei", ipa: "/eɪ/", pronunciation: "Soa como 'êi' — NÃO como 'a' em português", examples: [{ word: "apple", meaning: "maçã" }, { word: "name", meaning: "nome" }], tip: "Tem dois sons: 'æ' curto (cat) e 'eɪ' longo (cake)" },
    { letter: "B", name: "bi", ipa: "/biː/", pronunciation: "Como 'bi' em português", examples: [{ word: "book", meaning: "livro" }, { word: "baby", meaning: "bebê" }] },
    { letter: "C", name: "si", ipa: "/siː/", pronunciation: "Soa como 'si' — NÃO como 'sê'", examples: [{ word: "cat", meaning: "gato" }, { word: "city", meaning: "cidade" }], tip: "Som de 'k' antes de a/o/u (cat), som de 's' antes de e/i (city)" },
    { letter: "D", name: "di", ipa: "/diː/", pronunciation: "Como 'di' — a língua toca atrás dos dentes superiores", examples: [{ word: "dog", meaning: "cachorro" }, { word: "door", meaning: "porta" }] },
    { letter: "E", name: "i", ipa: "/iː/", pronunciation: "Soa como 'i' longo — NÃO como 'e' em português!", examples: [{ word: "eat", meaning: "comer" }, { word: "red", meaning: "vermelho" }], tip: "Nome da letra = 'i', mas o som pode ser /ɛ/ (bed) ou /iː/ (me)" },
    { letter: "F", name: "ef", ipa: "/ɛf/", pronunciation: "Como 'éf'", examples: [{ word: "food", meaning: "comida" }, { word: "fish", meaning: "peixe" }] },
    { letter: "G", name: "dji", ipa: "/dʒiː/", pronunciation: "Soa como 'dji' — NÃO como 'gê'", examples: [{ word: "good", meaning: "bom" }, { word: "girl", meaning: "garota" }], tip: "Som de 'g' duro (go), ou 'dj' suave (gym)" },
    { letter: "H", name: "eitch", ipa: "/eɪtʃ/", pronunciation: "Soa como 'êitch' — o H é SEMPRE pronunciado!", examples: [{ word: "house", meaning: "casa" }, { word: "hello", meaning: "olá" }], tip: "Em inglês o H é aspirado, diferente do português onde é mudo" },
    { letter: "I", name: "ai", ipa: "/aɪ/", pronunciation: "Soa como 'ái' — NÃO como 'i'!", examples: [{ word: "ice", meaning: "gelo" }, { word: "big", meaning: "grande" }], tip: "Nome = 'ai', mas o som curto é /ɪ/ (sit)" },
    { letter: "J", name: "djei", ipa: "/dʒeɪ/", pronunciation: "Soa como 'djêi'", examples: [{ word: "job", meaning: "emprego" }, { word: "jump", meaning: "pular" }] },
    { letter: "K", name: "kei", ipa: "/keɪ/", pronunciation: "Soa como 'kêi'", examples: [{ word: "key", meaning: "chave" }, { word: "king", meaning: "rei" }] },
    { letter: "L", name: "el", ipa: "/ɛl/", pronunciation: "Como 'éu' — o L final é 'dark L' (som de 'u')", examples: [{ word: "love", meaning: "amor" }, { word: "ball", meaning: "bola" }], tip: "O 'dark L' no final das palavras soa quase como 'u': ball = 'bóu'" },
    { letter: "M", name: "em", ipa: "/ɛm/", pronunciation: "Como 'ém'", examples: [{ word: "man", meaning: "homem" }, { word: "mother", meaning: "mãe" }] },
    { letter: "N", name: "en", ipa: "/ɛn/", pronunciation: "Como 'én'", examples: [{ word: "name", meaning: "nome" }, { word: "night", meaning: "noite" }] },
    { letter: "O", name: "ou", ipa: "/oʊ/", pronunciation: "Soa como 'ôu' — NÃO como 'ó'", examples: [{ word: "open", meaning: "abrir" }, { word: "hot", meaning: "quente" }], tip: "Nome = 'ou', som curto = /ɑː/ (hot), som longo = /oʊ/ (go)" },
    { letter: "P", name: "pi", ipa: "/piː/", pronunciation: "Como 'pi' com sopro de ar", examples: [{ word: "pen", meaning: "caneta" }, { word: "play", meaning: "jogar" }] },
    { letter: "Q", name: "kiu", ipa: "/kjuː/", pronunciation: "Soa como 'kiú' — sempre seguido de U", examples: [{ word: "queen", meaning: "rainha" }, { word: "question", meaning: "pergunta" }] },
    { letter: "R", name: "ar", ipa: "/ɑːr/", pronunciation: "Soa como 'ár' — a língua NÃO vibra! Enrole para trás", examples: [{ word: "red", meaning: "vermelho" }, { word: "run", meaning: "correr" }], tip: "O R americano é retroflexo — enrole a ponta da língua para trás sem tocar no céu da boca" },
    { letter: "S", name: "es", ipa: "/ɛs/", pronunciation: "Como 'és'", examples: [{ word: "sun", meaning: "sol" }, { word: "six", meaning: "seis" }] },
    { letter: "T", name: "ti", ipa: "/tiː/", pronunciation: "Como 'ti' com sopro de ar — NÃO é 'tchi'!", examples: [{ word: "time", meaning: "tempo" }, { word: "table", meaning: "mesa" }], tip: "No inglês americano, T entre vogais vira 'flap' (quase um D): water = 'wóder'" },
    { letter: "U", name: "iu", ipa: "/juː/", pronunciation: "Soa como 'iú'", examples: [{ word: "use", meaning: "usar" }, { word: "cup", meaning: "xícara" }], tip: "Nome = 'iu', som curto = /ʌ/ (cup), som longo = /uː/ (blue)" },
    { letter: "V", name: "vi", ipa: "/viː/", pronunciation: "Como 'vi' — lábio inferior toca dentes superiores", examples: [{ word: "very", meaning: "muito" }, { word: "voice", meaning: "voz" }] },
    { letter: "W", name: "dâbliu", ipa: "/ˈdʌbəljuː/", pronunciation: "Soa como 'dâbliu'", examples: [{ word: "water", meaning: "água" }, { word: "world", meaning: "mundo" }], tip: "Som de 'u' rápido com os lábios arredondados" },
    { letter: "X", name: "eks", ipa: "/ɛks/", pronunciation: "Como 'éks'", examples: [{ word: "box", meaning: "caixa" }, { word: "six", meaning: "seis" }] },
    { letter: "Y", name: "uai", ipa: "/waɪ/", pronunciation: "Soa como 'uái'", examples: [{ word: "yes", meaning: "sim" }, { word: "year", meaning: "ano" }] },
    { letter: "Z", name: "zi", ipa: "/ziː/", pronunciation: "Soa como 'zi' (no americano)", examples: [{ word: "zero", meaning: "zero" }, { word: "zoo", meaning: "zoológico" }] },
  ],
  specialSounds: [
    { sound: "TH (voiced)", ipa: "/ð/", description: "Coloque a língua ENTRE os dentes e vibre as cordas vocais", examples: [{ word: "the", meaning: "o/a" }, { word: "this", meaning: "isto" }, { word: "mother", meaning: "mãe" }], tip: "Morda levemente a ponta da língua e diga 'dh'" },
    { sound: "TH (voiceless)", ipa: "/θ/", description: "Língua entre os dentes SEM vibrar as cordas vocais", examples: [{ word: "think", meaning: "pensar" }, { word: "three", meaning: "três" }, { word: "bath", meaning: "banho" }], tip: "Como o TH anterior, mas sem vibração — apenas ar" },
    { sound: "R americano", ipa: "/ɹ/", description: "Enrole a ponta da língua para trás sem tocar no céu da boca", examples: [{ word: "red", meaning: "vermelho" }, { word: "car", meaning: "carro" }, { word: "world", meaning: "mundo" }], tip: "NÃO vibre a língua como o R em português! É retroflexo" },
    { sound: "Schwa", ipa: "/ə/", description: "O som mais comum do inglês! Um 'â' bem relaxado e curto. Aparece em sílabas átonas", examples: [{ word: "about", meaning: "sobre" }, { word: "banana", meaning: "banana" }, { word: "sofa", meaning: "sofá" }], tip: "Relaxe completamente a boca e diga 'â' bem curto" },
    { sound: "Short I", ipa: "/ɪ/", description: "Som entre 'i' e 'e' — mais relaxado que o 'i' português", examples: [{ word: "sit", meaning: "sentar" }, { word: "fish", meaning: "peixe" }, { word: "big", meaning: "grande" }], tip: "ship /ɪ/ vs sheep /iː/ — esta diferença muda o significado!" },
    { sound: "Æ (cat)", ipa: "/æ/", description: "Som entre 'a' e 'é' — abra bem a boca como para 'a' mas diga 'é'", examples: [{ word: "cat", meaning: "gato" }, { word: "hat", meaning: "chapéu" }, { word: "man", meaning: "homem" }], tip: "NÃO existe em português! Abra a boca como para 'a' mas puxe para 'é'" },
    { sound: "NG", ipa: "/ŋ/", description: "Som nasal posterior — como o 'n' de 'banco' mas sem o 'g' depois", examples: [{ word: "sing", meaning: "cantar" }, { word: "ring", meaning: "anel" }, { word: "thing", meaning: "coisa" }], tip: "A ponta da língua NÃO toca em nada — o som sai pelo nariz" },
    { sound: "W", ipa: "/w/", description: "Arredonde os lábios como para 'u' e rapidamente mude para a vogal seguinte", examples: [{ word: "water", meaning: "água" }, { word: "will", meaning: "vai" }, { word: "woman", meaning: "mulher" }], tip: "NÃO é 'v'! Os lábios se arredondam como para assobiar" },
    { sound: "Flap T", ipa: "/ɾ/", description: "No inglês americano, T entre vogais vira um som rápido parecido com o 'r' brasileiro", examples: [{ word: "water", meaning: "água" }, { word: "better", meaning: "melhor" }, { word: "city", meaning: "cidade" }], tip: "water soa como 'wóder', butter como 'bâder'" },
    { sound: "Dark L", ipa: "/ɫ/", description: "L no final de sílaba soa quase como 'u' — a língua sobe ao céu da boca", examples: [{ word: "ball", meaning: "bola" }, { word: "milk", meaning: "leite" }, { word: "cool", meaning: "legal" }], tip: "ball = 'bóu', milk = 'miuk'" },
  ],
  essentialPhrases: [
    { phrase: "How are you doing?", pronunciation: "ráu ar iú dúing?", meaning: "Como você está?", context: "Cumprimento informal americano" },
    { phrase: "I'd like to...", pronunciation: "ái'd láik tú...", meaning: "Eu gostaria de...", context: "Pedidos educados" },
    { phrase: "Could you say that again?", pronunciation: "cúd iú séi dét agên?", meaning: "Poderia repetir?", context: "Quando não entendeu" },
    { phrase: "What do you mean?", pronunciation: "uót du iú mín?", meaning: "O que você quer dizer?", context: "Pedindo esclarecimento" },
    { phrase: "I'm sorry, I don't understand.", pronunciation: "áim sóri, ái dônt ânderstênd.", meaning: "Desculpe, não entendo.", context: "Essencial para iniciantes" },
    { phrase: "Where is the restroom?", pronunciation: "uér iz de réstruum?", meaning: "Onde fica o banheiro?", context: "Americano usa 'restroom' (não 'toilet')" },
    { phrase: "How much does it cost?", pronunciation: "ráu mâtch dâz it cóst?", meaning: "Quanto custa?", context: "Compras" },
    { phrase: "Can I get the check, please?", pronunciation: "kén ái guét de tchék, plíz?", meaning: "Pode trazer a conta?", context: "No restaurante americano" },
    { phrase: "Nice to meet you!", pronunciation: "náis tu mít iú!", meaning: "Prazer em conhecê-lo!", context: "Conhecendo alguém" },
    { phrase: "I'm from Brazil.", pronunciation: "áim from Brazil.", meaning: "Sou do Brasil.", context: "Se apresentando" },
  ],
  grammarBasics: [
    { title: "Verbo TO BE (ser/estar)", explanation: "O verbo mais importante do inglês. Diferente do português, 'ser' e 'estar' são o mesmo verbo!", examples: [{ original: "I am happy.", translation: "Eu estou feliz." }, { original: "She is a teacher.", translation: "Ela é professora." }, { original: "They are Brazilian.", translation: "Eles são brasileiros." }] },
    { title: "Present Simple", explanation: "Para hábitos e verdades. Adicione -s/-es na 3ª pessoa (he/she/it).", examples: [{ original: "I work every day.", translation: "Eu trabalho todo dia." }, { original: "She works at Google.", translation: "Ela trabalha no Google." }, { original: "Do you speak English?", translation: "Você fala inglês?" }] },
    { title: "Present Continuous", explanation: "Para ações acontecendo AGORA. Usa am/is/are + verbo-ing.", examples: [{ original: "I am studying English.", translation: "Estou estudando inglês." }, { original: "She is cooking dinner.", translation: "Ela está fazendo o jantar." }] },
    { title: "Past Simple", explanation: "Para ações concluídas no passado. Verbos regulares: +ed. Irregulares: memorize!", examples: [{ original: "I worked yesterday.", translation: "Trabalhei ontem." }, { original: "She went to school.", translation: "Ela foi à escola." }, { original: "Did you eat?", translation: "Você comeu?" }] },
  ],
  funFacts: [
    "O inglês tem mais de 170.000 palavras em uso — é uma das línguas com mais vocabulário do mundo.",
    "A letra mais usada em inglês é o 'E'. A menos usada é o 'Z'.",
    "A palavra 'set' tem mais de 430 definições no dicionário — o recorde!",
    "'OK' é a palavra mais universalmente reconhecida no mundo.",
    "O inglês americano difere do britânico em mais de 4.000 palavras: truck/lorry, apartment/flat, cookie/biscuit.",
  ],
};

// ==================== GERMAN ====================
export const GERMAN_DATA: LanguageAlphabetData = {
  langId: "german",
  langName: "Deutsch",
  alphabetTitle: "Das deutsche Alphabet",
  alphabetDescription: "O alfabeto alemão tem 26 letras + 4 especiais: Ä, Ö, Ü (vogais com trema) e ß (Eszett/scharfes S).",
  alphabet: [
    { letter: "A", name: "ah", ipa: "/aː/", pronunciation: "Como 'a' aberto em português", examples: [{ word: "Apfel", meaning: "maçã" }, { word: "Abend", meaning: "noite" }] },
    { letter: "B", name: "bê", ipa: "/beː/", pronunciation: "Como 'bê' — no final de palavra soa como 'p'", examples: [{ word: "Buch", meaning: "livro" }, { word: "halb", meaning: "meio" }], tip: "No final: b→p. 'halb' soa 'halp'" },
    { letter: "C", name: "tsê", ipa: "/tseː/", pronunciation: "Soa como 'tsê'", examples: [{ word: "Café", meaning: "café" }, { word: "Computer", meaning: "computador" }] },
    { letter: "D", name: "dê", ipa: "/deː/", pronunciation: "Como 'dê' — no final soa como 't'", examples: [{ word: "Danke", meaning: "obrigado" }, { word: "Hund", meaning: "cachorro" }], tip: "No final: d→t. 'Hund' soa 'Hunt'" },
    { letter: "E", name: "ê", ipa: "/eː/", pronunciation: "Como 'ê' fechado", examples: [{ word: "essen", meaning: "comer" }, { word: "Erde", meaning: "terra" }] },
    { letter: "F", name: "éf", ipa: "/ɛf/", pronunciation: "Como 'éf' em português", examples: [{ word: "Frau", meaning: "mulher/senhora" }, { word: "Freund", meaning: "amigo" }] },
    { letter: "G", name: "guê", ipa: "/geː/", pronunciation: "SEMPRE som de 'g' duro (como 'gato')", examples: [{ word: "gut", meaning: "bom" }, { word: "Geld", meaning: "dinheiro" }], tip: "No final: g→k suave. 'Tag' soa 'Tak'" },
    { letter: "H", name: "há", ipa: "/haː/", pronunciation: "H aspirado como em inglês — ou mudo após vogais", examples: [{ word: "Haus", meaning: "casa" }, { word: "gehen", meaning: "ir" }], tip: "Após vogal, H é mudo e alonga a vogal: gehen = 'gê:en'" },
    { letter: "I", name: "i", ipa: "/iː/", pronunciation: "Como 'i' em português", examples: [{ word: "ich", meaning: "eu" }, { word: "immer", meaning: "sempre" }] },
    { letter: "J", name: "iót", ipa: "/jɔt/", pronunciation: "Soa como 'iót' — o J alemão soa como Y inglês!", examples: [{ word: "ja", meaning: "sim" }, { word: "Jahr", meaning: "ano" }], tip: "J = som de 'i' consonantal. 'ja' soa 'iá'" },
    { letter: "K", name: "ká", ipa: "/kaː/", pronunciation: "Como 'ká'", examples: [{ word: "Kind", meaning: "criança" }, { word: "kalt", meaning: "frio" }] },
    { letter: "L", name: "él", ipa: "/ɛl/", pronunciation: "Sempre 'claro', com a ponta da língua nos dentes", examples: [{ word: "Liebe", meaning: "amor" }, { word: "lesen", meaning: "ler" }] },
    { letter: "M", name: "ém", ipa: "/ɛm/", pronunciation: "Como 'ém'", examples: [{ word: "Mann", meaning: "homem" }, { word: "Mutter", meaning: "mãe" }] },
    { letter: "N", name: "én", ipa: "/ɛn/", pronunciation: "Como 'én'", examples: [{ word: "Name", meaning: "nome" }, { word: "Nacht", meaning: "noite" }] },
    { letter: "O", name: "ô", ipa: "/oː/", pronunciation: "Como 'ô' fechado", examples: [{ word: "ohne", meaning: "sem" }, { word: "Obst", meaning: "fruta" }] },
    { letter: "P", name: "pê", ipa: "/peː/", pronunciation: "Como 'pê' com aspiração", examples: [{ word: "Platz", meaning: "lugar" }, { word: "Polizei", meaning: "polícia" }] },
    { letter: "Q", name: "ku", ipa: "/kuː/", pronunciation: "Como 'ku' — sempre com U", examples: [{ word: "Quelle", meaning: "fonte" }, { word: "Qualität", meaning: "qualidade" }] },
    { letter: "R", name: "ér", ipa: "/ɛʁ/", pronunciation: "R gutural — produzido na garganta como gargarejo suave", examples: [{ word: "rot", meaning: "vermelho" }, { word: "Reise", meaning: "viagem" }], tip: "NÃO vibre a ponta da língua! O R alemão é uvular — na garganta" },
    { letter: "S", name: "és", ipa: "/ɛs/", pronunciation: "Antes de vogal = 'z' sonoro. Caso contrário = 's'", examples: [{ word: "Sonne", meaning: "sol" }, { word: "Haus", meaning: "casa" }], tip: "Sonne = 'zonne', mas Haus = 'haus'" },
    { letter: "T", name: "tê", ipa: "/teː/", pronunciation: "Como 'tê' com aspiração forte", examples: [{ word: "Tag", meaning: "dia" }, { word: "Tisch", meaning: "mesa" }] },
    { letter: "U", name: "u", ipa: "/uː/", pronunciation: "Como 'u' em português", examples: [{ word: "und", meaning: "e" }, { word: "Uhr", meaning: "relógio" }] },
    { letter: "V", name: "fau", ipa: "/faʊ/", pronunciation: "Soa como 'fau' — o V alemão soa como F!", examples: [{ word: "Vater", meaning: "pai" }, { word: "viel", meaning: "muito" }], tip: "V = F! 'Vater' soa 'fáter'. Em palavras estrangeiras pode soar como 'v'" },
    { letter: "W", name: "vê", ipa: "/veː/", pronunciation: "Soa como 'vê' — o W alemão soa como V!", examples: [{ word: "Wasser", meaning: "água" }, { word: "Welt", meaning: "mundo" }], tip: "W = V! 'Wasser' soa 'vásser'" },
    { letter: "X", name: "iks", ipa: "/ɪks/", pronunciation: "Como 'iks'", examples: [{ word: "Text", meaning: "texto" }] },
    { letter: "Y", name: "ípsilon", ipa: "/ˈʏpsilɔn/", pronunciation: "Soa como 'ípsilon'", examples: [{ word: "Typ", meaning: "tipo" }, { word: "Yoga", meaning: "yoga" }] },
    { letter: "Z", name: "tsét", ipa: "/tsɛt/", pronunciation: "Soa como 'tsét' — o Z alemão soa como 'TS'!", examples: [{ word: "Zeit", meaning: "tempo" }, { word: "Zug", meaning: "trem" }], tip: "Z = TS! 'Zeit' soa 'tsáit'" },
    { letter: "Ä", name: "é (a-trema)", ipa: "/ɛː/", pronunciation: "Como 'é' aberto em português", examples: [{ word: "Mädchen", meaning: "garota" }, { word: "Käse", meaning: "queijo" }], tip: "Ä = 'é' aberto. É o A modificado" },
    { letter: "Ö", name: "ö (o-trema)", ipa: "/øː/", pronunciation: "NÃO existe em português! Diga 'ê' com lábios arredondados como 'ô'", examples: [{ word: "schön", meaning: "bonito" }, { word: "böse", meaning: "mau" }], tip: "Posição da língua de 'ê', lábios de 'ô'" },
    { letter: "Ü", name: "ü (u-trema)", ipa: "/yː/", pronunciation: "NÃO existe em português! Diga 'i' com lábios arredondados como 'u'", examples: [{ word: "über", meaning: "sobre" }, { word: "Tür", meaning: "porta" }], tip: "Posição da língua de 'i', lábios de 'u'" },
    { letter: "ß", name: "Eszett", ipa: "/s/", pronunciation: "Soa como 'ss' — S duplo", examples: [{ word: "Straße", meaning: "rua" }, { word: "groß", meaning: "grande" }], tip: "Usado após vogais longas e ditongos. Straße = Strasse" },
  ],
  specialSounds: [
    { sound: "CH (ich-Laut)", ipa: "/ç/", description: "Som suave de 'ch' após e/i/ä/ö/ü/consoantes — como um 'ch' sussurrado", examples: [{ word: "ich", meaning: "eu" }, { word: "nicht", meaning: "não" }, { word: "Milch", meaning: "leite" }], tip: "Diga 'ch' de 'chipre' bem suave, sem a ponta da língua" },
    { sound: "CH (ach-Laut)", ipa: "/x/", description: "Som gutural de 'ch' após a/o/u — como raspar a garganta", examples: [{ word: "Buch", meaning: "livro" }, { word: "Nacht", meaning: "noite" }, { word: "auch", meaning: "também" }], tip: "Como o 'r' de 'rato' no sotaque carioca, mas mais forte" },
    { sound: "SCH", ipa: "/ʃ/", description: "Como 'ch' em 'chapéu' em português", examples: [{ word: "Schule", meaning: "escola" }, { word: "schön", meaning: "bonito" }, { word: "Deutsch", meaning: "alemão" }], tip: "Idêntico ao 'ch' de 'chave' em português!" },
    { sound: "SP / ST", ipa: "/ʃp/ /ʃt/", description: "No início de palavras, SP e ST soam como 'chp' e 'cht'!", examples: [{ word: "Sprache", meaning: "idioma" }, { word: "Straße", meaning: "rua" }, { word: "spielen", meaning: "jogar" }], tip: "Sprache = 'chpráche', Straße = 'chtrásse'" },
    { sound: "EI", ipa: "/aɪ/", description: "Ditongo 'ai' — como 'ai' em 'pai'", examples: [{ word: "Ei", meaning: "ovo" }, { word: "mein", meaning: "meu" }, { word: "nein", meaning: "não" }], tip: "EI = 'ai'. Cuidado: IE = 'i' longo!" },
    { sound: "IE", ipa: "/iː/", description: "Vogal longa 'i' — como 'i' prolongado", examples: [{ word: "Liebe", meaning: "amor" }, { word: "Bier", meaning: "cerveja" }, { word: "viel", meaning: "muito" }], tip: "IE = 'i' longo. O oposto de EI!" },
    { sound: "EU / ÄU", ipa: "/ɔʏ/", description: "Ditongo 'ói' — como 'ói' em 'boi'", examples: [{ word: "heute", meaning: "hoje" }, { word: "Leute", meaning: "pessoas" }, { word: "Häuser", meaning: "casas" }], tip: "EU e ÄU soam iguais: 'ói'" },
    { sound: "PF", ipa: "/pf/", description: "Combinação 'pf' — diga 'p' e 'f' juntos rapidamente", examples: [{ word: "Pferd", meaning: "cavalo" }, { word: "Apfel", meaning: "maçã" }], tip: "Comece com os lábios fechados (p) e abra para (f)" },
    { sound: "R gutural", ipa: "/ʁ/", description: "R produzido na garganta, como gargarejo suave. No final de sílaba, soa como 'â'", examples: [{ word: "rot", meaning: "vermelho" }, { word: "Vater", meaning: "pai" }, { word: "hier", meaning: "aqui" }], tip: "No início: gargarejar suave. No final: vira 'â'. Vater = 'fátâ'" },
  ],
  essentialPhrases: [
    { phrase: "Wie geht es Ihnen?", pronunciation: "ví guêt és ínen?", meaning: "Como vai o senhor/a senhora?", context: "Cumprimento formal" },
    { phrase: "Ich hätte gern...", pronunciation: "ich héte guérn...", meaning: "Eu gostaria de...", context: "Pedidos educados em restaurantes e lojas" },
    { phrase: "Können Sie das wiederholen?", pronunciation: "kénen zí das víder-hôlen?", meaning: "Pode repetir?", context: "Quando não entendeu" },
    { phrase: "Wo ist die Toilette?", pronunciation: "vô ist di toiléte?", meaning: "Onde fica o banheiro?", context: "Essencial para viajantes" },
    { phrase: "Ich verstehe nicht.", pronunciation: "ich ferchté-e nicht.", meaning: "Não entendo.", context: "Quando não compreende" },
    { phrase: "Sprechen Sie Englisch?", pronunciation: "chpréchen zí énglish?", meaning: "Você fala inglês?", context: "Pedindo ajuda" },
    { phrase: "Was kostet das?", pronunciation: "vás kóstet das?", meaning: "Quanto custa isso?", context: "Compras" },
    { phrase: "Die Rechnung, bitte.", pronunciation: "di réchnung, bite.", meaning: "A conta, por favor.", context: "No restaurante" },
    { phrase: "Ich komme aus Brasilien.", pronunciation: "ich kóme aus brazílien.", meaning: "Venho do Brasil.", context: "Se apresentando" },
    { phrase: "Entschuldigung!", pronunciation: "entchúldigung!", meaning: "Com licença! / Desculpe!", context: "Pedindo desculpas ou atenção" },
  ],
  grammarBasics: [
    { title: "Gêneros: der/die/das", explanation: "Alemão tem 3 gêneros: masculino (der), feminino (die), neutro (das). NÃO seguem lógica — memorize com o artigo!", examples: [{ original: "der Mann", translation: "o homem (masculino)" }, { original: "die Frau", translation: "a mulher (feminino)" }, { original: "das Kind", translation: "a criança (neutro)" }] },
    { title: "Ordem V2: verbo na 2ª posição", explanation: "Em frases declarativas, o verbo SEMPRE fica na 2ª posição. Se o sujeito não estiver na 1ª, ele vai para depois do verbo.", examples: [{ original: "Ich lerne Deutsch.", translation: "Eu aprendo alemão." }, { original: "Heute lerne ich Deutsch.", translation: "Hoje aprendo alemão. (verbo na 2ª!)" }] },
    { title: "Casos: Nominativo e Acusativo", explanation: "Alemão tem 4 casos. O mais básico: Nominativo (sujeito) e Acusativo (objeto direto). O artigo muda!", examples: [{ original: "Der Mann sieht den Hund.", translation: "O homem vê o cachorro. (der→den no acusativo masc.)" }, { original: "Ich habe einen Bruder.", translation: "Tenho um irmão. (ein→einen)" }] },
  ],
  funFacts: [
    "Alemão pode criar palavras compostas infinitas! 'Donaudampfschifffahrtsgesellschaft' = companhia de navegação a vapor do Danúbio.",
    "Todos os substantivos em alemão são escritos com MAIÚSCULA: der Hund, die Katze, das Buch.",
    "Goethe usou mais de 90.000 palavras em suas obras — o maior vocabulário de qualquer autor alemão.",
    "O alemão é a língua materna mais falada na União Europeia, com 95 milhões de falantes nativos.",
    "A palavra 'Kindergarten' (jardim de crianças) é uma das muitas palavras alemãs adotadas pelo inglês.",
  ],
};

// ==================== ITALIAN ====================
export const ITALIAN_DATA: LanguageAlphabetData = {
  langId: "italian",
  langName: "Italiano",
  alphabetTitle: "L'Alfabeto Italiano",
  alphabetDescription: "O alfabeto italiano tem 21 letras (não tem J, K, W, X, Y nativamente). O italiano se lê exatamente como se escreve — é fonético!",
  alphabet: [
    { letter: "A", name: "a", ipa: "/a/", pronunciation: "Como 'a' aberto em português", examples: [{ word: "amore", meaning: "amor" }, { word: "acqua", meaning: "água" }] },
    { letter: "B", name: "bi", ipa: "/bi/", pronunciation: "Como 'bi'", examples: [{ word: "bello", meaning: "bonito" }, { word: "buono", meaning: "bom" }] },
    { letter: "C", name: "tchi", ipa: "/tʃi/", pronunciation: "Soa como 'tchi'", examples: [{ word: "casa", meaning: "casa" }, { word: "ciao", meaning: "oi/tchau" }], tip: "C+a/o/u = 'k' (casa). C+e/i = 'tch' (cena, ciao)" },
    { letter: "D", name: "di", ipa: "/di/", pronunciation: "Como 'di'", examples: [{ word: "donna", meaning: "mulher" }, { word: "dolce", meaning: "doce" }] },
    { letter: "E", name: "e", ipa: "/e/", pronunciation: "Pode ser aberto /ɛ/ ou fechado /e/", examples: [{ word: "essere", meaning: "ser" }, { word: "bene", meaning: "bem" }], tip: "Dois sons: 'é' aberto (bello) e 'ê' fechado (sera)" },
    { letter: "F", name: "éffe", ipa: "/ɛffe/", pronunciation: "Como 'éfe'", examples: [{ word: "fatto", meaning: "feito" }, { word: "fiore", meaning: "flor" }] },
    { letter: "G", name: "dji", ipa: "/dʒi/", pronunciation: "Soa como 'dji'", examples: [{ word: "gatto", meaning: "gato" }, { word: "gelato", meaning: "sorvete" }], tip: "G+a/o/u = 'g' duro (gatto). G+e/i = 'dj' (gelato, giro)" },
    { letter: "H", name: "akka", ipa: "/akka/", pronunciation: "SEMPRE MUDO — nunca é pronunciado!", examples: [{ word: "ho", meaning: "tenho" }, { word: "hotel", meaning: "hotel" }], tip: "H é mudo! Só serve para endurecer C e G: che = 'ke', ghi = 'gui'" },
    { letter: "I", name: "i", ipa: "/i/", pronunciation: "Como 'i' em português", examples: [{ word: "Italia", meaning: "Itália" }, { word: "io", meaning: "eu" }] },
    { letter: "L", name: "élle", ipa: "/ɛlle/", pronunciation: "Sempre 'claro' — ponta da língua nos dentes", examples: [{ word: "latte", meaning: "leite" }, { word: "luna", meaning: "lua" }] },
    { letter: "M", name: "émme", ipa: "/ɛmme/", pronunciation: "Como 'éme'", examples: [{ word: "mamma", meaning: "mamãe" }, { word: "mare", meaning: "mar" }] },
    { letter: "N", name: "énne", ipa: "/ɛnne/", pronunciation: "Como 'éne'", examples: [{ word: "nome", meaning: "nome" }, { word: "notte", meaning: "noite" }] },
    { letter: "O", name: "o", ipa: "/o/", pronunciation: "Pode ser aberto /ɔ/ ou fechado /o/", examples: [{ word: "ora", meaning: "hora" }, { word: "otto", meaning: "oito" }], tip: "Dois sons: 'ó' aberto (uomo) e 'ô' fechado (sole)" },
    { letter: "P", name: "pi", ipa: "/pi/", pronunciation: "Como 'pi' — sem aspiração forte", examples: [{ word: "pane", meaning: "pão" }, { word: "pizza", meaning: "pizza" }] },
    { letter: "Q", name: "ku", ipa: "/ku/", pronunciation: "Sempre seguido de U", examples: [{ word: "quando", meaning: "quando" }, { word: "questo", meaning: "este" }] },
    { letter: "R", name: "érre", ipa: "/ɛrre/", pronunciation: "R vibrante — a língua vibra como no R de 'caro' no interior de SP", examples: [{ word: "Roma", meaning: "Roma" }, { word: "rosso", meaning: "vermelho" }], tip: "O R italiano é SEMPRE vibrante (alveolar). Nunca gutural!" },
    { letter: "S", name: "ésse", ipa: "/ɛsse/", pronunciation: "Pode ser surdo /s/ ou sonoro /z/", examples: [{ word: "sole", meaning: "sol" }, { word: "rosa", meaning: "rosa" }], tip: "S entre vogais geralmente é sonoro (como 'z'): rosa = 'rôza'" },
    { letter: "T", name: "ti", ipa: "/ti/", pronunciation: "Como 'ti' — dental, sem aspiração", examples: [{ word: "tempo", meaning: "tempo" }, { word: "tutto", meaning: "tudo" }] },
    { letter: "U", name: "u", ipa: "/u/", pronunciation: "Como 'u' em português", examples: [{ word: "uomo", meaning: "homem" }, { word: "uno", meaning: "um" }] },
    { letter: "V", name: "vu", ipa: "/vu/", pronunciation: "Como 'vu'", examples: [{ word: "vita", meaning: "vida" }, { word: "vino", meaning: "vinho" }] },
    { letter: "Z", name: "dzéta", ipa: "/dzɛta/", pronunciation: "Pode ser surdo /ts/ ou sonoro /dz/", examples: [{ word: "pizza", meaning: "pizza" }, { word: "zero", meaning: "zero" }], tip: "Z surdo: pizza = 'pittsa'. Z sonoro: zero = 'dzéro'" },
  ],
  specialSounds: [
    { sound: "GLI", ipa: "/ʎ/", description: "Como 'lhi' em português: família → famiglia", examples: [{ word: "famiglia", meaning: "família" }, { word: "figlio", meaning: "filho" }, { word: "moglie", meaning: "esposa" }], tip: "Idêntico ao 'lh' de 'filho' em português!" },
    { sound: "GN", ipa: "/ɲ/", description: "Como 'nh' em português: banho → bagno", examples: [{ word: "gnocchi", meaning: "nhoque" }, { word: "bagno", meaning: "banho" }, { word: "sogno", meaning: "sonho" }], tip: "Idêntico ao 'nh' de 'banho' em português!" },
    { sound: "SC + e/i", ipa: "/ʃ/", description: "Como 'ch' em 'chave' em português", examples: [{ word: "pesce", meaning: "peixe" }, { word: "scienza", meaning: "ciência" }, { word: "uscire", meaning: "sair" }], tip: "SC+e/i = 'ch'. SC+a/o/u = 'sk'" },
    { sound: "CHI / CHE", ipa: "/ki/ /ke/", description: "H endurece o C: chi = 'ki', che = 'ke'", examples: [{ word: "chi", meaning: "quem" }, { word: "perché", meaning: "por quê" }, { word: "amiche", meaning: "amigas" }], tip: "O H torna o C duro antes de E e I" },
    { sound: "GHI / GHE", ipa: "/gi/ /ge/", description: "H endurece o G: ghi = 'gui', ghe = 'gue'", examples: [{ word: "spaghetti", meaning: "espaguete" }, { word: "ghiaccio", meaning: "gelo" }], tip: "O H torna o G duro antes de E e I" },
    { sound: "Consoantes duplas", ipa: "longas", description: "Consoantes duplas são pronunciadas MAIS LONGAS e com mais força!", examples: [{ word: "pala → palla", meaning: "pá → bola" }, { word: "casa → cassa", meaning: "casa → caixa" }, { word: "nono → nonno", meaning: "nono → avô" }], tip: "A diferença entre 'pala' e 'palla' muda o significado!" },
    { sound: "CI + vogal", ipa: "/tʃ/+", description: "CI antes de a/o/u soa como 'tcha/tcho/tchu'", examples: [{ word: "ciao", meaning: "oi/tchau" }, { word: "cioccolato", meaning: "chocolate" }], tip: "O I é mudo, só 'amolece' o C" },
    { sound: "GI + vogal", ipa: "/dʒ/+", description: "GI antes de a/o/u soa como 'dja/djo/dju'", examples: [{ word: "giorno", meaning: "dia" }, { word: "già", meaning: "já" }], tip: "O I é mudo, só 'amolece' o G" },
  ],
  essentialPhrases: [
    { phrase: "Come stai?", pronunciation: "kóme stái?", meaning: "Como vai?", context: "Cumprimento informal" },
    { phrase: "Vorrei...", pronunciation: "vorréi...", meaning: "Eu gostaria de...", context: "Pedidos educados — condicional de volere" },
    { phrase: "Può ripetere, per favore?", pronunciation: "puó ripétere, per favóre?", meaning: "Pode repetir, por favor?", context: "Quando não entendeu" },
    { phrase: "Dov'è il bagno?", pronunciation: "dovê il bánho?", meaning: "Onde fica o banheiro?", context: "Essencial para viajantes" },
    { phrase: "Non capisco.", pronunciation: "non kapísko.", meaning: "Não entendo.", context: "Quando não compreende" },
    { phrase: "Quanto costa?", pronunciation: "kuánto kósta?", meaning: "Quanto custa?", context: "Compras" },
    { phrase: "Il conto, per favore.", pronunciation: "il kónto, per favóre.", meaning: "A conta, por favor.", context: "No restaurante" },
    { phrase: "Sono brasiliano/a.", pronunciation: "sóno brasiliáno/a.", meaning: "Sou brasileiro/a.", context: "Se apresentando" },
    { phrase: "Mi scusi!", pronunciation: "mi skúzi!", meaning: "Com licença! (formal)", context: "Pedindo atenção/desculpa" },
    { phrase: "Che bello!", pronunciation: "ke béllo!", meaning: "Que lindo!", context: "Expressão de admiração" },
  ],
  grammarBasics: [
    { title: "Artigos: il/lo/la/i/gli/le", explanation: "Italiano tem MUITOS artigos! Il (masc), lo (masc especial), la (fem), i (masc pl), gli (masc pl especial), le (fem pl).", examples: [{ original: "il libro", translation: "o livro" }, { original: "lo studente", translation: "o estudante (lo antes de s+cons)" }, { original: "gli amici", translation: "os amigos (gli antes de vogal)" }] },
    { title: "Verbos regulares: -ARE, -ERE, -IRE", explanation: "3 conjugações regulares. Muito parecido com português!", examples: [{ original: "Io parlo italiano.", translation: "Eu falo italiano. (-ARE)" }, { original: "Tu leggi il libro.", translation: "Você lê o livro. (-ERE)" }, { original: "Lei capisce tutto.", translation: "Ela entende tudo. (-IRE com -isc)" }] },
    { title: "Essere vs Stare vs Avere", explanation: "Italiano distingue 'essere' (ser/estar permanente) de 'stare' (estar temporário/ficar). 'Avere' = ter.", examples: [{ original: "Io sono brasiliano.", translation: "Sou brasileiro. (essere = ser)" }, { original: "Come stai?", translation: "Como está? (stare = estar)" }, { original: "Ho fame.", translation: "Tenho fome. (avere = ter)" }] },
  ],
  funFacts: [
    "O italiano é a língua mais próxima do latim ainda falada — 85% do vocabulário vem diretamente do latim.",
    "A Academia della Crusca (fundada em 1583) é a mais antiga academia linguística do mundo.",
    "Cerca de 60% do vocabulário italiano é compartilhado com o português — são línguas-irmãs!",
    "O italiano se tornou língua oficial da Itália unificada só em 1861 — antes cada região falava seu próprio dialeto.",
    "As palavras musicais (piano, forte, allegro, adagio) são todas italianas porque a Itália dominou a música por séculos.",
  ],
};

// ==================== PORTUGUESE ====================
export const PORTUGUESE_DATA: LanguageAlphabetData = {
  langId: "portuguese",
  langName: "Português",
  alphabetTitle: "O Alfabeto Português",
  alphabetDescription: "O alfabeto português tem 26 letras (K, W, Y foram oficializadas em 2009). O português tem sons nasais únicos que não existem em quase nenhuma outra língua!",
  alphabet: [
    { letter: "A", name: "á", ipa: "/a/", pronunciation: "3 sons: aberto 'á' (pá), fechado 'â' (cama átono), nasal 'ã' (maçã)", examples: [{ word: "água", meaning: "water" }, { word: "amigo", meaning: "friend" }], tip: "In unstressed syllables, A sounds like a weak 'â'" },
    { letter: "B", name: "bê", ipa: "/b/", pronunciation: "Like English 'b' — lips together", examples: [{ word: "bom", meaning: "good" }, { word: "Brasil", meaning: "Brazil" }] },
    { letter: "C", name: "cê", ipa: "/se/", pronunciation: "C+a/o/u = 'k'. C+e/i = 's'. Ç always = 's'", examples: [{ word: "casa", meaning: "house" }, { word: "cidade", meaning: "city" }], tip: "Ç (cedilha) is unique — always sounds like 's'" },
    { letter: "D", name: "dê", ipa: "/de/", pronunciation: "In Brazil before 'i' or final 'e': D sounds like 'dj' (dia = 'djia')", examples: [{ word: "dia", meaning: "day" }, { word: "dinheiro", meaning: "money" }], tip: "Brazilian Portuguese: dia = 'djia', onde = 'ondji'" },
    { letter: "E", name: "ê", ipa: "/e/", pronunciation: "4 sons: aberto 'é' (pé), fechado 'ê' (medo), mudo (de), nasal (em)", examples: [{ word: "escola", meaning: "school" }, { word: "ele", meaning: "he" }], tip: "Final unstressed E is almost silent in Brazil" },
    { letter: "F", name: "éfe", ipa: "/f/", pronunciation: "Like English 'f'", examples: [{ word: "falar", meaning: "to speak" }, { word: "família", meaning: "family" }] },
    { letter: "G", name: "gê", ipa: "/ʒe/", pronunciation: "G+a/o/u = hard 'g'. G+e/i = 'j' (like 'zh' in measure)", examples: [{ word: "gato", meaning: "cat" }, { word: "gente", meaning: "people" }], tip: "gente = 'jente', gato = 'gato' (hard g)" },
    { letter: "H", name: "agá", ipa: "mudo", pronunciation: "ALWAYS SILENT! Never pronounced", examples: [{ word: "hora", meaning: "hour" }, { word: "hotel", meaning: "hotel" }], tip: "H is always mute. 'hora' = 'ora'" },
    { letter: "I", name: "i", ipa: "/i/", pronunciation: "Like 'ee' in 'see'", examples: [{ word: "isso", meaning: "this/that" }, { word: "ida", meaning: "going" }] },
    { letter: "J", name: "jota", ipa: "/ʒ/", pronunciation: "Like 'zh' in English 'measure'", examples: [{ word: "janela", meaning: "window" }, { word: "já", meaning: "already" }], tip: "NOT like Spanish J! Portuguese J = French J" },
    { letter: "L", name: "éle", ipa: "/l/", pronunciation: "At end of syllable, L sounds like 'u' in Brazil: Brasil = 'Brasiu'", examples: [{ word: "lua", meaning: "moon" }, { word: "Brasil", meaning: "Brazil" }], tip: "Final L = 'u'. sal = 'sau', animal = 'animau'" },
    { letter: "M", name: "eme", ipa: "/m/", pronunciation: "Like English. At end of syllable, nasalizes the vowel", examples: [{ word: "mãe", meaning: "mother" }, { word: "bom", meaning: "good" }], tip: "Final M nasalizes: 'bom' = 'bõ(ng)'" },
    { letter: "N", name: "ene", ipa: "/n/", pronunciation: "Like English. At end of syllable, nasalizes the vowel", examples: [{ word: "não", meaning: "no" }, { word: "nome", meaning: "name" }] },
    { letter: "O", name: "ó", ipa: "/o/", pronunciation: "3 sons: aberto 'ó' (avó), fechado 'ô' (avô), reduced 'u' (unstressed)", examples: [{ word: "olho", meaning: "eye" }, { word: "bonito", meaning: "beautiful" }], tip: "Unstressed O often sounds like 'u': bonito = 'bunitu'" },
    { letter: "P", name: "pê", ipa: "/p/", pronunciation: "Like English 'p'", examples: [{ word: "pai", meaning: "father" }, { word: "porta", meaning: "door" }] },
    { letter: "Q", name: "quê", ipa: "/k/", pronunciation: "Always with U: QU before a/o = 'ku', QU before e/i = 'k'", examples: [{ word: "quando", meaning: "when" }, { word: "quero", meaning: "I want" }], tip: "quando = 'kuandu', quero = 'kéru' (U is silent!)" },
    { letter: "R", name: "erre", ipa: "/ʁ/ ou /r/", pronunciation: "THE most complex letter! Multiple sounds depending on position", examples: [{ word: "Rio", meaning: "river" }, { word: "caro", meaning: "expensive" }], tip: "Initial/double R = 'h' sound (Rio = 'Hiu'). Between vowels = tap (caro = flap r). After consonant = tap" },
    { letter: "S", name: "esse", ipa: "/s/", pronunciation: "Multiple sounds: initial = 's', between vowels = 'z', before consonant varies", examples: [{ word: "sol", meaning: "sun" }, { word: "casa", meaning: "house" }], tip: "casa = 'kaza' (S between vowels = Z)" },
    { letter: "T", name: "tê", ipa: "/t/", pronunciation: "In Brazil before 'i' or final 'e': T = 'tch' (time = 'tchime')", examples: [{ word: "tempo", meaning: "time" }, { word: "tia", meaning: "aunt" }], tip: "Brazilian: tia = 'tchia', noite = 'noitchi'" },
    { letter: "U", name: "u", ipa: "/u/", pronunciation: "Like 'oo' in 'moon'", examples: [{ word: "uva", meaning: "grape" }, { word: "um", meaning: "one" }] },
    { letter: "V", name: "vê", ipa: "/v/", pronunciation: "Like English 'v'", examples: [{ word: "vida", meaning: "life" }, { word: "você", meaning: "you" }] },
    { letter: "X", name: "xis", ipa: "varies", pronunciation: "THE most unpredictable letter! 4 different sounds!", examples: [{ word: "xícara", meaning: "cup (ch)" }, { word: "exame", meaning: "exam (z)" }], tip: "X = 'ch' (xícara), 'z' (exame), 'ks' (táxi), 's' (próximo)" },
    { letter: "Z", name: "zê", ipa: "/z/", pronunciation: "Like English 'z'", examples: [{ word: "zero", meaning: "zero" }, { word: "feliz", meaning: "happy" }] },
  ],
  specialSounds: [
    { sound: "Ã / ÃO / ÃE", ipa: "/ɐ̃/ /ɐ̃w̃/ /ɐ̃j̃/", description: "Sons nasais ÚNICOS do português! O ar sai pelo nariz", examples: [{ word: "mão", meaning: "hand" }, { word: "pão", meaning: "bread" }, { word: "mãe", meaning: "mother" }], tip: "These nasal sounds are one of the hardest parts of Portuguese for foreigners" },
    { sound: "LH", ipa: "/ʎ/", description: "Like Italian 'gli' or Spanish 'll' (traditional)", examples: [{ word: "filho", meaning: "son" }, { word: "trabalho", meaning: "work" }, { word: "olho", meaning: "eye" }], tip: "Place the middle of your tongue on the roof of your mouth" },
    { sound: "NH", ipa: "/ɲ/", description: "Like Spanish 'ñ' or Italian 'gn'", examples: [{ word: "banho", meaning: "bath" }, { word: "senhor", meaning: "sir" }, { word: "amanhã", meaning: "tomorrow" }], tip: "Similar to 'ny' in 'canyon'" },
    { sound: "RR / R inicial", ipa: "/ʁ/", description: "In most of Brazil, sounds like English 'h'! In Portugal, it's a uvular trill", examples: [{ word: "carro", meaning: "car" }, { word: "Rio", meaning: "river" }, { word: "rato", meaning: "mouse" }], tip: "In Brazil: carro = 'cahu', Rio = 'Hiu'" },
    { sound: "R entre vogais", ipa: "/ɾ/", description: "A quick tap/flap of the tongue — like Spanish 'r' or American 'butter'", examples: [{ word: "caro", meaning: "expensive" }, { word: "para", meaning: "for" }, { word: "hora", meaning: "hour" }], tip: "Very different from RR! caro (one tap) vs carro (h sound)" },
    { sound: "SS", ipa: "/s/", description: "Always voiceless 's' — ensures the sound stays 's' between vowels", examples: [{ word: "pássaro", meaning: "bird" }, { word: "pessoa", meaning: "person" }], tip: "Without SS, S between vowels would be 'z': casa vs massa" },
    { sound: "CH", ipa: "/ʃ/", description: "Like English 'sh' in 'shoe'", examples: [{ word: "chave", meaning: "key" }, { word: "chuva", meaning: "rain" }, { word: "achar", meaning: "to find/think" }], tip: "Always 'sh' sound — never like English 'ch' in 'church'" },
    { sound: "QU", ipa: "/k/ ou /kw/", description: "QU before E/I = just 'k'. QU before A/O = 'kw'", examples: [{ word: "quero", meaning: "I want" }, { word: "quando", meaning: "when" }, { word: "quase", meaning: "almost" }], tip: "quero = 'kéru' (U silent), quando = 'kuandu' (U pronounced)" },
  ],
  essentialPhrases: [
    { phrase: "Tudo bem?", pronunciation: "túdu bêin?", meaning: "Everything OK?", context: "Most common Brazilian greeting" },
    { phrase: "Eu gostaria de...", pronunciation: "êu gostaría dji...", meaning: "I would like...", context: "Polite requests" },
    { phrase: "Pode repetir, por favor?", pronunciation: "pódji hepetír, por favór?", meaning: "Can you repeat, please?", context: "When you didn't understand" },
    { phrase: "Onde fica o banheiro?", pronunciation: "ondji fíka u banhêiru?", meaning: "Where is the bathroom?", context: "Essential for travelers" },
    { phrase: "Não entendi.", pronunciation: "nãw entêndji.", meaning: "I didn't understand.", context: "When confused" },
    { phrase: "Quanto custa?", pronunciation: "kuantu kústa?", meaning: "How much does it cost?", context: "Shopping" },
    { phrase: "A conta, por favor.", pronunciation: "a kônta, por favór.", meaning: "The bill, please.", context: "At a restaurant" },
    { phrase: "Prazer em conhecê-lo.", pronunciation: "prazér êin conhecê-lu.", meaning: "Nice to meet you.", context: "Meeting someone" },
    { phrase: "Com licença!", pronunciation: "kõn licênsа!", meaning: "Excuse me!", context: "Getting attention politely" },
    { phrase: "Saudade!", pronunciation: "saudádji!", meaning: "Missing/longing (untranslatable!)", context: "A uniquely Portuguese concept — deep emotional longing" },
  ],
  grammarBasics: [
    { title: "Ser vs Estar", explanation: "Unlike English (and like Spanish), Portuguese distinguishes permanent (SER) from temporary (ESTAR).", examples: [{ original: "Eu sou brasileiro.", translation: "I am Brazilian. (permanent = SER)" }, { original: "Eu estou feliz.", translation: "I am happy. (temporary = ESTAR)" }, { original: "Ela é bonita.", translation: "She is beautiful. (inherent = SER)" }] },
    { title: "Conjugação verbal", explanation: "Portuguese has the MOST COMPLEX verb conjugation of any Romance language — 6 persons × many tenses!", examples: [{ original: "Eu falo / Tu falas / Ele fala", translation: "I speak / You speak / He speaks" }, { original: "Nós falamos / Vocês falam / Eles falam", translation: "We speak / You all speak / They speak" }] },
    { title: "Futuro do subjuntivo", explanation: "Portuguese is the ONLY Romance language that still uses the future subjunctive — a tense that disappeared from Spanish and Italian!", examples: [{ original: "Quando eu for ao Brasil...", translation: "When I go to Brazil..." }, { original: "Se você quiser...", translation: "If you want..." }] },
  ],
  funFacts: [
    "Portuguese is the 6th most spoken language in the world, with 260+ million speakers across 4 continents.",
    "'Saudade' is one of the most difficult words to translate — it means a deep emotional longing for something or someone absent.",
    "Portuguese is the only Romance language with the mesoclisis: 'fá-lo-ei' (I will do it) — placing pronouns INSIDE the verb!",
    "Brazilian Portuguese and European Portuguese differ significantly — like American and British English, but even more so.",
    "The word 'obrigado' literally means 'obligated' — as in 'I am obligated to you for your kindness.'",
  ],
};

// ==================== SPANISH ====================
export const SPANISH_DATA: LanguageAlphabetData = {
  langId: "spanish",
  langName: "Español",
  alphabetTitle: "El Alfabeto Español",
  alphabetDescription: "O alfabeto espanhol tem 27 letras — inclui o Ñ, exclusivo do espanhol. O espanhol é fonético: lê-se como se escreve!",
  alphabet: [
    { letter: "A", name: "a", ipa: "/a/", pronunciation: "Igual ao português", examples: [{ word: "amigo", meaning: "amigo" }, { word: "agua", meaning: "água" }] },
    { letter: "B", name: "be", ipa: "/b/", pronunciation: "B e V têm o MESMO som!", examples: [{ word: "bueno", meaning: "bom" }, { word: "bien", meaning: "bem" }], tip: "Entre vogais fica suave, quase sem fechar os lábios" },
    { letter: "C", name: "ce", ipa: "/θe/ ou /se/", pronunciation: "C+e/i: Espanha = 'th' inglês. América Latina = 's'", examples: [{ word: "casa", meaning: "casa" }, { word: "cielo", meaning: "céu" }], tip: "Na Espanha: cielo = 'thielo'. Na AL: cielo = 'sielo'" },
    { letter: "D", name: "de", ipa: "/d/", pronunciation: "Entre vogais fica suave", examples: [{ word: "dónde", meaning: "onde" }, { word: "ciudad", meaning: "cidade" }] },
    { letter: "E", name: "e", ipa: "/e/", pronunciation: "Sempre 'ê' fechado", examples: [{ word: "este", meaning: "este" }] },
    { letter: "F", name: "efe", ipa: "/f/", pronunciation: "Igual ao português", examples: [{ word: "familia", meaning: "família" }] },
    { letter: "G", name: "ge", ipa: "/xe/", pronunciation: "G+a/o/u = 'g' duro. G+e/i = aspirado forte!", examples: [{ word: "gato", meaning: "gato" }, { word: "gente", meaning: "gente" }], tip: "G+e/i soa como 'rr' aspirado" },
    { letter: "H", name: "hache", ipa: "mudo", pronunciation: "SEMPRE MUDO", examples: [{ word: "hola", meaning: "olá" }], tip: "hola soa 'ola'" },
    { letter: "I", name: "i", ipa: "/i/", pronunciation: "Igual ao português", examples: [{ word: "isla", meaning: "ilha" }] },
    { letter: "J", name: "jota", ipa: "/x/", pronunciation: "Som aspirado forte na garganta", examples: [{ word: "jugar", meaning: "jogar" }, { word: "jardín", meaning: "jardim" }], tip: "NÃO é como 'j' português!" },
    { letter: "K", name: "ka", ipa: "/k/", pronunciation: "Só em estrangeirismos", examples: [{ word: "kilo", meaning: "quilo" }] },
    { letter: "L", name: "ele", ipa: "/l/", pronunciation: "Sempre claro, nunca vira 'u'", examples: [{ word: "libro", meaning: "livro" }] },
    { letter: "LL", name: "elle", ipa: "/ʝ/", pronunciation: "Som de 'i' consonantal ou 'dj'", examples: [{ word: "llamar", meaning: "chamar" }, { word: "calle", meaning: "rua" }], tip: "Na Argentina: som de 'ch'" },
    { letter: "M", name: "eme", ipa: "/m/", pronunciation: "Igual ao português", examples: [{ word: "madre", meaning: "mãe" }] },
    { letter: "N", name: "ene", ipa: "/n/", pronunciation: "Igual ao português", examples: [{ word: "nombre", meaning: "nome" }] },
    { letter: "Ñ", name: "eñe", ipa: "/ɲ/", pronunciation: "= 'nh' em português!", examples: [{ word: "España", meaning: "Espanha" }, { word: "niño", meaning: "menino" }, { word: "año", meaning: "ano" }], tip: "Letra EXCLUSIVA do espanhol!" },
    { letter: "O", name: "o", ipa: "/o/", pronunciation: "Sempre 'ô' fechado", examples: [{ word: "ojo", meaning: "olho" }] },
    { letter: "P", name: "pe", ipa: "/p/", pronunciation: "Igual ao português", examples: [{ word: "padre", meaning: "pai" }] },
    { letter: "Q", name: "cu", ipa: "/k/", pronunciation: "U sempre mudo: que='ke'", examples: [{ word: "quiero", meaning: "quero" }] },
    { letter: "R", name: "ere", ipa: "/r/", pronunciation: "R simples: vibrante suave. RR: vibrante forte!", examples: [{ word: "pero", meaning: "mas" }, { word: "perro", meaning: "cachorro" }], tip: "pero vs perro = significados diferentes!" },
    { letter: "S", name: "ese", ipa: "/s/", pronunciation: "Sempre 's', nunca vira 'z'", examples: [{ word: "casa", meaning: "casa" }], tip: "casa = 'kasa' (NÃO 'kaza')" },
    { letter: "T", name: "te", ipa: "/t/", pronunciation: "Nunca vira 'tch'", examples: [{ word: "tiempo", meaning: "tempo" }] },
    { letter: "U", name: "u", ipa: "/u/", pronunciation: "Igual ao português", examples: [{ word: "uno", meaning: "um" }] },
    { letter: "V", name: "uve", ipa: "/b/", pronunciation: "MESMO som que B!", examples: [{ word: "vida", meaning: "vida" }], tip: "Espanhóis NÃO distinguem B e V" },
    { letter: "X", name: "equis", ipa: "/ks/", pronunciation: "Geralmente 'ks'. México = 'j'", examples: [{ word: "examen", meaning: "exame" }, { word: "México", meaning: "México" }] },
    { letter: "Y", name: "ye", ipa: "/ʝ/", pronunciation: "Som de 'i' consonantal", examples: [{ word: "yo", meaning: "eu" }, { word: "playa", meaning: "praia" }] },
    { letter: "Z", name: "zeta", ipa: "/θ/ ou /s/", pronunciation: "Espanha = 'th'. AL = 's'", examples: [{ word: "zapato", meaning: "sapato" }] },
  ],
  specialSounds: [
    { sound: "RR (vibrante)", ipa: "/rr/", description: "Vibrante múltipla — a língua vibra várias vezes", examples: [{ word: "perro", meaning: "cachorro" }, { word: "carro", meaning: "carro" }], tip: "pero (mas) vs perro (cão)!" },
    { sound: "LL", ipa: "/ʝ/ ou /ʃ/", description: "Som de 'i' consonantal. Argentina: som de 'ch'", examples: [{ word: "llamar", meaning: "chamar" }, { word: "calle", meaning: "rua" }], tip: "Na Argentina: calle = 'cashe'" },
    { sound: "J / G+e/i", ipa: "/x/", description: "Som aspirado forte na garganta", examples: [{ word: "joven", meaning: "jovem" }, { word: "gente", meaning: "gente" }], tip: "Mais forte que o 'h' inglês" },
    { sound: "Ñ", ipa: "/ɲ/", description: "= 'nh' em português", examples: [{ word: "mañana", meaning: "amanhã" }, { word: "baño", meaning: "banho" }], tip: "Letra separada no dicionário!" },
    { sound: "B/V entre vogais", ipa: "/β/", description: "Entre vogais ficam suaves — lábios quase se tocam", examples: [{ word: "haber", meaning: "haver" }, { word: "tuvo", meaning: "teve" }], tip: "Os lábios não fecham completamente" },
  ],
  essentialPhrases: [
    { phrase: "¿Cómo estás?", pronunciation: "kómo estás?", meaning: "Como vai?", context: "Cumprimento informal" },
    { phrase: "Me gustaría...", pronunciation: "me gustaría...", meaning: "Eu gostaria de...", context: "Pedidos educados" },
    { phrase: "¿Puede repetir?", pronunciation: "puéde repetír?", meaning: "Pode repetir?", context: "Quando não entendeu" },
    { phrase: "¿Dónde está el baño?", pronunciation: "dónde está el bánho?", meaning: "Onde fica o banheiro?", context: "Essencial" },
    { phrase: "No entiendo.", pronunciation: "no entiéndo.", meaning: "Não entendo.", context: "Quando não compreende" },
    { phrase: "¿Cuánto cuesta?", pronunciation: "kuánto kuésta?", meaning: "Quanto custa?", context: "Compras" },
    { phrase: "La cuenta, por favor.", pronunciation: "la kuénta, por fabór.", meaning: "A conta, por favor.", context: "No restaurante" },
    { phrase: "Soy de Brasil.", pronunciation: "soi de brasíl.", meaning: "Sou do Brasil.", context: "Se apresentando" },
  ],
  grammarBasics: [
    { title: "SER vs ESTAR", explanation: "SER = permanente. ESTAR = temporário. Como em português!", examples: [{ original: "Yo soy brasileño.", translation: "Sou brasileiro. (SER)" }, { original: "Yo estoy feliz.", translation: "Estou feliz. (ESTAR)" }] },
    { title: "Falsos amigos", explanation: "Palavras que parecem iguais mas significam coisas diferentes!", examples: [{ original: "Estoy embarazada.", translation: "Estou GRÁVIDA (NÃO envergonhada!)" }, { original: "Eso es exquisito.", translation: "Isso é DELICIOSO (NÃO esquisito!)" }] },
  ],
  funFacts: [
    "O espanhol é a 2ª língua materna mais falada do mundo, com 500+ milhões de falantes.",
    "O sinal ¿ antes de perguntas é EXCLUSIVO do espanhol!",
    "O espanhol e o português compartilham 89% do vocabulário.",
    "A Ñ é tão importante que a Espanha lutou para mantê-la nos teclados.",
  ],
};

// ==================== EXPORT ALL ====================
export const LANGUAGE_ALPHABET_DATA: Record<string, LanguageAlphabetData> = {
  english: ENGLISH_DATA,
  spanish: SPANISH_DATA,
  german: GERMAN_DATA,
  italian: ITALIAN_DATA,
  portuguese: PORTUGUESE_DATA,
};
