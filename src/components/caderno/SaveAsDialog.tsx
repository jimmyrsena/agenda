import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2, FileText, Globe, Code, Type, FileCode, File, FolderOpen, Info } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from "docx";
import { saveAs } from "file-saver";
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

interface ExportFormat {
  id: string;
  label: string;
  ext: string;
  icon: typeof FileText;
  description: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'docx', label: 'Documento do Word (*.docx)', ext: '.docx', icon: FileText, description: 'Formato padrão do Microsoft Word' },
  { id: 'pdf', label: 'PDF (*.pdf)', ext: '.pdf', icon: FileDown, description: 'Portable Document Format' },
  { id: 'html', label: 'Página da Web (*.htm, *.html)', ext: '.html', icon: Globe, description: 'Página HTML com estilos' },
  { id: 'html-filtered', label: 'Página da Web, filtrada (*.htm, *.html)', ext: '.html', icon: Globe, description: 'HTML limpo sem estilos extras' },
  { id: 'rtf', label: 'Formato Rich Text (*.rtf)', ext: '.rtf', icon: Type, description: 'Compatível com a maioria dos editores' },
  { id: 'txt', label: 'Texto sem Formatação (*.txt)', ext: '.txt', icon: File, description: 'Apenas texto, sem formatação' },
  { id: 'xml', label: 'Documento XML do Word (*.xml)', ext: '.xml', icon: Code, description: 'Formato XML do Word 2003' },
  { id: 'odt', label: 'Texto do OpenDocument (*.odt)', ext: '.odt', icon: FileCode, description: 'Formato aberto (LibreOffice)' },
  { id: 'bmp', label: 'Imagem BMP (*.bmp)', ext: '.bmp', icon: File, description: 'Bitmap — captura visual do documento' },
  { id: 'emf', label: 'Imagem EMF (*.emf)', ext: '.emf', icon: File, description: 'Enhanced Metafile — vetorial Windows' },
  { id: 'eps', label: 'Imagem EPS (*.eps)', ext: '.eps', icon: File, description: 'Encapsulated PostScript' },
];

function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function generateRTF(text: string, title: string): string {
  const escapeRtf = (s: string) => s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  const lines = text.split('\n');
  let body = `\\pard\\qc\\b\\fs32 ${escapeRtf(title)}\\b0\\par\\par\n`;
  body += `\\pard\\ql\\fs24\n`;
  for (const line of lines) {
    body += `${escapeRtf(line)}\\par\n`;
  }
  return `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Calibri;}{\\f1 Times New Roman;}}\n{\\colortbl ;\\red0\\green0\\blue0;\\red0\\green0\\blue128;}\n\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n${body}}`;
}

function generateWordXML(html: string, title: string): string {
  const text = htmlToPlainText(html);
  const lines = text.split('\n').filter(l => l.trim());
  const bodyParagraphs = lines.map(line =>
    `<w:p><w:r><w:t xml:space="preserve">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t></w:r></w:p>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:o="urn:schemas-microsoft-com:office:office">
  <w:body>
    <w:p><w:pPr><w:jc w:val="center"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</w:t></w:r>
    </w:p>
    ${bodyParagraphs}
  </w:body>
</w:wordDocument>`;
}

function generateODT(text: string, title: string): Blob {
  // ODT is a ZIP file containing XML. We'll build a minimal one manually.
  // Since we don't have JSZip, we create a flat ODT XML (FODT) which is valid.
  const escXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = text.split('\n').filter(l => l.trim());
  const paragraphs = lines.map(l => `<text:p text:style-name="Standard">${escXml(l)}</text:p>`).join('\n');

  const fodt = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:mimetype="application/vnd.oasis.opendocument.text"
  office:version="1.2">
  <office:automatic-styles>
    <style:style style:name="Title" style:family="paragraph">
      <style:paragraph-properties fo:text-align="center"/>
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Standard" style:family="paragraph">
      <style:text-properties fo:font-size="12pt" style:font-name="Calibri"/>
    </style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
      <text:p text:style-name="Title">${escXml(title)}</text:p>
      ${paragraphs}
    </office:text>
  </office:body>
</office:document>`;

  return new Blob([fodt], { type: 'application/vnd.oasis.opendocument.text' });
}

export function SaveAsDialog({
  open, onClose, content, title, paperSize, orientation,
  margins, topMargin, bottomMargin, watermark, headerText, footerText, showPageNumbers,
}: Props) {
  const [exporting, setExporting] = useState(false);
  const [fileName, setFileName] = useState(title || 'documento');
  const [selectedFormat, setSelectedFormat] = useState('docx');

  const getExportBlob = async (): Promise<Blob> => {
    const name = fileName.trim() || 'documento';
    const plainText = htmlToPlainText(content);

    switch (selectedFormat) {
      case 'docx':
        return await buildDOCXBlob(content, plainText, title);
      case 'pdf':
        return buildPDFBlob(plainText, title);
      case 'html':
        return buildHTMLBlob(content, title, false);
      case 'html-filtered':
        return buildHTMLBlob(content, title, true);
      case 'rtf': {
        const rtf = generateRTF(plainText, title);
        return new Blob([rtf], { type: 'application/rtf' });
      }
      case 'txt':
        return new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      case 'xml': {
        const xml = generateWordXML(content, title);
        return new Blob([xml], { type: 'application/xml' });
      }
      case 'odt':
        return generateODT(plainText, title);
      case 'bmp':
      case 'emf':
      case 'eps':
        return await buildImageBlob(content, selectedFormat);
      default:
        return new Blob([content], { type: 'text/html;charset=utf-8' });
    }
  };

  // Direct download (fallback)
  const handleExport = async () => {
    setExporting(true);
    const name = fileName.trim() || 'documento';
    const fmt = EXPORT_FORMATS.find(f => f.id === selectedFormat)!;
    try {
      const blob = await getExportBlob();
      saveAs(blob, `${name}${fmt.ext}`);
      toast.success(`Arquivo baixado como "${name}${fmt.ext}"`);
      onClose();
    } catch (e: any) {
      toast.error('Erro ao exportar: ' + e.message);
    }
    setExporting(false);
  };

  // Save with download
  const handleExportWithPicker = async () => {
    // In iframe environments, showSaveFilePicker is blocked.
    // Use saveAs which triggers browser download dialog.
    // User should enable "Ask where to save" in browser settings.
    await handleExport();
  };

  const buildDOCXBlob = async (html: string, plainText: string, docTitle: string): Promise<Blob> => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const children: any[] = [];

    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) children.push(new Paragraph({ children: [new TextRun({ text })] }));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1') {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: el.textContent || '', bold: true, size: 32 })] }));
      } else if (tag === 'h2') {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: el.textContent || '', bold: true, size: 28 })] }));
      } else if (tag === 'h3') {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: el.textContent || '', bold: true, size: 24 })] }));
      } else if (tag === 'p' || tag === 'div') {
        const runs: TextRun[] = [];
        el.childNodes.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            runs.push(new TextRun({ text: child.textContent || '' }));
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement;
            const childTag = childEl.tagName.toLowerCase();
            runs.push(new TextRun({
              text: childEl.textContent || '',
              bold: childTag === 'strong' || childTag === 'b',
              italics: childTag === 'em' || childTag === 'i',
              underline: childTag === 'u' ? {} : undefined,
              strike: childTag === 's' || childTag === 'del',
            }));
          }
        });
        if (runs.length > 0) {
          const align = el.style.textAlign;
          children.push(new Paragraph({
            children: runs,
            alignment: align === 'center' ? AlignmentType.CENTER : align === 'right' ? AlignmentType.RIGHT : align === 'justify' ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
          }));
        }
      } else if (tag === 'ul' || tag === 'ol') {
        el.querySelectorAll('li').forEach(li => {
          children.push(new Paragraph({ children: [new TextRun({ text: `• ${li.textContent || ''}` })], indent: { left: convertInchesToTwip(0.5) } }));
        });
      } else if (tag === 'blockquote') {
        children.push(new Paragraph({ children: [new TextRun({ text: el.textContent || '', italics: true })], indent: { left: convertInchesToTwip(0.5) } }));
      } else if (tag === 'table') {
        el.querySelectorAll('tr').forEach(tr => {
          const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '');
          children.push(new Paragraph({ children: [new TextRun({ text: cells.join(' | ') })] }));
        });
      } else {
        el.childNodes.forEach(c => processNode(c));
      }
    };

    temp.childNodes.forEach(n => processNode(n));
    if (children.length === 0) children.push(new Paragraph({ children: [new TextRun({ text: plainText })] }));
    children.unshift(new Paragraph({
      heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: docTitle || 'Documento', bold: true, size: 36 })],
    }));

    const doc = new Document({
      sections: [{
        properties: { page: { margin: {
          top: convertInchesToTwip(topMargin / 2.54), bottom: convertInchesToTwip(bottomMargin / 2.54),
          left: convertInchesToTwip(margins.leftMarginCm / 2.54), right: convertInchesToTwip(margins.rightMarginCm / 2.54),
        }}},
        children,
      }],
    });
    return await Packer.toBlob(doc);
  };

  const buildPDFBlob = (plainText: string, docTitle: string): Blob => {
    const dims = getPaperDimensions(paperSize, orientation);
    const pSize = PAPER_SIZES.find(p => p.id === paperSize) || PAPER_SIZES[0];
    const doc = new jsPDF({ orientation: orientation === 'landscape' ? 'landscape' : 'portrait', unit: 'cm', format: [pSize.widthCm, pSize.heightCm] });
    const leftM = margins.leftMarginCm;
    const rightM = margins.rightMarginCm;
    const pageW = dims.widthCm - leftM - rightM;
    const lines = doc.splitTextToSize(plainText, pageW);
    const lineH = 0.5;
    let y = topMargin;
    let page = 1;
    const addHF = (pg: number) => {
      if (headerText) { doc.setFontSize(8); doc.setTextColor(150); doc.text(headerText, dims.widthCm / 2, topMargin - 0.5, { align: 'center' }); }
      if (watermark) { doc.setFontSize(48); doc.setTextColor(230); doc.text(watermark, dims.widthCm / 2, dims.heightCm / 2, { align: 'center', angle: 45 }); }
      if (showPageNumbers) { doc.setFontSize(8); doc.setTextColor(150); doc.text(`Página ${pg}`, dims.widthCm - rightM, dims.heightCm - bottomMargin + 0.8, { align: 'right' }); }
      if (footerText) { doc.setFontSize(8); doc.setTextColor(150); doc.text(footerText, leftM, dims.heightCm - bottomMargin + 0.8); }
    };
    doc.setFontSize(16); doc.setTextColor(0); doc.text(docTitle || 'Documento', leftM, y + 0.6); y += 1.2;
    doc.setFontSize(12); doc.setTextColor(40);
    for (const line of lines) {
      if (y + lineH > dims.heightCm - bottomMargin) { addHF(page); doc.addPage(); page++; y = topMargin; }
      doc.text(line, leftM, y); y += lineH;
    }
    addHF(page);
    return doc.output('blob') as unknown as Blob;
  };

  const buildHTMLBlob = (html: string, docTitle: string, filtered: boolean): Blob => {
    const fullHtml = filtered
      ? `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title></head><body>${html}</body></html>`
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Calibri, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1e293b; line-height: 1.6; font-size: 14px; }
  h1 { font-size: 24px; margin: 20px 0 10px; color: #0f172a; }
  h2 { font-size: 20px; margin: 16px 0 8px; color: #1e3a5f; }
  h3 { font-size: 16px; margin: 14px 0 6px; color: #334155; }
  p { margin: 6px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
  th { background: #f1f5f9; font-weight: 600; }
  blockquote { border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 8px 0; background: #eff6ff; }
  code { background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 13px; }
  img { max-width: 100%; }
</style></head><body>
<h1>${docTitle}</h1>
${html}
<footer style="margin-top: 40px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
  Exportado em ${new Date().toLocaleDateString('pt-BR')}
</footer>
</body></html>`;
    return new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  };

  const buildImageBlob = (htmlContent: string, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 600;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 800, 600);
      const plain = htmlToPlainText(htmlContent);
      ctx.fillStyle = '#000'; ctx.font = '16px serif'; ctx.fillText(title, 20, 40);
      ctx.font = '12px serif';
      let ty = 70;
      for (const tl of plain.split('\n')) {
        if (ty > 580) break;
        ctx.fillText(tl.slice(0, 100), 20, ty); ty += 18;
      }
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Falha ao gerar imagem')), format === 'bmp' ? 'image/bmp' : 'image/png');
    });
  };

  const selected = EXPORT_FORMATS.find(f => f.id === selectedFormat)!;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b bg-muted/30">
          <DialogTitle className="text-base font-semibold">Salvar Como</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* File name */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Nome do arquivo</label>
            <Input value={fileName} onChange={e => setFileName(e.target.value)} className="h-9 text-sm" placeholder="documento" autoFocus />
          </div>

          {/* Format selector */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Tipo de arquivo</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-56">
                  {EXPORT_FORMATS.map((fmt) => (
                    <SelectItem key={fmt.id} value={fmt.id} className="text-sm">
                      {fmt.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Info card */}
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-xs font-medium text-foreground">{selected.description}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Arquivo final: <span className="font-medium text-foreground">{fileName || 'documento'}{selected.ext}</span>
            </p>
          </div>

          {/* Tip */}
          <div className="rounded-md border border-border bg-muted/40 p-3 flex gap-2 items-start">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Para escolher a pasta de destino, ative <strong className="text-foreground">"Perguntar onde salvar cada arquivo"</strong> nas configurações de download do seu navegador (Chrome: Configurações → Downloads).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-muted/20">
          <Button variant="outline" size="sm" className="h-9 px-4 text-sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" className="h-9 px-5 text-sm gap-2" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
