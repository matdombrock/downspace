# JS Eval

Evaluate JavaScript in the browser. Press **Ctrl+Enter** to run, or click **▶ Run**. `console.log` output is captured and shown.

<div id="eval-root">
  <div class="eval-header">
    <span class="eval-title">⬢ JS Eval</span>
    <div class="eval-header-actions">
      <button class="eval-btn" id="clear-btn" title="Clear output and history">✕ Clear</button>
    </div>
  </div>

  <textarea id="eval-input" placeholder="Enter JavaScript here…&#10;e.g. [1, 2, 3].map(x => x * 2)&#10;or use console.log('hello')"></textarea>

  <div class="eval-toolbar">
    <button class="eval-btn eval-btn-primary" id="run-btn">▶ Run</button>
    <label class="eval-live-toggle">
      <input type="checkbox" id="live-check" checked />
      <span>Live preview</span>
    </label>
  </div>

  <div id="eval-output">
    <div class="eval-placeholder">Results appear here</div>
  </div>

  <div id="eval-history" style="display:none">
    <div class="eval-history-header">
      <span>History</span>
      <button class="eval-btn eval-btn-small" id="clear-history-btn">Clear</button>
    </div>
    <div id="eval-history-list"></div>
  </div>
</div>

<script>
(function() {
  const input = document.getElementById('eval-input');
  const output = document.getElementById('eval-output');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const liveCheck = document.getElementById('live-check');
  const historyDiv = document.getElementById('eval-history');
  const historyList = document.getElementById('eval-history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  let history = [];
  let lastEvalId = 0;

  // ─── Console capture ──────────────────────────────────────────────────

  const logs = [];

  function captureConsole() {
    const methods = ['log', 'warn', 'error', 'info', 'debug'];
    const originals = {};
    for (const m of methods) {
      originals[m] = console[m];
      console[m] = function(...args) {
        logs.push({ method: m, args: args.map(fmtArg) });
        originals[m].apply(console, args);
      };
    }
    return () => {
      for (const m of methods) console[m] = originals[m];
    };
  }

  function fmtArg(arg) {
    if (arg === undefined) return 'undefined';
    if (arg === null) return 'null';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    if (arg instanceof Error) return arg.stack || arg.message;
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }

  function fmtResult(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val instanceof Promise) return 'Promise { <pending> }';
    if (Array.isArray(val)) {
      try { return JSON.stringify(val, null, 2); } catch { return String(val); }
    }
    if (typeof val === 'object') {
      try { return JSON.stringify(val, null, 2); } catch { return String(val); }
    }
    return String(val);
  }

  // ─── Evaluate ─────────────────────────────────────────────────────────

  async function evaluate(code) {
    logs.length = 0;
    const restore = captureConsole();

    try {
      // Try as expression first
      let result;
      const trimmed = code.trim();

      // Support async/await: wrap in async IIFE if it contains await
      if (trimmed.includes('await ')) {
        result = await eval(`(async () => { ${trimmed} })()`);
      } else {
        // Wrap in expression check — if it's a statement/block, eval as-is
        try {
          // Check if it's a valid expression by attempting to parse
          result = eval(trimmed);
        } catch {
          // If expression eval fails, try as a block
          result = eval(`(() => { ${trimmed} })()`);
        }
      }

      return { result, logs: [...logs] };
    } catch (err) {
      return { error: err.message || String(err), logs: [...logs] };
    } finally {
      restore();
    }
  }

  function renderResult(r) {
    output.innerHTML = '';

    if (r.logs && r.logs.length > 0) {
      for (const log of r.logs) {
        const line = document.createElement('div');
        line.className = 'eval-console-line eval-console-' + log.method;
        line.textContent = log.args.join(' ');
        output.appendChild(line);
      }
    }

    if (r.error !== undefined) {
      const line = document.createElement('div');
      line.className = 'eval-error';
      line.textContent = '✗ ' + r.error;
      output.appendChild(line);
    } else if (r.result !== undefined) {
      const line = document.createElement('div');
      line.className = 'eval-result';
      line.textContent = '⇒ ' + fmtResult(r.result);
      output.appendChild(line);
    }

    if (output.children.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'eval-placeholder';
      placeholder.textContent = '(no output)';
      output.appendChild(placeholder);
    }
  }

  function showPlaceholder() {
    output.innerHTML = '<div class="eval-placeholder">Results appear here</div>';
  }

  // ─── History ──────────────────────────────────────────────────────────

  function renderHistory() {
    historyDiv.style.display = history.length > 0 ? 'block' : 'none';
    historyList.innerHTML = '';

    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      const item = document.createElement('div');
      item.className = 'eval-history-item';

      const expr = document.createElement('span');
      expr.className = 'eval-history-expr';
      expr.textContent = entry.code;

      const result = document.createElement('span');
      result.className = 'eval-history-result';
      if (entry.error) {
        result.textContent = '✗ ' + entry.error;
        result.style.color = '#e74c3c';
      } else {
        result.textContent = '⇒ ' + fmtResult(entry.result);
      }

      const actions = document.createElement('span');
      actions.className = 'eval-history-actions';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'eval-btn eval-btn-small';
      loadBtn.textContent = 'Load';
      loadBtn.addEventListener('click', () => {
        input.value = entry.code;
        input.dispatchEvent(new Event('input'));
        input.focus();
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'eval-btn eval-btn-small';
      delBtn.textContent = 'Del';
      delBtn.addEventListener('click', () => {
        history.splice(i, 1);
        renderHistory();
      });

      actions.appendChild(loadBtn);
      actions.appendChild(delBtn);

      item.appendChild(expr);
      item.appendChild(result);
      item.appendChild(actions);
      historyList.appendChild(item);
    }
  }

  function clearHistory() {
    history = [];
    renderHistory();
  }

  // ─── Run ──────────────────────────────────────────────────────────────

  async function run() {
    const code = input.value;
    if (!code.trim()) return;

    const r = await evaluate(code);
    renderResult(r);

    if (r.error !== undefined) {
      history.push({ code, error: r.error });
    } else {
      history.push({ code, result: r.result });
    }
    renderHistory();
  }

  // ─── Live preview ─────────────────────────────────────────────────────

  let liveTimer = null;

  async function liveUpdate() {
    if (!liveCheck.checked) return;
    const code = input.value.trim();
    if (!code) { showPlaceholder(); return; }

    const r = await evaluate(code);
    renderResult(r);
  }

  // ─── Events ───────────────────────────────────────────────────────────

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  });

  input.addEventListener('input', function() {
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(liveUpdate, 400);
  });

  runBtn.addEventListener('click', run);

  clearBtn.addEventListener('click', function() {
    clearHistory();
    showPlaceholder();
  });

  clearHistoryBtn.addEventListener('click', clearHistory);

  // Focus input
  input.focus();
})();
</script>

<style>
#eval-root {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
}

.eval-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.eval-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.eval-header-actions {
  display: flex;
  gap: 4px;
}

#eval-input {
  width: 100%;
  min-height: 8rem;
  max-height: 24rem;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  tab-size: 2;
}

#eval-input:focus {
  border-bottom-color: var(--accent, #4a90d9);
}

#eval-input::placeholder {
  color: var(--text-muted, #999);
  font-family: system-ui, -apple-system, sans-serif;
}

/* ─── Toolbar ────────────────────────────────────────────────────────── */

.eval-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.eval-live-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  user-select: none;
}

.eval-live-toggle input {
  margin: 0;
  cursor: pointer;
}

/* ─── Buttons ────────────────────────────────────────────────────────── */

.eval-btn {
  padding: 5px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
}

.eval-btn:hover {
  background: var(--bg-tertiary, #e8e8e8);
}

.eval-btn-primary {
  background: var(--accent, #4a90d9);
  color: #fff;
  border-color: var(--accent, #4a90d9);
  font-weight: 600;
}

.eval-btn-primary:hover {
  opacity: 0.9;
}

.eval-btn-small {
  padding: 2px 6px;
  font-size: 11px;
}

/* ─── Output ─────────────────────────────────────────────────────────── */

#eval-output {
  padding: 8px 12px;
  min-height: 2.5em;
  max-height: 20rem;
  overflow-y: auto;
  background: var(--bg, #fff);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.eval-placeholder {
  color: var(--text-muted, #999);
  font-style: italic;
}

.eval-console-line {
  padding: 1px 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.eval-console-log {
  color: var(--text, #1a1a1a);
}

.eval-console-warn {
  color: #e67e22;
}

.eval-console-error {
  color: #e74c3c;
}

.eval-console-info {
  color: var(--accent, #4a90d9);
}

.eval-console-debug {
  color: var(--text-muted, #999);
}

.eval-error {
  color: #e74c3c;
  padding: 2px 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.eval-result {
  color: #2ecc71;
  padding: 2px 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-weight: 600;
}

/* ─── History ────────────────────────────────────────────────────────── */

#eval-history {
  border-top: 1px solid var(--border, #d0d0d0);
}

.eval-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #666);
  background: var(--bg-secondary, #f5f5f5);
  border-bottom: 1px solid var(--border, #d0d0d0);
}

#eval-history-list {
  max-height: 16rem;
  overflow-y: auto;
}

.eval-history-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  font-size: 12px;
  line-height: 1.4;
}

.eval-history-item:last-child {
  border-bottom: none;
}

.eval-history-expr {
  flex: 0 0 40%;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  color: var(--text, #1a1a1a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eval-history-result {
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.eval-history-actions {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

/* ─── Dark mode ──────────────────────────────────────────────────────── */

@media (prefers-color-scheme: dark) {
  #eval-root {
    --border: #444;
    --bg: #1e1e1e;
    --bg-secondary: #2a2a2a;
    --bg-tertiary: #333;
    --text: #e0e0e0;
    --text-secondary: #999;
    --text-muted: #777;
    --accent: #4a90d9;
  }

  #eval-input {
    background: #1a1a1a;
    color: #e0e0e0;
  }
}
</style>
