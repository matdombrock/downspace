<script lang="ts">
  import { login, clearToken } from "./auth";

  interface Props {
    /** Message explaining why the prompt appeared. */
    message?: string;
    ondone?: () => void;
  }

  let { message = "This server requires an access token.", ondone }: Props = $props();

  let token = $state("");
  let error = $state<string | null>(null);
  let busy = $state(false);

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    if (!token.trim() || busy) return;
    busy = true;
    error = null;
    const ok = await login(token.trim());
    busy = false;
    if (ok) {
      token = "";
      ondone?.();
    } else {
      clearToken();
      error = "Invalid token.";
    }
  }

  function dismiss() {
    ondone?.();
  }
</script>

<div class="auth-backdrop">
  <form class="auth-panel" onsubmit={submit}>
    <h2>Downspace</h2>
    <p class="auth-msg">{message}</p>
    <input
      type="password"
      placeholder="Access token"
      autocomplete="current-password"
      bind:value={token}
      disabled={busy}
    />
    {#if error}
      <p class="auth-error">{error}</p>
    {/if}
    <div class="auth-actions">
      <button type="submit" disabled={busy || !token.trim()}>
        {busy ? "Checking…" : "Unlock"}
      </button>
      {#if ondone}
        <button type="button" class="secondary" onclick={dismiss}>Cancel</button>
      {/if}
    </div>
  </form>
</div>

<style>
  .auth-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .auth-panel {
    background: var(--bg, #fff);
    color: var(--fg, #111);
    border: 1px solid var(--border, #ddd);
    border-radius: 10px;
    padding: 1.5rem;
    width: min(22rem, 100%);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .auth-msg {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.75;
  }

  input {
    padding: 0.5rem;
    border: 1px solid var(--border, #ccc);
    border-radius: 6px;
    font: inherit;
    background: transparent;
    color: inherit;
  }

  .auth-error {
    margin: 0;
    color: #d33;
    font-size: 0.8rem;
  }

  .auth-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.45rem 0.9rem;
    border-radius: 6px;
    border: 1px solid var(--border, #ccc);
    background: var(--accent, #4a7);
    color: #fff;
    cursor: pointer;
    font: inherit;
  }

  button.secondary {
    background: transparent;
    color: inherit;
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
