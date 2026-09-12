<script lang="ts">
  let {
    onclick,
    disabled = false,
    title,
    children,
  }: {
    onclick?: (event: MouseEvent) => void;
    disabled?: boolean;
    title?: string;
    children: import("svelte").Snippet;
  } = $props();
</script>

<button type="button" class="quiet" {disabled} {title} {onclick}>{@render children()}</button>

<style>
  .quiet {
    height: 1.75rem;
    padding: 0 0.7rem;
    border: 1px solid var(--well-edge);
    border-radius: 999px;
    background: transparent;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background-color 0.16s var(--ease), border-color 0.16s var(--ease), transform 0.12s var(--ease);
  }

  .quiet:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .quiet:active:not(:disabled) {
    transform: scale(0.97);
  }

  .quiet:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .quiet:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
</style>
