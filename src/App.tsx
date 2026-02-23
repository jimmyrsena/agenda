import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { TaskNotifications } from "@/components/TaskNotifications";
import Index from "./pages/Index";
import KanbanPage from "./pages/KanbanPage";
import AgendaPage from "./pages/AgendaPage";
import TutorPage from "./pages/TutorPage";

import FlashcardsPage from "./pages/FlashcardsPage";
import MetasPage from "./pages/MetasPage";
import CadernoPage from "./pages/CadernoPage";
import PomodoroPage from "./pages/PomodoroPage";
import PlanoEstudosPage from "./pages/PlanoEstudosPage";

import SimuladosPage from "./pages/SimuladosPage";
import IdiomasPage from "./pages/IdiomasPage";
import SalasPage from "./pages/SalasPage";
import TraducaoPage from "./pages/TraducaoPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import AjudaPage from "./pages/AjudaPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <TaskNotifications />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/salas" element={<SalasPage />} />
            
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/metas" element={<MetasPage />} />
            <Route path="/caderno" element={<CadernoPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/plano" element={<PlanoEstudosPage />} />
            <Route path="/simulados" element={<SimuladosPage />} />
            
            <Route path="/idiomas" element={<IdiomasPage />} />
            <Route path="/traducao" element={<TraducaoPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="/relatorios" element={<RelatoriosPage />} />
            <Route path="/ajuda" element={<AjudaPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
