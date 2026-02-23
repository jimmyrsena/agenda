import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Save, Cloud, CloudOff, Loader2,
  Undo2, Redo2, FileText, ChevronDown, Sparkles, Printer, Trash2, Download,
  History, FileDown, BookOpen, FileUp, X
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Note, NoteTag, EnemArea, ENEM_AREAS, Flashcard } from "@/types/study";
import { format } from "date-fns";
import { WordRibbon } from "@/components/caderno/WordRibbon";
import { HorizontalRuler, VerticalRuler, DEFAULT_MARGINS, type RulerMargins } from "@/components/caderno/WordRulers";
import { getPaperDimensions, CM_TO_PX, PAPER_SIZES } from "@/components/caderno/paperSizes";
import { NoteCommandPalette } from "@/components/caderno/NoteCommandPalette";

import { NoteDocSettings, DOC_THEMES } from "@/components/caderno/NoteDocSettings";
import { NoteZenMode } from "@/components/caderno/NoteZenMode";
import { FindReplacePanel } from "@/components/caderno/FindReplacePanel";
import { DocumentComments, type DocComment } from "@/components/caderno/DocumentComments";
import { DocumentHeaderFooter } from "@/components/caderno/DocumentHeader";
import { WordStats } from "@/components/caderno/WordStats";
import { NavigationPane } from "@/components/caderno/NavigationPane";
import { PageSetupDialog } from "@/components/caderno/PageSetupDialog";
import { EquationDialog } from "@/components/caderno/EquationDialog";
import { ShapesTextBoxDialog } from "@/components/caderno/ShapesTextBoxDialog";
import { VersionHistory, type VersionSnapshot } from "@/components/caderno/VersionHistory";
import { PDFExportDialog } from "@/components/caderno/PDFExportDialog";

import { ABNTFormatter } from "@/components/caderno/ABNTFormatter";

import { SpeechToText } from "@/components/caderno/SpeechToText";

import { ReadAloud } from "@/components/caderno/ReadAloud";
import { TranslatePanel } from "@/components/caderno/TranslatePanel";
import { AccessibilityChecker } from "@/components/caderno/AccessibilityChecker";

import { DocumentCompare } from "@/components/caderno/DocumentCompare";
import { useScreenCapture } from "@/components/caderno/ScreenCapture";
import { SaveAsDialog } from "@/components/caderno/SaveAsDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TipTapEditor, { type TipTapEditorHandle } from "@/components/caderno/TipTapEditor";
import { DrawingCanvas } from "@/components/caderno/DrawingCanvas";
import { TableOverlayHandles } from "@/components/caderno/TableOverlayHandles";

export default function CadernoPage() {
  // Data
  const [notes, setNotes] = useLocalStorage<Note[]>('study-notes', []);
  const [deletedNotes, setDeletedNotes] = useLocalStorage<(Note & { deletedAt: string })[]>('deleted-notes', []);
  const [noteTags, setNoteTags] = useLocalStorage<NoteTag[]>('note-tags', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);

  // Current document
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', content: '', area: 'linguagens' as EnemArea, tags: [] as string[], favorite: false, folder: '', icon: '📝', coverColor: '' });
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // UI
  const [docTheme, setDocTheme] = useState('default');
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  
  const [zenMode, setZenMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [cloudSync, setCloudSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showNavPane, setShowNavPane] = useState(false);
  const [rulerMargins, setRulerMargins] = useState<RulerMargins>(DEFAULT_MARGINS);
  const [topMarginCm, setTopMarginCm] = useState(2.5);
  const [bottomMarginCm, setBottomMarginCm] = useState(2);

  // New feature states
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useLocalStorage<DocComment[]>('doc-comments', []);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showWordStats, setShowWordStats] = useState(false);
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [paperSize, setPaperSize] = useState('a4');
  const [watermark, setWatermark] = useState('');
  const [pageColor, setPageColor] = useState('');
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [columns, setColumns] = useState(1);
  const [showEquation, setShowEquation] = useState(false);
  const [showShapes, setShowShapes] = useState(false);
  const [showTextBox, setShowTextBox] = useState(false);

  // ===== NEW: 8 Improvements =====
  const [versions, setVersions] = useLocalStorage<VersionSnapshot[]>('doc-versions', []);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPDFExport, setShowPDFExport] = useState(false);
  
  const [showABNT, setShowABNT] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // ===== NEW: Additional features =====
  const [showReadAloud, setShowReadAloud] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  
  const [showCompare, setShowCompare] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(false);
  const [trackChanges, setTrackChanges] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [drawingActive, setDrawingActive] = useState(false);
  const [drawTool, setDrawTool] = useState('');
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(2);
  const [drawClearSignal, setDrawClearSignal] = useState(0);
  const [hyphenation, setHyphenation] = useState(false);
  const [paragraphIndentLeft, setParagraphIndentLeft] = useState(0);
  const [paragraphIndentRight, setParagraphIndentRight] = useState(0);
  const [spacingBefore, setSpacingBefore] = useState(0);
  const [spacingAfter, setSpacingAfter] = useState(8);
  const [pageBorder, setPageBorder] = useState('');
  const [formatBrushActive, setFormatBrushActive] = useState(false);
  const [formatBrushMarks, setFormatBrushMarks] = useState<any>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(true);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const editorRef = useRef<TipTapEditorHandle>(null);
  // autoSaveRef removido — salvamento apenas manual
  const fileHandleRef = useRef<any>(null); // File System Access API handle for current file
  const theme = DOC_THEMES.find(t => t.id === docTheme) || DOC_THEMES[0];
  const documentAreaRef = useRef<HTMLDivElement>(null);
  const paperContentRef = useRef<HTMLDivElement>(null);

  // ==================== DERIVED ====================
  const wordCount = useMemo(() => {
    const text = draft.content.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(Boolean).length;
  }, [draft.content]);
  const charCount = useMemo(() => draft.content.replace(/<[^>]*>/g, '').length, [draft.content]);
  const [measuredPageCount, setMeasuredPageCount] = useState(1);
  const pageCount = measuredPageCount;
  const readingTime = useMemo(() => Math.max(1, Math.ceil(wordCount / 200)), [wordCount]);

  const paperDims = useMemo(() => getPaperDimensions(paperSize, orientation), [paperSize, orientation]);
  const paperWidthPx = paperDims.widthPx;
  const paperHeightPx = paperDims.heightPx;
  const pageContentHeightPx = paperHeightPx - (topMarginCm + bottomMarginCm) * CM_TO_PX;

  // Measure actual content height to compute real page count
  useEffect(() => {
    const el = paperContentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const totalH = el.scrollHeight;
      setMeasuredPageCount(Math.max(1, Math.ceil(totalH / paperHeightPx)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [paperHeightPx]);

  const currentNote = useMemo(() => {
    if (!currentNoteId) return { id: 'draft', title: draft.title, content: draft.content, area: draft.area, createdAt: '', updatedAt: '', tags: draft.tags, favorite: draft.favorite, folder: draft.folder } as Note;
    return notes.find(n => n.id === currentNoteId) || null;
  }, [currentNoteId, draft, notes]);

  // Get TipTap editor instance
  const tiptapEditor = editorRef.current?.getEditor() || null;


  // Screen capture
  const { captureScreen } = useScreenCapture((src) => {
    tiptapEditor?.commands.setResizableImage({ src, width: 500 });
    setHasChanges(true);
  });


  // Translate insert handler
  const handleTranslateInsert = useCallback((text: string) => {
    tiptapEditor?.chain().focus().insertContent(text).run();
    setHasChanges(true);
  }, [tiptapEditor]);

  // Track selection for rewrite
  useEffect(() => {
    if (!tiptapEditor) return;
    const updateSelection = () => {
      const { from, to } = tiptapEditor.state.selection;
      if (from !== to) {
        setSelectedText(tiptapEditor.state.doc.textBetween(from, to));
      } else {
        setSelectedText('');
      }
    };
    tiptapEditor.on('selectionUpdate', updateSelection);
    return () => { tiptapEditor.off('selectionUpdate', updateSelection); };
  }, [tiptapEditor]);

  // ==================== CLOUD SYNC ====================
  const syncToCloud = useCallback(async (notesToSync: Note[]) => {
    setSyncing(true);
    try {
      for (const note of notesToSync) {
        const wc = note.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
        await supabase.from('notes').upsert({
          id: note.id, title: note.title, content: note.content, area: note.area,
          tags: note.tags || [], favorite: note.favorite || false, folder: note.folder || '',
          icon: (note as any).icon || '📝', cover_color: (note as any).coverColor || null, word_count: wc,
        }, { onConflict: 'id' });
      }
      setCloudSync(true);
    } catch (e) { console.error('Cloud sync failed:', e); }
    setSyncing(false);
  }, []);

  const loadFromCloud = useCallback(async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.from('notes').select('*').is('deleted_at', null).order('updated_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const cloudNotes: Note[] = data.map((n: any) => ({
          id: n.id, title: n.title, content: n.content, area: n.area as EnemArea,
          tags: n.tags || [], favorite: n.favorite || false, folder: n.folder || '',
          icon: n.icon || '📝', coverColor: n.cover_color || '',
          createdAt: n.created_at, updatedAt: n.updated_at,
        }));
        const cloudIds = new Set(cloudNotes.map(n => n.id));
        const localOnly = notes.filter(n => !cloudIds.has(n.id));
        setNotes([...cloudNotes, ...localOnly]);
        setCloudSync(true);
        toast.success(`${data.length} nota(s) carregadas da nuvem`);
      }
    } catch (e) { console.error('Load from cloud failed:', e); }
    setSyncing(false);
  }, [notes, setNotes]);

  // ==================== PRINT ====================
  const handlePrint = useCallback(() => {
    const content = draft.content;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Pop-up bloqueado. Permita pop-ups para imprimir.'); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${draft.title || 'Documento'}</title>
      <style>@page{size:A4;margin:2.5cm 2cm 2cm 3cm}body{font-family:serif;font-size:12pt;line-height:1.5;color:#000}
      h1,h2,h3{margin-top:1em}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px}
      img{max-width:100%}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, [draft.content, draft.title]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') { e.preventDefault(); saveToLocalFile(true); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveToLocalFile(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); newDocument(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); setShowFindReplace(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') { e.preventDefault(); setShowFindReplace(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') { e.preventDefault(); setShowNavPane(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') { e.preventDefault(); setShowPDFExport(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); handlePrint(); }
      if (e.key === 'Escape' && focusMode) setFocusMode(false);
      if (e.key === 'F1') { e.preventDefault(); setShowShortcuts(true); }
      if (e.key === 'F11') { e.preventDefault(); setFocusMode(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusMode]);

  // ==================== Ctrl+Scroll Zoom ====================
  useEffect(() => {
    const el = documentAreaRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.max(50, Math.min(200, z + (e.deltaY > 0 ? -10 : 10))));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Auto-save removido — o usuário salva manualmente via Ctrl+S ou botão Salvar.

  // ==================== BEFOREUNLOAD PROTECTION ====================
  useEffect(() => {
    const hasContent = draft.content.replace(/<[^>]*>/g, '').trim().length > 0;
    if (!hasChanges || !hasContent) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges, draft.content]);

  // ==================== HELPERS ====================
  const draftToNote = useCallback(() => ({
    title: draft.title, content: draft.content, area: draft.area,
    tags: draft.tags, favorite: draft.favorite, folder: draft.folder,
    icon: draft.icon, coverColor: draft.coverColor, updatedAt: new Date().toISOString(),
  }), [draft]);

  const handleContentChange = useCallback((html: string) => {
    setDraft(p => ({ ...p, content: html }));
    setHasChanges(true);
  }, []);

  const saveNote = useCallback(() => {
    if (!draft.title.trim()) {
      // Show unsaved dialog with title input instead of just a toast
      setUnsavedNeedsTitle(true);
      setPendingCloseAction(null);
      setShowUnsavedDialog(true);
      return;
    }
    const now = new Date().toISOString();

    // Save version snapshot
    const wc = draft.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    setVersions(prev => [{
      id: crypto.randomUUID(),
      timestamp: now,
      title: draft.title,
      content: draft.content,
      wordCount: wc,
    }, ...prev].slice(0, 30));

    if (currentNoteId) {
      setNotes(prev => prev.map(n => n.id === currentNoteId ? { ...n, ...draftToNote() } : n));
      if (cloudSync) {
        const existing = notes.find(n => n.id === currentNoteId);
        syncToCloud([{ ...draftToNote(), id: currentNoteId, createdAt: existing?.createdAt || now } as Note]);
      }
    } else {
      const newNote = { ...draftToNote(), id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      setNotes(prev => [...prev, newNote as Note]);
      setCurrentNoteId(newNote.id);
      if (cloudSync) syncToCloud([newNote as Note]);
    }
    setLastSaved(now);
    setHasChanges(false);
    toast.success('Documento salvo!');
  }, [draft, currentNoteId, notes, setNotes, cloudSync, syncToCloud, draftToNote, setVersions]);

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [unsavedNeedsTitle, setUnsavedNeedsTitle] = useState(false);
  const [unsavedTitleInput, setUnsavedTitleInput] = useState('');

  const doNewDocument = useCallback(() => {
    setCurrentNoteId(null);
    setDraft({ title: '', content: '', area: 'linguagens', tags: [], favorite: false, folder: '', icon: '📝', coverColor: '' });
    setLastSaved(null); setHasChanges(false);
    editorRef.current?.setContent('');
    fileHandleRef.current = null;
    setCurrentFileName(null);
    setShowWelcomeDialog(false);
  }, []);

  const newDocument = useCallback(() => {
    if (hasChanges && (draft.title.trim() || draft.content.replace(/<[^>]*>/g, '').trim())) {
      setPendingCloseAction(() => doNewDocument);
      setShowUnsavedDialog(true);
    } else {
      doNewDocument();
    }
  }, [hasChanges, draft.title, draft.content, doNewDocument]);

  // Close document → return to welcome
  const closeDocument = useCallback(() => {
    const hasContent = draft.content.replace(/<[^>]*>/g, '').trim().length > 0;
    if (hasChanges && (draft.title.trim() || hasContent)) {
      setPendingCloseAction(() => () => {
        doNewDocument();
        setShowWelcomeDialog(true);
      });
      setShowUnsavedDialog(true);
    } else {
      doNewDocument();
      setShowWelcomeDialog(true);
    }
  }, [hasChanges, draft.title, draft.content, doNewDocument]);

  const navigate = useNavigate();

  // Exit caderno → go to dashboard
  const exitCaderno = useCallback(() => {
    const hasContent = draft.content.replace(/<[^>]*>/g, '').trim().length > 0;
    if (hasChanges && (draft.title.trim() || hasContent)) {
      setPendingCloseAction(() => () => navigate('/'));
      setShowUnsavedDialog(true);
    } else {
      navigate('/');
    }
  }, [hasChanges, draft.title, draft.content, navigate]);

  const openNote = useCallback((note: Note) => {
    if (hasChanges && draft.title.trim()) saveNote();
    setDraft({
      title: note.title, content: note.content, area: note.area,
      tags: note.tags || [], favorite: note.favorite || false, folder: note.folder || '',
      icon: (note as any).icon || '📝', coverColor: (note as any).coverColor || '',
    });
    setCurrentNoteId(note.id);
    setLastSaved(note.updatedAt); setHasChanges(false);
    setShowWelcomeDialog(false);
  }, [hasChanges, draft.title, saveNote]);

  // Open file from local computer
  const openLocalFile = useCallback(async () => {
    const BINARY_EXTS = ['docx', 'doc', 'dotx', 'pdf', 'odt'];
    const TEXT_EXTS = ['txt', 'htm', 'html', 'rtf'];

    const getExt = (name: string) => (name.split('.').pop() || '').toLowerCase();

    const processTextFile = (file: File, handle?: any) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const fileName = file.name.replace(/\.[^.]+$/, '');
        const ext = getExt(file.name);
        let content: string;
        if (ext === 'rtf') {
          // Strip RTF control words for basic display
          const stripped = text.replace(/\{\\[^{}]*\}/g, '').replace(/\\[a-z]+\d*\s?/gi, '').replace(/[{}]/g, '');
          content = `<p>${stripped.replace(/\n/g, '</p><p>')}</p>`;
        } else {
          const isHTML = text.trim().startsWith('<');
          content = isHTML ? text : `<p>${text.replace(/\n/g, '</p><p>')}</p>`;
        }
        setDraft(p => ({ ...p, title: fileName, content }));
        setCurrentNoteId(null);
        editorRef.current?.setContent(content);
        if (handle) {
          fileHandleRef.current = handle;
          setCurrentFileName(handle.name);
        } else {
          fileHandleRef.current = null;
          setCurrentFileName(file.name);
        }
        setHasChanges(false);
        setShowWelcomeDialog(false);
        toast.success(`Arquivo "${file.name}" aberto!`);
      };
      reader.readAsText(file);
    };

    const processBinaryFile = async (file: File, handle?: any) => {
      const ext = getExt(file.name);
      const fileName = file.name.replace(/\.[^.]+$/, '');

      try {
        if (ext === 'docx' || ext === 'doc' || ext === 'dotx') {
          // Use mammoth-like approach: read as ArrayBuffer and extract text
          const buffer = await file.arrayBuffer();
          // Try to extract text from DOCX (ZIP containing XML)
          try {
            const { default: JSZip } = await import('jszip') as any;
            const zip = await JSZip.loadAsync(buffer);
            const docXml = await zip.file('word/document.xml')?.async('string');
            if (docXml) {
              // Extract text from XML
              const textContent = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              const content = `<p>${textContent.replace(/\. /g, '.</p><p>')}</p>`;
              setDraft(p => ({ ...p, title: fileName, content }));
              setCurrentNoteId(null);
              editorRef.current?.setContent(content);
              fileHandleRef.current = handle || null;
              setCurrentFileName(file.name);
              setHasChanges(false);
              setShowWelcomeDialog(false);
              toast.success(`Arquivo "${file.name}" aberto!`);
              return;
            }
          } catch {
            // JSZip not available, fall through
          }
          toast.error('Para abrir arquivos .docx, use o "Salvar Como" do Word para exportar como .html primeiro.');
          return;
        }
        if (ext === 'pdf') {
          toast.info('Arquivos PDF são somente leitura. Use "Abrir" no PDF e copie o conteúdo, ou salve como .txt/.html.');
          return;
        }
        if (ext === 'odt') {
          // ODT is also a ZIP with XML
          const buffer = await file.arrayBuffer();
          try {
            const { default: JSZip } = await import('jszip') as any;
            const zip = await JSZip.loadAsync(buffer);
            const contentXml = await zip.file('content.xml')?.async('string');
            if (contentXml) {
              const textContent = contentXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              const content = `<p>${textContent.replace(/\. /g, '.</p><p>')}</p>`;
              setDraft(p => ({ ...p, title: fileName, content }));
              setCurrentNoteId(null);
              editorRef.current?.setContent(content);
              fileHandleRef.current = handle || null;
              setCurrentFileName(file.name);
              setHasChanges(false);
              setShowWelcomeDialog(false);
              toast.success(`Arquivo "${file.name}" aberto!`);
              return;
            }
          } catch {
            // fall through
          }
          toast.error('Não foi possível abrir o arquivo .odt. Tente salvar como .html no LibreOffice.');
          return;
        }
      } catch (err) {
        toast.error(`Erro ao processar "${file.name}"`);
      }
    };

    const processFile = (file: File, handle?: any) => {
      const ext = getExt(file.name);
      if (BINARY_EXTS.includes(ext)) {
        processBinaryFile(file, handle);
      } else {
        processTextFile(file, handle);
      }
    };

    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.docx,.doc,.dotx,.pdf,.odt,.rtf,.txt,.htm,.html';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) processFile(file);
        document.body.removeChild(input);
      };
      input.click();
    } catch (err: any) {
      if (err.name !== 'AbortError') toast.error('Erro ao abrir arquivo');
    }
  }, []);

  // Save to local file — always opens SaveAs dialog
  const saveToLocalFile = useCallback(async (saveAsMode = false) => {
    setShowSaveAs(true);
  }, []);

  const deleteNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) setDeletedNotes(prev => [...prev, { ...note, deletedAt: new Date().toISOString() }].slice(-50));
    setNotes(prev => prev.filter(n => n.id !== id));
    if (cloudSync) supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (currentNoteId === id) newDocument();
    toast.success('Nota excluída');
  }, [notes, currentNoteId, cloudSync, setNotes, setDeletedNotes, newDocument]);

  // Restore deleted note
  const restoreNote = useCallback((id: string) => {
    const note = deletedNotes.find(n => n.id === id);
    if (!note) return;
    const { deletedAt, ...restored } = note;
    setNotes(prev => [...prev, restored as Note]);
    setDeletedNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Documento restaurado!');
  }, [deletedNotes, setNotes, setDeletedNotes]);

  const permanentDelete = useCallback((id: string) => {
    setDeletedNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Documento excluído permanentemente');
  }, [setDeletedNotes]);

  const emptyTrash = useCallback(() => {
    setDeletedNotes([]);
    toast.success('Lixeira esvaziada');
  }, [setDeletedNotes]);

  // Insert Table of Contents
  const insertTOC = useCallback(() => {
    if (!tiptapEditor) return;
    const headings = draft.content.match(/<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi) || [];
    if (headings.length === 0) {
      toast.error('Nenhum título (H1, H2, H3) encontrado no documento');
      return;
    }
    let tocHtml = '<div style="border:1px solid #ddd;padding:16px;margin-bottom:16px;border-radius:4px;"><p><strong>SUMÁRIO</strong></p>';
    headings.forEach(h => {
      const level = parseInt(h.charAt(2));
      const text = h.replace(/<[^>]*>/g, '');
      const indent = (level - 1) * 20;
      tocHtml += `<p style="margin-left:${indent}px;margin-top:2px;margin-bottom:2px;">${text}</p>`;
    });
    tocHtml += '</div>';
    tiptapEditor.chain().focus().insertContentAt(0, tocHtml).run();
    setHasChanges(true);
    toast.success('Sumário inserido no início do documento');
  }, [tiptapEditor, draft.content]);

  const [showTrash, setShowTrash] = useState(false);

  const handleBulkFlashcards = useCallback((cards: { question: string; answer: string; area: string; subject: string }[]) => {
    const newCards: Flashcard[] = cards.map(c => ({
      id: crypto.randomUUID(), question: c.question, answer: c.answer,
      area: c.area as EnemArea, subject: c.subject, status: 'new' as const,
      createdAt: new Date().toISOString(), easeFactor: 2.5, interval: 0, reviewCount: 0, reviews: [],
    }));
    setFlashcards(prev => [...prev, ...newCards]);
  }, [setFlashcards]);

  // Comments handlers
  const addComment = useCallback((c: Omit<DocComment, 'id' | 'createdAt' | 'resolved' | 'replies'>) => {
    setComments(prev => [...prev, { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString(), resolved: false, replies: [] }]);
  }, [setComments]);

  const resolveComment = useCallback((id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c));
  }, [setComments]);

  const deleteComment = useCallback((id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  }, [setComments]);

  const replyComment = useCallback((id: string, text: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, replies: [...c.replies, { id: crypto.randomUUID(), text, author: 'Você', createdAt: new Date().toISOString() }] } : c));
  }, [setComments]);

  // ===== NEW: ABNT apply handler =====
  const applyABNT = useCallback((config: { margins: RulerMargins; topMargin: number; bottomMargin: number; lineSpacing: number; fontFamily: string; fontSize: string }) => {
    setRulerMargins(config.margins);
    setTopMarginCm(config.topMargin);
    setBottomMarginCm(config.bottomMargin);
    setLineSpacing(config.lineSpacing);
    // Apply font via editor
    if (tiptapEditor) {
      tiptapEditor.chain().focus().setFontFamily(config.fontFamily).run();
      tiptapEditor.view.dom.style.fontSize = `${config.fontSize}pt`;
      tiptapEditor.chain().focus().setTextAlign('justify').run();
    }
  }, [tiptapEditor]);

  // ===== NEW: Spell check replace =====
  const handleSpellReplace = useCallback((original: string, replacement: string) => {
    if (!tiptapEditor) return;
    const html = tiptapEditor.getHTML();
    const updated = html.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
    tiptapEditor.commands.setContent(updated);
    setHasChanges(true);
  }, [tiptapEditor]);

  // ===== NEW: Paragraph rewrite replace =====
  const handleRewriteReplace = useCallback((newText: string) => {
    if (!tiptapEditor) return;
    const { from, to } = tiptapEditor.state.selection;
    tiptapEditor.chain().focus().insertContentAt({ from, to }, newText).run();
    setHasChanges(true);
  }, [tiptapEditor]);

  // ===== NEW: Speech transcript handler =====
  const handleSpeechTranscript = useCallback((text: string) => {
    if (!tiptapEditor) return;
    tiptapEditor.chain().focus().insertContent(text).run();
    setHasChanges(true);
  }, [tiptapEditor]);

  // ===== NEW: Version restore =====
  const handleVersionRestore = useCallback((content: string) => {
    setDraft(p => ({ ...p, content }));
    editorRef.current?.setContent(content);
    setHasChanges(true);
  }, []);

  // Format brush handler
  const handleFormatBrush = useCallback(() => {
    if (!tiptapEditor) return;
    if (formatBrushActive) { setFormatBrushActive(false); setFormatBrushMarks(null); return; }
    const { from, to } = tiptapEditor.state.selection;
    if (from === to) { toast.info('Selecione o texto com a formatação desejada'); return; }
    const marks: any = {};
    if (tiptapEditor.isActive('bold')) marks.bold = true;
    if (tiptapEditor.isActive('italic')) marks.italic = true;
    if (tiptapEditor.isActive('underline')) marks.underline = true;
    if (tiptapEditor.isActive('strike')) marks.strike = true;
    const clr = tiptapEditor.getAttributes('textStyle').color;
    if (clr) marks.color = clr;
    const hl = tiptapEditor.getAttributes('highlight').color;
    if (hl) marks.highlight = hl;
    const ff = tiptapEditor.getAttributes('textStyle').fontFamily;
    if (ff) marks.fontFamily = ff;
    setFormatBrushMarks(marks);
    setFormatBrushActive(true);
    toast.info('Pincel ativado! Selecione o texto de destino.');
  }, [tiptapEditor, formatBrushActive]);

  // Apply format brush on next selection
  useEffect(() => {
    if (!tiptapEditor || !formatBrushActive || !formatBrushMarks) return;
    const handler = () => {
      const { from, to } = tiptapEditor.state.selection;
      if (from === to) return;
      let chain = tiptapEditor.chain().focus();
      if (formatBrushMarks.bold) chain = chain.setBold();
      if (formatBrushMarks.italic) chain = chain.setItalic();
      if (formatBrushMarks.underline) chain = chain.setUnderline();
      if (formatBrushMarks.strike) chain = chain.setStrike();
      if (formatBrushMarks.color) chain = chain.setColor(formatBrushMarks.color);
      if (formatBrushMarks.highlight) chain = chain.setHighlight({ color: formatBrushMarks.highlight });
      if (formatBrushMarks.fontFamily) chain = chain.setFontFamily(formatBrushMarks.fontFamily);
      chain.run();
      setFormatBrushActive(false);
      setFormatBrushMarks(null);
      toast.success('Formatação aplicada!');
    };
    tiptapEditor.on('selectionUpdate', handler);
    return () => { tiptapEditor.off('selectionUpdate', handler); };
  }, [tiptapEditor, formatBrushActive, formatBrushMarks]);

  // File attachment handler
  const handleFileAttach = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      tiptapEditor?.chain().focus().insertContent(
        `<p>📎 <a href="${base64}" download="${file.name}">${file.name}</a> (${(file.size / 1024).toFixed(1)} KB)</p>`
      ).run();
      setHasChanges(true);
      toast.success(`"${file.name}" anexado ao documento!`);
    };
    reader.readAsDataURL(file);
  }, [tiptapEditor]);

  // Header/footer removed per user request

  // ==================== ZEN MODE ====================
  if (zenMode) {
    return (
      <NoteZenMode
        content={draft.content}
        onChange={c => handleContentChange(c)}
        title={draft.title}
        wordCount={wordCount}
        onExit={() => setZenMode(false)}
      />
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="flex flex-col -m-3 sm:-m-5 md:-m-8" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Unsaved changes dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={(open) => { if (!open) { setShowUnsavedDialog(false); setPendingCloseAction(null); setUnsavedTitleInput(''); setUnsavedNeedsTitle(false); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Documento não salvo</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">Você tem alterações não salvas. Deseja salvar antes de continuar?</p>
          {unsavedNeedsTitle && (
            <div className="mt-2">
              <label className="text-xs font-medium text-foreground">Informe um título para salvar:</label>
              <input
                type="text"
                value={unsavedTitleInput}
                onChange={e => setUnsavedTitleInput(e.target.value)}
                autoFocus
                placeholder="Título do documento"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={e => {
                  if (e.key === 'Enter' && unsavedTitleInput.trim()) {
                    setDraft(p => ({ ...p, title: unsavedTitleInput.trim() }));
                    setTimeout(() => { saveNote(); setShowUnsavedDialog(false); setUnsavedNeedsTitle(false); setUnsavedTitleInput(''); if (pendingCloseAction) { pendingCloseAction(); setPendingCloseAction(null); } }, 50);
                  }
                }}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setShowUnsavedDialog(false); setUnsavedNeedsTitle(false); setUnsavedTitleInput(''); if (pendingCloseAction) { pendingCloseAction(); setPendingCloseAction(null); } }}>Não Salvar</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setShowUnsavedDialog(false); setPendingCloseAction(null); setUnsavedNeedsTitle(false); setUnsavedTitleInput(''); }}>Cancelar</Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => {
              if (!draft.title.trim() && !unsavedTitleInput.trim()) {
                setUnsavedNeedsTitle(true);
                return;
              }
              if (unsavedTitleInput.trim()) {
                setDraft(p => ({ ...p, title: unsavedTitleInput.trim() }));
                setTimeout(() => { saveNote(); setShowUnsavedDialog(false); setUnsavedNeedsTitle(false); setUnsavedTitleInput(''); if (pendingCloseAction) { pendingCloseAction(); setPendingCloseAction(null); } }, 50);
              } else {
                saveNote(); setShowUnsavedDialog(false); setUnsavedNeedsTitle(false); setUnsavedTitleInput(''); if (pendingCloseAction) { pendingCloseAction(); setPendingCloseAction(null); }
              }
            }}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome dialog - shown on page load */}
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Caderno
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">O que deseja fazer?</p>

          {/* Paper size & orientation selection */}
          <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Configuração do papel</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground mb-1 block">Tamanho do Papel</label>
                <select value={paperSize} onChange={e => setPaperSize(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring">
                  {PAPER_SIZES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Orientação</label>
                <div className="flex gap-1">
                  <button onClick={() => setOrientation('portrait')}
                    className={`h-8 px-2.5 text-[10px] rounded-md border transition-colors ${orientation === 'portrait' ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}>
                    Retrato
                  </button>
                  <button onClick={() => setOrientation('landscape')}
                    className={`h-8 px-2.5 text-[10px] rounded-md border transition-colors ${orientation === 'landscape' ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent'}`}>
                    Paisagem
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="h-16 justify-start gap-3 text-left" onClick={() => { setShowWelcomeDialog(false); doNewDocument(); }}>
              <Plus className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Novo Documento</p>
                <p className="text-[10px] text-muted-foreground font-normal">Começar um documento em branco</p>
              </div>
            </Button>
            <Button variant="outline" className="h-16 justify-start gap-3 text-left" onClick={openLocalFile}>
              <FileUp className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Abrir Arquivo Local</p>
                <p className="text-[10px] text-muted-foreground font-normal">Abrir um arquivo do seu computador (.docx, .doc, .pdf, .odt, .rtf, .txt, .html)</p>
              </div>
            </Button>
            {notes.length > 0 && (
              <>
                <div className="border-t pt-2 mt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Documentos salvos</p>
                    <Button size="sm" variant="ghost" className="h-5 text-[9px] text-destructive hover:text-destructive px-1.5"
                      onClick={() => { setNotes([]); toast.success('Documentos salvos removidos'); }}>
                      <Trash2 className="h-3 w-3 mr-1" /> Limpar
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {notes.slice(0, 10).map(note => (
                      <button key={note.id} onClick={() => openNote(note)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/60 transition-colors flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{note.title}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(note.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <NoteCommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} notes={notes} onEditNote={openNote} onNewNote={newDocument} />

      {/* Trash dialog */}
      <Dialog open={showTrash} onOpenChange={setShowTrash}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" /> Lixeira</DialogTitle>
          </DialogHeader>
          {deletedNotes.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">A lixeira está vazia</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">{deletedNotes.length} documento(s) na lixeira</p>
                <Button size="sm" variant="ghost" className="h-6 text-[9px] text-destructive hover:text-destructive" onClick={emptyTrash}>
                  Esvaziar Lixeira
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {deletedNotes.map(note => (
                  <div key={note.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent/50 group">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{note.title || 'Sem título'}</p>
                      <p className="text-[10px] text-muted-foreground">Excluído em {format(new Date(note.deletedAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 text-[9px] opacity-0 group-hover:opacity-100" onClick={() => restoreNote(note.id)}>
                      Restaurar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[9px] text-destructive opacity-0 group-hover:opacity-100" onClick={() => permanentDelete(note.id)}>
                      Excluir
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WordStats open={showWordStats} onClose={() => setShowWordStats(false)} content={draft.content} />
      {/* Keyboard shortcuts dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">⌨️ Atalhos de Teclado</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
            {[
              ['Ctrl+S', 'Salvar no disco'],
              ['Ctrl+N', 'Novo documento'],
              ['Ctrl+F', 'Buscar / Substituir'],
              ['Ctrl+P', 'Imprimir'],
              ['Ctrl+Z', 'Desfazer'],
              ['Ctrl+Y', 'Refazer'],
              ['Ctrl+B', 'Negrito'],
              ['Ctrl+I', 'Itálico'],
              ['Ctrl+U', 'Sublinhado'],
              ['Ctrl+K', 'Paleta de comandos'],
              ['Ctrl+G', 'Painel de navegação'],
              ['Ctrl+Shift+E', 'Exportar PDF'],
              ['F1', 'Atalhos de teclado'],
              ['F11', 'Modo foco'],
              ['Esc', 'Sair do modo foco'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between py-0.5 border-b border-border/30">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">{key}</kbd>
                <span className="text-muted-foreground text-right">{desc}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PageSetupDialog
        open={showPageSetup} onClose={() => setShowPageSetup(false)}
        margins={rulerMargins} topMargin={topMarginCm} bottomMargin={bottomMarginCm}
        onMarginsChange={setRulerMargins} onTopMarginChange={setTopMarginCm} onBottomMarginChange={setBottomMarginCm}
        orientation={orientation} onOrientationChange={setOrientation}
        paperSize={paperSize} onPaperSizeChange={setPaperSize}
        watermark={watermark} onWatermarkChange={v => setWatermark(v === 'none' ? '' : v)}
        pageColor={pageColor} onPageColorChange={setPageColor}
        lineSpacing={lineSpacing} onLineSpacingChange={setLineSpacing}
        columns={columns} onColumnsChange={setColumns}
      />
      <EquationDialog open={showEquation} onClose={() => setShowEquation(false)}
        onInsert={text => { tiptapEditor?.chain().focus().insertContent(text).run(); setHasChanges(true); }} />
      <ShapesTextBoxDialog open={showShapes} onClose={() => setShowShapes(false)} mode="shapes"
        onInsertShape={(src, width) => { tiptapEditor?.commands.setResizableImage({ src, width }); setHasChanges(true); }}
        onInsertTextBox={() => {}} />
      <ShapesTextBoxDialog open={showTextBox} onClose={() => setShowTextBox(false)} mode="textbox"
        onInsertShape={() => {}}
        onInsertTextBox={text => { tiptapEditor?.chain().focus().insertContent(`<blockquote><p>${text}</p></blockquote>`).run(); setHasChanges(true); }} />

      {/* NEW: Dialogs for 8 improvements */}
      <VersionHistory open={showVersionHistory} onClose={() => setShowVersionHistory(false)}
        versions={versions} currentContent={draft.content} onRestore={handleVersionRestore} />
      <PDFExportDialog open={showPDFExport} onClose={() => setShowPDFExport(false)}
        content={draft.content} title={draft.title} paperSize={paperSize} orientation={orientation}
        margins={rulerMargins} topMargin={topMarginCm} bottomMargin={bottomMarginCm}
        watermark={watermark} headerText={headerText} footerText={footerText} showPageNumbers={showPageNumbers} />
      <SaveAsDialog open={showSaveAs} onClose={() => setShowSaveAs(false)}
        content={draft.content} title={draft.title} paperSize={paperSize} orientation={orientation}
        margins={rulerMargins} topMargin={topMarginCm} bottomMargin={bottomMarginCm}
        watermark={watermark} headerText={headerText} footerText={footerText} showPageNumbers={showPageNumbers} />

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-lg">Sobre o Caderno</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-2xl">📝</p>
            <p className="text-sm font-semibold text-foreground">Caderno — Editor de Documentos</p>
            <p className="text-xs text-muted-foreground">Projeto desenvolvido por Jimmy Veiga — © 2025</p>
          </div>
        </DialogContent>
      </Dialog>
      <ABNTFormatter open={showABNT} onClose={() => setShowABNT(false)} onApply={applyABNT} />
      <DocumentCompare open={showCompare} onClose={() => setShowCompare(false)}
        currentContent={draft.content} currentTitle={draft.title}
        documents={notes.filter(n => n.id !== currentNoteId).map(n => ({ id: n.id, title: n.title, content: n.content }))} />

      {/* Top toolbar */}
      <div className="flex items-center px-2 py-1 bg-card border-b gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 px-2">
              <FileText className="h-3.5 w-3.5" /> Arquivo <ChevronDown className="h-2.5 w-2.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={newDocument} className="text-xs gap-2"><Plus className="h-3.5 w-3.5" /> Novo Documento</DropdownMenuItem>
            <DropdownMenuItem onClick={openLocalFile} className="text-xs gap-2"><FileUp className="h-3.5 w-3.5" /> Abrir Arquivo...</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => saveToLocalFile(false)} className="text-xs gap-2"><Save className="h-3.5 w-3.5" /> Salvar no Disco (Ctrl+S)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => saveToLocalFile(true)} className="text-xs gap-2"><Download className="h-3.5 w-3.5" /> Salvar Como...</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowPDFExport(true)} className="text-xs gap-2"><FileDown className="h-3.5 w-3.5" /> Exportar PDF (Ctrl+Shift+E)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowVersionHistory(true)} className="text-xs gap-2"><History className="h-3.5 w-3.5" /> Histórico de Versões</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowPageSetup(true)} className="text-xs gap-2"><Printer className="h-3.5 w-3.5" /> Configurar Página...</DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint} className="text-xs gap-2">🖨️ Imprimir (Ctrl+P)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowABNT(true)} className="text-xs gap-2">📋 Formatação ABNT</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={insertTOC} className="text-xs gap-2">📑 Inserir Sumário (TOC)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowTrash(true)} className="text-xs gap-2"><Trash2 className="h-3.5 w-3.5" /> Lixeira ({deletedNotes.length})</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={closeDocument} className="text-xs gap-2"><X className="h-3.5 w-3.5" /> Fechar Documento</DropdownMenuItem>
            <DropdownMenuItem onClick={exitCaderno} className="text-xs gap-2 text-destructive focus:text-destructive">🚪 Sair do Caderno</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowAbout(true)} className="text-xs gap-2">ℹ️ Sobre</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveToLocalFile(false)} title="Salvar no Disco (Ctrl+S)"><Save className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => tiptapEditor?.chain().focus().undo().run()} disabled={!tiptapEditor?.can().undo()} title="Desfazer"><Undo2 className="h-3.5 w-3.5" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => tiptapEditor?.chain().focus().redo().run()} disabled={!tiptapEditor?.can().redo()} title="Refazer"><Redo2 className="h-3.5 w-3.5" /></Button>

        {/* Speech to Text */}
        <SpeechToText onTranscript={handleSpeechTranscript} />

        <div className="flex-1 text-center">
          <input value={draft.title} onChange={e => { setDraft(p => ({ ...p, title: e.target.value })); setHasChanges(true); }}
            placeholder="Documento sem título"
            className="text-xs text-center bg-transparent border-0 outline-none text-muted-foreground w-full max-w-[300px] mx-auto placeholder:text-muted-foreground/50" />
          {hasChanges && <span className="text-[9px] text-muted-foreground/60 ml-1">•</span>}
        </div>

        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={closeDocument} title="Fechar Documento">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ===== RIBBON ===== */}
      <div className="shrink-0">
        <WordRibbon
          editor={tiptapEditor}
          onFocusMode={() => setFocusMode(p => !p)}
          wordCount={wordCount} charCount={charCount}
          noteTags={noteTags} selectedTags={draft.tags}
          onToggleTag={id => setDraft(p => ({ ...p, tags: p.tags.includes(id) ? p.tags.filter(t => t !== id) : [...p.tags, id] }))}
          onAddTag={tag => setNoteTags(prev => [...prev, tag])}
          onDeleteTag={id => { setNoteTags(prev => prev.filter(t => t.id !== id)); setDraft(p => ({ ...p, tags: p.tags.filter(t => t !== id) })); }}
          showRuler={showRuler} onToggleRuler={() => setShowRuler(p => !p)}
          onFindReplace={() => setShowFindReplace(true)}
          onShowComments={() => setShowComments(p => !p)}
          onShowNavPane={() => setShowNavPane(p => !p)}
          onShowWordStats={() => setShowWordStats(true)}
          onShowPageSetup={() => setShowPageSetup(true)}
          onShowEquation={() => setShowEquation(true)}
          onShowShapes={() => setShowShapes(true)}
          onShowTextBox={() => setShowTextBox(true)}
          onInsertResizableImage={(src: string) => {
            tiptapEditor?.commands.setResizableImage({ src, width: 400 });
            setHasChanges(true);
          }}
          showNavPane={showNavPane}
          showComments={showComments}
          lineSpacing={lineSpacing}
          onLineSpacingChange={setLineSpacing}
          columns={columns}
          onColumnsChange={setColumns}
          watermark={watermark}
          onWatermarkChange={v => setWatermark(v === 'none' ? '' : v)}
          orientation={orientation}
          onOrientationChange={setOrientation}
          paperSize={paperSize}
          onPaperSizeChange={setPaperSize}
          commentCount={comments.filter(c => !c.resolved).length}
          zoom={zoom}
          onZoomChange={setZoom}
          pageColor={pageColor}
          onPageColorChange={setPageColor}
          // NEW props
          onShowABNT={() => setShowABNT(true)}
          onShowPDFExport={() => setShowPDFExport(true)}
          onShowVersionHistory={() => setShowVersionHistory(true)}
          // Additional features
          onShowReadAloud={() => setShowReadAloud(p => !p)}
          onShowTranslate={() => setShowTranslate(p => !p)}
          onShowAccessibility={() => setShowAccessibility(p => !p)}
          onShowCompare={() => setShowCompare(true)}
          onScreenCapture={captureScreen}
          lineNumbers={lineNumbers}
          onToggleLineNumbers={() => setLineNumbers(p => !p)}
          trackChanges={trackChanges}
          onToggleTrackChanges={() => { setTrackChanges(p => !p); toast.info(trackChanges ? 'Controle de alterações desativado' : 'Controle de alterações ativado'); }}
          formatBrushActive={formatBrushActive}
          onFormatBrush={handleFormatBrush}
          drawingActive={drawingActive}
          onToggleDrawing={() => setDrawingActive(p => !p)}
          onClearDrawing={() => setDrawClearSignal(s => s + 1)}
          drawTool={drawTool}
          onDrawToolChange={setDrawTool}
          drawColor={drawColor}
          onDrawColorChange={setDrawColor}
          drawWidth={drawWidth}
          onDrawWidthChange={setDrawWidth}
          hyphenation={hyphenation}
          onHyphenationChange={setHyphenation}
          paragraphIndentLeft={paragraphIndentLeft}
          onParagraphIndentLeftChange={setParagraphIndentLeft}
          paragraphIndentRight={paragraphIndentRight}
          onParagraphIndentRightChange={setParagraphIndentRight}
          spacingBefore={spacingBefore}
          onSpacingBeforeChange={setSpacingBefore}
          spacingAfter={spacingAfter}
          onSpacingAfterChange={setSpacingAfter}
          pageBorder={pageBorder}
          onPageBorderChange={setPageBorder}
          onFileAttach={handleFileAttach}
          onShowAbout={() => setShowAbout(true)}
        />
      </div>

      {/* ===== FIND & REPLACE ===== */}
      {showFindReplace && <FindReplacePanel editor={tiptapEditor} onClose={() => setShowFindReplace(false)} />}


      {/* ===== READ ALOUD / TRANSLATE / ACCESSIBILITY / PLAGIARISM PANELS ===== */}
      {(showReadAloud || showTranslate || showAccessibility) && (
        <div className="px-4 py-1.5 bg-card border-b shrink-0 flex gap-2 flex-wrap">
          {showReadAloud && <div className="flex-1 min-w-[250px]"><ReadAloud content={draft.content} onClose={() => setShowReadAloud(false)} /></div>}
          {showTranslate && <div className="flex-1 min-w-[250px]"><TranslatePanel selectedText={selectedText} onInsert={handleTranslateInsert} onClose={() => setShowTranslate(false)} /></div>}
          {showAccessibility && <div className="flex-1 min-w-[250px]"><AccessibilityChecker content={draft.content} title={draft.title} onClose={() => setShowAccessibility(false)} /></div>}
        </div>
      )}


      {/* ===== DOCUMENT AREA ===== */}
      <div className="flex-1 flex overflow-hidden" ref={documentAreaRef}>
        {/* Navigation pane */}
        {showNavPane && (
          <NavigationPane
            content={draft.content}
            onClose={() => setShowNavPane(false)}
            pageCount={pageCount}
          />
        )}

        {/* White paper on gray canvas — each page has its own rulers */}
        <div className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/20">
          <div className="py-6 px-4 sm:px-8">
            <div className="flex flex-col items-center gap-8" style={zoom !== 100 ? { transform: `scale(${zoom / 100})`, transformOrigin: 'top center' } : undefined}>
              {Array.from({ length: pageCount }, (_, pageIdx) => (
                <div key={pageIdx}>
                  {/* Horizontal ruler for this page */}
                  {showRuler && (
                    <div className="flex">
                      <div className="w-5 h-6 bg-card border-r border-b border-border/50 shrink-0" />
                      <HorizontalRuler margins={rulerMargins} onMarginsChange={setRulerMargins} paperWidthPx={paperWidthPx} totalCm={paperDims.widthCm} />
                    </div>
                  )}
                  <div className="flex">
                    {/* Vertical ruler for this page */}
                    {showRuler && (
                      <VerticalRuler
                        heightPx={paperHeightPx}
                        topMarginCm={topMarginCm}
                        bottomMarginCm={bottomMarginCm}
                        onTopMarginChange={setTopMarginCm}
                        onBottomMarginChange={setBottomMarginCm}
                        totalCm={paperDims.heightCm}
                      />
                    )}

                    {/* Page content area */}
                    {pageIdx === 0 ? (
                      <div>
                        {draft.coverColor && (
                          <div className={`h-28 rounded-t-lg bg-gradient-to-r ${draft.coverColor} flex items-end p-4`} style={{ width: paperWidthPx }}>
                            <span className="text-3xl">{draft.icon}</span>
                          </div>
                        )}
                        <div
                          ref={paperContentRef}
                          className={`caderno-paginated-paper relative ${draft.coverColor ? 'rounded-t-none' : ''} ${trackChanges ? 'track-changes-active' : ''}`}
                          style={{
                            width: paperWidthPx,
                            maxWidth: paperWidthPx,
                            minHeight: paperHeightPx,
                            paddingLeft: `${rulerMargins.leftMarginCm * CM_TO_PX}px`,
                            paddingRight: `${rulerMargins.rightMarginCm * CM_TO_PX}px`,
                            paddingTop: `${topMarginCm * CM_TO_PX}px`,
                            paddingBottom: `${bottomMarginCm * CM_TO_PX}px`,
                            ['--page-height' as string]: `${paperHeightPx}px`,
                            ['--first-line-indent' as string]: `${rulerMargins.firstLineIndentCm * CM_TO_PX}px`,
                            ['--hanging-indent' as string]: `${rulerMargins.hangingIndentCm * CM_TO_PX}px`,
                            backgroundColor: pageColor || undefined,
                            columnCount: columns > 1 ? columns : undefined,
                            columnGap: columns > 1 ? '2em' : undefined,
                            border: pageBorder || '1px solid hsl(var(--border))',
                            hyphens: hyphenation ? 'auto' : 'manual',
                            WebkitHyphens: hyphenation ? 'auto' : 'manual',
                          } as React.CSSProperties}
                        >
                          {watermark && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                              <span className="text-6xl sm:text-8xl font-bold text-foreground/5 -rotate-45 select-none whitespace-nowrap">{watermark}</span>
                            </div>
                          )}
                          <div className="relative z-10" style={{
                            paddingLeft: paragraphIndentLeft > 0 ? `${paragraphIndentLeft}cm` : undefined,
                            paddingRight: paragraphIndentRight > 0 ? `${paragraphIndentRight}cm` : undefined,
                            ['--spacing-before' as string]: `${spacingBefore}pt`,
                            ['--spacing-after' as string]: `${spacingAfter}pt`,
                          }}>
                            {tiptapEditor && <TableOverlayHandles editor={tiptapEditor} containerRef={paperContentRef as React.RefObject<HTMLDivElement>} />}
                            <TipTapEditor
                              ref={editorRef}
                              content={draft.content}
                              onChange={handleContentChange}
                              fontFamily={theme.font}
                              lineHeight={lineSpacing.toString()}
                              placeholder="Comece a escrever seu documento aqui..."
                            />
                            {drawingActive && (
                              <DrawingCanvas tool={drawTool} color={drawColor} strokeWidth={drawWidth} clearSignal={drawClearSignal} />
                            )}
                          </div>
                          {/* Page number for first page */}
                          {showPageNumbers && (
                            <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-muted-foreground/60 select-none pointer-events-none">
                              Página 1{pageCount > 1 ? ` de ${pageCount}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Continuation pages — visual representation */
                      <div
                        className="relative bg-card"
                        style={{
                          width: paperWidthPx,
                          height: paperHeightPx,
                          border: pageBorder || '1px solid hsl(var(--border))',
                          backgroundColor: pageColor || undefined,
                        }}
                      >
                      {watermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                            <span className="text-6xl sm:text-8xl font-bold text-foreground/5 -rotate-45 select-none whitespace-nowrap">{watermark}</span>
                          </div>
                        )}
                        {showPageNumbers && (
                          <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] text-muted-foreground/60 select-none pointer-events-none">
                            Página {pageIdx + 1} de {pageCount}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments panel */}
        {showComments && (
          <DocumentComments
            comments={comments}
            onAdd={addComment}
            onResolve={resolveComment}
            onDelete={deleteComment}
            onReply={replyComment}
            onClose={() => setShowComments(false)}
          />
        )}
      </div>

      {/* ===== STATUS BAR ===== */}
      <div className="bg-primary text-primary-foreground px-3 py-1 flex items-center justify-between text-[10px] font-medium shrink-0">
        <div className="flex items-center gap-3">
          {currentFileName && (
            <span className="text-primary-foreground/80 truncate max-w-[150px]" title={currentFileName}>📄 {currentFileName}</span>
          )}
          <button onClick={() => setShowWordStats(true)} className="hover:underline cursor-pointer">Pág {pageCount}</button>
          <button onClick={() => setShowWordStats(true)} className="hover:underline cursor-pointer">{wordCount} palavras</button>
          <span>{charCount} caracteres</span>
          <span className="hidden sm:inline">~{readingTime} min leitura</span>
          {comments.filter(c => !c.resolved).length > 0 && (
            <button onClick={() => setShowComments(true)} className="hover:underline cursor-pointer">
              💬 {comments.filter(c => !c.resolved).length}
            </button>
          )}
          <span className="text-primary-foreground/60">{orientation === 'landscape' ? 'Paisagem' : 'Retrato'}</span>
          {columns > 1 && <span className="text-primary-foreground/60">{columns} col</span>}
          
        </div>
        <div className="flex items-center gap-3">
          {cloudSync && <span className="flex items-center gap-1"><Cloud className="h-3 w-3" /> Nuvem</span>}
          {syncing ? (
            <span className="flex items-center gap-1 text-primary-foreground/80"><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</span>
          ) : hasChanges ? (
            <span className="flex items-center gap-1 text-yellow-300 animate-pulse">● Não salvo</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-green-300">✓ Salvo {format(new Date(lastSaved), 'HH:mm:ss')}</span>
          ) : (
            <span className="text-primary-foreground/50">Novo documento</span>
          )}
          <button onClick={() => setShowVersionHistory(true)} className="hover:underline cursor-pointer hidden sm:inline">
            📂 {versions.length} versões
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="hover:bg-primary-foreground/20 rounded px-0.5">−</button>
            <input type="range" min={50} max={200} step={10} value={zoom} onChange={e => setZoom(Number(e.target.value))}
              className="w-16 h-1 accent-primary-foreground cursor-pointer" />
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="hover:bg-primary-foreground/20 rounded px-0.5">+</button>
            <span>{zoom}%</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:underline cursor-pointer">{ENEM_AREAS[draft.area].label}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(ENEM_AREAS).map(([k, v]) => (
                <DropdownMenuItem key={k} onClick={() => setDraft(p => ({ ...p, area: k as EnemArea }))} className="text-xs">{v.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NoteDocSettings theme={docTheme} onThemeChange={setDocTheme} zoom={zoom} onZoomChange={setZoom}
            noteIcon={draft.icon} onIconChange={icon => setDraft(p => ({ ...p, icon }))}
            coverColor={draft.coverColor} onCoverChange={coverColor => setDraft(p => ({ ...p, coverColor }))} />
        </div>
      </div>
    </div>
  );
}
