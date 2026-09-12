<script lang="ts">
  import type { Message } from "$lib/types/message";

  let { messages, busy = false }: { messages: Message[]; busy?: boolean } = $props();

  let pane: HTMLElement | undefined = $state();
  const pendingId = $derived(busy ? messages.findLast((message) => message.role === "assistant")?.id : undefined);

  $effect(() => {
    messages.length;
    messages.at(-1)?.text;
    pane?.scrollTo({ top: pane.scrollHeight });
  });
</script>

<section class="transcript" aria-label="Conversation" bind:this={pane}>
  {#if messages.length === 0}
    <div class="empty">
      <span class="mark" aria-hidden="true"></span>
      <h1>The page is empty.</h1>
      <p>Write below whenever you’re ready.</p>
    </div>
  {:else}
    <ol class="thread">
      {#each messages as message (message.id)}
        <li class="turn" data-role={message.role} data-pending={message.id === pendingId} data-failed={message.failed}>
          <span class="who">{message.role === "user" ? "You" : "Chatpad"}</span>
          <p>{message.text}</p>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .transcript {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    contain: content;
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
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
    max-width: var(--measure);
    margin: 0 auto;
    padding: 1.75rem 1.5rem 2rem;
    list-style: none;
  }

  .turn {
    animation: rise 0.35s var(--ease) both;
  }

  .turn + .turn {
    margin-top: 1.5rem;
  }

  .who {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .turn p {
    margin: 0;
    max-width: none;
    font-size: 0.96875rem;
    line-height: 1.6;
    color: var(--ink);
    text-align: left;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .turn[data-failed="true"] p {
    color: var(--danger);
  }

  .turn[data-pending="true"] p::after {
    content: "▍";
    margin-left: 0.12em;
    opacity: 0.4;
    animation: blink 1s step-end infinite;
  }

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

  @keyframes blink {
    50% { opacity: 0; }
  }
</style>
