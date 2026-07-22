import Sortable from 'sortablejs';

interface SortableOptions {
  dirPath: string;
  onMove: (srcPath: string, targetDir: string) => void;
}

export function sortable(node: HTMLElement, options: SortableOptions) {
  node.dataset.dirPath = options.dirPath;

  const s = new Sortable(node, {
    group: {
      name: 'notes',
      pull: true,
      put: true,
    },
    sort: false,
    filter: '.tree-item',
    animation: 150,

    // ─── Reduce boundary flickering ─────────────────────────────────────
    // forceFallback uses a CSS-transformed clone instead of HTML5 drag API,
    // giving smoother boundary detection between containers.
    forceFallback: true,
    // Explicit vertical orientation helps Sortable calculate insertion
    // points more accurately in a tree list.
    direction: 'vertical',
    // Require the dragged element to fully overlap the target width before
    // swapping positions.  Reduces jitter from partial overlaps.
    swapThreshold: 1,
    // Invert the swap calculation so the dragged element's trailing edge
    // is used instead of the leading edge, which stabilises boundary
    // transitions.
    invertSwap: true,
    // Only delay on touch devices — prevents accidental drags on mobile
    // without affecting desktop responsiveness.
    delay: 200,
    delayOnTouchOnly: true,

    onEnd(evt) {
      if (evt.from !== evt.to) {
        const srcPath = (evt.item as HTMLElement).dataset.path;
        const targetDir = (evt.to as HTMLElement).dataset.dirPath ?? '';
        if (srcPath) {
          options.onMove(srcPath, targetDir);
        }
      }
    },
  });

  return {
    destroy() {
      s.destroy();
    },
  };
}
