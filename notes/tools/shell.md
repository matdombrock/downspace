# Shell

An embedded shell that runs commands on the server (via `POST /exec`). Type a command and press **Ctrl+Enter** or click **Run**.

<div id="shell-root">
  <div class="shell-header">
    <span class="shell-title">⬢ Shell</span>
    <button class="shell-btn" id="clear-btn" title="Clear">✕ Clear</button>
  </div>

  <div class="shell-input-row">
    <input id="cmd-input" type="text" placeholder="Enter a command…" />
    <button class="shell-btn shell-btn-primary" id="run-btn">▶ Run</button>
  </div>

  <div id="error-box" style="display:none"></div>

  <div id="output-area" style="display:none">
    <div id="exit-badge"></div>
    <pre id="stdout-box" style="display:none"></pre>
    <pre id="stderr-box" style="display:none"></pre>
  </div>

  <div id="placeholder">
    Type a command and press <kbd>Ctrl+Enter</kbd> or click <strong>Run</strong>.
  </div>
</div>

<script>
(function() {
  const root = document.getElementById('shell-root');
  const input = document.getElementById('cmd-input');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const errorBox = document.getElementById('error-box');
  const outputArea = document.getElementById('output-area');
  const exitBadge = document.getElementById('exit-badge');
  const stdoutBox = document.getElementById('stdout-box');
  const stderrBox = document.getElementById('stderr-box');
  const placeholder = document.getElementById('placeholder');

  let running = false;

  async function run() {
    const cmd = input.value.trim();
    if (!cmd || running) return;

    running = true;
    runBtn.disabled = true;
    runBtn.innerHTML = '⏳ Running…';
    errorBox.style.display = 'none';
    outputArea.style.display = 'none';

    try {
      const res = await fetch('/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const data = await res.json();

      placeholder.style.display = 'none';
      outputArea.style.display = 'block';

      // Exit code badge
      const ok = data.exitCode === 0;
      exitBadge.textContent = ok ? '✓ Exit code: ' + data.exitCode : '✗ Exit code: ' + data.exitCode;
      exitBadge.className = ok ? 'exit-ok' : 'exit-fail';

      // Stdout
      if (data.stdout) {
        stdoutBox.textContent = data.stdout;
        stdoutBox.style.display = 'block';
      } else {
        stdoutBox.style.display = 'none';
      }

      // Stderr
      if (data.stderr) {
        stderrBox.textContent = data.stderr;
        stderrBox.style.display = 'block';
      } else {
        stderrBox.style.display = 'none';
      }
    } catch (e) {
      errorBox.textContent = e.message;
      errorBox.style.display = 'block';
    } finally {
      running = false;
      runBtn.disabled = false;
      runBtn.innerHTML = '▶ Run';
    }
  }

  function clearOutput() {
    outputArea.style.display = 'none';
    errorBox.style.display = 'none';
    placeholder.style.display = 'block';
    stdoutBox.textContent = '';
    stderrBox.textContent = '';
  }

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  });

  runBtn.addEventListener('click', run);
  clearBtn.addEventListener('click', clearOutput);

  // Focus input on load
  input.focus();
})();
</script>

<style>
#shell-root {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
}

.shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.shell-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.shell-input-row {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

#cmd-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

#cmd-input:focus {
  border-color: var(--accent, #4a90d9);
}

#cmd-input::placeholder {
  color: var(--text-muted, #999);
  font-family: system-ui, -apple-system, sans-serif;
}

.shell-btn {
  padding: 6px 12px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}

.shell-btn:hover {
  background: var(--bg-tertiary, #e8e8e8);
}

.shell-btn-primary {
  background: var(--accent, #4a90d9);
  color: #fff;
  border-color: var(--accent, #4a90d9);
  font-weight: 600;
}

.shell-btn-primary:hover {
  opacity: 0.9;
}

.shell-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#error-box {
  margin: 8px 12px 0;
  padding: 6px 10px;
  background: var(--danger, #e74c3c);
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
}

#output-area {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

#exit-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.exit-ok {
  color: #2ecc71;
}

.exit-fail {
  color: #e74c3c;
}

#stdout-box,
#stderr-box {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--bg-secondary, #f5f5f5);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

#stderr-box {
  color: #e74c3c;
  margin-top: 4px;
}

#placeholder {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-muted, #999);
  font-size: 13px;
}

#placeholder kbd {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  background: var(--bg-tertiary, #e8e8e8);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid var(--border, #d0d0d0);
  font-size: 12px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  #shell-root {
    --border: #444;
    --bg: #1e1e1e;
    --bg-secondary: #2a2a2a;
    --bg-tertiary: #333;
    --text: #e0e0e0;
    --text-secondary: #999;
    --text-muted: #777;
    --accent: #4a90d9;
    --danger: #e74c3c;
  }
}
</style>
