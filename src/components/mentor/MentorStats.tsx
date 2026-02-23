import React from "react";
import { ChatMessage } from "@/types/study";
import { MessageCircle, ThumbsUp, Brain, Clock } from "lucide-react";

interface MentorStatsProps {
  messages: ChatMessage[];
  show: boolean;
  onClose: () => void;
}

export const MentorStats: React.FC<MentorStatsProps> = ({ messages, show, onClose }) => {
  if (!show) return null;

  const userMsgs = messages.filter(m => m.role === 'user');
  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  
  // Count topics discussed (rough heuristic from user messages)
  const topics = new Set(
    userMsgs.map(m => {
      const words = m.content.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
      return words;
    })
  );

  // Count sentiment distribution
  const sentiments: Record<string, number> = {};
  assistantMsgs.forEach(m => {
    if (m.sentiment) sentiments[m.sentiment] = (sentiments[m.sentiment] || 0) + 1;
  });

  // Count reactions
  const totalReactions = messages.reduce((sum, m) => {
    if (!m.reactions) return sum;
    return sum + Object.values(m.reactions).reduce((s, c) => s + c, 0);
  }, 0);

  const sentimentEmoji: Record<string, string> = {
    motivado: '😊', frustrado: '😔', ansioso: '😰', confiante: '💪', confuso: '🤔', neutro: '😐',
  };

  return (
    <div className="bg-card border-b px-3 py-3 animate-in slide-in-from-top-2 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">📊 Estatísticas da Sessão</h3>
        <button onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground">Fechar</button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-accent/30 rounded-lg p-2 text-center">
          <MessageCircle className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{userMsgs.length}</p>
          <p className="text-[10px] text-muted-foreground">Perguntas</p>
        </div>
        <div className="bg-accent/30 rounded-lg p-2 text-center">
          <Brain className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{assistantMsgs.length}</p>
          <p className="text-[10px] text-muted-foreground">Respostas</p>
        </div>
        <div className="bg-accent/30 rounded-lg p-2 text-center">
          <ThumbsUp className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{totalReactions}</p>
          <p className="text-[10px] text-muted-foreground">Reações</p>
        </div>
        <div className="bg-accent/30 rounded-lg p-2 text-center">
          <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{topics.size}</p>
          <p className="text-[10px] text-muted-foreground">Tópicos</p>
        </div>
      </div>

      {Object.keys(sentiments).length > 0 && (
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Humor detectado:</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(sentiments).map(([s, count]) => (
              <span key={s} className="text-xs bg-accent/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                {sentimentEmoji[s] || '🔹'} {s} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
