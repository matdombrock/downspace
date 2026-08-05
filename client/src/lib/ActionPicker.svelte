<script lang="ts">
  import { onMount } from 'svelte';
  import type { Action } from './actions';

  interface Props {
    actions: Action[];
    onClose: () => void;
    onPick: (action: Action) => void;
  }

  let { actions, onClose, onPick }: Props = $props();

  let query = $state('');
  let highlight = $state(0);
  let searchInput: HTMLInputElement;

  onMount(() => {
    searchInput?.focus();
  });

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) =>
      [a.title, a.description ?? '', ...(a.keywords ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  });

  $effect(() => {
    if (highlight >= filtered.length) {
      highlight = Math.max(0, filtered.length - 1);
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight = Math.min(filtered.length - 1, highlight + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight = Math.max(0, highlight - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filtered[highlight];
      if (action) onPick(action);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="action-overlay"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}
>
  <div class="action-picker" role="dialog" aria-label="Actions">
    <div class="action-picker-header">
      <h3><i class="fas fa-bolt"></i> Actions</h3>
      <input
        type="text"
        placeholder="Search actions…"
        bind:this={searchInput}
        bind:value={query}
      />
    </div>
    <ul class="action-list">
      {#if filtered.length === 0}
        <li class="action-empty">No actions match "{query}"</li>
      {:else}
        {#each filtered as action, i (action.id)}
          <li class:selected={i === highlight}>
            <button
              class="action-item"
              onclick={() => onPick(action)}
              onmouseenter={() => (highlight = i)}
            >
              <span class="action-icon"
                ><i class="fas {action.icon ?? 'fa-bolt'}"></i></span
              >
              <span class="action-info">
                <span class="action-title">{action.title}</span>
                {#if action.description}
                  <span class="action-desc">{action.description}</span>
                {/if}
              </span>
            </button>
          </li>
        {/each}
      {/if}
    </ul>
    <div class="action-picker-footer">
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
      <span><kbd>Enter</kbd> run</span>
      <span><kbd>Esc</kbd> close</span>
    </div>
  </div>
</div>

<style>
  .action-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 40;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 12vh 16px 16px;
  }

  .action-picker {
    width: min(460px, 100%);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow), 0 8px 30px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    max-height: 70vh;
    overflow: hidden;
  }

  .action-picker-header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  .action-picker-header h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: var(--text);
  }

  .action-picker-header h3 i {
    margin-right: 6px;
    color: var(--accent);
  }

  .action-picker-header input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-secondary);
    color: var(--text);
    font-size: 14px;
    outline: none;
  }

  .action-picker-header input:focus {
    border-color: var(--accent);
  }

  .action-list {
    list-style: none;
    margin: 0;
    padding: 6px;
    overflow-y: auto;
  }

  .action-list li {
    margin: 0;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: none;
    border-radius: var(--radius);
    cursor: pointer;
    text-align: left;
    color: var(--text);
  }

  .action-item:hover,
  li.selected .action-item {
    background: var(--bg-tertiary);
  }

  .action-icon {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius);
    background: var(--bg-secondary);
    color: var(--accent);
    font-size: 15px;
  }

  .action-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .action-title {
    font-size: 14px;
    font-weight: 500;
  }

  .action-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .action-empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
  }

  .action-picker-footer {
    display: flex;
    gap: 14px;
    padding: 8px 16px;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--text-muted);
  }

  .action-picker-footer kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 1px 4px;
    margin-right: 3px;
  }
</style>
