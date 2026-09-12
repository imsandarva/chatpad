<script lang="ts">
  import { writeText } from "./write";

  let { text }: { text: string } = $props();

  let done = $state(false);
  let timer = 0;
  const ready = $derived(Boolean(text.replace(/\s+$/u, "")));

  async function copy() {
    if (!ready || done) return;
    if (!await writeText(text)) return;
    done = true;
    clearTimeout(timer);
    timer = window.setTimeout(() => { done = false; }, 1200);
  }
</script>

{#if ready}
  <button type="button" class="copy-btn" aria-label={done ? "Copied" : "Copy"} onclick={copy}>{done ? "Copied" : "Copy"}</button>
{/if}

<style>
  .copy-btn {
    height: 1.45rem;
    padding: 0 0.45rem;
    border: 0;
    border-radius: 0.4rem;
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.14s var(--ease), color 0.14s var(--ease), opacity 0.16s var(--ease);
  }

  .copy-btn:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    color: var(--ink);
  }

  .copy-btn:active { transform: scale(0.97); }

  .copy-btn:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
</style>
