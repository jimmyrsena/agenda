import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Languages, Upload, FileText, Loader2, Copy, Check, ArrowRightLeft, Download, Plus, Trash2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { jsPDF } from "jspdf";
import { translateLocally } from "@/data/offlineTranslation";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-text`;
const AUTH_HEADER = { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` };

const LANGUAGES = [
  { id: "portuguese", name: "Português BR", flag: "🇧🇷" },
  { id: "english", name: "English", flag: "🇺🇸" },
  { id: "spanish", name: "Español", flag: "🇪🇸" },
  { id: "german", name: "Deutsch", flag: "🇩🇪" },
  { id: "italian", name: "Italiano", flag: "🇮🇹" },
  { id: "mandarin", name: "中文 Mandarim", flag: "🇨🇳" },
];

export default function TraducaoPage() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("portuguese");
  const [targetLang, setTargetLang] = useState("english");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfName, setPdfName] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [translationMethod, setTranslationMethod] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const clearAll = () => {
    setSourceText("");
    setTranslatedText("");
    setPdfName("");
    setCopied(false);
    setPdfReady(false);
    setProcessingStep("");
    if (fileRef.current) fileRef.current.value = "";
    toast.success("Dados limpos!");
  };

  const newTranslation = () => {
    setSourceText("");
    setTranslatedText("");
    setPdfName("");
    setCopied(false);
    setPdfReady(false);
    setProcessingStep("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const translateText = async (text: string): Promise<string> => {
    try {
      const resp = await fetch(FUNC_URL, { method: "POST", headers: AUTH_HEADER, body: JSON.stringify({ text: text.trim(), sourceLang, targetLang }) });
      if (!resp.ok) throw new Error("server-unavailable");
      const data = await resp.json();
      if (data.error) throw new Error("server-unavailable");
      setIsOffline(false);
      setTranslationMethod(data.method === "ai" ? "IA" : data.method === "mymemory" ? "MyMemory" : data.method === "libre" ? "LibreTranslate" : "Online");
      return data.translation;
    } catch {
      setIsOffline(true);
      setTranslationMethod("Dicionário Local");
      const localResult = translateLocally(text.trim(), sourceLang, targetLang);
      return localResult;
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) { toast.error("Digite ou envie um texto para traduzir."); return; }
    if (sourceLang === targetLang) { toast.error("Selecione idiomas diferentes."); return; }
    setLoading(true);
    setTranslatedText("");
    setPdfReady(false);
    try {
      const result = await translateText(sourceText);
      setTranslatedText(result);
      toast.success(isOffline ? "Tradução local concluída (modo dicionário)" : "Tradução concluída!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao traduzir");
    }
    setLoading(false);
  };

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Envie um arquivo PDF."); return; }
    if (sourceLang === targetLang) { toast.error("Selecione idiomas diferentes antes de enviar o PDF."); return; }

    const fileName = file.name;
    setPdfName(fileName);
    setExtracting(true);
    setTranslatedText("");
    setPdfReady(false);
    setProcessingStep("Extraindo texto do PDF...");
    toast.info("Processando PDF em segundo plano...");

    try {
      // Step 1: Extract text
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const pages: string[] = [];
      const maxPages = Math.min(pdf.numPages, 50);

      for (let i = 1; i <= maxPages; i++) {
        setProcessingStep(`Extraindo página ${i} de ${maxPages}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (pageText) pages.push(pageText);
      }

      const fullText = pages.join("\n\n").slice(0, 20000);
      if (!fullText || fullText.length < 20) {
        toast.error("Não foi possível extrair texto. O PDF pode ser escaneado (imagem).");
        setExtracting(false);
        setProcessingStep("");
        if (fileRef.current) fileRef.current.value = "";
        return;
      }

      setSourceText(fullText);
      setProcessingStep("Traduzindo texto...");

      // Step 2: Auto-translate
      const result = await translateText(fullText);
      setTranslatedText(result);
      setPdfReady(true);
      setProcessingStep("");
      toast.success(`PDF traduzido! Clique em "Baixar PDF" para salvar.`, { duration: 6000 });
    } catch (err: any) {
      console.error("PDF pipeline error:", err);
      toast.error(err.message || "Erro ao processar o PDF.");
      setProcessingStep("");
    }
    setExtracting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const copyResult = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const tgtName = LANGUAGES.find(l => l.id === targetLang)?.name || targetLang;
    const srcName = LANGUAGES.find(l => l.id === sourceLang)?.name || sourceLang;

    // Title
    doc.setFontSize(14);
    doc.text(`Tradução: ${srcName} → ${tgtName}`, 14, 20);

    // Content
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(translatedText, 180);
    let y = 32;
    const pageH = doc.internal.pageSize.getHeight() - 20;

    for (const line of lines) {
      if (y > pageH) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 6;
    }

    const baseName = pdfName ? pdfName.replace(/\.pdf$/i, "") : "traducao";
    doc.save(`${baseName}_traduzido.pdf`);
    toast.success("PDF traduzido baixado!");
  };

  const srcLangObj = LANGUAGES.find(l => l.id === sourceLang)!;
  const tgtLangObj = LANGUAGES.find(l => l.id === targetLang)!;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-7 w-7 text-primary" />
            Tradução de Textos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Traduza textos ou PDFs entre os idiomas do sistema • Funciona online e offline</p>
          {isOffline ? (
            <Badge variant="outline" className="gap-1 mt-1 border-destructive/40 text-destructive">
              <WifiOff className="h-3 w-3" /> Modo Local (Dicionário)
            </Badge>
          ) : translationMethod && (
            <Badge variant="outline" className="gap-1 mt-1 border-primary/40 text-primary">
              <Languages className="h-3 w-3" /> Traduzido via {translationMethod}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={newTranslation}>
            <Plus className="h-4 w-4" /> Nova Tradução
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={clearAll}>
            <Trash2 className="h-4 w-4" /> Limpar Dados
          </Button>
        </div>
      </div>

      {/* Language selector bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex-1 min-w-[160px]">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex items-center gap-2">{l.flag} {l.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={swapLangs} className="shrink-0 h-10 w-10 rounded-full hover:bg-primary/10">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </Button>
            <div className="flex-1 min-w-[160px]">
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      <span className="flex items-center gap-2">{l.flag} {l.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing banner */}
      {(extracting || processingStep) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Processando em segundo plano</p>
              <p className="text-xs text-muted-foreground">{processingStep}</p>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Input / Output panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b">
            <Badge variant="secondary" className="gap-1">{srcLangObj.flag} {srcLangObj.name}</Badge>
            <div className="flex-1" />
            <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} className="hidden" />
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileRef.current?.click()} disabled={extracting}>
              {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {extracting ? "Processando..." : "Upload PDF"}
            </Button>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col">
            {pdfName && (
              <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
                <FileText className="h-3.5 w-3.5" /> {pdfName}
              </div>
            )}
            <Textarea
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Digite o texto aqui ou envie um PDF..."
              className="flex-1 min-h-[250px] resize-none border-0 focus-visible:ring-0 p-0"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-[10px] text-muted-foreground">{sourceText.length} caracteres</span>
              <Button onClick={handleTranslate} disabled={loading || extracting || !sourceText.trim()} className="gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                {loading ? "Traduzindo..." : "Traduzir"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 p-3 border-b">
            <Badge variant="secondary" className="gap-1">{tgtLangObj.flag} {tgtLangObj.name}</Badge>
            <div className="flex-1" />
            {translatedText && (
              <>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={copyResult}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={downloadAsPDF}>
                  <Download className="h-3.5 w-3.5" /> Baixar PDF
                </Button>
              </>
            )}
          </div>
          <CardContent className="p-3 flex-1">
            {(loading || extracting) ? (
              <div className="flex items-center gap-3 text-muted-foreground h-full justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="animate-pulse">{extracting ? processingStep || "Processando..." : "Traduzindo texto..."}</span>
              </div>
            ) : translatedText ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{translatedText}</div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                A tradução aparecerá aqui
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
