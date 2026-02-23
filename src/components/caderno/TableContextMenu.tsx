import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Merge, Split, Minus, MoveUp, MoveDown, MousePointerClick, GripVertical
} from 'lucide-react';

interface Props {
  editor: Editor;
}

export function TableContextMenu({ editor }: Props) {
  const [isInTable, setIsInTable] = useState(false);

  useEffect(() => {
    const update = () => setIsInTable(editor.isActive('table'));
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  if (!isInTable) return null;

  const selectTable = () => {
    // Select all cells in current table
    const { state } = editor;
    const { $from } = state.selection;
    // Find the table node
    let tablePos = -1;
    let tableNode: any = null;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'table') {
        tablePos = $from.before(d);
        tableNode = $from.node(d);
        break;
      }
    }
    if (tablePos >= 0 && tableNode) {
      // Select from first to last cell
      const from = tablePos + 1;
      const to = tablePos + tableNode.nodeSize - 1;
      editor.chain().focus().setTextSelection({ from, to }).run();
    }
  };

  const moveTableUp = () => {
    const { state } = editor;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'table') {
        const pos = $from.before(d);
        if (pos <= 0) return;
        const node = $from.node(d);
        const { tr } = state;
        // Find the node before the table
        const $pos = state.doc.resolve(pos);
        const before = $pos.nodeBefore;
        if (!before) return;
        const beforePos = pos - before.nodeSize;
        tr.delete(pos, pos + node.nodeSize);
        tr.insert(beforePos, node);
        editor.view.dispatch(tr);
        editor.commands.focus();
        return;
      }
    }
  };

  const moveTableDown = () => {
    const { state } = editor;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'table') {
        const pos = $from.before(d);
        const node = $from.node(d);
        const after = pos + node.nodeSize;
        const $after = state.doc.resolve(after);
        const nextNode = $after.nodeAfter;
        if (!nextNode) return;
        const { tr } = state;
        const nextEnd = after + nextNode.nodeSize;
        tr.delete(pos, pos + node.nodeSize);
        // After deletion, nextNode shifted up
        const newPos = pos + nextNode.nodeSize;
        // Re-read after delete
        tr.insert(pos + nextNode.nodeSize - node.nodeSize, node);
        editor.view.dispatch(tr);
        editor.commands.focus();
        return;
      }
    }
  };

  const groups = [
    [
      { icon: MousePointerClick, label: 'Selecionar tabela', action: selectTable },
    ],
    [
      { icon: ArrowUp, label: 'Linha acima', action: () => editor.chain().focus().addRowBefore().run() },
      { icon: ArrowDown, label: 'Linha abaixo', action: () => editor.chain().focus().addRowAfter().run() },
      { icon: ArrowLeft, label: 'Coluna esq.', action: () => editor.chain().focus().addColumnBefore().run() },
      { icon: ArrowRight, label: 'Coluna dir.', action: () => editor.chain().focus().addColumnAfter().run() },
    ],
    [
      { icon: Minus, label: 'Excluir linha', action: () => editor.chain().focus().deleteRow().run(), destructive: true },
      { icon: Minus, label: 'Excluir coluna', action: () => editor.chain().focus().deleteColumn().run(), destructive: true },
    ],
    [
      { icon: Merge, label: 'Mesclar', action: () => editor.chain().focus().mergeCells().run() },
      { icon: Split, label: 'Dividir', action: () => editor.chain().focus().splitCell().run() },
    ],
    [
      { icon: MoveUp, label: 'Mover acima', action: moveTableUp },
      { icon: MoveDown, label: 'Mover abaixo', action: moveTableDown },
    ],
    [
      { icon: Trash2, label: 'Excluir tabela', action: () => editor.chain().focus().deleteTable().run(), destructive: true },
    ],
  ];

  return (
    <div className="flex items-center gap-1 bg-card border rounded-lg shadow-md px-2 py-1 mb-1 flex-wrap">
      <span className="text-[9px] text-muted-foreground font-semibold tracking-wide mr-1">TABELA</span>
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="w-px h-5 bg-border mx-0.5" />}
          {group.map(({ icon: Icon, label, action, destructive }: any) => (
            <button
              key={label}
              title={label}
              className={`inline-flex items-center justify-center h-6 w-6 rounded transition-colors
                ${destructive ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-accent'} text-foreground/70`}
              onClick={(e) => { e.preventDefault(); action(); }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
