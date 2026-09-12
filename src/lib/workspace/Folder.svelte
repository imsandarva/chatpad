<script lang="ts">
  import ChromeButton from "$lib/chrome/ChromeButton.svelte";
  import { onMount } from "svelte";
  import { conversation } from "$lib/conversation/conversation.svelte";
  import { folderName, loadWorkspace, pickFolder, workspace } from "./workspace.svelte";

  onMount(() => { void loadWorkspace(); });

  const name = $derived(folderName(workspace.cwd));
</script>

<div class="folder">
  {#if workspace.error}
    <p class="error" role="alert">{workspace.error}</p>
  {/if}
  <ChromeButton title={workspace.cwd} disabled={conversation.busy} onclick={() => void pickFolder()}>{name}</ChromeButton>
</div>

<style>
  .folder {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    animation: rise 0.35s var(--ease) both;
  }

  .error {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.2;
    color: var(--danger);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(0.2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
