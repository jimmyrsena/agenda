import { useState } from "react";

interface Props {
  headerText: string;
  footerText: string;
  onHeaderChange: (text: string) => void;
  onFooterChange: (text: string) => void;
  pageNumber: number;
  totalPages: number;
  showPageNumbers: boolean;
  onTogglePageNumbers: () => void;
}

export function DocumentHeaderFooter({ headerText, footerText, onHeaderChange, onFooterChange, pageNumber, totalPages, showPageNumbers, onTogglePageNumbers }: Props) {
  const [editingHeader, setEditingHeader] = useState(false);
  const [editingFooter, setEditingFooter] = useState(false);

  return { header: (
    <div
      className="border-b border-dashed border-border/30 mb-4 pb-2 min-h-[24px] group cursor-text"
      onClick={() => setEditingHeader(true)}
    >
      {editingHeader ? (
        <input
          value={headerText}
          onChange={e => onHeaderChange(e.target.value)}
          onBlur={() => setEditingHeader(false)}
          autoFocus
          className="w-full text-[9px] text-muted-foreground bg-transparent border-0 outline-none text-center"
          placeholder="Cabeçalho — clique para editar"
        />
      ) : (
        <p className="text-[9px] text-muted-foreground/50 text-center group-hover:text-muted-foreground transition-colors">
          {headerText || 'Cabeçalho — clique para editar'}
        </p>
      )}
    </div>
  ), footer: (
    <div
      className="border-t border-dashed border-border/30 mt-4 pt-2 min-h-[24px] group cursor-text flex items-center justify-between"
    >
      <div className="flex-1" onClick={() => setEditingFooter(true)}>
        {editingFooter ? (
          <input
            value={footerText}
            onChange={e => onFooterChange(e.target.value)}
            onBlur={() => setEditingFooter(false)}
            autoFocus
            className="w-full text-[9px] text-muted-foreground bg-transparent border-0 outline-none"
            placeholder="Rodapé"
          />
        ) : (
          <p className="text-[9px] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            {footerText || 'Rodapé — clique para editar'}
          </p>
        )}
      </div>
      {showPageNumbers && (
        <span className="text-[9px] text-muted-foreground shrink-0">
          Página {pageNumber} de {totalPages}
        </span>
      )}
    </div>
  )};
}

export function PageBreakLine() {
  return (
    <div className="relative my-2">
      <div className="h-8 bg-muted/50 dark:bg-muted/20" />
    </div>
  );
}
