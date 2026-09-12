<script lang="ts">
  let { start, end }: { start?: import("svelte").Snippet; end?: import("svelte").Snippet } = $props();
</script>

<header class="header">
  <div class="lead">
    <p class="wordmark">Chatpad</p>
    {@render start?.()}
  </div>
  <div class="actions">{@render end?.()}</div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    height: 3.25rem;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--line);
  }

  .lead,
  .actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .actions {
    justify-content: flex-end;
  }

  .wordmark {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1;
  }
</style>
