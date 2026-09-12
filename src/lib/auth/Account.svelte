<script lang="ts">
  import ChromeButton from "$lib/chrome/ChromeButton.svelte";
  import { onMount } from "svelte";
  import { auth, refresh, signIn, signOut } from "./session.svelte";

  onMount(() => { void refresh(); });

  const signedIn = $derived(auth.session.status === "logged-in");
</script>

<div class="account">
  {#if auth.error}
    <p class="error" role="alert">{auth.error}</p>
  {/if}

  {#if signedIn && auth.session.status === "logged-in"}
    <p class="who" title={auth.session.email}>{auth.session.name}</p>
    <ChromeButton disabled={auth.busy} onclick={() => void signOut()}>Sign out</ChromeButton>
  {:else}
    <ChromeButton disabled={auth.busy} onclick={() => void signIn()}>
      {auth.waiting ? "Waiting for Cursor…" : "Sign in"}
    </ChromeButton>
  {/if}
</div>

<style>
  .account {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.65rem;
    min-width: 0;
  }

  .who {
    margin: 0;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1;
    animation: rise 0.35s var(--ease) both;
  }

  .error {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.2;
    color: var(--danger);
    animation: rise 0.3s var(--ease) both;
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
