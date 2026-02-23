import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap, Sparkles, Volume2, VolumeX, Square, Settings,
  MessageSquarePlus, Pause, Play, Save, Search, Maximize2, Minimize2, X,
  FileDown, BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { MentorMode, MENTOR_MODES } from "@/types/study";
import { MentorConfig } from "./MentorTypes";

interface MentorHeaderProps {
  mode: MentorMode;
  config: MentorConfig;
  memoriesCount: number;
  isSpeaking: boolean;
  isPaused: boolean;
  voiceEnabled: boolean;
  showSearch: boolean;
  focusMode: boolean;
  isSavingChat: boolean;
  onToggleModeSelector: () => void;
  onTogglePause: () => void;
  onStopSpeaking: () => void;
  onToggleVoice: () => void;
  onToggleSearch: () => void;
  onToggleFocus: () => void;
  onSaveConversation: () => void;
  onClearChat: () => void;
  onExportToNotes: () => void;
}

export const MentorHeader: React.FC<MentorHeaderProps> = ({
  mode, config, memoriesCount, isSpeaking, isPaused, voiceEnabled,
  showSearch, focusMode, isSavingChat,
  onToggleModeSelector, onTogglePause, onStopSpeaking, onToggleVoice,
  onToggleSearch, onToggleFocus, onSaveConversation, onClearChat, onExportToNotes,
}) => (
  <div className="flex items-center gap-2 px-3 py-2.5 mentor-gradient text-white shrink-0 rounded-t-xl">
    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
      <GraduationCap className="h-4 w-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm">Mentor</p>
      <p className="text-[10px] opacity-80 truncate">
        {MENTOR_MODES[mode]?.icon} {MENTOR_MODES[mode]?.label} • {config.userName}
      </p>
    </div>

    <button onClick={onToggleModeSelector}
      className="bg-white/20 hover:bg-white/30 rounded-full px-2 py-1 text-[10px] font-medium transition-colors flex items-center gap-1"
      title="Mudar modo">
      {MENTOR_MODES[mode]?.icon} {MENTOR_MODES[mode]?.label}
    </button>

    {memoriesCount > 0 && (
      <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0 gap-1 hidden sm:flex">
        <Sparkles className="h-3 w-3" /> {memoriesCount}
      </Badge>
    )}

    {isSpeaking && (
      <>
        <button onClick={onTogglePause} className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors" title={isPaused ? "Continuar" : "Pausar"}>
          {isPaused ? <Play className="h-3.5 w-3.5 fill-white" /> : <Pause className="h-3.5 w-3.5 fill-white" />}
        </button>
        <button onClick={onStopSpeaking} className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors" title="Parar">
          <Square className="h-3.5 w-3.5 fill-white" />
        </button>
      </>
    )}

    <button onClick={onToggleVoice} className="opacity-70 hover:opacity-100 transition-opacity" title={voiceEnabled ? "Desativar voz" : "Ativar voz"}>
      {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>

    <button onClick={onToggleSearch} className="opacity-70 hover:opacity-100 transition-opacity" title="Buscar">
      <Search className="h-4 w-4" />
    </button>

    <button onClick={onToggleFocus} className="opacity-70 hover:opacity-100 transition-opacity" title={focusMode ? "Sair do foco" : "Modo foco"}>
      {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>

    <button onClick={onExportToNotes} className="opacity-70 hover:opacity-100 transition-opacity" title="Exportar para Caderno">
      <BookOpen className="h-4 w-4" />
    </button>

    <Link to="/configuracoes" className="opacity-70 hover:opacity-100 transition-opacity" title="Configurações">
      <Settings className="h-4 w-4" />
    </Link>

    <button onClick={onSaveConversation} className={`opacity-70 hover:opacity-100 transition-opacity ${isSavingChat ? 'animate-pulse' : ''}`} title="Salvar conversa" disabled={isSavingChat}>
      <Save className="h-4 w-4" />
    </button>

    <button onClick={onClearChat} className="opacity-70 hover:opacity-100 transition-opacity" title="Nova conversa">
      <MessageSquarePlus className="h-4 w-4" />
    </button>
  </div>
);
