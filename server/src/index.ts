import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_DIR = process.env.NOTES
  ? path.resolve(process.env.NOTES)
  : path.resolve(__dirname, '../../notes');
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureNotesDir() {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

/** Resolve a note path relative to NOTES_DIR, throwing on directory traversal. */
function resolveNotePath(notePath: string): string {
  // Normalise and ensure .md extension
  let p = notePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!p.endsWith('.md')) p += '.md';

  const resolved = path.resolve(NOTES_DIR, p);
  if (!resolved.startsWith(NOTES_DIR)) {
    throw Object.assign(new Error('Invalid path: directory traversal detected'), { status: 400 });
  }
  return resolved;
}

/** Resolve an arbitrary path under NOTES_DIR (for directories). */
function resolveDirPath(dirPath: string): string {
  const p = dirPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const resolved = path.resolve(NOTES_DIR, p);
  if (!resolved.startsWith(NOTES_DIR)) {
    throw Object.assign(new Error('Invalid path: directory traversal detected'), { status: 400 });
  }
  return resolved;
}

interface TreeNode {
  type: 'directory' | 'note';
  name: string;
  path: string;
  children?: TreeNode[];
  modified?: string;
}

function walkDir(dir: string, basePath: string = ''): TreeNode[] {
  const entries: TreeNode[] = [];
  let items: fs.Dirent[];
  try {
    items = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const fullPath = path.join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      const children = walkDir(fullPath, relativePath);
      entries.push({
        type: 'directory',
        name: item.name,
        path: relativePath,
        children,
      });
    } else if (item.isFile()) {
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      if (item.name.endsWith('.md')) {
        entries.push({
          type: 'note',
          name: item.name.slice(0, -3),
          path: relativePath,
          modified: stat.mtime.toISOString(),
        });
      } else {
        entries.push({
          type: 'file',
          name: item.name,
          path: relativePath,
          modified: stat.mtime.toISOString(),
        });
      }
    }
  }

  entries.sort((a, b) => {
    // directories first, then notes (markdown), then other files
    const order = { directory: 0, note: 1, file: 2 } as const;
    if (a.type !== b.type) return order[a.type] - order[b.type];
    return a.name.localeCompare(b.name);
  });

  return entries;
}

// ─── API: Tree ──────────────────────────────────────────────────────────────

app.get('/api/tree', (_req, res) => {
  try {
    ensureNotesDir();
    const tree = walkDir(NOTES_DIR);
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Notes ─────────────────────────────────────────────────────────────

app.get('/api/note', (req, res) => {
  try {
    const notePath = req.query.path as string;
    if (!notePath) return res.status(400).json({ error: 'path query parameter required' });

    const safe = resolveNotePath(notePath);
    if (!fs.existsSync(safe)) {
      return res.status(404).json({ error: 'Note not found' });
    }
    const content = fs.readFileSync(safe, 'utf-8');
    const stat = fs.statSync(safe);
    const name = path.basename(notePath.replace(/\.md$/i, ''));
    const dir = path.dirname(notePath);
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : name;

    res.json({
      path: notePath.endsWith('.md') ? notePath : notePath + '.md',
      name,
      title,
      content,
      modified: stat.mtime.toISOString(),
      directory: dir === '.' ? '' : dir,
    });
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

app.post('/api/note', (req, res) => {
  try {
    const { path: notePath, content } = req.body;
    if (!notePath) return res.status(400).json({ error: 'path is required' });

    const safe = resolveNotePath(notePath);
    const dir = path.dirname(safe);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(safe, content || '', 'utf-8');

    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.delete('/api/note', (req, res) => {
  try {
    const notePath = req.query.path as string;
    if (!notePath) return res.status(400).json({ error: 'path query parameter required' });

    const safe = resolveNotePath(notePath);
    if (!fs.existsSync(safe)) {
      return res.status(404).json({ error: 'Note not found' });
    }
    fs.unlinkSync(safe);

    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/note/move', (req, res) => {
  try {
    const { path: oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'path and newPath are required' });
    }

    const safeOld = resolveNotePath(oldPath);
    const safeNew = resolveNotePath(newPath);

    if (!fs.existsSync(safeOld)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const dir = path.dirname(safeNew);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.renameSync(safeOld, safeNew);
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── API: Directories ───────────────────────────────────────────────────────

app.post('/api/directory', (req, res) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) return res.status(400).json({ error: 'path is required' });

    const safe = resolveDirPath(dirPath);
    if (fs.existsSync(safe)) {
      return res.status(409).json({ error: 'Directory already exists' });
    }
    fs.mkdirSync(safe, { recursive: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.delete('/api/directory', (req, res) => {
  try {
    const dirPath = req.query.path as string;
    if (!dirPath) return res.status(400).json({ error: 'path query parameter required' });

    const safe = resolveDirPath(dirPath);
    if (!fs.existsSync(safe)) {
      return res.status(404).json({ error: 'Directory not found' });
    }
    fs.rmSync(safe, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post('/api/directory/move', (req, res) => {
  try {
    const { path: oldPath, newPath } = req.body;
    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'path and newPath are required' });
    }

    const safeOld = resolveDirPath(oldPath);
    const safeNew = resolveDirPath(newPath);

    if (!fs.existsSync(safeOld)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const dir = path.dirname(safeNew);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.renameSync(safeOld, safeNew);
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── API: Search ─────────────────────────────────────────────────────────────

interface SearchResult {
  path: string;
  name: string;
  title: string;
  snippet: string;
  modified: string;
}

app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    const mode = (req.query.mode as string) || 'fulltext';
    if (!q) return res.json([]);

    ensureNotesDir();
    const qLower = q.toLowerCase();
    const results: SearchResult[] = [];

    function walk(dir: string, basePath: string) {
      let items: fs.Dirent[];
      try {
        items = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const item of items) {
        if (item.name.startsWith('.')) continue;
        const fullPath = path.join(dir, item.name);
        const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
          walk(fullPath, relativePath);
        } else if (item.isFile() && item.name.endsWith('.md')) {
          const name = item.name.slice(0, -3);
          const nameLower = name.toLowerCase();
          const nameMatch = nameLower.includes(qLower);

          let content: string;
          try {
            content = fs.readFileSync(fullPath, 'utf-8');
          } catch {
            continue;
          }
          const contentLower = content.toLowerCase();
          const contentMatch = contentLower.includes(qLower);

          if (mode === 'filename' ? !nameMatch : !nameMatch && !contentMatch) continue;

          const stat = fs.statSync(fullPath);
          const titleMatch = content.match(/^#\s+(.+)/m);
          const title = titleMatch ? titleMatch[1].trim() : name;

          // Extract snippet around first match
          let snippet = '';
          const idx = contentLower.indexOf(qLower);
          if (idx >= 0) {
            const start = Math.max(0, idx - 60);
            const end = Math.min(content.length, idx + q.length + 60);
            snippet = (start > 0 ? '…' : '') + content.slice(start, end).replace(/\n/g, ' ') + (end < content.length ? '…' : '');
          }

          results.push({ path: relativePath, name, title, snippet, modified: stat.mtime.toISOString() });
        }
      }
    }

    walk(NOTES_DIR, '');

    // Score and sort: filename-prefix match > filename-substring > content match
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStarts = aName.startsWith(qLower);
      const bStarts = bName.startsWith(qLower);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      if (aName.includes(qLower) !== bName.includes(qLower)) return aName.includes(qLower) ? -1 : 1;
      return b.modified.localeCompare(a.modified);
    });

    res.json(results.slice(0, 50));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Static file serving ────────────────────────────────────────────────────

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
}

// Serve note-attached files (images, etc.) at /f/ prefix so that
// markdown can reference them as e.g. `![bot](/f/boticon2.png)`.
app.use('/f', express.static(NOTES_DIR, {
  dotfiles: 'ignore',
  index: false,
}));

// SPA fallback — serve index.html for any unmatched GET route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/f')) return next();
  if (!fs.existsSync(CLIENT_DIST)) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// ─── Start ──────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => {
  console.log(`✦ downspace server running on http://localhost:${PORT}`);
});
