<script lang="ts">
  import { conversation } from "$lib/conversation/conversation.svelte";
  import { faceOf, model, warmCatalog } from "./model.svelte";
  import Menu from "./Menu.svelte";
  import { above } from "./place";

  let open = $state(false);
  let root: HTMLDivElement | undefined = $state();
  let face: HTMLButtonElement | undefined = $state();
  let box = $state({ left: 0, bottom: 0, width: 328, maxHeight: 352 });
  const locked = $derived(conversation.busy);

  function layout() {
    if (face) box = above(face);
  }

  function toggle() {
    if (locked) return;
    open = !open;
    if (open) {
      layout();
      void warmCatalog(true);
    }
  }

  function close() { open = false; }

  $effect(() => {
    if (!open) return;
    layout();
    const onptr = (event: PointerEvent) => {
      if (root && !root.contains(event.target as Node)) close();
    };
    const onkey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", onptr);
    window.addEventListener("keydown", onkey);
    window.addEventListener("resize", layout);
    return () => {
      window.removeEventListener("pointerdown", onptr);
      window.removeEventListener("keydown", onkey);
      window.removeEventListener("resize", layout);
    };
  });
</script>

<div class="pick" class:off={locked} bind:this={root}>
  <button
    type="button"
    class="face"
    bind:this={face}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label="Model"
    title={model.error || "Who writes back"}
    disabled={locked}
    onclick={toggle}
  >
    <span class="name">{faceOf()}</span>
    <span class="chev" aria-hidden="true"></span>
  </button>
  {#if open}
    <div class="pop" style="left:{box.left}px;bottom:{box.bottom}px;width:{box.width}px;height:{box.maxHeight}px">
      <Menu onclose={close} />
    </div>
  {/if}
</div>

<style>
  .pick { position: relative; min-width: 0; }

  .face {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    max-width: 11.5rem;
    height: 2rem;
    padding: 0 0.55rem 0 0.65rem;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--ink-soft);
    cursor: pointer;
    transition: background-color 0.16s var(--ease), color 0.16s var(--ease), transform 0.12s var(--ease);
  }

  .face:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    color: var(--ink);
  }

  .face[aria-expanded="true"] {
    background: color-mix(in srgb, var(--ink) 7%, transparent);
    color: var(--ink);
  }

  .face:active:not(:disabled) { transform: scale(0.97); }
  .face:disabled { cursor: default; opacity: 0.55; }
  .face:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

  .name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1;
  }

  .chev {
    flex: 0 0 auto;
    width: 0.34rem;
    height: 0.34rem;
    margin-top: -0.12rem;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg);
    opacity: 0.7;
  }

  .pop {
    position: fixed;
    z-index: 40;
    display: flex;
    flex-direction: column;
  }

  .off { pointer-events: none; }
</style>
