<script lang="ts">
  import { blocks } from "$lib/copy/blocks";
  import { renderMarkdown } from "$lib/markdown/render";

  let {
    text,
    markdown = false,
    pending = false,
    quiet = false,
    failed = false,
  }: {
    text: string;
    markdown?: boolean;
    pending?: boolean;
    quiet?: boolean;
    failed?: boolean;
  } = $props();

  const html = $derived(markdown && text ? renderMarkdown(text) : "");
</script>

{#if markdown && text}
  <div class="md" class:quiet class:failed data-pending={pending} use:blocks={html}>{@html html}</div>
{:else}
  <p class:quiet class:failed data-pending={pending}>{text}</p>
{/if}

<style>
  p,
  .md {
    margin: 0;
    font-size: 0.96875rem;
    line-height: 1.6;
    color: var(--bubble-ink, var(--ink));
    overflow-wrap: anywhere;
  }

  p {
    white-space: pre-wrap;
  }

  .quiet { color: var(--ink-soft); }
  .failed,
  :global(.turn[data-failed="true"]) p { color: var(--danger); }

  p[data-pending="true"]::after,
  .md[data-pending="true"]::after {
    content: "▍";
    margin-left: 0.12em;
    color: currentColor;
    opacity: 0.4;
    animation: blink 1s step-end infinite;
  }

  .md :global(> :first-child) { margin-top: 0; }
  .md :global(> :last-child) { margin-bottom: 0; }

  .md :global(p) {
    margin: 0 0 0.7em;
    line-height: 1.6;
  }

  .md :global(h1),
  .md :global(h2),
  .md :global(h3) {
    margin: 1em 0 0.4em;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }

  .md :global(h1) { font-size: 1.2rem; }
  .md :global(h2) { font-size: 1.08rem; }
  .md :global(h3) { font-size: 1rem; }

  .md :global(ul),
  .md :global(ol) {
    margin: 0 0 0.7em;
    padding-left: 1.25rem;
  }

  .md :global(li) { margin: 0.2em 0; }
  .md :global(li + li) { margin-top: 0.15em; }

  .md :global(blockquote) {
    margin: 0 0 0.7em;
    padding: 0.1em 0 0.1em 0.75rem;
    border-left: 2px solid color-mix(in srgb, var(--ink) 18%, transparent);
    color: var(--ink-soft);
  }

  .md :global(a) {
    color: inherit;
    text-underline-offset: 0.12em;
  }

  .md :global(code) {
    font-family: ui-monospace, "Ubuntu Mono", "Noto Sans Mono", monospace;
    font-size: 0.86em;
    padding: 0.1em 0.35em;
    border-radius: 0.28rem;
    background: color-mix(in srgb, var(--ink) 7%, var(--well));
  }

  .md :global(pre) {
    position: relative;
    margin: 0 0 0.8em;
    padding: 0.75rem 0.85rem;
    overflow-x: auto;
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--ink) 5.5%, var(--paper));
    border: 1px solid var(--line);
  }

  .md :global(pre.copyable) {
    padding-top: 2rem;
  }

  .md :global(pre > .copy-btn) {
    position: absolute;
    top: 0.35rem;
    right: 0.4rem;
    z-index: 1;
    height: 1.45rem;
    padding: 0 0.45rem;
    border: 0;
    border-radius: 0.4rem;
    background: color-mix(in srgb, var(--well) 82%, transparent);
    color: var(--ink-soft);
    font: 500 0.6875rem var(--font);
    letter-spacing: 0.02em;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.16s var(--ease), color 0.14s var(--ease), background-color 0.14s var(--ease);
  }

  .md :global(pre:hover > .copy-btn),
  .md :global(pre:focus-within > .copy-btn),
  .md :global(pre > .copy-btn:focus-visible) {
    opacity: 1;
  }

  .md :global(pre > .copy-btn:hover) {
    background: var(--well);
    color: var(--ink);
  }

  .md :global(pre > .copy-btn:focus-visible) {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  @media (hover: none) {
    .md :global(pre > .copy-btn) { opacity: 0.8; }
  }

  .md :global(pre code) {
    padding: 0;
    background: none;
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .md :global(hr) {
    margin: 1rem 0;
    border: 0;
    border-top: 1px solid var(--line);
  }

  .md :global(strong) { font-weight: 600; }
  .md :global(em) { font-style: italic; }

  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
