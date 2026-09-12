<script lang="ts">
  import { settings } from "$lib/settings/settings.svelte";
  import type { Message } from "$lib/types/message";
  import Body from "./Body.svelte";

  let { message, pending = false }: { message: Message; pending?: boolean } = $props();

  const mine = $derived(message.role === "user");
  const who = $derived(mine ? "You" : "Cursor");
  const text = $derived(message.text || (message.stopped ? "You stopped this reply." : ""));
</script>

<li
  class="turn"
  data-role={message.role}
  data-pending={pending}
  data-failed={message.failed}
  data-stopped={message.stopped}
>
  <span class="sr">{who}</span>
  <div class="bubble">
    <Body
      {text}
      markdown={settings.markdown && !mine && Boolean(message.text)}
      {pending}
      quiet={Boolean(message.stopped && !message.text)}
      failed={Boolean(message.failed)}
    />
  </div>
</li>

<style>
  .turn {
    display: flex;
    flex-direction: column;
    max-width: min(76%, 32rem);
    animation: rise 0.32s var(--ease) both;
  }

  .turn[data-role="user"] {
    --bubble-ink: var(--send-ink);
    align-self: flex-end;
    align-items: flex-end;
    animation-name: rise-mine;
  }

  .turn[data-role="assistant"] {
    --bubble-ink: var(--ink);
    align-self: flex-start;
    align-items: flex-start;
    animation-name: rise-theirs;
  }

  .bubble {
    padding: 0.62rem 0.92rem 0.68rem;
    border-radius: 1.2rem;
    transition: border-radius 0.18s var(--ease);
  }

  .turn[data-role="user"] .bubble {
    background: var(--send);
    color: var(--send-ink);
    border-bottom-right-radius: 0.32rem;
    box-shadow: 0 1px 1px rgba(26, 25, 22, 0.06), 0 6px 16px rgba(26, 25, 22, 0.08);
  }

  .turn[data-role="assistant"] .bubble {
    background: color-mix(in srgb, var(--ink) 3.2%, var(--well));
    border: 1px solid var(--well-edge);
    border-bottom-left-radius: 0.32rem;
    box-shadow: 0 1px 1px rgba(26, 25, 22, 0.03);
  }

  .turn[data-failed="true"] .bubble {
    background: color-mix(in srgb, var(--danger) 8%, var(--well));
    border-color: color-mix(in srgb, var(--danger) 28%, var(--well-edge));
  }

  .turn[data-stopped="true"] .bubble {
    opacity: 0.82;
  }

  @keyframes rise-theirs {
    from { opacity: 0; transform: translate3d(-0.4rem, 0.35rem, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes rise-mine {
    from { opacity: 0; transform: translate3d(0.4rem, 0.35rem, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @media (prefers-color-scheme: dark) {
    .turn[data-role="user"] .bubble {
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2), 0 8px 18px rgba(0, 0, 0, 0.18);
    }

    .turn[data-role="assistant"] .bubble {
      box-shadow: none;
    }
  }
</style>
