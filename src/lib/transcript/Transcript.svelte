<script lang="ts">
  import type { Message } from "$lib/types/message";
  import { follow } from "./follow";
  import Turn from "./Turn.svelte";

  let { messages, busy = false, ready = true }: { messages: Message[]; busy?: boolean; ready?: boolean } = $props();

  const pendingId = $derived(busy ? messages.findLast((message) => message.role === "assistant")?.id : undefined);
</script>

<section class="transcript" aria-label="Conversation" use:follow={messages.length}>
  {#if !ready}
    <div class="empty wait" aria-hidden="true"></div>
  {:else if messages.length === 0}
    <div class="empty">
      <span class="mark" aria-hidden="true"></span>
      <h1>The page is empty.</h1>
      <p>Write below whenever you’re ready.</p>
    </div>
  {:else}
    <ol class="thread">
      {#each messages as message (message.id)}
        <Turn {message} pending={message.id === pendingId} />
      {/each}
    </ol>
  {/if}
</section>

<style>
  .transcript {
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    overscroll-behavior: contain;
    overflow-anchor: none;
    touch-action: pan-y;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }

  .empty.wait {
    animation: none;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 3rem 1.5rem 4rem;
    text-align: center;
    animation: rise 0.7s var(--ease) both;
  }

  .mark {
    width: 0.35rem;
    height: 0.35rem;
    margin-bottom: 1.25rem;
    border-radius: 50%;
    background: var(--ink);
    opacity: 0.35;
  }

  h1 {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 500;
    letter-spacing: -0.025em;
    line-height: 1.25;
  }

  p {
    margin: 0.6rem 0 0;
    max-width: 22rem;
    font-size: 0.9375rem;
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .thread {
    display: flex;
    flex-direction: column;
    max-width: var(--measure);
    margin: 0 auto;
    padding: 1.5rem 1.15rem 1.75rem;
    list-style: none;
  }

  .thread :global(.turn + .turn) {
    margin-top: 0.38rem;
  }

  .thread :global(.turn[data-role="user"] + .turn[data-role="assistant"]),
  .thread :global(.turn[data-role="assistant"] + .turn[data-role="user"]) {
    margin-top: 1.05rem;
  }

  .thread :global(.turn[data-role="user"]:has(+ .turn[data-role="user"]) .bubble) { border-bottom-right-radius: 1.2rem; }
  .thread :global(.turn[data-role="user"] + .turn[data-role="user"] .bubble) { border-top-right-radius: 0.4rem; }
  .thread :global(.turn[data-role="assistant"]:has(+ .turn[data-role="assistant"]) .bubble) { border-bottom-left-radius: 1.2rem; }
  .thread :global(.turn[data-role="assistant"] + .turn[data-role="assistant"] .bubble) { border-top-left-radius: 0.4rem; }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(0.6rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
