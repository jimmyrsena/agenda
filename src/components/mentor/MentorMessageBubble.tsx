import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Volume2, Square, ThumbsUp, ThumbsDown, Bookmark,
  Pin, Copy, Zap, CheckCircle2, Target, MessageCircle,
} from "lucide-react";
import { ChatMessage } from "@/types/study";
import ReactMarkdown from "react-markdown";
import { parseActions, cleanTags, renderLatex } from "./MentorUtils";

interface MentorMessageBubbleProps {
  msg: ChatMessage;
  idx: number;
  isSpeaking: boolean;
  speakingMsgIdx: number | null;
  highlightWord: number;
  onSpeakText: (text: string, idx: number) => void;
  onStopSpeaking: () => void;
  onToggleReaction: (idx: number, emoji: string) => void;
  onTogglePin: (idx: number) => void;
  onCopyMessage: (content: string) => void;
  onHandleAction: (action: { type: string; params: string[] }) => void;
  onRateResponse?: (idx: number, rating: 'helpful' | 'unhelpful') => void;
}

export const MentorMessageBubble: React.FC<MentorMessageBubbleProps> = ({
  msg, idx, isSpeaking, speakingMsgIdx, highlightWord,
  onSpeakText, onStopSpeaking, onToggleReaction, onTogglePin,
  onCopyMessage, onHandleAction, onRateResponse,
}) => {
  const [rated, setRated] = useState<'helpful' | 'unhelpful' | null>(null);

  const renderUserMessage = (content: string) => {
    if (content.startsWith('> ')) {
      const lines = content.split('\n');
      const quoteLines: string[] = []; const restLines: string[] = []; let inQuote = true;
      for (const line of lines) {
        if (inQuote && line.startsWith('> ')) quoteLines.push(line.slice(2));
        else if (inQuote && line.trim() === '') inQuote = false;
        else { inQuote = false; restLines.push(line); }
      }
      return (
        <div>
          {quoteLines.length > 0 && (
            <div className="border-l-2 border-primary-foreground/40 pl-2 mb-1.5 text-xs opacity-80 italic line-clamp-3">
              {quoteLines.join(' ')}
            </div>
          )}
          <span>{restLines.join('\n')}</span>
        </div>
      );
    }
    return content;
  };

  const renderAssistantMessage = (content: string) => {
    const actions = parseActions(content);
    const displayContent = renderLatex(cleanTags(content));

    if (speakingMsgIdx === idx && highlightWord >= 0) {
      const words = displayContent.replace(/[#*`_\[\]]/g, '').split(/\s+/);
      return (
        <div>
          <p className="text-sm leading-relaxed">
            {words.map((w, i) => (
              <span key={i} className={i === highlightWord ? 'bg-primary/20 text-primary font-semibold rounded px-0.5' : ''}>
                {w}{' '}
              </span>
            ))}
          </p>
          {actions.length > 0 && <ActionButtons actions={actions} onAction={onHandleAction} />}
        </div>
      );
    }

    return (
      <div>
        <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>table]:text-xs">
          <ReactMarkdown components={{ p: ({ children }) => <p>{children}</p> }}>{displayContent}</ReactMarkdown>
        </div>
        {actions.length > 0 && <ActionButtons actions={actions} onAction={onHandleAction} />}
        {/* Response rating */}
        {onRateResponse && !rated && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
            <span className="text-[10px] text-muted-foreground">Foi útil?</span>
            <button onClick={() => { setRated('helpful'); onRateResponse(idx, 'helpful'); }}
              className="text-[10px] px-2 py-0.5 rounded-full border hover:bg-green-500/10 hover:border-green-500/30 transition-colors flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> Sim
            </button>
            <button onClick={() => { setRated('unhelpful'); onRateResponse(idx, 'unhelpful'); }}
              className="text-[10px] px-2 py-0.5 rounded-full border hover:bg-red-500/10 hover:border-red-500/30 transition-colors flex items-center gap-1">
              <ThumbsDown className="h-3 w-3" /> Não
            </button>
          </div>
        )}
        {rated && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {rated === 'helpful' ? '✅ Obrigado pelo feedback!' : '📝 Vou melhorar!'}
          </div>
        )}
      </div>
    );
  };

  const sentimentEmoji: Record<string, string> = {
    motivado: '😊', frustrado: '😔', ansioso: '😰', confiante: '💪', confuso: '🤔',
  };

  return (
    <div className={`flex gap-2 group ${msg.role === 'user' ? 'justify-end' : ''}`}>
      {msg.role === 'assistant' && (
        <div className="w-7 h-7 rounded-full mentor-gradient flex items-center justify-center shrink-0 mt-1 shadow-sm">
          <GraduationCap className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2.5 text-sm shadow-sm relative ${
        msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card border rounded-bl-md select-text'
      } ${msg.pinned ? 'ring-1 ring-primary/30' : ''}`}>
        {msg.pinned && <Pin className="h-3 w-3 text-primary absolute -top-1 -right-1" />}
        {msg.sentiment && msg.role === 'assistant' && sentimentEmoji[msg.sentiment] && (
          <span className="absolute -top-2 -left-1 text-xs" title={`Sentimento: ${msg.sentiment}`}>
            {sentimentEmoji[msg.sentiment]}
          </span>
        )}
        {msg.role === 'user' ? renderUserMessage(msg.content) : renderAssistantMessage(msg.content)}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {Object.entries(msg.reactions).map(([emoji, count]) => count > 0 && (
              <span key={emoji} className="text-xs bg-accent/50 px-1.5 py-0.5 rounded-full">{emoji}</span>
            ))}
          </div>
        )}
      </div>
      {msg.role === 'assistant' && (
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity self-start mt-2">
          {isSpeaking && speakingMsgIdx === idx ? (
            <button onClick={onStopSpeaking} title="Parar"><Square className="h-3.5 w-3.5 text-destructive fill-destructive" /></button>
          ) : (
            <button onClick={() => onSpeakText(msg.content, idx)} title="Ouvir"><Volume2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
          )}
          <button onClick={() => onToggleReaction(idx, '👍')} title="Útil"><ThumbsUp className="h-3 w-3 text-muted-foreground" /></button>
          <button onClick={() => onToggleReaction(idx, '👎')} title="Não ajudou"><ThumbsDown className="h-3 w-3 text-muted-foreground" /></button>
          <button onClick={() => onToggleReaction(idx, '🔖')} title="Salvar"><Bookmark className="h-3 w-3 text-muted-foreground" /></button>
          <button onClick={() => onTogglePin(idx)} title={msg.pinned ? "Desfixar" : "Fixar"}>
            <Pin className={`h-3 w-3 ${msg.pinned ? 'text-primary' : 'text-muted-foreground'}`} />
          </button>
          <button onClick={() => onCopyMessage(msg.content)} title="Copiar"><Copy className="h-3 w-3 text-muted-foreground" /></button>
        </div>
      )}
    </div>
  );
};

const ActionButtons: React.FC<{
  actions: { type: string; params: string[] }[];
  onAction: (action: { type: string; params: string[] }) => void;
}> = ({ actions, onAction }) => (
  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
    {actions.map((action, i) => {
      const icons: Record<string, React.ReactNode> = {
        FLASHCARD: <Zap className="h-3 w-3" />,
        TAREFA: <CheckCircle2 className="h-3 w-3" />,
        POMODORO: <Target className="h-3 w-3" />,
        META: <Target className="h-3 w-3" />,
      };
      const labels: Record<string, string> = {
        FLASHCARD: `Criar Flashcard`,
        TAREFA: `Criar Tarefa: ${action.params[0]?.slice(0, 25)}...`,
        POMODORO: `Iniciar Pomodoro`,
        META: `Criar Meta`,
      };
      return (
        <Button key={i} size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-full"
          onClick={() => onAction(action)}>
          {icons[action.type]} {labels[action.type] || action.type}
        </Button>
      );
    })}
  </div>
);
