import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Code, Quote, Link, CheckSquare, Minus, AlertTriangle, Lightbulb, CheckCircle, XCircle, Pin, ChevronDown, Table, Sigma } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  onInsert: (before: string, after?: string) => void;
}

const MAIN_TOOLS = [
  { icon: Bold, label: 'Negrito (Ctrl+B)', before: '**', after: '**' },
  { icon: Italic, label: 'Itálico (Ctrl+I)', before: '*', after: '*' },
  { icon: Heading1, label: 'Título 1', before: '# ', after: '' },
  { icon: Heading2, label: 'Título 2', before: '## ', after: '' },
  { icon: Heading3, label: 'Título 3', before: '### ', after: '' },
  { icon: List, label: 'Lista', before: '- ', after: '' },
  { icon: ListOrdered, label: 'Lista Numerada', before: '1. ', after: '' },
  { icon: CheckSquare, label: 'Checklist', before: '- [ ] ', after: '' },
  { icon: Code, label: 'Código', before: '`', after: '`' },
  { icon: Quote, label: 'Citação', before: '> ', after: '' },
  { icon: Link, label: 'Link', before: '[texto](', after: 'url)' },
  { icon: Minus, label: 'Separador', before: '\n---\n', after: '' },
];

const CALLOUTS = [
  { icon: '💡', label: 'Dica', md: '\n> 💡 **Dica:** ' },
  { icon: '⚠️', label: 'Atenção', md: '\n> ⚠️ **Atenção:** ' },
  { icon: '✅', label: 'Importante', md: '\n> ✅ **Importante:** ' },
  { icon: '❌', label: 'Erro Comum', md: '\n> ❌ **Erro Comum:** ' },
  { icon: '📌', label: 'Lembrar', md: '\n> 📌 **Lembrar:** ' },
  { icon: '🔑', label: 'Conceito-chave', md: '\n> 🔑 **Conceito-chave:** ' },
  { icon: '📝', label: 'Exemplo', md: '\n> 📝 **Exemplo:** ' },
  { icon: '🧪', label: 'Fórmula', md: '\n> 🧪 **Fórmula:** ' },
];

const BLOCKS = [
  { icon: '📊', label: 'Tabela', md: '\n| Coluna 1 | Coluna 2 | Coluna 3 |\n|----------|----------|----------|\n| dado 1   | dado 2   | dado 3   |\n' },
  { icon: '🔽', label: 'Spoiler/Toggle', md: '\n<details>\n<summary>Clique para revelar</summary>\n\nConteúdo oculto aqui...\n\n</details>\n' },
  { icon: '💻', label: 'Bloco de Código', md: '\n```\n// seu código aqui\n```\n' },
  { icon: '📐', label: 'Fórmula (LaTeX)', md: '\n$$\nE = mc^2\n$$\n' },
  { icon: '📅', label: 'Timeline', md: '\n### 📅 Timeline\n1. **Evento 1** — Descrição\n2. **Evento 2** — Descrição\n3. **Evento 3** — Descrição\n' },
  { icon: '🗂️', label: 'Definição', md: '\n**Termo:** \n**Definição:** \n**Exemplo:** \n' },
];

export function NoteToolbar({ onInsert }: Props) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap border-b pb-1.5 mb-2">
      {MAIN_TOOLS.map(tool => (
        <Tooltip key={tool.label}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onInsert(tool.before, tool.after)}
            >
              <tool.icon className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{tool.label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Callouts dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-0.5 px-1.5">
            <AlertTriangle className="h-3 w-3" /> Callout <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {CALLOUTS.map(c => (
            <DropdownMenuItem key={c.label} onClick={() => onInsert(c.md)} className="text-xs gap-2">
              <span>{c.icon}</span> {c.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Blocks dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-0.5 px-1.5">
            <Table className="h-3 w-3" /> Bloco <ChevronDown className="h-2.5 w-2.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {BLOCKS.map(b => (
            <DropdownMenuItem key={b.label} onClick={() => onInsert(b.md)} className="text-xs gap-2">
              <span>{b.icon}</span> {b.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
