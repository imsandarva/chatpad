<script lang="ts">
  import { face, matches, same } from "./choice";
  import { model, setModel } from "./model.svelte";
  import Row from "./Row.svelte";

  let { onclose }: { onclose: () => void } = $props();

  let query = $state("");
  let cursor = $state(0);
  let field: HTMLInputElement | undefined = $state();

  const shown = $derived(model.rows.filter((row) => matches(row, query)));
  const counts = $derived(shown.reduce<Record<string, number>>((acc, row) => { acc[row.group] = (acc[row.group] ?? 0) + 1; return acc; }, {}));

  $effect(() => {
    cursor = Math.min(cursor, Math.max(0, shown.length - 1));
    document.getElementById(shown[cursor]?.key ?? "")?.scrollIntoView({ block: "nearest" });
  });

  $effect(() => {
    field?.focus();
  });

  function pickAt(index: number) {
    const row = shown[index];
    if (!row) return;
    setModel({ id: row.id, params: row.params }, face(row));
    onclose();
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") { event.preventDefault(); cursor = Math.min(shown.length - 1, cursor + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); cursor = Math.max(0, cursor - 1); }
    else if (event.key === "Enter") { event.preventDefault(); pickAt(cursor); }
    else if (event.key === "Escape") { event.preventDefault(); onclose(); }
  }
</script>

<div class="menu" role="listbox" aria-label="Models" tabindex="-1" {onkeydown}>
  <label class="sr" for="model-search">Search models</label>
  <input id="model-search" class="find" bind:this={field} bind:value={query} type="search" placeholder="Search models" autocomplete="off" spellcheck="false" onkeydown={onkeydown} />

  {#if model.error}
    <p class="hint">{model.error}</p>
  {:else if model.loading && !model.live}
    <p class="hint">Looking up your models…</p>
  {/if}

  <div class="list">
    {#if !shown.length}
      <p class="hint empty">Nothing matches.</p>
    {:else}
      {#each shown as row, i (row.key)}
        {#if (counts[row.group] ?? 0) > 1 && (i === 0 || shown[i - 1].group !== row.group)}
          <p class="group">{row.group}</p>
        {/if}
        <Row option={row} current={same(row, model.pick)} active={i === cursor} onpick={() => pickAt(i)} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    min-width: 16.5rem;
    max-width: min(20.5rem, calc(100vw - 1.5rem));
    max-height: min(22rem, calc(100vh - 6.5rem));
    padding: 0.45rem;
    border: 1px solid var(--well-edge);
    border-radius: 0.85rem;
    background: var(--well);
    box-shadow: var(--shadow-focus);
    animation: rise 0.2s var(--ease) both;
  }

  .find {
    width: 100%;
    height: 2rem;
    margin: 0 0 0.3rem;
    padding: 0 0.65rem;
    border: 0;
    border-radius: 0.55rem;
    background: color-mix(in srgb, var(--ink) 5%, var(--well));
    font-size: 0.8125rem;
    letter-spacing: -0.01em;
    outline: none;
  }

  .find:focus { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 18%, var(--well-edge)); }
  .find::placeholder { color: var(--ink-soft); opacity: 0.8; }

  .list {
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .group {
    margin: 0.45rem 0.35rem 0.2rem;
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .hint {
    margin: 0.15rem 0.45rem 0.4rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--ink-soft);
  }

  .empty { margin: 0.55rem 0.45rem 0.65rem; }

  @keyframes rise {
    from { opacity: 0; transform: translateY(0.35rem) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
