<script lang="ts">
  import { sendPrompt, startAgentListener, stopPrompt } from "$lib/agent/chat";
  import Account from "$lib/auth/Account.svelte";
  import Header from "$lib/chrome/Header.svelte";
  import Composer from "$lib/composer/Composer.svelte";
  import { conversation } from "$lib/conversation/conversation.svelte";
  import Transcript from "$lib/transcript/Transcript.svelte";
  import Folder from "$lib/workspace/Folder.svelte";
  import { onMount } from "svelte";

  let draft = $state("");

  onMount(() => {
    let stop = () => {};
    void startAgentListener().then((unlisten) => { stop = unlisten; });
    return () => stop();
  });

  function send() {
    const text = draft.trim();
    if (!text || conversation.busy) return;
    draft = "";
    void sendPrompt(text);
  }
</script>

<div class="desk">
  <Header>
    {#snippet start()}<Folder />{/snippet}
    {#snippet end()}<Account />{/snippet}
  </Header>
  <Transcript messages={conversation.messages} busy={conversation.busy} />
  <Composer bind:value={draft} disabled={conversation.busy} stopping={conversation.stopping} onsend={send} onstop={() => void stopPrompt()} />
</div>

<style>
  .desk {
    display: flex;
    flex-direction: column;
    height: 100%;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--ink) 3.5%, transparent), transparent 70%),
      var(--bg);
  }
</style>
