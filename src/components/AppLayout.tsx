import { useEffect, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/kanban': 'Planner de Estudos',
  '/agenda': 'Agenda',
  '/tutor': 'Mentor',
  '/simulados': 'Simulados & Questões',
  '/flashcards': 'Flashcards',
  '/metas': 'Metas',
  '/caderno': 'Caderno',
  '/pomodoro': 'Pomodoro',
  '/plano': 'Plano Semanal',
  
  '/idiomas': 'Sala de Idiomas',
  '/traducao': 'Tradução',
  '/salas': 'Salas de Conhecimento',
  '/configuracoes': 'Configurações',
  '/relatorios': 'Relatórios',
  '/ajuda': 'Central de Ajuda',
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Sistema de Estudos';
  const prevPath = useRef(location.pathname);

  // Stop all audio/speech when navigating between pages
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      window.speechSynthesis?.cancel();
      document.querySelectorAll("audio").forEach(a => { a.pause(); a.currentTime = 0; });
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  // Auto-backup: detect localStorage changes and save backup timestamp
  useEffect(() => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const patchedSetItem = function (key: string, value: string) {
      originalSetItem(key, value);
      // Don't trigger on meta keys to avoid infinite loops
      if (!key.startsWith("last-backup") && key !== "auto-backup-pending") {
        originalSetItem("auto-backup-pending", "true");
      }
    };
    localStorage.setItem = patchedSetItem;
    return () => { localStorage.setItem = originalSetItem; };
  }, []);

  // beforeunload: warn user if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const pending = localStorage.getItem("auto-backup-pending");
      if (pending === "true") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 sm:h-14 flex items-center gap-2 sm:gap-3 border-b px-3 sm:px-5 bg-card/80 backdrop-blur-sm shrink-0 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border hidden sm:block" />
            <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground hidden lg:block">por Jimmy Sena</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-5 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
