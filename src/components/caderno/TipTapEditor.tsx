import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import ImageExt from '@tiptap/extension-image';
import { ResizableImage } from './ImageResizeExtension';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import FontFamily from '@tiptap/extension-font-family';
import { useEffect, useCallback, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Link as LinkIcon,
  Code
} from 'lucide-react';
import type { Editor } from '@tiptap/core';
import './tiptap-styles.css';

export interface TipTapEditorHandle {
  getHTML: () => string;
  getText: () => string;
  getWordCount: () => number;
  getCharCount: () => number;
  setContent: (content: string) => void;
  focus: () => void;
  getEditor: () => Editor | null;
}

interface Props {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  editable?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

const TipTapEditor = forwardRef<TipTapEditorHandle, Props>(({
  content, onChange, className, fontFamily = 'Inter', fontSize = '12',
  lineHeight = '1.75', editable = true, placeholder = 'Comece a escrever seu documento aqui...', style,
}, ref) => {
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: 'bg-muted rounded-md p-3 font-mono text-sm' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-primary/40 pl-4 italic text-muted-foreground' } },
        // Disable extensions we configure separately to avoid duplicates (TipTap v3 StarterKit includes them)
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'tiptap-table' } }),
      TableRow,
      TableCell,
      TableHeader,
      ImageExt.configure({ HTMLAttributes: { class: 'max-w-full rounded-md' }, inline: false }),
      ResizableImage,
      Placeholder.configure({ placeholder }),
      Typography,
      Subscript,
      Superscript,
      TaskList.configure({ HTMLAttributes: { class: 'tiptap-task-list' } }),
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline cursor-pointer' } }),
      CharacterCount,
      FontFamily,
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      if (from === to) { setBubblePos(null); return; }
      // Get selection position for bubble menu
      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const wrapRect = editorWrapRef.current?.getBoundingClientRect();
        if (wrapRect && rect.width > 0) {
          setBubblePos({
            x: rect.left - wrapRect.left + rect.width / 2,
            y: rect.top - wrapRect.top - 8,
          });
        }
      }
    },
    onBlur: () => {
      setTimeout(() => setBubblePos(null), 200);
    },
    editorProps: {
      attributes: {
        class: `tiptap focus:outline-none h-full ${className || ''}`,
        style: `font-family: ${fontFamily}, sans-serif; font-size: ${fontSize}pt; line-height: ${lineHeight}; overflow-wrap: break-word; word-break: break-word;`,
      },
    },
  });

  // Only sync external content when it truly differs (e.g. loading a different note).
  // Use a ref to avoid resetting undo history on every auto-save round-trip.
  const lastExternalContent = useRef(content);
  useEffect(() => {
    if (editor && content !== lastExternalContent.current && content !== editor.getHTML()) {
      lastExternalContent.current = content;
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Keep the ref in sync when the user types (so auto-save doesn't trigger setContent)
  const onUpdateRef = useRef(onChange);
  onUpdateRef.current = onChange;

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (editor) {
      editor.view.dom.style.fontFamily = `${fontFamily}, sans-serif`;
      editor.view.dom.style.fontSize = `${fontSize}pt`;
      editor.view.dom.style.lineHeight = lineHeight;
    }
  }, [editor, fontFamily, fontSize, lineHeight]);

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
    getWordCount: () => editor?.storage.characterCount.words() || 0,
    getCharCount: () => editor?.storage.characterCount.characters() || 0,
    setContent: (c: string) => editor?.commands.setContent(c),
    focus: () => editor?.commands.focus(),
    getEditor: () => editor,
  }));

  if (!editor) return null;

  return (
    <div ref={editorWrapRef} className="relative">
      {/* Floating Bubble Menu on selection */}
      {bubblePos && (
        <div
          className="absolute z-50 flex items-center gap-0.5 bg-card border shadow-lg rounded-lg p-1 -translate-x-1/2 -translate-y-full"
          style={{ left: bubblePos.x, top: bubblePos.y }}
          onMouseDown={e => e.preventDefault()}
        >
          <BubbleBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough className="h-3.5 w-3.5" />
          </BubbleBtn>
          <div className="w-px h-4 bg-border mx-0.5" />
          <BubbleBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run()}>
            <Highlighter className="h-3.5 w-3.5" />
          </BubbleBtn>
          <div className="w-px h-4 bg-border mx-0.5" />
          <BubbleBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter className="h-3.5 w-3.5" />
          </BubbleBtn>
          <BubbleBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight className="h-3.5 w-3.5" />
          </BubbleBtn>
          <div className="w-px h-4 bg-border mx-0.5" />
          <BubbleBtn active={editor.isActive('link')} onClick={() => {
            const url = window.prompt('URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}>
            <LinkIcon className="h-3.5 w-3.5" />
          </BubbleBtn>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

function BubbleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center h-7 w-7 rounded transition-colors
        ${active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60 text-foreground/80'}`}
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
    >
      {children}
    </button>
  );
}

export default TipTapEditor;
