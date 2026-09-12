<script lang="ts">
  import { attach } from "./bind";

  let { port }: { port?: HTMLElement } = $props();
  let track: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!port || !track) return;
    return attach(port, track);
  });
</script>

<div
  class="track"
  bind:this={track}
  role="scrollbar"
  aria-orientation="vertical"
  aria-controls="conversation"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="0"
  aria-label="Conversation"
  aria-hidden="true"
  tabindex="-1"
>
  <div class="thumb"></div>
</div>

<style>
  .track {
    position: absolute;
    top: 0.55rem;
    right: 0.12rem;
    bottom: 0.55rem;
    width: 0.85rem;
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    touch-action: none;
    cursor: pointer;
    transition: opacity 0.22s var(--ease);
  }

  .track:global(.on) {
    opacity: 1;
    pointer-events: auto;
  }

  .track::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 0.14rem;
    transform: translateX(-50%);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ink) 9%, transparent);
    opacity: 0;
    transition: opacity 0.2s var(--ease), width 0.2s var(--ease);
  }

  .track:global(.on):hover::before,
  .track:global(.held)::before {
    opacity: 1;
    width: 0.2rem;
  }

  .thumb {
    position: absolute;
    top: 0;
    left: 50%;
    width: 0.22rem;
    margin-left: -0.11rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ink) 30%, transparent);
    transition: width 0.18s var(--ease), margin-left 0.18s var(--ease), background 0.18s var(--ease);
  }

  .track:hover .thumb,
  .track:global(.held) .thumb {
    width: 0.4rem;
    margin-left: -0.2rem;
    background: color-mix(in srgb, var(--ink) 48%, transparent);
  }

  .track:global(.held) .thumb {
    background: color-mix(in srgb, var(--ink) 58%, transparent);
  }

  .track:focus-visible {
    outline: none;
  }

  .track:focus-visible .thumb {
    box-shadow: 0 0 0 2px var(--bg), 0 0 0 3.5px color-mix(in srgb, var(--ink) 45%, transparent);
  }
</style>
