import { KanbanTask, ChatMessage, Note } from "@/types/study";

export function getReminders(tasks: KanbanTask[]): string[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today); endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.column !== 'done');
  const notStarted = tasks.filter(t => t.column === 'todo');
  const inProgress = tasks.filter(t => t.column === 'doing');
  const thisWeek = tasks.filter(t => { if (!t.dueDate || t.column === 'done') return false; const d = new Date(t.dueDate); return d >= today && d <= endOfWeek; });
  const msgs: string[] = [];
  if (overdue.length > 0) msgs.push(`Atenção: Você tem ${overdue.length} tarefa(s) atrasada(s): ${overdue.map(t => `\"${t.title}\"`).join(', ')}.`);
  if (notStarted.length > 0) msgs.push(`${notStarted.length} tarefa(s) ainda não iniciada(s).`);
  if (inProgress.length > 0) msgs.push(`${inProgress.length} tarefa(s) em andamento.`);
  if (thisWeek.length > 0) msgs.push(`${thisWeek.length} tarefa(s) para esta semana: ${thisWeek.map(t => `\"${t.title}\"`).join(', ')}.`);
  if (msgs.length === 0) msgs.push("Tudo em dia! Continue assim!");
  return msgs;
}

export function extractMemories(text: string): string[] {
  const regex = /\[MEMORIZAR:\s*(.+?)\]/g;
  const found: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) found.push(match[1].trim());
  return found;
}

export function parseActions(text: string): { type: string; params: string[] }[] {
  const regex = /\[AÇÃO:(\w+):([^\]]+)\]/g;
  const actions: { type: string; params: string[] }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    actions.push({ type: match[1], params: match[2].split('|').map(s => s.trim()) });
  }
  return actions;
}

export function extractSentiment(text: string): string | undefined {
  const match = text.match(/\[SENTIMENTO:\s*(\w+)\]/);
  return match ? match[1] : undefined;
}

export function cleanTags(text: string): string {
  return text
    .replace(/\[AÇÃO:\w+:[^\]]+\]/g, '')
    .replace(/\[SENTIMENTO:\s*\w+\]/g, '')
    .replace(/\[MEMORIZAR:\s*.+?\]/g, '')
    .trim();
}

// Render LaTeX-like notation to readable text
export function renderLatex(text: string): string {
  return text
    .replace(/\$\\mathbb\{([A-Z])\}\$/g, '$1')
    .replace(/\$\\([a-zA-Z]+)\{([^}]*)\}\$/g, '$2')
    .replace(/\\mathbb\{([A-Z])\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\\\/g, '')
    .replace(/\$([^$]+)\$/g, '$1');
}

// Compress long conversation context for the AI
export function compressMessages(messages: ChatMessage[], maxMessages: number = 20): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;
  
  // Keep first message (greeting) + last N messages
  const first = messages[0];
  const recent = messages.slice(-maxMessages + 1);
  
  // Summarize middle messages
  const middle = messages.slice(1, -maxMessages + 1);
  const middleSummary: ChatMessage = {
    role: 'assistant',
    content: `[Resumo de ${middle.length} mensagens anteriores: O aluno e o Mentor discutiram sobre ${
      [...new Set(middle.filter(m => m.role === 'user').map(m => m.content.slice(0, 30)))].join(', ')
    }]`,
    timestamp: middle[middle.length - 1]?.timestamp,
  };
  
  return [first, middleSummary, ...recent];
}

// Export conversation as a Note
export function exportAsNote(messages: ChatMessage[], userName: string): Note {
  const userMsgs = messages.filter(m => m.role === 'user');
  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  
  const title = `Conversa com Mentor - ${new Date().toLocaleDateString('pt-BR')}`;
  
  let content = `# ${title}\n\n`;
  content += `**Resumo:** ${userMsgs.length} perguntas, ${assistantMsgs.length} respostas\n\n---\n\n`;
  
  messages.forEach(m => {
    if (m.role === 'user') {
      content += `**${userName}:** ${m.content}\n\n`;
    } else {
      content += `**Mentor:** ${cleanTags(m.content)}\n\n---\n\n`;
    }
  });
  
  return {
    id: crypto.randomUUID(),
    title,
    content,
    area: 'linguagens',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
