import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { PAPER_SIZES, getPaperDimensions } from "./paperSizes";
import type { RulerMargins } from "./WordRulers";

interface Props {
  open: boolean;
  onClose: () => void;
  content: string;
  title: string;
  paperSize: string;
  orientation: 'portrait' | 'landscape';
  margins: RulerMargins;
  topMargin: number;
  bottomMargin: number;
  watermark: string;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
}

export function PDFExportDialog({
  open, onClose, content, title, paperSize, orientation,
  margins, topMargin, bottomMargin, watermark, headerText, footerText, showPageNumbers,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [fileName, setFileName] = useState(title || 'documento');
  const [includeWatermark, setIncludeWatermark] = useState(!!watermark);
  const [includeHeader, setIncludeHeader] = useState(!!headerText);
  const [includeFooter, setIncludeFooter] = useState(true);

  const exportPDF = async () => {
    setExporting(true);
    try {
      const dims = getPaperDimensions(paperSize, orientation);
      const pSize = PAPER_SIZES.find(p => p.id === paperSize) || PAPER_SIZES[0];

      const doc = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'cm',
        format: [pSize.widthCm, pSize.heightCm],
      });

      const leftM = margins.leftMarginCm;
      const rightM = margins.rightMarginCm;
      const topM = topMargin;
      const bottomM = bottomMargin;
      const pageW = dims.widthCm - leftM - rightM;
      const pageH = dims.heightCm - topM - bottomM;

      // Extract plain text from HTML
      const temp = document.createElement('div');
      temp.innerHTML = content;
      const plainText = temp.textContent || temp.innerText || '';
      const lines = doc.splitTextToSize(plainText, pageW);

      const lineH = 0.5;
      let y = topM;
      let page = 1;

      const addHeaderFooter = (pg: number, total: number) => {
        if (includeHeader && headerText) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(headerText, dims.widthCm / 2, topM - 0.5, { align: 'center' });
        }
        if (includeWatermark && watermark) {
          doc.setFontSize(48);
          doc.setTextColor(230);
          doc.saveGraphicsState();
          const cx = dims.widthCm / 2;
          const cy = dims.heightCm / 2;
          // Approximate diagonal watermark
          doc.text(watermark, cx, cy, { align: 'center', angle: 45 });
          doc.restoreGraphicsState();
        }
        if (includeFooter && showPageNumbers) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Página ${pg}`, dims.widthCm - rightM, dims.heightCm - bottomM + 0.8, { align: 'right' });
        }
        if (includeFooter && footerText) {
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(footerText, leftM, dims.heightCm - bottomM + 0.8);
        }
      };

      // Title
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(title || 'Documento', leftM, y + 0.6);
      y += 1.2;

      // Body
      doc.setFontSize(12);
      doc.setTextColor(40);

      for (const line of lines) {
        if (y + lineH > dims.heightCm - bottomM) {
          addHeaderFooter(page, 0);
          doc.addPage();
          page++;
          y = topM;
        }
        doc.text(line, leftM, y);
        y += lineH;
      }
      addHeaderFooter(page, page);

      doc.save(`${fileName || 'documento'}.pdf`);
      toast.success('PDF exportado com sucesso!');
      onClose();
    } catch (e: any) {
      toast.error('Erro ao exportar: ' + e.message);
    }
    setExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nome do arquivo</label>
            <Input value={fileName} onChange={e => setFileName(e.target.value)} className="h-8 text-xs mt-1" />
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>📄 Papel: <strong>{PAPER_SIZES.find(p => p.id === paperSize)?.label}</strong> ({orientation === 'landscape' ? 'Paisagem' : 'Retrato'})</p>
            <p>📏 Margens: {margins.leftMarginCm}cm / {margins.rightMarginCm}cm / {topMargin}cm / {bottomMargin}cm</p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs">
              <span>Incluir marca d'água</span>
              <Switch checked={includeWatermark} onCheckedChange={setIncludeWatermark} disabled={!watermark} />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span>Incluir cabeçalho</span>
              <Switch checked={includeHeader} onCheckedChange={setIncludeHeader} />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span>Incluir rodapé e numeração</span>
              <Switch checked={includeFooter} onCheckedChange={setIncludeFooter} />
            </label>
          </div>
          <Button onClick={exportPDF} disabled={exporting} className="w-full h-8 text-xs gap-2">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
            Exportar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
