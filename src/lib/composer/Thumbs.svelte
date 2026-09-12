<script lang="ts">
  import type { Pic } from "./images";

  let { images, onremove }: { images: Pic[]; onremove?: (id: string) => void } = $props();
</script>

{#if images.length}
  <ul class="thumbs" class:edit={Boolean(onremove)} data-count={images.length}>
    {#each images as pic (pic.id)}
      <li class="tile">
        <img src={pic.url} alt={pic.name} draggable="false" />
        {#if onremove}
          <button type="button" class="x" aria-label="Remove {pic.name}" onclick={() => onremove(pic.id)}>×</button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  .thumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0 0 0.65rem;
    padding: 0;
    list-style: none;
  }

  .tile {
    position: relative;
    width: 3.5rem;
    height: 3.5rem;
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 0.62rem;
    background: color-mix(in srgb, var(--ink) 6%, var(--well));
    animation: pop 0.28s var(--ease) both;
  }

  .thumbs[data-count="1"] .tile {
    width: 5.25rem;
    height: 5.25rem;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .x {
    position: absolute;
    top: 0.18rem;
    right: 0.18rem;
    width: 1.1rem;
    height: 1.1rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ink) 72%, transparent);
    color: var(--well);
    font-size: 0.85rem;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.12s var(--ease), opacity 0.16s var(--ease);
  }

  .x:hover { opacity: 0.88; }
  .x:active { transform: scale(0.94); }
  .x:focus-visible { outline: 2px solid var(--ink); outline-offset: 1px; }

  @keyframes pop {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
