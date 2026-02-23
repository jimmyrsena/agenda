/**
 * Banco de Questões Offline Expandido
 * Cobre: Ensino Fundamental, Ensino Médio, Concursos e Tendências 2025/26
 * 100% local — sem dependência de IA ou APIs externas.
 */

import { Question } from "./questionBank";

// ── Reutiliza o tipo Question mas com áreas genéricas como string ──
export interface OfflineQuestion extends Omit<Question, 'area'> {
  area: string;
  category: string; // 'ef' | 'em' | 'conc' | 'tend'
}

export const OFFLINE_QUESTIONS: OfflineQuestion[] = [

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — Português
  // ══════════════════════════════════════════════════════════
  { id: 'ef-pt-1', area: 'ef-portugues', category: 'ef', subject: 'Interpretação de Texto', difficulty: 'facil',
    question: 'Qual das alternativas indica a função principal de um texto instrucional (como uma receita)?',
    options: ['Entreter o leitor', 'Informar sobre acontecimentos', 'Orientar o leitor a realizar uma ação', 'Persuadir o leitor', 'Descrever sentimentos'],
    correctIndex: 2, explanation: 'Textos instrucionais têm função injuntiva: guiam o leitor na execução de tarefas (receitas, manuais, bulas).' },

  { id: 'ef-pt-2', area: 'ef-portugues', category: 'ef', subject: 'Ortografia', difficulty: 'facil',
    question: 'Qual palavra está escrita corretamente?',
    options: ['excessão', 'execeção', 'exsessão', 'exceção', 'excessção'],
    correctIndex: 3, explanation: '"Exceção" é a grafia correta, derivada do latim "exceptio". Erros comuns incluem duplicação de letras ou troca de ç/ss.' },

  { id: 'ef-pt-3', area: 'ef-portugues', category: 'ef', subject: 'Classes de Palavras', difficulty: 'medio',
    question: 'Na frase "Ela canta muito bem", a palavra "muito" é:',
    options: ['Adjetivo', 'Substantivo', 'Advérbio de intensidade', 'Pronome', 'Conjunção'],
    correctIndex: 2, explanation: '"Muito" modifica o advérbio "bem", intensificando-o. Quando modifica verbo, adjetivo ou outro advérbio, é advérbio de intensidade.' },

  { id: 'ef-pt-4', area: 'ef-portugues', category: 'ef', subject: 'Pontuação', difficulty: 'medio',
    question: 'Em qual alternativa o uso da vírgula está correto?',
    options: ['O menino, comeu a maçã.', 'Maria, João e Pedro foram à escola.', 'Ela foi, ao mercado comprar pão.', 'Ontem, ela foi ao cinema e, comprou pipoca.', 'O livro está, na mesa.'],
    correctIndex: 1, explanation: 'Vírgula separa elementos de uma enumeração (série de termos). "Maria, João e Pedro" é uma lista de sujeitos — uso correto.' },

  { id: 'ef-pt-5', area: 'ef-portugues', category: 'ef', subject: 'Gêneros Textuais', difficulty: 'facil',
    question: 'Um texto que narra fatos reais recentes de interesse público é chamado de:',
    options: ['Conto', 'Notícia', 'Poesia', 'Fábula', 'Crônica ficcional'],
    correctIndex: 1, explanation: 'Notícia é um gênero jornalístico que relata fatos reais, recentes e de interesse coletivo, com linguagem objetiva e impessoal.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — Matemática
  // ══════════════════════════════════════════════════════════
  { id: 'ef-mat-1', area: 'ef-matematica', category: 'ef', subject: 'Frações', difficulty: 'facil',
    question: 'Qual é o resultado de 1/2 + 1/3?',
    options: ['2/5', '2/6', '5/6', '1/6', '3/4'],
    correctIndex: 2, explanation: 'Para somar frações com denominadores diferentes, calcule o MMC: MMC(2,3)=6. 1/2=3/6 e 1/3=2/6. Soma: 5/6.' },

  { id: 'ef-mat-2', area: 'ef-matematica', category: 'ef', subject: 'Porcentagem', difficulty: 'medio',
    question: 'Um produto custa R$ 200 e teve desconto de 15%. Qual é o novo preço?',
    options: ['R$ 170', 'R$ 150', 'R$ 180', 'R$ 160', 'R$ 185'],
    correctIndex: 0, explanation: '15% de 200 = 30. Preço com desconto: 200 - 30 = R$ 170.' },

  { id: 'ef-mat-3', area: 'ef-matematica', category: 'ef', subject: 'Geometria Básica', difficulty: 'facil',
    question: 'Qual é a área de um retângulo com base 5 cm e altura 3 cm?',
    options: ['8 cm²', '16 cm²', '15 cm²', '10 cm²', '25 cm²'],
    correctIndex: 2, explanation: 'Área do retângulo = base × altura = 5 × 3 = 15 cm².' },

  { id: 'ef-mat-4', area: 'ef-matematica', category: 'ef', subject: 'Equações do 1° Grau', difficulty: 'medio',
    question: 'Resolva: 2x + 6 = 14. Qual o valor de x?',
    options: ['x = 3', 'x = 4', 'x = 10', 'x = 7', 'x = 2'],
    correctIndex: 1, explanation: '2x = 14 - 6 → 2x = 8 → x = 4.' },

  { id: 'ef-mat-5', area: 'ef-matematica', category: 'ef', subject: 'Proporcionalidade', difficulty: 'medio',
    question: 'Se 3 canetas custam R$ 9, quantas canetas posso comprar com R$ 24?',
    options: ['6', '7', '8', '9', '10'],
    correctIndex: 2, explanation: 'Regra de três: 3/9 = x/24 → x = (3 × 24)/9 = 72/9 = 8 canetas.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — Ciências
  // ══════════════════════════════════════════════════════════
  { id: 'ef-ci-1', area: 'ef-ciencias', category: 'ef', subject: 'Corpo Humano', difficulty: 'facil',
    question: 'Qual órgão é responsável pela bombeamento do sangue no corpo humano?',
    options: ['Pulmão', 'Rim', 'Fígado', 'Coração', 'Estômago'],
    correctIndex: 3, explanation: 'O coração é o órgão central do sistema circulatório, responsável por bombear o sangue para todos os tecidos do corpo.' },

  { id: 'ef-ci-2', area: 'ef-ciencias', category: 'ef', subject: 'Ecologia', difficulty: 'medio',
    question: 'A relação em que um organismo se beneficia sem prejudicar nem beneficiar o outro é chamada de:',
    options: ['Parasitismo', 'Mutualismo', 'Comensalismo', 'Predatismo', 'Competição'],
    correctIndex: 2, explanation: 'Comensalismo: (+/0) — um se beneficia e o outro é indiferente. Ex: rêmora e tubarão.' },

  { id: 'ef-ci-3', area: 'ef-ciencias', category: 'ef', subject: 'Estados da Matéria', difficulty: 'facil',
    question: 'Quando o gelo se transforma em água, o processo é chamado de:',
    options: ['Vaporização', 'Solidificação', 'Fusão', 'Condensação', 'Sublimação'],
    correctIndex: 2, explanation: 'Fusão é a mudança do estado sólido para líquido. O ponto de fusão da água (gelo) é 0°C.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — História
  // ══════════════════════════════════════════════════════════
  { id: 'ef-hi-1', area: 'ef-historia', category: 'ef', subject: 'Brasil Colonial', difficulty: 'medio',
    question: 'O sistema de capitanias hereditárias, criado em 1534, tinha como objetivo principal:',
    options: ['Abolir a escravidão', 'Defender o Brasil dos ingleses', 'Colonizar o território brasileiro com recursos privados', 'Criar um sistema democrático', 'Estabelecer um governo republicano'],
    correctIndex: 2, explanation: 'Portugal criou as capitanias hereditárias para transferir o ônus da colonização a particulares (donatários), garantindo a ocupação do território.' },

  { id: 'ef-hi-2', area: 'ef-historia', category: 'ef', subject: 'Independência do Brasil', difficulty: 'facil',
    question: 'O Grito do Ipiranga, símbolo da Independência do Brasil, ocorreu em:',
    options: ['7 de setembro de 1822', '15 de novembro de 1889', '13 de maio de 1888', '22 de abril de 1500', '7 de setembro de 1889'],
    correctIndex: 0, explanation: 'Em 7 de setembro de 1822, D. Pedro I proclamou a independência às margens do riacho Ipiranga, em São Paulo.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — Geografia
  // ══════════════════════════════════════════════════════════
  { id: 'ef-ge-1', area: 'ef-geografia', category: 'ef', subject: 'Biomas Brasileiros', difficulty: 'medio',
    question: 'Qual bioma brasileiro é conhecido como o "berço das águas" por abrigar as nascentes dos principais rios do país?',
    options: ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pantanal'],
    correctIndex: 2, explanation: 'O Cerrado é chamado de "berço das águas" pois alimenta as bacias hidrográficas do Amazonas, do Paraná e do São Francisco.' },

  { id: 'ef-ge-2', area: 'ef-geografia', category: 'ef', subject: 'Cartografia', difficulty: 'facil',
    question: 'A linha imaginária que divide o globo terrestre em hemisférios Norte e Sul é o(a):',
    options: ['Trópico de Capricórnio', 'Meridiano de Greenwich', 'Equador', 'Trópico de Câncer', 'Círculo Polar Ártico'],
    correctIndex: 2, explanation: 'O Equador é a linha imaginária (latitude 0°) que divide a Terra em Hemisfério Norte e Hemisfério Sul.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO FUNDAMENTAL — Inglês
  // ══════════════════════════════════════════════════════════
  { id: 'ef-en-1', area: 'ef-ingles', category: 'ef', subject: 'Vocabulário Básico', difficulty: 'facil',
    question: 'What is the meaning of the word "beautiful"?',
    options: ['Feio', 'Rápido', 'Bonito/Belo', 'Triste', 'Pequeno'],
    correctIndex: 2, explanation: '"Beautiful" significa bonito(a) ou belo(a). Ex: "She is beautiful" = "Ela é bonita/bela".' },

  { id: 'ef-en-2', area: 'ef-ingles', category: 'ef', subject: 'Verbo To Be', difficulty: 'facil',
    question: 'Qual é a tradução correta de "They are students"?',
    options: ['Ele é estudante', 'Ela é estudante', 'Nós somos estudantes', 'Eles são estudantes', 'Você é estudante'],
    correctIndex: 3, explanation: '"They" = eles/elas; "are" = são/estão; "students" = estudantes. Tradução: "Eles são estudantes".' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Língua Portuguesa
  // ══════════════════════════════════════════════════════════
  { id: 'em-pt-1', area: 'em-portugues', category: 'em', subject: 'Crase', difficulty: 'medio',
    question: 'Em qual alternativa o uso da crase está correto?',
    options: ['Fui à escola', 'Vou à Portugal amanhã', 'Refiro-me à isso', 'Estou à disposição à sua família', 'Assistiu à um show'],
    correctIndex: 0, explanation: '"Fui à escola" = correto (a + a = à). Portugal não usa crase (país masculino). "À isso" é errado (demonstrativo não aceita crase). "Assistir" = regência com "a".' },

  { id: 'em-pt-2', area: 'em-portugues', category: 'em', subject: 'Regência Verbal', difficulty: 'dificil',
    question: 'Assinale a alternativa com uso correto de regência verbal:',
    options: ['Aspirei ao cargo de diretor', 'Prefiro ir do que ficar', 'Cheguei em casa tarde', 'Obedeça a lei', 'Namorei com ela por dois anos'],
    correctIndex: 0, explanation: '"Aspirar a" (cobiçar) rege preposição "a". "Preferir" não aceita "do que" (preferível é "a"). "Chegar em" é popular; formal é "chegar a".' },

  { id: 'em-pt-3', area: 'em-portugues', category: 'em', subject: 'Funções da Linguagem', difficulty: 'medio',
    question: 'Em "Saudades que de mim, saudades... que saudades!" predomina a função:',
    options: ['Referencial', 'Fática', 'Metalinguística', 'Emotiva/Expressiva', 'Conativa'],
    correctIndex: 3, explanation: 'A função emotiva (ou expressiva) manifesta o estado emocional do emissor. A repetição de "saudades" e a exclamação expressam sentimento subjetivo.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Literatura
  // ══════════════════════════════════════════════════════════
  { id: 'em-lit-1', area: 'em-literatura', category: 'em', subject: 'Modernismo', difficulty: 'medio',
    question: 'A obra "Macunaíma" (1928), de Mário de Andrade, é considerada uma rapsódia porque:',
    options: ['Segue a estrutura clássica da epopeia greco-romana', 'Mistura elementos folclóricos, lendas e culturas diversas do Brasil', 'Foi escrita em versos rimados tradicionais', 'Retrata exclusivamente a elite paulista', 'É uma narrativa realista do século XIX'],
    correctIndex: 1, explanation: 'Rapsódia une elementos heterogêneos. Macunaíma costura lendas indígenas, africanas e européias, criando um "herói sem nenhum caráter" símbolo do povo brasileiro.' },

  { id: 'em-lit-2', area: 'em-literatura', category: 'em', subject: 'Parnasianismo', difficulty: 'medio',
    question: 'O Parnasianismo, escola literária do final do século XIX, caracteriza-se principalmente por:',
    options: ['Subjetivismo exacerbado e fuga da realidade', 'Culto à forma perfeita, objetividade e mitologia greco-latina', 'Valorização do inconsciente e do sonho', 'Crítica social naturalista e determinismo', 'Experimentação formal e linguagem coloquial'],
    correctIndex: 1, explanation: 'Parnasianismo: "arte pela arte" — busca de perfeição formal, rima rica, objetividade, vocabulário erudito. Representantes: Olavo Bilac, Raimundo Correia, Alberto de Oliveira.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Matemática
  // ══════════════════════════════════════════════════════════
  { id: 'em-mat-1', area: 'em-matematica', category: 'em', subject: 'Função do 2° Grau', difficulty: 'medio',
    question: 'Qual é o vértice da parábola y = x² - 4x + 3?',
    options: ['(2, -1)', '(-2, 1)', '(2, 1)', '(4, 3)', '(1, 0)'],
    correctIndex: 0, explanation: 'Vértice: Xv = -b/2a = 4/2 = 2; Yv = -(b²-4ac)/4a = -(16-12)/4 = -4/4 = -1. Vértice: (2, -1).' },

  { id: 'em-mat-2', area: 'em-matematica', category: 'em', subject: 'Trigonometria', difficulty: 'dificil',
    question: 'Num triângulo retângulo, o seno de um ângulo agudo é igual a:',
    options: ['cateto adjacente / hipotenusa', 'cateto oposto / cateto adjacente', 'cateto oposto / hipotenusa', 'hipotenusa / cateto oposto', 'cateto adjacente / cateto oposto'],
    correctIndex: 2, explanation: 'sen(θ) = cateto oposto / hipotenusa. Memorize: SOH-CAH-TOA (Seno=Oposto/Hipotenusa, Cosseno=Adjacente/Hip., Tangente=Oposto/Adj.).' },

  { id: 'em-mat-3', area: 'em-matematica', category: 'em', subject: 'Progressão Aritmética', difficulty: 'medio',
    question: 'A soma dos 10 primeiros termos de uma PA com a₁ = 2 e r = 3 é:',
    options: ['155', '145', '175', '120', '200'],
    correctIndex: 0, explanation: 'Sₙ = n(a₁+aₙ)/2. aₙ = a₁ + (n-1)r = 2 + 9×3 = 29. S₁₀ = 10(2+29)/2 = 10×31/2 = 155.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Física
  // ══════════════════════════════════════════════════════════
  { id: 'em-fi-1', area: 'em-fisica', category: 'em', subject: 'Cinemática', difficulty: 'medio',
    question: 'Um carro parte do repouso e acelera uniformemente a 4 m/s². Qual sua velocidade após 5 segundos?',
    options: ['10 m/s', '15 m/s', '20 m/s', '25 m/s', '40 m/s'],
    correctIndex: 2, explanation: 'v = v₀ + at = 0 + 4×5 = 20 m/s. Em MRUV: velocidade cresce linearmente com o tempo.' },

  { id: 'em-fi-2', area: 'em-fisica', category: 'em', subject: 'Leis de Newton', difficulty: 'medio',
    question: 'Uma força de 30 N age sobre um objeto de massa 6 kg. Qual é a aceleração?',
    options: ['2 m/s²', '4 m/s²', '5 m/s²', '6 m/s²', '180 m/s²'],
    correctIndex: 2, explanation: '2ª Lei de Newton: F = m × a → a = F/m = 30/6 = 5 m/s².' },

  { id: 'em-fi-3', area: 'em-fisica', category: 'em', subject: 'Óptica', difficulty: 'medio',
    question: 'Um espelho côncavo forma uma imagem real e invertida quando o objeto está:',
    options: ['Entre o foco e o espelho', 'No foco', 'No centro de curvatura', 'Além do centro de curvatura', 'Em qualquer posição'],
    correctIndex: 3, explanation: 'Em espelho côncavo: objeto além do centro (C) → imagem real, invertida e menor. No foco → imagem no infinito. Entre F e espelho → imagem virtual.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Química
  // ══════════════════════════════════════════════════════════
  { id: 'em-qi-1', area: 'em-quimica', category: 'em', subject: 'Estequiometria', difficulty: 'dificil',
    question: 'Na reação CH₄ + 2O₂ → CO₂ + 2H₂O, quantas moles de água são produzidas a partir de 3 moles de CH₄?',
    options: ['3 mol', '4 mol', '6 mol', '2 mol', '9 mol'],
    correctIndex: 2, explanation: 'A proporção estequiométrica é 1 CH₄ : 2 H₂O. Para 3 mol de CH₄: 3 × 2 = 6 mol de H₂O.' },

  { id: 'em-qi-2', area: 'em-quimica', category: 'em', subject: 'Ligações Químicas', difficulty: 'medio',
    question: 'Qual tipo de ligação ocorre entre Na (sódio) e Cl (cloro) no sal de cozinha (NaCl)?',
    options: ['Covalente polar', 'Covalente apolar', 'Iônica', 'Metálica', 'Coordenada'],
    correctIndex: 2, explanation: 'Metal (Na) + ametal (Cl) = ligação iônica, por transferência de elétrons. Na⁺ e Cl⁻ se atraem eletricamente formando o cristal iônico NaCl.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Biologia
  // ══════════════════════════════════════════════════════════
  { id: 'em-bi-1', area: 'em-biologia', category: 'em', subject: 'Genética', difficulty: 'dificil',
    question: 'Um casal de portadores (Aa × Aa) tem filho com fenótipo recessivo. Qual a probabilidade de isso ocorrer?',
    options: ['25%', '50%', '75%', '100%', '12,5%'],
    correctIndex: 0, explanation: 'Aa × Aa → 1 AA : 2 Aa : 1 aa. O fenótipo recessivo (aa) ocorre em 1/4 = 25% dos casos. 1ª Lei de Mendel.' },

  { id: 'em-bi-2', area: 'em-biologia', category: 'em', subject: 'Evolução', difficulty: 'medio',
    question: 'Qual é a principal diferença entre a teoria de Darwin e a de Lamarck?',
    options: ['Darwin acreditava em uso e desuso, Lamarck em seleção natural', 'Darwin propôs seleção natural, Lamarck propôs herança de caracteres adquiridos', 'Ambos propuseram a mesma teoria', 'Darwin era criacionista, Lamarck era evolucionista', 'Lamarck propôs mutações genéticas'],
    correctIndex: 1, explanation: 'Lamarck: uso e desuso + herança de caracteres adquiridos (ex: girafa que alonga pescoço). Darwin: variação + seleção natural — os mais adaptados sobrevivem e se reproduzem.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — História
  // ══════════════════════════════════════════════════════════
  { id: 'em-hi-1', area: 'em-historia', category: 'em', subject: 'Segunda Guerra Mundial', difficulty: 'medio',
    question: 'O evento que marcou a entrada dos EUA na Segunda Guerra Mundial foi:',
    options: ['Invasão da Polônia', 'Batalha de Stalingrado', 'Ataque japonês a Pearl Harbor', 'Desembarque na Normandia', 'Bombardeio de Londres'],
    correctIndex: 2, explanation: 'O ataque surpresa do Japão à base naval americana de Pearl Harbor, no Havaí, em 7 de dezembro de 1941, levou os EUA a declararem guerra ao Japão e entrar no conflito.' },

  { id: 'em-hi-2', area: 'em-historia', category: 'em', subject: 'Guerra Fria', difficulty: 'medio',
    question: 'A corrida espacial durante a Guerra Fria teve início com o lançamento do satélite soviético:',
    options: ['Apollo 11', 'Mir', 'Sputnik', 'Vostok', 'Explorer'],
    correctIndex: 2, explanation: 'A URSS lançou o Sputnik 1 em 1957, o primeiro satélite artificial da história, iniciando a corrida espacial e causando o "choque do Sputnik" nos EUA.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Geografia
  // ══════════════════════════════════════════════════════════
  { id: 'em-geo-1', area: 'em-geografia', category: 'em', subject: 'Geopolítica', difficulty: 'medio',
    question: 'O conceito de "globalização" refere-se principalmente a:',
    options: ['Expansão do território dos países', 'Integração econômica, cultural e tecnológica entre países', 'Criação de fronteiras comerciais', 'Promoção do nacionalismo exacerbado', 'Retorno à economia agrária'],
    correctIndex: 1, explanation: 'Globalização é o processo de integração mundial nas dimensões econômica (fluxos de capital), cultural (difusão cultural) e tecnológica (internet, telecomunicações).' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Filosofia
  // ══════════════════════════════════════════════════════════
  { id: 'em-filo-1', area: 'em-filosofia', category: 'em', subject: 'Filosofia Grega', difficulty: 'medio',
    question: 'O método socrático de busca da verdade por meio de perguntas e respostas é chamado de:',
    options: ['Sofística', 'Dialética (maiêutica)', 'Empirismo', 'Racionalismo', 'Estoicismo'],
    correctIndex: 1, explanation: 'A maiêutica socrática ("arte de partejar") consiste em extrair o conhecimento latente no interlocutor por meio de perguntas, levando-o à contradição (elenchos) e à verdade.' },

  // ══════════════════════════════════════════════════════════
  // ENSINO MÉDIO — Sociologia
  // ══════════════════════════════════════════════════════════
  { id: 'em-soc-1', area: 'em-sociologia', category: 'em', subject: 'Estratificação Social', difficulty: 'medio',
    question: 'O conceito de "capital cultural" foi desenvolvido pelo sociólogo:',
    options: ['Émile Durkheim', 'Max Weber', 'Karl Marx', 'Pierre Bourdieu', 'Auguste Comte'],
    correctIndex: 3, explanation: 'Pierre Bourdieu desenvolveu os conceitos de capital cultural, social e econômico para explicar como a reprodução das desigualdades sociais ocorre além das relações de produção.' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Língua Portuguesa
  // ══════════════════════════════════════════════════════════
  { id: 'co-pt-1', area: 'conc-portugues', category: 'conc', subject: 'Redação Oficial', difficulty: 'medio',
    question: 'Segundo o Manual de Redação da Presidência da República, o principal documento de comunicação entre órgãos da Administração Pública é o:',
    options: ['Memorando', 'Carta', 'Ofício', 'E-mail', 'Relatório'],
    correctIndex: 2, explanation: 'O Ofício (padrão ofício unificado desde 2018) é o documento padrão nas comunicações externas e internas da Administração Pública Federal.' },

  { id: 'co-pt-2', area: 'conc-portugues', category: 'conc', subject: 'Coesão e Coerência', difficulty: 'dificil',
    question: 'Na frase "Embora estudasse muito, não foi aprovado", a conjunção "embora" indica:',
    options: ['Causa', 'Consequência', 'Condição', 'Concessão', 'Adição'],
    correctIndex: 3, explanation: 'Concessão: indica uma ressalva/oposição ao esperado. Mesmo estudando muito (fator esperado para aprovação), o resultado foi negativo. Outras conj.: conquanto, apesar de que, ainda que, mesmo que.' },

  { id: 'co-pt-3', area: 'conc-portugues', category: 'conc', subject: 'Concordância Nominal', difficulty: 'medio',
    question: 'Assinale a frase com concordância nominal correta:',
    options: ['Elas estão meia confusas', 'A sala ficou meio bagunçada', 'Ficamos todos contente', 'Ele chegou cansado e suado', 'As candidatas estão pronto'],
    correctIndex: 3, explanation: '"Cansado e suado" concordam com o sujeito masculino singular "Ele". "Meia" deve ser "meio" (advérbio invariável). "Pronto" deve concordar com "candidatas" (prontas).' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Raciocínio Lógico
  // ══════════════════════════════════════════════════════════
  { id: 'co-rl-1', area: 'conc-rlm', category: 'conc', subject: 'Proposições Lógicas', difficulty: 'medio',
    question: 'Se P → Q (se P então Q) é verdadeiro, qual das seguintes é necessariamente verdadeira?',
    options: ['Q → P', '¬P → ¬Q', '¬Q → ¬P (contrapositiva)', 'P ↔ Q', 'Q → ¬P'],
    correctIndex: 2, explanation: 'A contrapositiva (¬Q → ¬P) é logicamente equivalente a P → Q. Se uma é verdadeira, a outra também é. Recíproca (Q→P) e inversa (¬P→¬Q) podem ser falsas.' },

  { id: 'co-rl-2', area: 'conc-rlm', category: 'conc', subject: 'Combinatória', difficulty: 'medio',
    question: 'De quantas maneiras distintas 5 pessoas podem se sentar em 5 cadeiras numeradas?',
    options: ['10', '25', '60', '120', '5'],
    correctIndex: 3, explanation: 'Permutação simples: P(5) = 5! = 5×4×3×2×1 = 120. Para arranjos com todas as cadeiras ocupadas, conta-se todas as permutações dos 5 elementos.' },

  { id: 'co-rl-3', area: 'conc-rlm', category: 'conc', subject: 'Probabilidade', difficulty: 'medio',
    question: 'Em um baralho de 52 cartas, qual é a probabilidade de sortear um ás?',
    options: ['1/52', '1/13', '1/4', '4/52 = 1/13', '2/52'],
    correctIndex: 3, explanation: 'Há 4 ases em 52 cartas. P = 4/52 = 1/13 ≈ 7,7%. Alternativas B e D são a mesma resposta — 1/13.' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Informática
  // ══════════════════════════════════════════════════════════
  { id: 'co-inf-1', area: 'conc-informatica', category: 'conc', subject: 'Segurança da Informação', difficulty: 'medio',
    question: 'Phishing é uma técnica de:',
    options: ['Criptografia de dados', 'Engenharia social para roubar dados por e-mails/sites falsos', 'Atualização de sistemas', 'Backup de arquivos', 'Compressão de dados'],
    correctIndex: 1, explanation: 'Phishing é engenharia social: o atacante cria e-mails ou sites falsos imitando instituições legítimas para induzir a vítima a fornecer dados (senhas, CPF, cartão).' },

  { id: 'co-inf-2', area: 'conc-informatica', category: 'conc', subject: 'Redes', difficulty: 'medio',
    question: 'O protocolo HTTP é utilizado para:',
    options: ['Envio de e-mails', 'Transferência de arquivos FTP', 'Comunicação entre navegador e servidor web', 'Criptografia de dados', 'Resolução de nomes de domínio'],
    correctIndex: 2, explanation: 'HTTP (HyperText Transfer Protocol) é o protocolo da Web, definindo como navegadores (clientes) e servidores trocam informações. HTTPS é a versão segura (com TLS/SSL).' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Direito Constitucional
  // ══════════════════════════════════════════════════════════
  { id: 'co-dc-1', area: 'conc-constitucional', category: 'conc', subject: 'Direitos Fundamentais', difficulty: 'medio',
    question: 'Segundo a CF/88, qual é a inviolabilidade garantida pelo habeas corpus?',
    options: ['Direito à propriedade', 'Liberdade de locomoção ameaçada por ato ilegal ou abuso de poder', 'Sigilo de correspondência', 'Direito à educação', 'Liberdade de imprensa'],
    correctIndex: 1, explanation: 'Habeas corpus (Art. 5º, LXVIII/CF): protege a liberdade de locomoção quando alguém sofre ou se encontra ameaçado de sofrer violência ou coação ilegal em sua liberdade de ir e vir.' },

  { id: 'co-dc-2', area: 'conc-constitucional', category: 'conc', subject: 'Poderes da República', difficulty: 'medio',
    question: 'O controle de constitucionalidade difuso no Brasil pode ser exercido por:',
    options: ['Apenas o STF', 'Apenas os Tribunais Superiores', 'Qualquer juiz ou tribunal', 'Apenas o Congresso Nacional', 'Apenas o Presidente da República'],
    correctIndex: 2, explanation: 'Controle difuso: qualquer juiz/tribunal pode declarar inconstitucionalidade em caso concreto (via de exceção). Controle concentrado: exclusivo do STF (ADI, ADC, ADPF).' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Direito Administrativo
  // ══════════════════════════════════════════════════════════
  { id: 'co-da-1', area: 'conc-administrativo', category: 'conc', subject: 'Princípios', difficulty: 'medio',
    question: 'O princípio da Administração Pública que determina que ela só pode fazer o que a lei autoriza é o princípio da:',
    options: ['Moralidade', 'Eficiência', 'Legalidade', 'Impessoalidade', 'Publicidade'],
    correctIndex: 2, explanation: 'Legalidade (LIMPE): a Administração Pública está subordinada à lei — só pode agir quando há autorização legal. O particular pode fazer tudo que a lei não proíbe; a Administração só faz o que a lei autoriza.' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Ética no Serviço Público
  // ══════════════════════════════════════════════════════════
  { id: 'co-et-1', area: 'conc-etica', category: 'conc', subject: 'Decreto 1.171/94', difficulty: 'medio',
    question: 'Segundo o Código de Ética Profissional do Servidor Público Civil Federal (Decreto 1.171/94), é vedado ao servidor:',
    options: ['Participar de associações de classe', 'Usar o cargo para obter vantagens pessoais', 'Apresentar sugestões de melhoria', 'Recusar-se a participar de atividade ilegal', 'Denunciar irregularidades'],
    correctIndex: 1, explanation: 'O Decreto 1.171/94 veda ao servidor: retirar proveito da condição funcional em benefício próprio ou de outrem, usar o nome do cargo em atividades privadas, etc.' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — AFO
  // ══════════════════════════════════════════════════════════
  { id: 'co-afo-1', area: 'conc-afo', category: 'conc', subject: 'LOA', difficulty: 'medio',
    question: 'A Lei Orçamentária Anual (LOA) tem como principal característica:',
    options: ['Definir as diretrizes de médio prazo', 'Estabelecer o plano de longo prazo', 'Estimar receitas e fixar despesas para o exercício financeiro', 'Criar tributos novos', 'Disciplinar a criação de cargos públicos'],
    correctIndex: 2, explanation: 'A LOA (Lei de Orçamento Anual) estima receitas e fixa despesas para um exercício financeiro (1 ano). É uma das três leis orçamentárias: PPA (4 anos), LDO (1 ano, diretrizes) e LOA (1 ano, execução).' },

  // ══════════════════════════════════════════════════════════
  // TENDÊNCIAS 2025/26 — LGPD
  // ══════════════════════════════════════════════════════════
  { id: 'tend-lg-1', area: 'tend-lgpd', category: 'tend', subject: 'LGPD - Princípios', difficulty: 'medio',
    question: 'A Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) regula principalmente:',
    options: ['A criação de sites e aplicativos', 'O tratamento de dados pessoais por pessoas físicas e jurídicas', 'O acesso à internet no Brasil', 'A tributação de empresas de tecnologia', 'O uso de inteligência artificial'],
    correctIndex: 1, explanation: 'A LGPD regula o tratamento (coleta, uso, armazenamento, compartilhamento) de dados pessoais por qualquer pessoa física ou jurídica, pública ou privada, no Brasil.' },

  { id: 'tend-lg-2', area: 'tend-lgpd', category: 'tend', subject: 'LGPD - Direitos', difficulty: 'medio',
    question: 'Segundo a LGPD, o titular dos dados NÃO tem direito a:',
    options: ['Confirmação de tratamento', 'Correção de dados incorretos', 'Eliminação de dados tratados com consentimento', 'Receber indenização automática por qualquer uso dos dados', 'Portabilidade dos dados'],
    correctIndex: 3, explanation: 'A LGPD não garante indenização automática — o titular deve provar dano e nexo causal. Os direitos garantidos incluem: acesso, correção, eliminação, portabilidade, revogação de consentimento, entre outros.' },

  // ══════════════════════════════════════════════════════════
  // TENDÊNCIAS — Políticas Públicas
  // ══════════════════════════════════════════════════════════
  { id: 'tend-pp-1', area: 'tend-politicas', category: 'tend', subject: 'Ciclo de Políticas Públicas', difficulty: 'medio',
    question: 'O ciclo de políticas públicas geralmente inclui as fases de:',
    options: ['Eleição, votação e promulgação', 'Identificação do problema, formulação, implementação e avaliação', 'Proposta, debate e aprovação parlamentar apenas', 'Criação de lei, decreto e regulamentação', 'Diagnóstico, intervenção e descontinuidade'],
    correctIndex: 1, explanation: 'O ciclo clássico de políticas públicas (policy cycle): 1) Identificação/agenda, 2) Formulação, 3) Decisão/legitimação, 4) Implementação, 5) Avaliação, 6) Feedback/extinção.' },

  // ══════════════════════════════════════════════════════════
  // TENDÊNCIAS — Realidade Brasileira
  // ══════════════════════════════════════════════════════════
  { id: 'tend-rb-1', area: 'tend-realidade', category: 'tend', subject: 'Reforma Tributária', difficulty: 'dificil',
    question: 'A Emenda Constitucional 132/2023 (Reforma Tributária) criou qual novo tributo em substituição ao ICMS e ISS?',
    options: ['CSLL', 'IBS (Imposto sobre Bens e Serviços)', 'IOF', 'IRPF', 'COFINS'],
    correctIndex: 1, explanation: 'A EC 132/2023 criou o IBS (estadual/municipal, substituindo ICMS e ISS) e a CBS (federal, substituindo PIS/Cofins), além do Imposto Seletivo. Simplifica o sistema tributário.' },

  // ══════════════════════════════════════════════════════════
  // TENDÊNCIAS — Inglês Instrumental
  // ══════════════════════════════════════════════════════════
  { id: 'tend-en-1', area: 'tend-ingles', category: 'tend', subject: 'Cognatos', difficulty: 'facil',
    question: 'Qual das seguintes palavras é um cognato (tem o mesmo significado em inglês e português)?',
    options: ['Actually (atualmente)', 'Library (livraria)', 'Hospital (hospital)', 'Propaganda (propaganda ✗)', 'Push (puxar)'],
    correctIndex: 2, explanation: '"Hospital" é cognato verdadeiro. "Actually" = na verdade (falso cognato). "Library" = biblioteca (falso). "Propaganda" = advertising. "Push" = empurrar.' },

  { id: 'tend-en-2', area: 'tend-ingles', category: 'tend', subject: 'Leitura Técnica', difficulty: 'medio',
    question: 'In the sentence "The management decided to implement new procedures", the word "implement" means:',
    options: ['Remover / Remove', 'Executar/colocar em prática / Put into practice', 'Cancelar / Cancel', 'Questionar / Question', 'Propor / Propose'],
    correctIndex: 1, explanation: '"Implement" = implementar, executar, colocar em prática. Cognato com o português "implementar". Frequente em textos administrativos e de concursos.' },

  // ══════════════════════════════════════════════════════════
  // CONCURSOS — Contabilidade
  // ══════════════════════════════════════════════════════════
  { id: 'co-cont-1', area: 'conc-contabilidade', category: 'conc', subject: 'Balanço Patrimonial', difficulty: 'medio',
    question: 'No Balanço Patrimonial, o Ativo Circulante inclui:',
    options: ['Imóveis e terrenos', 'Investimentos de longo prazo', 'Disponibilidades, estoques e contas a receber de curto prazo', 'Capital social', 'Depreciação acumulada'],
    correctIndex: 2, explanation: 'Ativo Circulante: bens e direitos conversíveis em dinheiro em até 12 meses (caixa, bancos, estoques, clientes a receber). Não circulante: duração > 12 meses.' },

  // Concursos — TI
  { id: 'co-ti-1', area: 'conc-ti', category: 'conc', subject: 'Banco de Dados', difficulty: 'medio',
    question: 'Em SQL, o comando usado para recuperar dados de uma tabela é:',
    options: ['INSERT', 'UPDATE', 'DELETE', 'SELECT', 'CREATE'],
    correctIndex: 3, explanation: 'SELECT é o comando DML de consulta. INSERT adiciona dados, UPDATE modifica, DELETE remove, CREATE cria estruturas (DDL).' },

  // Concursos — Auditoria
  { id: 'co-aud-1', area: 'conc-auditoria', category: 'conc', subject: 'Auditoria Interna', difficulty: 'medio',
    question: 'Qual é o principal objetivo da auditoria interna?',
    options: ['Apurar crimes fiscais', 'Agregar valor e melhorar as operações da organização por meio de avaliação independente', 'Calcular impostos devidos', 'Elaborar demonstrações financeiras', 'Fiscalizar apenas folha de pagamento'],
    correctIndex: 1, explanation: 'Definição do IIA: auditoria interna é atividade independente, de asseguração e consultoria, que agrega valor e melhora as operações da organização mediante avaliação sistemática de riscos, controles e governança.' },

  // Concursos — Direito Civil
  { id: 'co-dc-civ-1', area: 'conc-civil', category: 'conc', subject: 'Personalidade Jurídica', difficulty: 'medio',
    question: 'Segundo o Código Civil, a personalidade civil da pessoa natural começa:',
    options: ['Com a concepção', 'Com o registro de nascimento', 'Com o nascimento com vida', 'Com a maioridade', 'Com o batismo'],
    correctIndex: 2, explanation: 'Art. 2° do CC: "A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro."' },

  // Concursos — Direito Penal
  { id: 'co-dp-1', area: 'conc-penal', category: 'conc', subject: 'Princípios', difficulty: 'medio',
    question: 'O princípio da legalidade penal é expresso pela máxima:',
    options: ['"In dubio pro reo"', '"Nullum crimen, nulla poena sine lege"', '"Pacta sunt servanda"', '"Res judicata"', '"Erga omnes"'],
    correctIndex: 1, explanation: '"Nullum crimen, nulla poena sine lege" (Feuerbach, 1801): não há crime nem pena sem lei anterior que os defina. Previsto no Art. 5°, XXXIX da CF/88 e Art. 1° do Código Penal.' },
];

/**
 * Retorna questões para uma área específica.
 * Se não houver questões suficientes, completa com questões do banco geral ENEM.
 */
export function getQuestionsForArea(
  area: string,
  count: number,
  fallbackQuestions: import('./questionBank').Question[]
): Array<OfflineQuestion | import('./questionBank').Question> {
  const areaQuestions = OFFLINE_QUESTIONS.filter(q => q.area === area);

  if (areaQuestions.length >= count) {
    return [...areaQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // Complement with fallback ENEM questions
  const needed = count - areaQuestions.length;
  const complement = [...fallbackQuestions].sort(() => Math.random() - 0.5).slice(0, needed);
  return [...areaQuestions.sort(() => Math.random() - 0.5), ...complement];
}
