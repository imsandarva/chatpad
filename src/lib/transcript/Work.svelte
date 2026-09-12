<script lang="ts">
  import Copy from "$lib/copy/Copy.svelte";
  import type { Work } from "$lib/types/message";

  let { step }: { step: Work } = $props();

  const clip = $derived(step.detail || step.label);
</script>

<div class="step" data-status={step.status}>
  <span class="dot" aria-hidden="true"></span>
  <div class="copy">
    <p class="label">{step.label}</p>
    {#if step.detail}
      <p class="detail">{step.detail}</p>
    {/if}
  </div>
  <div class="take">
    <Copy text={clip} />
  </div>
</div>

<style>
  .step {
    display: flex;
    align-items: baseline;
    gap: 0.55rem;
    width: 100%;
    padding: 0.18rem 0.2rem;
    color: var(--ink-soft);
    animation: fade 0.28s var(--ease) both;
  }

  .take {
    flex: 0 0 auto;
    margin-left: auto;
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
    margin-top: 0.42rem;
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

  .copy { min-width: 0; user-select: text; -webkit-user-select: text; }

  .label {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.012em;
    line-height: 1.4;
    color: color-mix(in srgb, var(--ink) 72%, var(--ink-soft));
  }

  .step[data-status="error"] .label { color: var(--danger); }

  .detail {
    margin: 0.12rem 0 0;
    font-family: ui-monospace, "Ubuntu Mono", "Noto Sans Mono", monospace;
    font-size: 0.72rem;
    line-height: 1.4;
    letter-spacing: -0.01em;
    color: var(--ink-soft);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
