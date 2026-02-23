import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useUserName } from "@/hooks/useUserName";

interface ExportPDFProps {
  title: string;
  getContent: () => string;
}

export function ExportPDF({ title, getContent }: ExportPDFProps) {
  const userName = useUserName();
  const print = useCallback(() => {
    const content = getContent();
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Permita pop-ups para imprimir');
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; max-width: 780px; margin: 0 auto; padding: 24px 16px; color: #1e293b; line-height: 1.5; font-size: 12px; }
  h1 { color: #1e3a5f; font-size: 18px; margin-bottom: 4px; padding-bottom: 6px; border-bottom: 2px solid #3b82f6; }
  h2 { color: #1e40af; font-size: 14px; margin: 14px 0 4px; border-left: 3px solid #3b82f6; padding-left: 8px; }
  h3 { color: #4338ca; font-size: 13px; margin: 10px 0 3px; }
  p { margin: 2px 0; }
  li { margin: 1px 0; padding-left: 2px; }
  ul, ol { margin: 3px 0 3px 16px; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 11px; }
  th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
  th { background: #f1f5f9; font-weight: 600; color: #334155; }
  tr:nth-child(even) td { background: #f8fafc; }
  strong { color: #0f172a; }
  em { color: #475569; font-style: italic; }
  code { background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 11px; color: #be185d; }
  blockquote { border-left: 3px solid #3b82f6; padding: 4px 10px; margin: 6px 0; background: #eff6ff; color: #1e40af; border-radius: 0 6px 6px 0; font-size: 11px; }
  .section { page-break-inside: avoid; margin-bottom: 10px; }
  .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; text-align: center; }
  @media print {
    body { padding: 12px; }
    .section { page-break-inside: avoid; }
    h1 { font-size: 16px; }
    h2 { font-size: 13px; margin-top: 10px; }
    h3 { font-size: 12px; }
    p, li { font-size: 11px; line-height: 1.4; }
  }
</style></head><body>${content}
<div class="footer">${userName} | ${new Date().toLocaleDateString('pt-BR')} | Sistema de Estudos</div>
</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }, [title, getContent, userName]);

  return (
    <Button size="sm" variant="outline" onClick={print} className="gap-1.5">
      <Printer className="h-3.5 w-3.5" />
      Imprimir
    </Button>
  );
}
