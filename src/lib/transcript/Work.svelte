<script lang="ts">
  import Copy from "$lib/copy/Copy.svelte";
  import type { Work } from "$lib/types/message";

  let { step }: { step: Work } = $props();

  let open = $state(false);
  const body = $derived(step.detail ?? "");
  const canOpen = $derived(Boolean(body));
  const clip = $derived(body || step.label);
  const pane = $derived(`work-${step.id}`);

  function toggle() {
    if (canOpen) open = !open;
  }
</script>

<div class="step" data-status={step.status} data-open={open}>
  <span class="dot" aria-hidden="true"></span>
  <div class="copy">
    {#if canOpen}
      <button type="button" class="head" aria-expanded={open} aria-controls={pane} onclick={toggle}>
        <span class="label">{step.label}</span>
        <span class="chev" aria-hidden="true"></span>
      </button>
    {:else}
      <p class="label">{step.label}</p>
    {/if}

    {#if canOpen}
      <div class="reveal" id={pane} data-open={open} role="region" aria-label={step.label} aria-hidden={!open}>
        <div class="inner">
          <pre class="detail">{body}</pre>
        </div>
      </div>
    {/if}
  </div>
  <div class="take">
    <Copy text={clip} />
  </div>
</div>

<style>
  .step {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    width: 100%;
    padding: 0.18rem 0.2rem;
    color: var(--ink-soft);
    animation: fade 0.28s var(--ease) both;
  }

  .take {
    flex: 0 0 auto;
    margin-left: auto;
    margin-top: 0.12rem;
    opacity: 0;
    transition: opacity 0.16s var(--ease);
  }

  .step:hover .take,
  .step:focus-within .take {
    opacity: 1;
  }

  @media (hover: none) {
    .take { opacity: 0.75; }
  }

  .dot {
    flex: 0 0 auto;
    width: 0.34rem;
    height: 0.34rem;
    margin-top: 0.48rem;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ink) 42%, transparent);
  }

  .step[data-status="running"] .dot {
    background: color-mix(in srgb, var(--ink) 72%, #c4a574);
    animation: pulse 1.15s var(--ease) infinite;
  }

  .step[data-status="done"] .dot {
    opacity: 0.45;
  }

  .step[data-status="error"] {
    color: var(--danger);
  }

  .step[data-status="error"] .dot {
    background: var(--danger);
  }

  .copy { min-width: 0; flex: 1; user-select: text; -webkit-user-select: text; }

  .head {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    max-width: 100%;
    margin: 0;
    padding: 0.08rem 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    border-radius: 0.28rem;
  }

  .head:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 3px;
  }

  .label {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.012em;
    line-height: 1.4;
    color: color-mix(in srgb, var(--ink) 72%, var(--ink-soft));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .head:hover .label {
    color: color-mix(in srgb, var(--ink) 88%, var(--ink-soft));
  }

  .step[data-status="error"] .label { color: var(--danger); }

  .chev {
    flex: 0 0 auto;
    width: 0.32rem;
    height: 0.32rem;
    margin-top: -0.08rem;
    border-right: 1.5px solid color-mix(in srgb, var(--ink) 38%, transparent);
    border-bottom: 1.5px solid color-mix(in srgb, var(--ink) 38%, transparent);
    transform: rotate(-45deg);
    transition: transform 0.22s var(--ease), border-color 0.16s var(--ease);
  }

  .head:hover .chev {
    border-color: color-mix(in srgb, var(--ink) 58%, transparent);
  }

  .head[aria-expanded="true"] .chev {
    margin-top: 0;
    transform: rotate(45deg);
  }

  /* Closed is a line. Open is a little well you can sit with — not a viewer. */
  .reveal {
    display: grid;
    grid-template-rows: 0fr;
    margin-top: 0;
    opacity: 0;
    transition: grid-template-rows 0.28s var(--ease), opacity 0.2s var(--ease), margin-top 0.28s var(--ease);
  }

  .reveal[data-open="true"] {
    grid-template-rows: 1fr;
    margin-top: 0.32rem;
    opacity: 1;
  }

  .inner {
    min-height: 0;
    overflow: hidden;
  }

  .step[data-open="true"] { padding-bottom: 0.22rem; }

  .detail {
    margin: 0;
    width: fit-content;
    max-width: 100%;
    max-height: 8.4rem;
    padding: 0.48rem 0.62rem 0.52rem;
    overflow: auto;
    border: 1px solid color-mix(in srgb, var(--ink) 7%, var(--line));
    border-radius: 0.55rem;
    background: color-mix(in srgb, #c4a574 6%, var(--well));
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--well) 70%, transparent);
    color: color-mix(in srgb, var(--ink) 78%, var(--ink-soft));
    font-family: ui-monospace, "Ubuntu Mono", "Noto Sans Mono", monospace;
    font-size: 0.72rem;
    line-height: 1.5;
    letter-spacing: -0.012em;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }

  .step[data-status="error"] .detail {
    background: color-mix(in srgb, var(--danger) 6%, var(--well));
    border-color: color-mix(in srgb, var(--danger) 18%, var(--line));
    color: var(--danger);
  }

  @media (prefers-reduced-motion: reduce) {
    .chev, .reveal { transition: none; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.35; transform: scale(0.92); }
    50% { opacity: 1; transform: scale(1); }
  }

  @keyframes fade {
    from { opacity: 0; transform: translate3d(0, 0.2rem, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }
</style>
