<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<div class="root">{@render children()}</div>

<style>
  .root {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
</style>
