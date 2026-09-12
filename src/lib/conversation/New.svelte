<script lang="ts">
  import ChromeButton from "$lib/chrome/ChromeButton.svelte";
  import { conversation } from "./conversation.svelte";
  import { newChat } from "./persist";

  const blank = $derived(!conversation.messages.length && !conversation.agentId);
  const title = $derived(conversation.busy ? "Wait for this reply to finish" : blank ? "You’re already on a new page" : "Start a new conversation");
</script>

<ChromeButton {title} disabled={conversation.busy || blank || !conversation.ready} onclick={() => void newChat()}>New</ChromeButton>
