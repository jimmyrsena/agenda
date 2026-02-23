import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (options: { src: string; alt?: string; title?: string; width?: number }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      alignment: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[data-resizable]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, width, ...rest } = HTMLAttributes;
    const style = [
      width ? `width: ${width}px` : 'max-width: 100%',
      'height: auto',
      'border-radius: 6px',
      'cursor: pointer',
    ].join('; ');

    const wrapStyle = `text-align: ${alignment || 'center'}; margin: 0.5em 0;`;

    return ['div', { style: wrapStyle, class: 'resizable-image-wrap' }, [
      'img', mergeAttributes(this.options.HTMLAttributes, rest, {
        'data-resizable': '',
        style,
        draggable: 'false',
      }),
    ]];
  },

  addCommands() {
    return {
      setResizableImage: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('resizableImagePlugin');
    
    return [
      new Plugin({
        key: pluginKey,
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement;
              if (target.tagName !== 'IMG' || !target.hasAttribute('data-resizable')) return false;
              
              const startX = event.clientX;
              const startWidth = target.offsetWidth;
              
              // Find the node position
              const pos = view.posAtDOM(target, 0);
              if (pos === undefined) return false;

              const overlay = document.createElement('div');
              overlay.style.cssText = 'position:fixed;inset:0;cursor:ew-resize;z-index:9999;';
              document.body.appendChild(overlay);

              const onMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(50, startWidth + (e.clientX - startX));
                target.style.width = `${newWidth}px`;
              };

              const onMouseUp = (e: MouseEvent) => {
                const finalWidth = Math.max(50, startWidth + (e.clientX - startX));
                overlay.remove();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                // Update the node attribute
                const { state, dispatch } = view;
                const nodePos = view.posAtDOM(target, 0);
                if (nodePos !== undefined) {
                  const resolvedPos = state.doc.resolve(nodePos);
                  const node = resolvedPos.parent;
                  if (node.type.name === 'resizableImage') {
                    const tr = state.tr.setNodeMarkup(resolvedPos.before(), undefined, {
                      ...node.attrs,
                      width: finalWidth,
                    });
                    dispatch(tr);
                  }
                }
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
              event.preventDefault();
              return true;
            },
          },
        },
      }),
    ];
  },
});
