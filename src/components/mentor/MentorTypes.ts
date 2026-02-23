import { ChatMessage, MentorMode, MENTOR_MODES, StudentContext } from "@/types/study";

export interface MentorConfig {
  userName: string;
  voiceSpeed: number;
  voicePersona: string;
}

export const DEFAULT_CONFIG: MentorConfig = {
  userName: "Johan",
  voiceSpeed: 1.0,
  voicePersona: "formal",
};

export const VOICE_PERSONAS: { id: string; label: string; rate: number; pitch: number }[] = [
  { id: "formal", label: "Formal", rate: 0.85, pitch: 0.85 },
  { id: "descolado", label: "Descolado", rate: 1.0, pitch: 1.0 },
  { id: "feminino", label: "Feminino", rate: 0.9, pitch: 1.3 },
  { id: "masculino", label: "Masculino", rate: 0.88, pitch: 0.8 },
  { id: "robo", label: "Robô", rate: 0.75, pitch: 0.6 },
  { id: "jovem", label: "Jovem", rate: 1.05, pitch: 1.05 },
];

export const PROMPT_TEMPLATES = [
  { label: "Explique como se eu tivesse 5 anos", prompt: "Explique como se eu tivesse 5 anos: ", icon: "👶" },
  { label: "Me dê 5 questões ENEM", prompt: "Me dê 5 questões no estilo ENEM sobre: ", icon: "📝" },
  { label: "Resuma em 3 frases", prompt: "Resuma em 3 frases: ", icon: "📋" },
  { label: "Faça um mapa mental", prompt: "Faça um mapa mental sobre: ", icon: "🧠" },
  { label: "Compare X e Y", prompt: "Compare e contraste: ", icon: "⚖️" },
  { label: "Dê exemplos do cotidiano", prompt: "Dê exemplos do cotidiano para: ", icon: "🏠" },
  { label: "Quais os erros mais comuns?", prompt: "Quais os erros mais comuns em: ", icon: "⚠️" },
  { label: "Conecte com outras matérias", prompt: "Conecte este assunto com outras matérias: ", icon: "🔗" },
  { label: "Resolva passo a passo", prompt: "Resolva passo a passo: ", icon: "🪜" },
  { label: "Dicas de memorização", prompt: "Me dê técnicas de memorização para: ", icon: "💡" },
];

export const TYPING_INDICATORS: Record<string, string[]> = {
  livre: ["Pensando...", "Analisando sua pergunta...", "Consultando minha base de conhecimento..."],
  aula: ["Preparando aula...", "Organizando o conteúdo...", "Montando exemplos práticos..."],
  socratico: ["Formulando perguntas...", "Pensando na melhor abordagem...", "Criando sequência de raciocínio..."],
  redacao: ["Analisando o texto...", "Avaliando competências...", "Verificando critérios ENEM..."],
  debate: ["Preparando contra-argumentos...", "Analisando posição...", "Buscando evidências..."],
  revisao: ["Selecionando tópicos...", "Preparando quiz...", "Verificando seu histórico..."],
  exercicios: ["Buscando questões...", "Montando exercício...", "Preparando resolução guiada..."],
  entrevista: ["Preparando pergunta...", "Avaliando resposta...", "Simulando entrevistador..."],
  brainstorm: ["Buscando repertório...", "Gerando ideias...", "Consultando fontes..."],
};

export const MODE_SUGGESTIONS: Record<MentorMode, string[]> = {
  livre: [
    'Como estudar melhor?', 'Me ajude com Matemática', 'Dicas para redação ENEM',
    'Estou ansioso com a prova', 'Qual carreira combina comigo?', 'Dicas de produtividade',
  ],
  redacao: [
    'Corrija minha redação', 'Me dê um tema para praticar', 'Dicas para competência 5',
  ],
  aula: [
    'Me ensine sobre fotossíntese', 'Aula sobre funções do 2° grau', 'Explique a Revolução Francesa',
  ],
  socratico: [
    'O que é mitose?', 'Como funciona a gravidade?', 'O que são funções exponenciais?',
  ],
  debate: ['Vamos debater sobre IA na educação', 'Discutir privatização', 'Debate sobre meio ambiente'],
  revisao: ['Me teste sobre Biologia', 'Quiz de História', 'Revisão de Matemática'],
  exercicios: ['Me dê questões de Física', 'Exercícios de Química', 'Pratique Geometria comigo'],
  entrevista: ['Simule entrevista de emprego', 'Me prepare para vestibular', 'Entrevista de bolsas'],
  brainstorm: ['Tema: tecnologia e solidão', 'Tema: saúde mental jovem', 'Tema: fake news'],
};
