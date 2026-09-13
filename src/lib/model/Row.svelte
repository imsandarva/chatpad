<script lang="ts">
  import type { Option } from "./types";

  let {
    option,
    current = false,
    active = false,
    onpick,
  }: { option: Option; current?: boolean; active?: boolean; onpick: () => void } = $props();
</script>

<button
  type="button"
  class="row"
  class:on={current}
  class:go={active}
  role="option"
  id={option.key}
  aria-selected={current}
  onclick={onpick}
>
  <span class="name">{option.label}</span>
  {#if option.note && option.note !== option.label && option.note !== option.group}
    <span class="note">{option.note}</span>
  {/if}
</button>

<style>
  .row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.12rem;
    width: 100%;
    min-height: 2.05rem;
    padding: 0.42rem 0.65rem;
    border: 0;
    border-radius: 0.55rem;
    background: transparent;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.14s var(--ease), transform 0.12s var(--ease);
  }

  .row.go:not(.on) { background: color-mix(in srgb, var(--ink) 6%, transparent); }
  .row.on {
    background: color-mix(in srgb, var(--ink) 8.5%, var(--well));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 8%, var(--well-edge));
  }
  .row:hover:not(.on) { background: color-mix(in srgb, var(--ink) 5%, transparent); }
  .row:active { transform: scale(0.992); }
  .row:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }

  .name {
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.25;
  }

  .note {
    font-size: 0.6875rem;
    line-height: 1.3;
    color: var(--ink-soft);
  }
</style>
