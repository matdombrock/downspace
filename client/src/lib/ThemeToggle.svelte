<script lang="ts">
  type Theme = 'light' | 'dark' | 'dark-modern' | 'dark-oled';

  interface Props {
    theme: Theme;
    ontoggle: () => void;
  }

  let { theme, ontoggle }: Props = $props();
</script>

<button class="btn-icon theme-btn" onclick={ontoggle} title="{theme}">
  {#if theme === 'light'}
    <i class="fas fa-sun fa-lg"></i>
  {:else if theme === 'dark-oled'}
    <i class="fas fa-circle fa-lg"></i>
  {:else if theme === 'dark-modern'}
    <i class="fas fa-moon fa-lg"></i>
  {:else}
    <i class="fas fa-moon fa-lg"></i>
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
