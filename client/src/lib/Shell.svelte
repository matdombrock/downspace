<script lang="ts">
  let command = $state('');
  let stdout = $state('');
  let stderr = $state('');
  let exitCode = $state<number | null>(null);
  let running = $state(false);
  let error = $state<string | null>(null);

  async function run() {
    const cmd = command.trim();
    if (!cmd) return;

    running = true;
    error = null;
    stdout = '';
    stderr = '';
    exitCode = null;

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
      stdout = data.stdout || '';
      stderr = data.stderr || '';
      exitCode = data.exitCode;
    } catch (e: any) {
      error = e.message;
    } finally {
      running = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      run();
    }
  }

  function clearOutput() {
    stdout = '';
    stderr = '';
    exitCode = null;
    error = null;
  }
</script>

<div class="shell">
  <div class="shell-header">
    <span class="shell-title"><i class="fas fa-terminal"></i> Shell</span>
    <button class="btn-icon" title="Clear" onclick={clearOutput}>
      <i class="fas fa-eraser"></i>
    </button>
  </div>

  <div class="shell-input-row">
    <input
      class="shell-input"
      type="text"
      placeholder="Enter a command…"
      bind:value={command}
      onkeydown={handleKeydown}
      disabled={running}
    />
    <button class="btn btn-primary" onclick={run} disabled={running || !command.trim()}>
      {#if running}
        <i class="fas fa-spinner fa-spin"></i>
      {:else}
        <i class="fas fa-play"></i>
      {/if}
      Run
    </button>
  </div>

  {#if error}
    <div class="shell-error">{error}</div>
  {/if}

  {#if stdout || stderr || exitCode !== null}
    <div class="shell-output">
      {#if exitCode !== null}
        <div class="shell-exit-code" class:success={exitCode === 0} class:fail={exitCode !== 0}>
          <i class="fas fa-{exitCode === 0 ? 'check-circle' : 'exclamation-circle'}"></i>
          Exit code: {exitCode}
        </div>
      {/if}
      {#if stdout}
        <pre class="shell-stdout">{stdout}</pre>
      {/if}
      {#if stderr}
        <pre class="shell-stderr">{stderr}</pre>
      {/if}
    </div>
  {:else if !running}
    <div class="shell-placeholder">
      <p>Type a command and press <kbd>Ctrl+Enter</kbd> or click <strong>Run</strong>.</p>
    </div>
  {/if}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .shell-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .shell-title {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-secondary);
  }

  .shell-input-row {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }

  .shell-input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-secondary);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 13px;
    outline: none;
  }

  .shell-input:focus {
    border-color: var(--accent);
  }

  .shell-input::placeholder {
    color: var(--text-muted);
    font-family: var(--font);
  }

  .shell-error {
    margin: 8px 12px 0;
    padding: 6px 10px;
    background: var(--danger);
    color: white;
    border-radius: var(--radius);
    font-size: 13px;
  }

  .shell-output {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
  }

  .shell-exit-code {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: var(--radius);
    margin-bottom: 8px;
  }

  .shell-exit-code.success {
    color: #2ecc71;
  }

  .shell-exit-code.fail {
    color: var(--danger);
  }

  .shell-stdout {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--bg-secondary);
    padding: 10px;
    border-radius: var(--radius);
    overflow-x: auto;
  }

  .shell-stderr {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--bg-secondary);
    padding: 10px;
    border-radius: var(--radius);
    overflow-x: auto;
    color: var(--danger);
    margin-top: 4px;
  }

  .shell-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 13px;
    text-align: center;
    padding: 24px;
  }

  .shell-placeholder kbd {
    font-family: var(--font-mono);
    background: var(--bg-tertiary);
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid var(--border);
    font-size: 12px;
  }
</style>
