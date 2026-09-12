<script lang="ts">
  import type { Queued } from "./queue.svelte";

  let { item, onundo }: { item: Queued; onundo: () => void } = $props();

  const preview = $derived((() => {
    const text = item.text.replace(/\s+/g, " ").trim();
    if (text) return text.length > 36 ? `${text.slice(0, 35).trimEnd()}…` : text;
    return item.pics.length ? "A few pictures" : "A note";
  })());
</script>

<div class="waiting">
  <p class="copy"><span class="tag">Next</span> {preview}</p>
  <button type="button" class="undo" aria-label="Keep this note in the box" onclick={onundo}>Keep</button>
</div>

<style>
  .waiting {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0 0 0.55rem;
    padding: 0.42rem 0.5rem 0.42rem 0.65rem;
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--ink) 4.5%, var(--well));
    animation: fade 0.22s var(--ease) both;
  }

  .copy {
    min-width: 0;
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.35;
  }

  .tag {
    margin-right: 0.28rem;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .undo {
    flex: 0 0 auto;
    height: 1.55rem;
    padding: 0 0.55rem;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background-color 0.14s var(--ease), color 0.14s var(--ease);
  }

  .undo:hover {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    color: var(--ink);
  }

  .undo:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  @keyframes fade {
    from { opacity: 0; transform: translateY(0.2rem); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
