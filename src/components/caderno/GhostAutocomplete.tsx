import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/core";
import { toast } from "sonner";

const TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-tools`;

interface Props {
  editor: Editor | null;
  enabled: boolean;
}

export function useGhostAutocomplete({ editor, enabled }: Props) {
  const [suggestion, setSuggestion] = useState('');
  const [showGhost, setShowGhost] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();
  const lastTextRef = useRef('');

  const fetchSuggestion = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 20) return;

    // Get last ~200 chars for context
    const context = text.slice(-200);
    
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(TOOLS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'note-ai-action',
          data: { action: 'autocomplete', title: '', content: context, area: 'linguagens' },
        }),
        signal: controller.signal,
      });

      if (!resp.ok) return;
      const data = await resp.json();
      const result = (data.result || '').trim();
      
      if (result && result.length > 2 && result.length < 200) {
        setSuggestion(result);
        setShowGhost(true);
      }
    } catch {
      // Silently fail for aborted/network errors
    }
  }, []);

  useEffect(() => {
    if (!editor || !enabled) return;

    const handleUpdate = () => {
      const text = editor.getText();
      if (text === lastTextRef.current) return;
      lastTextRef.current = text;
      
      setSuggestion('');
      setShowGhost(false);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fetchSuggestion(text), 2000);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [editor, enabled, fetchSuggestion]);

  const acceptSuggestion = useCallback(() => {
    if (!editor || !suggestion) return;
    editor.chain().focus().insertContent(suggestion).run();
    setSuggestion('');
    setShowGhost(false);
  }, [editor, suggestion]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion('');
    setShowGhost(false);
  }, []);

  // Tab key handler
  useEffect(() => {
    if (!showGhost || !suggestion) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && showGhost) {
        e.preventDefault();
        acceptSuggestion();
      } else if (e.key === 'Escape') {
        dismissSuggestion();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showGhost, suggestion, acceptSuggestion, dismissSuggestion]);

  return { suggestion: showGhost ? suggestion : '', acceptSuggestion, dismissSuggestion };
}
