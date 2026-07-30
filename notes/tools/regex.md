# Regex Tester

Test regular expressions against input text. Matches are highlighted with match details shown below.

<div id="regex-root">
  <div class="regex-header">
    <span class="regex-title">⬢ Regex Tester</span>
  </div>

  <div class="regex-pattern-row">
    <span class="regex-label">Pattern</span>
    <input id="regex-pattern" type="text" placeholder="[a-z]+" spellcheck="false" value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" />
    <div class="regex-flags">
      <label class="regex-flag" title="Case insensitive">
        <input type="checkbox" id="flag-i" /> i
      </label>
      <label class="regex-flag" title="Global">
        <input type="checkbox" id="flag-g" checked /> g
      </label>
      <label class="regex-flag" title="Multiline">
        <input type="checkbox" id="flag-m" /> m
      </label>
      <label class="regex-flag" title="Dotall">
        <input type="checkbox" id="flag-s" /> s
      </label>
      <label class="regex-flag" title="Unicode">
        <input type="checkbox" id="flag-u" /> u
      </label>
    </div>
  </div>

  <div class="regex-input-row">
    <span class="regex-label">Text</span>
    <textarea id="regex-input" placeholder="Enter text to search…" spellcheck="false">hello@example.com 555-1234
https://downspace.app

Hello world! This is a test.
The quick brown fox jumps over the lazy dog.
Call me at (555) 987-6543 or support@example.com

Another URL: https://example.com/path?q=regex#test
IP: 192.168.1.1, port 8080

const greet = (name) => {
  return `Hello, ${name}!`;
};

# heading
- list item
**bold** *italic*</textarea>
  </div>

  <div class="regex-toolbar">
    <button class="regex-btn" id="clear-btn">✕ Clear</button>
    <div class="regex-submit-row">
      <button class="regex-btn regex-btn-primary" id="run-btn">▶ Run</button>
      <label class="regex-live-toggle">
        <input type="checkbox" id="live-check" checked />
        <span>Live</span>
      </label>
    </div>
  </div>

  <div id="regex-stats" style="display:none"></div>
  <div id="regex-output" style="display:none"></div>

  <div id="regex-placeholder">
    Enter a pattern and text above, then press <kbd>Ctrl+Enter</kbd> or click <strong>Run</strong>.
  </div>
</div>

<div id="regex-replace-root" style="display:none">
  <div class="regex-replace-row">
    <span class="regex-label">Replace</span>
    <input id="regex-replace" type="text" placeholder="Replacement string…" spellcheck="false" />
    <button class="regex-btn regex-btn-primary" id="replace-btn">Replace</button>
  </div>
  <div id="regex-replace-output" style="display:none"></div>
</div>

<script>
(function() {
  const patternInput = document.getElementById('regex-pattern');
  const textInput = document.getElementById('regex-input');
  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const liveCheck = document.getElementById('live-check');
  const stats = document.getElementById('regex-stats');
  const output = document.getElementById('regex-output');
  const placeholder = document.getElementById('regex-placeholder');

  const replaceRoot = document.getElementById('regex-replace-root');
  const replaceInput = document.getElementById('regex-replace');
  const replaceBtn = document.getElementById('replace-btn');
  const replaceOutput = document.getElementById('regex-replace-output');

  const flagI = document.getElementById('flag-i');
  const flagG = document.getElementById('flag-g');
  const flagM = document.getElementById('flag-m');
  const flagS = document.getElementById('flag-s');
  const flagU = document.getElementById('flag-u');

  // ─── Build regex ──────────────────────────────────────────────────────

  function getFlags() {
    let f = '';
    if (flagI.checked) f += 'i';
    if (flagG.checked) f += 'g';
    if (flagM.checked) f += 'm';
    if (flagS.checked) f += 's';
    if (flagU.checked) f += 'u';
    return f || 'g';
  }

  function buildRegex() {
    const raw = patternInput.value;
    if (!raw.trim()) return null;
    try {
      return new RegExp(raw, getFlags());
    } catch (e) {
      return { error: e.message };
    }
  }

  // ─── Run ──────────────────────────────────────────────────────────────

  function run() {
    const text = textInput.value;
    if (!text) { showPlaceholder(); return; }

    const re = buildRegex();
    if (!re) { showPlaceholder(); return; }

    if (re.error) {
      stats.style.display = 'block';
      stats.className = 'regex-stats regex-stats-error';
      stats.textContent = '✗ ' + re.error;
      output.style.display = 'none';
      placeholder.style.display = 'none';
      replaceRoot.style.display = 'none';
      return;
    }

    const matches = [];
    let m;
    // Reset lastIndex if global
    re.lastIndex = 0;
    const global = re.flags.includes('g');

    if (global) {
      while ((m = re.exec(text)) !== null) {
        matches.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
          named: m.groups || {},
        });
        if (m.index === re.lastIndex) re.lastIndex++;
        // Safety limit
        if (matches.length > 10000) { matches.push({ match: '… (truncated at 10000 matches)', index: -1, groups: [], named: {} }); break; }
      }
    } else {
      m = re.exec(text);
      if (m) {
        matches.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
          named: m.groups || {},
        });
      }
    }

    renderResults(text, re, matches);
  }

  // ─── Render results ───────────────────────────────────────────────────

  function renderResults(text, re, matches) {
    placeholder.style.display = 'none';

    // Stats
    stats.style.display = 'block';
    stats.className = 'regex-stats';
    if (matches.length === 0 || (matches.length === 1 && matches[0].index === -1 && matches[0].match.startsWith('…'))) {
      stats.textContent = 'No matches';
      stats.className = 'regex-stats regex-stats-empty';
    } else {
      stats.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es') + ' found';
    }

    // Highlighted text
    output.style.display = 'block';
    output.innerHTML = '';

    if (matches.length > 0 && !(matches.length === 1 && matches[0].index === -1)) {
      const highlighted = document.createElement('div');
      highlighted.className = 'regex-highlighted';

      let lastEnd = 0;
      const parts = [];

      for (const match of matches) {
        if (match.index === -1) continue;
        if (match.index > lastEnd) {
          parts.push(escHtml(text.slice(lastEnd, match.index)));
        }
        parts.push('<mark class="regex-mark">' + escHtml(match.match) + '</mark>');
        lastEnd = match.index + match.match.length;
      }
      if (lastEnd < text.length) {
        parts.push(escHtml(text.slice(lastEnd)));
      }

      highlighted.innerHTML = parts.join('');
      output.appendChild(highlighted);

      // Match details
      const details = document.createElement('div');
      details.className = 'regex-details';

      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        if (m.index === -1) continue;
        const row = document.createElement('div');
        row.className = 'regex-detail-row';

        const num = document.createElement('span');
        num.className = 'regex-detail-num';
        num.textContent = '#' + (i + 1);

        const pos = document.createElement('span');
        pos.className = 'regex-detail-pos';
        pos.textContent = m.index + '–' + (m.index + m.match.length);

        const val = document.createElement('span');
        val.className = 'regex-detail-val';
        val.textContent = m.match;

        const grp = document.createElement('span');
        grp.className = 'regex-detail-groups';
        const groupParts = [];
        if (m.groups.length > 0) {
          for (let g = 0; g < m.groups.length; g++) {
            if (m.groups[g] !== undefined) {
              groupParts.push('$' + (g + 1) + '=' + m.groups[g]);
            }
          }
        }
        if (Object.keys(m.named).length > 0) {
          for (const [k, v] of Object.entries(m.named)) {
            if (v !== undefined) groupParts.push(k + '=' + v);
          }
        }
        grp.textContent = groupParts.join(', ');

        row.appendChild(num);
        row.appendChild(pos);
        row.appendChild(val);
        if (groupParts.length > 0) row.appendChild(grp);
        details.appendChild(row);
      }

      output.appendChild(details);
    } else {
      output.innerHTML = '<div class="regex-no-matches">No matches</div>';
    }

    // Replace section
    replaceRoot.style.display = 'block';
    replaceOutput.style.display = 'none';

    // Scroll to results
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function escHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // ─── Replace ──────────────────────────────────────────────────────────

  function doReplace() {
    const text = textInput.value;
    const replacement = replaceInput.value;
    if (!text) return;

    const re = buildRegex();
    if (!re || re.error) return;

    try {
      const result = text.replace(re, replacement);
      replaceOutput.style.display = 'block';
      replaceOutput.innerHTML = '<div class="regex-replace-result"><strong>Result:</strong><pre>' + escHtml(result) + '</pre></div>';
    } catch (e) {
      replaceOutput.style.display = 'block';
      replaceOutput.innerHTML = '<div class="regex-stats regex-stats-error">Replace error: ' + escHtml(e.message) + '</div>';
    }
  }

  // ─── Show placeholder ─────────────────────────────────────────────────

  function showPlaceholder() {
    placeholder.style.display = 'block';
    stats.style.display = 'none';
    output.style.display = 'none';
    replaceRoot.style.display = 'none';
  }

  function clearAll() {
    patternInput.value = '';
    textInput.value = '';
    replaceInput.value = '';
    showPlaceholder();
    patternInput.focus();
  }

  // ─── Live ─────────────────────────────────────────────────────────────

  let liveTimer = null;

  function liveRun() {
    if (!liveCheck.checked) return;
    if (!patternInput.value.trim() || !textInput.value.trim()) {
      showPlaceholder();
      return;
    }
    run();
  }

  // ─── Events ───────────────────────────────────────────────────────────

  patternInput.addEventListener('input', () => {
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(liveRun, 350);
  });

  textInput.addEventListener('input', () => {
    if (liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(liveRun, 350);
  });

  // Flags change → live re-run
  for (const flag of [flagI, flagG, flagM, flagS, flagU]) {
    flag.addEventListener('change', liveRun);
  }

  textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  });

  patternInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run();
    }
  });

  runBtn.addEventListener('click', run);
  clearBtn.addEventListener('click', clearAll);
  replaceBtn.addEventListener('click', doReplace);

  // ─── Init ─────────────────────────────────────────────────────────────

  patternInput.focus();
})();
</script>

<style>
#regex-root {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 6px;
  overflow: hidden;
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
}

#regex-replace-root {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
  border: 1px solid var(--border, #d0d0d0);
  border-top: none;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
  background: var(--bg, #fff);
  color: var(--text, #1a1a1a);
}

/* ─── Header ──────────────────────────────────────────────────────────── */

.regex-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.regex-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

/* ─── Rows ────────────────────────────────────────────────────────────── */

.regex-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  flex-shrink: 0;
  width: 64px;
}

.regex-pattern-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

#regex-pattern {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  outline: none;
}

#regex-pattern:focus {
  border-color: var(--accent, #4a90d9);
}

#regex-pattern::placeholder {
  color: var(--text-muted, #999);
  font-family: system-ui, -apple-system, sans-serif;
}

/* ─── Flags ───────────────────────────────────────────────────────────── */

.regex-flags {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.regex-flag {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px 6px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 3px;
  background: var(--bg-secondary, #f5f5f5);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 11px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  user-select: none;
  transition: background 0.1s;
}

.regex-flag:hover {
  background: var(--bg-tertiary, #e8e8e8);
}

.regex-flag input {
  margin: 0;
  cursor: pointer;
}

.regex-flag:has(input:checked) {
  background: var(--accent, #4a90d9);
  color: #fff;
  border-color: var(--accent, #4a90d9);
}

/* ─── Input text ──────────────────────────────────────────────────────── */

.regex-input-row {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.regex-input-row .regex-label {
  padding-top: 6px;
}

#regex-input {
  flex: 1;
  min-height: 6rem;
  max-height: 20rem;
  padding: 6px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

#regex-input:focus {
  border-color: var(--accent, #4a90d9);
}

#regex-input::placeholder {
  color: var(--text-muted, #999);
  font-family: system-ui, -apple-system, sans-serif;
}

/* ─── Toolbar ─────────────────────────────────────────────────────────── */

.regex-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
  background: var(--bg-secondary, #f5f5f5);
}

.regex-submit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.regex-live-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  user-select: none;
}

.regex-live-toggle input {
  margin: 0;
  cursor: pointer;
}

/* ─── Buttons ─────────────────────────────────────────────────────────── */

.regex-btn {
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

.regex-btn:hover {
  background: var(--bg-tertiary, #e8e8e8);
}

.regex-btn-primary {
  background: var(--accent, #4a90d9);
  color: #fff;
  border-color: var(--accent, #4a90d9);
  font-weight: 600;
}

.regex-btn-primary:hover {
  opacity: 0.9;
}

/* ─── Stats ───────────────────────────────────────────────────────────── */

#regex-stats {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.regex-stats {
  color: var(--text-secondary, #666);
}

.regex-stats-error {
  color: #e74c3c;
}

.regex-stats-empty {
  color: var(--text-muted, #999);
}

/* ─── Highlighted output ──────────────────────────────────────────────── */

#regex-output {
  max-height: 30vh;
  overflow-y: auto;
}

.regex-highlighted {
  padding: 10px 12px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--bg, #fff);
  border-bottom: 1px solid var(--border, #d0d0d0);
}

.regex-mark {
  background: #f1c40f;
  color: #1a1a1a;
  border-radius: 2px;
  padding: 0 1px;
}

@media (prefers-color-scheme: dark) {
  .regex-mark {
    background: #8e6b00;
    color: #e0e0e0;
  }
}

.regex-no-matches {
  padding: 20px 12px;
  text-align: center;
  color: var(--text-muted, #999);
  font-size: 13px;
}

/* ─── Match details ───────────────────────────────────────────────────── */

.regex-details {
  padding: 4px 0;
}

.regex-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 12px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
  border-bottom: 1px solid var(--border, #f0f0f0);
}

.regex-detail-row:last-child {
  border-bottom: none;
}

.regex-detail-num {
  color: var(--text-muted, #999);
  flex-shrink: 0;
  width: 28px;
}

.regex-detail-pos {
  color: var(--text-muted, #999);
  flex-shrink: 0;
  width: 80px;
}

.regex-detail-val {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text, #1a1a1a);
}

.regex-detail-groups {
  color: var(--text-secondary, #666);
  flex-shrink: 0;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Replace ─────────────────────────────────────────────────────────── */

.regex-replace-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border, #d0d0d0);
}

#regex-replace {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #d0d0d0);
  border-radius: 4px;
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text, #1a1a1a);
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  outline: none;
}

#regex-replace:focus {
  border-color: var(--accent, #4a90d9);
}

#regex-replace::placeholder {
  color: var(--text-muted, #999);
  font-family: system-ui, -apple-system, sans-serif;
}

#regex-replace-output {
  padding: 8px 12px;
}

.regex-replace-result {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.regex-replace-result strong {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #999);
  display: block;
  margin-bottom: 4px;
}

.regex-replace-result pre {
  margin: 0;
  padding: 8px 10px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text, #1a1a1a);
}

/* ─── Placeholder ─────────────────────────────────────────────────────── */

#regex-placeholder {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-muted, #999);
  font-size: 13px;
}

#regex-placeholder kbd {
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  background: var(--bg-tertiary, #e8e8e8);
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid var(--border, #d0d0d0);
  font-size: 12px;
}

/* ─── Dark mode ───────────────────────────────────────────────────────── */

@media (prefers-color-scheme: dark) {
  #regex-root,
  #regex-replace-root {
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

  .regex-detail-row {
    border-bottom-color: #2a2a2a;
  }
}
</style>
