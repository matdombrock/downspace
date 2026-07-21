<script lang="ts">
  import themes from './themes';
  import type { Theme } from './settings';

  interface Props {
    theme: Theme;
    ontoggle: () => void;
  }

  let { theme, ontoggle }: Props = $props();

  let current = $derived(themes.find(t => t.id === theme));
</script>

<button class="btn-icon theme-btn" onclick={ontoggle} title={current?.label ?? theme}>
  {#if current}
    <i class="fas fa-{current.icon} fa-lg"></i>
  {/if}
</button>

<style>
  .theme-btn {
    color: var(--text-secondary);
  }
  .theme-btn:hover {
    color: var(--text);
  }
</style>
