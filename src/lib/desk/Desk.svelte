<script lang="ts">
  import Account from "$lib/auth/Account.svelte";
  import Header from "$lib/chrome/Header.svelte";
  import Composer from "$lib/composer/Composer.svelte";
  import Transcript from "$lib/transcript/Transcript.svelte";
  import type { Message } from "$lib/types/message";

  let draft = $state("");
  let messages = $state<Message[]>([]);

  // Dead shell — the agent is wired in a later step.
  function send() {}
</script>

<div class="desk">
  <Header>
    <Account />
  </Header>
  <Transcript {messages} />
  <Composer bind:value={draft} onsend={send} />
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
