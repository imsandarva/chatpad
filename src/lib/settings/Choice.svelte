<script lang="ts">
  import { models, type ModelId } from "./models";

  let {
    value,
    disabled = false,
    onchange,
  }: { value: ModelId; disabled?: boolean; onchange: (id: ModelId) => void } = $props();

  const hint = $derived(models.find((model) => model.id === value)?.hint ?? "");
</script>

<div class="choice" class:off={disabled}>
  <div class="pick" role="radiogroup" aria-label="Model" aria-disabled={disabled}>
    {#each models as model (model.id)}
      <button
        type="button"
        class="opt"
        role="radio"
        aria-checked={value === model.id}
        disabled={disabled}
        onclick={() => onchange(model.id)}
      >{model.label}</button>
    {/each}
  </div>
  <p class="hint">{hint}</p>
</div>

<style>
  .choice { min-width: 0; }

  .pick {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.16rem;
    padding: 0.16rem;
    border-radius: 0.7rem;
    background: color-mix(in srgb, var(--ink) 5.5%, var(--well));
  }

  .opt {
    height: 1.85rem;
    padding: 0 0.35rem;
    border: 0;
    border-radius: 0.56rem;
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.16s var(--ease), color 0.16s var(--ease), box-shadow 0.16s var(--ease), transform 0.12s var(--ease);
  }

  .opt[aria-checked="true"] {
    background: var(--well);
    color: var(--ink);
    box-shadow: 0 1px 1px rgba(26, 25, 22, 0.06), 0 4px 10px rgba(26, 25, 22, 0.06);
  }

  .opt:hover:not(:disabled):not([aria-checked="true"]) {
    color: color-mix(in srgb, var(--ink) 78%, var(--ink-soft));
  }

  .opt:active:not(:disabled) { transform: scale(0.98); }

  .opt:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .opt:disabled { cursor: default; }

  .hint {
    margin: 0.45rem 0 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--ink-soft);
  }

  .off { opacity: 0.55; }

  @media (prefers-color-scheme: dark) {
    .opt[aria-checked="true"] {
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), 0 6px 14px rgba(0, 0, 0, 0.16);
    }
  }
</style>
