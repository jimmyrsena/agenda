import { useState } from "react";
import {
  LayoutDashboard, KanbanSquare, CalendarDays, GraduationCap,
  CreditCard, Target, BookOpen, Timer, CalendarRange,
  FileText, Languages, Settings, BarChart3, HelpCircle, School, LogOut, Download,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Planner", url: "/kanban", icon: KanbanSquare },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Mentor", url: "/tutor", icon: GraduationCap },
  { title: "Salas", url: "/salas", icon: School },
];

const studyItems = [
  { title: "Pomodoro", url: "/pomodoro", icon: Timer },
  { title: "Plano Semanal", url: "/plano", icon: CalendarRange },
  { title: "Simulados", url: "/simulados", icon: FileText },
  
  { title: "Flashcards", url: "/flashcards", icon: CreditCard },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Caderno", url: "/caderno", icon: BookOpen },
  { title: "Idiomas", url: "/idiomas", icon: Languages },
  { title: "Tradução", url: "/traducao", icon: Languages },
];

const systemItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Ajuda", url: "/ajuda", icon: HelpCircle },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleExit = () => {
    // Force backup download
    const allData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allData[key] = localStorage.getItem(key) || "";
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `sistema-estudos-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.removeItem("auto-backup-pending");
    toast.success("Backup salvo! Você pode fechar o sistema com segurança.");
    setShowExitDialog(false);
  };

  return (
    <>
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      onMouseEnter={() => !isMobile && collapsed && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Logo" className="w-9 h-9 rounded-xl shadow-lg" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-foreground">Sistema de Estudos</p>
              <p className="text-[11px] text-sidebar-foreground/50">por Jimmy Sena</p>
            </div>
          </div>
        ) : (
          <img src="/favicon.png" alt="Logo" className="w-9 h-9 rounded-xl mx-auto shadow-lg" />
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent/50 rounded-lg transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={false} className="hover:bg-sidebar-accent/50 rounded-lg transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-wider">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={false} className="hover:bg-sidebar-accent/50 rounded-lg transition-colors" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Exit button */}
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sair" onClick={() => setShowExitDialog(true)} className="hover:bg-destructive/10 rounded-lg transition-colors text-destructive cursor-pointer">
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border text-center">
          <p className="text-[10px] text-sidebar-foreground/30">por Jimmy Sena</p>
        </div>
      )}
    </Sidebar>

    <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" /> Salvar Backup antes de sair
          </AlertDialogTitle>
          <AlertDialogDescription>
            Para não perder nenhuma informação, o sistema irá baixar um backup completo dos seus dados antes de fechar. Salve o arquivo na mesma pasta do seu disco local.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleExit} className="gap-1.5">
            <Download className="h-4 w-4" /> Salvar e Sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
