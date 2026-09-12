<script lang="ts">
  import { closeSettings, setMarkdown, settings } from "./settings.svelte";
  import Toggle from "./Toggle.svelte";

  let pane: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (!pane) return;
    if (settings.open && !pane.open) pane.showModal();
    if (!settings.open && pane.open) pane.close();
  });
</script>

<dialog class="sheet" bind:this={pane} aria-labelledby="settings-title" onclose={closeSettings}>
  <header class="top">
    <h2 id="settings-title">Settings</h2>
    <button type="button" class="done" onclick={closeSettings}>Done</button>
  </header>

  <div class="row">
    <div class="copy">
      <p class="name">Markdown</p>
      <p class="hint">Format replies with headings, lists, and code.</p>
    </div>
    <Toggle checked={settings.markdown} label="Markdown" onchange={setMarkdown} />
  </div>
</dialog>

<style>
  .sheet {
    width: min(22.5rem, calc(100vw - 2rem));
    margin: auto;
    padding: 1.15rem 1.2rem 1.25rem;
    border: 1px solid var(--well-edge);
    border-radius: 1.05rem;
    background: var(--well);
    color: var(--ink);
    box-shadow: var(--shadow-focus);
    animation: rise 0.28s var(--ease) both;
  }

  .sheet::backdrop {
    background: color-mix(in srgb, var(--ink) 28%, transparent);
    animation: fade 0.22s var(--ease) both;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.15rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .done {
    height: 1.75rem;
    padding: 0 0.7rem;
    border: 0;
    border-radius: 999px;
    background: var(--send);
    color: var(--send-ink);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: transform 0.12s var(--ease), opacity 0.16s var(--ease);
  }

  .done:hover { opacity: 0.88; }
  .done:active { transform: scale(0.97); }
  .done:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 0.9rem;
    border: 1px solid var(--well-edge);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--ink) 2.5%, var(--well));
  }

  .copy { min-width: 0; }

  .name {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  .hint {
    margin: 0.28rem 0 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--ink-soft);
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(0.55rem) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
