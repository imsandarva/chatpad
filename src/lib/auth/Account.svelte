<script lang="ts">
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
    <button type="button" class="quiet" disabled={auth.busy} onclick={() => void signOut()}>
      Sign out
    </button>
  {:else}
    <button type="button" class="quiet" disabled={auth.busy} onclick={() => void signIn()}>
      {auth.busy ? "Waiting for Cursor…" : "Sign in"}
    </button>
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

  .quiet {
    height: 1.75rem;
    padding: 0 0.7rem;
    border: 1px solid var(--well-edge);
    border-radius: 999px;
    background: transparent;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background-color 0.16s var(--ease), border-color 0.16s var(--ease), transform 0.12s var(--ease);
  }

  .quiet:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .quiet:active:not(:disabled) {
    transform: scale(0.97);
  }

  .quiet:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .quiet:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
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
