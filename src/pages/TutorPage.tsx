import { useState, useCallback, useRef } from "react";
import { GraduationCap, Brain, Sparkles, BookOpen, Briefcase, Heart, Code, Lightbulb, Cpu, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUserName } from "@/hooks/useUserName";
import { useIsMobile } from "@/hooks/use-mobile";
import { MentorChat } from "@/components/MentorChat";
import { ChatHistory } from "@/components/ChatHistory";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/types/study";

const SKILLS = [
  { icon: BookOpen, label: "Todas as matérias", desc: "Fund., Médio, ENEM e Concursos" },
  { icon: Brain, label: "Psicologia moderna", desc: "IE, CNV, Mindset" },
  { icon: Briefcase, label: "Concursos públicos", desc: "Núcleo, Médio e Superior" },
  { icon: Heart, label: "Saúde e bem-estar", desc: "Nutrição, sono, exercício" },
  { icon: Lightbulb, label: "Produtividade", desc: "GTD, Deep Work, hábitos" },
  { icon: Code, label: "Programação e TI", desc: "Software, BD, Nuvem, IA" },
  { icon: Cpu, label: "Tendências 2025/26", desc: "LGPD, Políticas Públicas" },
  { icon: Sparkles, label: "Educação financeira", desc: "AFO, finanças pessoais" },
];

export default function TutorPage() {
  const userName = useUserName();
  const isMobile = useIsMobile();
  const [memories, setMemories] = useLocalStorage<string[]>('mentor-memories', []);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const handleClearMemories = useCallback(() => {
    setMemories([]);
  }, [setMemories]);
  const setMessagesRef = useRef<((msgs: ChatMessage[]) => void) | null>(null);

  const handleLoadConversation = useCallback((msgs: ChatMessage[]) => {
    setMessagesRef.current?.(msgs);
    if (isMobile) setShowMobileHistory(false);
  }, [isMobile]);

  const handleMessagesRef = useCallback((setter: (msgs: ChatMessage[]) => void) => {
    setMessagesRef.current = setter;
  }, []);

  return (
    <div className="flex h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] gap-0 relative">
      {/* Mobile history overlay */}
      {isMobile && showMobileHistory && (
        <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setShowMobileHistory(false)}>
          <div className="h-full w-[280px] max-w-[85vw]" onClick={e => e.stopPropagation()}>
            <ChatHistory
              onLoadConversation={handleLoadConversation}
              onClearMemories={handleClearMemories}
              isCollapsed={false}
              onToggleCollapse={() => setShowMobileHistory(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Chat History Sidebar */}
      {!isMobile && (
        <ChatHistory
          onLoadConversation={handleLoadConversation}
          onClearMemories={handleClearMemories}
          isCollapsed={historyCollapsed}
          onToggleCollapse={() => setHistoryCollapsed(prev => !prev)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 p-0 lg:pl-4 min-w-0">
        {/* Mobile history toggle */}
        {isMobile && (
          <div className="flex items-center gap-2 px-1 pb-1 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowMobileHistory(true)}>
              <History className="h-3.5 w-3.5" /> Histórico
            </Button>
          </div>
        )}

        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col min-h-0 flex-1">
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg">
            <MentorChat embedded onMessagesRef={handleMessagesRef} />
          </Card>
        </div>

        {/* Side panel - hidden on mobile */}
        <div className="space-y-4 overflow-auto scrollbar-thin hidden lg:block">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl mentor-gradient flex items-center justify-center mx-auto shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold">Mentor</h2>
            <p className="text-xs text-muted-foreground">Orientador acadêmico e conselheiro pessoal</p>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Brain className="h-4 w-4 text-primary" />
                Áreas de conhecimento
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {SKILLS.map(s => (
                  <div key={s.label} className="flex items-start gap-2 p-2 rounded-lg bg-accent/50">
                    <s.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {memories.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Memórias ({memories.length})
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  {memories.slice(-6).map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {m}
                    </li>
                  ))}
                  {memories.length > 6 && (
                    <li>
                      <Badge variant="secondary" className="text-[10px]">+{memories.length - 6} memórias</Badge>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Desenvolvido por Jimmy Sena para {userName}
          </p>
        </div>
      </div>
    </div>
  );
}
