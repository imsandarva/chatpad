<script lang="ts">
  // Trailing slot is reserved for login and folder later.
  let { children }: { children?: import("svelte").Snippet } = $props();
</script>

<header class="header">
  <p class="wordmark">Chatpad</p>
  <div class="actions">{@render children?.()}</div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    height: 3.25rem;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--line);
  }

  .wordmark {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1rem;
  }
</style>
