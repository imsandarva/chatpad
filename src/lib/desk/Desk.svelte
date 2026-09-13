<script lang="ts">
  import { sendPrompt, startAgentListener, stopPrompt } from "$lib/agent/chat";
  import Account from "$lib/auth/Account.svelte";
  import { auth } from "$lib/auth/session.svelte";
  import Header from "$lib/chrome/Header.svelte";
  import Composer from "$lib/composer/Composer.svelte";
  import { MAX_PICS, release, type DraftPic } from "$lib/composer/images";
  import { offer, take } from "$lib/composer/queue.svelte";
  import { conversation } from "$lib/conversation/conversation.svelte";
  import Earlier from "$lib/conversation/Earlier.svelte";
  import New from "$lib/conversation/New.svelte";
  import { openFolder, startPersistence } from "$lib/conversation/persist";
  import { forgetCatalog, warmCatalog } from "$lib/model/model.svelte";
  import Settings from "$lib/settings/Settings.svelte";
  import Transcript from "$lib/transcript/Transcript.svelte";
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

  $effect(() => {
    if (auth.session.status === "logged-in") void warmCatalog();
    else forgetCatalog();
  });

  function send() {
    const text = draft.trim();
    if (!text && !pics.length) return;
    const ready = pics;
    if (conversation.busy) {
      if (!offer(text, ready)) return;
      draft = "";
      pics = [];
      return;
    }
    draft = "";
    pics = [];
    void sendPrompt(text, ready);
  }

  function keep() {
    const next = take();
    if (!next) return;
    draft = [next.text, draft].filter(Boolean).join("\n");
    const merged = [...next.pics, ...pics];
    pics = merged.slice(0, MAX_PICS);
    for (const pic of merged.slice(MAX_PICS)) release(pic);
  }
</script>

<div class="desk">
  <Header>
    {#snippet start()}<Folder />{/snippet}
    {#snippet end()}<New /><Earlier /><Settings /><Account />{/snippet}
  </Header>
  <Transcript messages={conversation.messages} busy={conversation.busy} ready={conversation.ready} />
  <Composer bind:value={draft} bind:pics busy={conversation.busy} stopping={conversation.stopping} onsend={send} onstop={() => void stopPrompt()} onkeep={keep} />
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
