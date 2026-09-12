<script lang="ts">
  import { sendPrompt, startAgentListener, stopPrompt } from "$lib/agent/chat";
  import Account from "$lib/auth/Account.svelte";
  import Header from "$lib/chrome/Header.svelte";
  import Composer from "$lib/composer/Composer.svelte";
  import type { DraftPic } from "$lib/composer/images";
  import { conversation } from "$lib/conversation/conversation.svelte";
  import { openFolder, startPersistence } from "$lib/conversation/persist";
  import Transcript from "$lib/transcript/Transcript.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import Folder from "$lib/workspace/Folder.svelte";
  import { workspace } from "$lib/workspace/workspace.svelte";
  import { onMount } from "svelte";

  let draft = $state("");
  let pics = $state<DraftPic[]>([]);

  onMount(() => {
    let stop = () => {};
    let stopPersist = () => {};
    void startAgentListener().then((unlisten) => { stop = unlisten; });
    void startPersistence().then((unlisten) => { stopPersist = unlisten; });
    return () => { stop(); stopPersist(); };
  });

  $effect(() => {
    if (!workspace.ready) return;
    void openFolder(workspace.cwd);
  });

  function send() {
    const text = draft.trim();
    if ((!text && !pics.length) || conversation.busy) return;
    const ready = pics;
    draft = "";
    pics = [];
    void sendPrompt(text, ready);
  }
</script>

<div class="desk">
  <Header>
    {#snippet start()}<Folder />{/snippet}
    {#snippet end()}<Settings /><Account />{/snippet}
  </Header>
  <Transcript messages={conversation.messages} busy={conversation.busy} ready={conversation.ready} />
  <Composer bind:value={draft} bind:pics disabled={conversation.busy} stopping={conversation.stopping} onsend={send} onstop={() => void stopPrompt()} />
</div>

<style>
  /* Header / thread / composer — minmax(0, 1fr) so the middle cannot grow the page. */
  .desk {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-columns: minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--ink) 3.5%, transparent), transparent 70%),
      var(--bg);
  }
</style>
