import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Note, ENEM_AREAS } from "@/types/study";
import { Download, FileText, Code, Presentation, QrCode, Globe, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";

interface Props {
  note: Note | null;
  allNotes: Note[];
}

export function NoteExportAdvanced({ note, allNotes }: Props) {
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [qrDialog, setQrDialog] = useState(false);

  const slides = note ? note.content.split(/\n---\n|(?=^## )/gm).filter(s => s.trim()) : [];

  const exportMarkdown = useCallback(() => {
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown' });
    downloadBlob(blob, `${note.title}.md`);
    toast.success('Markdown exportado!');
  }, [note]);

  const exportHTML = useCallback(() => {
    if (!note) return;
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${note.title}</title>
<style>
  body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: Georgia, serif; line-height: 1.8; color: #333; }
  h1 { border-bottom: 2px solid #0078D4; padding-bottom: 8px; }
  h2 { color: #0078D4; margin-top: 2em; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
  blockquote { border-left: 4px solid #0078D4; margin-left: 0; padding-left: 16px; color: #555; }
  table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .meta { color: #888; font-size: 0.85em; margin-bottom: 2em; }
</style>
</head>
<body>
<h1>${note.title}</h1>
<p class="meta">Área: ${ENEM_AREAS[note.area].label} | Atualizado: ${new Date(note.updatedAt).toLocaleDateString('pt-BR')}</p>
${markdownToHTML(note.content)}
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, `${note.title}.html`);
    toast.success('HTML exportado!');
  }, [note]);

  const exportPDF = useCallback(() => {
    if (!note) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(note.title, margin, y);
    y += 10;

    // Meta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Área: ${ENEM_AREAS[note.area].label} | ${new Date(note.updatedAt).toLocaleDateString('pt-BR')}`, margin, y);
    y += 8;
    doc.setTextColor(0);

    // Line
    doc.setDrawColor(0, 120, 212);
    doc.line(margin, y, margin + pageWidth, y);
    y += 8;

    // Content
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(note.content, pageWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      // Simple formatting
      if (line.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(line.replace(/^#+\s/, ''), margin, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(line.replace(/^#+\s/, ''), margin, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, margin, y);
      }
      y += 6;
    }

    // Page numbers
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`${note.title} — Página ${i}/${totalPages}`, margin, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`${note.title}.pdf`);
    toast.success('PDF exportado!');
  }, [note]);

  const exportAllZip = useCallback(async () => {
    // Simple: export all as single markdown file
    const content = allNotes.map(n =>
      `# ${n.title}\n\nÁrea: ${ENEM_AREAS[n.area].label} | ${new Date(n.updatedAt).toLocaleDateString('pt-BR')}\n\n${n.content}\n\n---\n`
    ).join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    downloadBlob(blob, `caderno-completo-${new Date().toISOString().slice(0, 10)}.md`);
    toast.success(`${allNotes.length} notas exportadas!`);
  }, [allNotes]);

  const printNote = useCallback(() => {
    if (!note) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${note.title}</title>
    <style>
      body { max-width: 700px; margin: 40px auto; font-family: Georgia, serif; line-height: 1.8; }
      h1 { border-bottom: 2px solid #0078D4; } h2 { color: #0078D4; }
      @media print { body { margin: 20mm; } }
    </style></head><body>
    <h1>${note.title}</h1>
    <p style="color:#888;font-size:0.9em">Área: ${ENEM_AREAS[note.area].label} | ${new Date(note.updatedAt).toLocaleDateString('pt-BR')}</p>
    ${markdownToHTML(note.content)}
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }, [note]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
            <Download className="h-3 w-3" /> Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-[10px]">Nota Atual</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportMarkdown} disabled={!note} className="text-xs gap-2">
            <Code className="h-3 w-3" /> Markdown (.md)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportHTML} disabled={!note} className="text-xs gap-2">
            <Globe className="h-3 w-3" /> HTML (.html)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportPDF} disabled={!note} className="text-xs gap-2">
            <FileText className="h-3 w-3" /> PDF (.pdf)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={printNote} disabled={!note} className="text-xs gap-2">
            <Printer className="h-3 w-3" /> Imprimir
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { if (note && slides.length > 0) { setPresentationMode(true); setCurrentSlide(0); } }}
            disabled={!note || slides.length < 2} className="text-xs gap-2">
            <Presentation className="h-3 w-3" /> Modo Apresentação
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px]">Todas as Notas</DropdownMenuLabel>
          <DropdownMenuItem onClick={exportAllZip} className="text-xs gap-2">
            <Download className="h-3 w-3" /> Backup Completo (.md)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Presentation mode */}
      {presentationMode && note && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col" onClick={e => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          if (e.clientX > rect.width / 2) setCurrentSlide(p => Math.min(p + 1, slides.length - 1));
          else setCurrentSlide(p => Math.max(p - 1, 0));
        }}
          onKeyDown={e => {
            if (e.key === 'ArrowRight' || e.key === ' ') setCurrentSlide(p => Math.min(p + 1, slides.length - 1));
            if (e.key === 'ArrowLeft') setCurrentSlide(p => Math.max(p - 1, 0));
            if (e.key === 'Escape') setPresentationMode(false);
          }}
          tabIndex={0}
          ref={el => el?.focus()}
        >
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="prose prose-lg max-w-3xl dark:prose-invert">
              <ReactMarkdown>{slides[currentSlide] || ''}</ReactMarkdown>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-muted/50 text-xs">
            <span>{note.title}</span>
            <span>Slide {currentSlide + 1} / {slides.length}</span>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={e => { e.stopPropagation(); setPresentationMode(false); }}>
              Sair (Esc)
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function markdownToHTML(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}
