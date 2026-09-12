<script lang="ts">
  import ChromeButton from "$lib/chrome/ChromeButton.svelte";
  import { chats } from "./chats.svelte";
  import { conversation } from "./conversation.svelte";
  import { openChat } from "./persist";

  let open = $state(false);
  let root: HTMLDivElement | undefined = $state();

  function close() { open = false; }

  function pick(id: string) {
    close();
    void openChat(id);
  }

  $effect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (root && !root.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  });
</script>

{#if chats.items.length}
  <div class="earlier" bind:this={root}>
    <ChromeButton
      title="Earlier conversations in this folder"
      disabled={conversation.busy}
      aria-expanded={open}
      aria-haspopup="menu"
      onclick={() => { open = !open; }}
    >Earlier</ChromeButton>

    {#if open}
      <div class="menu" role="menu" aria-label="Earlier conversations">
        <p class="lead">Earlier</p>
        {#each chats.items as item (item.id)}
          <button type="button" class="item" role="menuitem" disabled={conversation.busy} onclick={() => pick(item.id)}>
            <span class="name">{item.title}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .earlier {
    position: relative;
  }

  .menu {
    position: absolute;
    top: calc(100% + 0.45rem);
    right: 0;
    z-index: 8;
    display: flex;
    flex-direction: column;
    width: min(18.5rem, 70vw);
    max-height: min(22rem, 60vh);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.45rem;
    border: 1px solid var(--well-edge);
    border-radius: 0.9rem;
    background: var(--well);
    box-shadow: var(--shadow-focus);
    animation: rise 0.22s var(--ease) both;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }

  .lead {
    margin: 0;
    padding: 0.4rem 0.65rem 0.35rem;
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .item {
    display: block;
    width: 100%;
    padding: 0.55rem 0.65rem;
    border: 0;
    border-radius: 0.55rem;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.14s var(--ease);
  }

  .item:hover:not(:disabled),
  .item:focus-visible {
    background: color-mix(in srgb, var(--ink) 5.5%, transparent);
  }

  .item:disabled { cursor: default; opacity: 0.55; }
  .item:focus-visible { outline: none; }

  .name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.35;
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(-0.35rem) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
