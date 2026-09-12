<script lang="ts">
  import ChromeButton from "$lib/chrome/ChromeButton.svelte";
  import Sheet from "./Sheet.svelte";
  import { openSettings } from "./settings.svelte";
</script>

<ChromeButton title="Settings" onclick={openSettings}>Settings</ChromeButton>
<Sheet />
