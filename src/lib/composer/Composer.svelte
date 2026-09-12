<script lang="ts">
  import { autosize } from "./autosize";

  let { value = $bindable(""), disabled = false, onsend }: { value: string; disabled?: boolean; onsend: () => void } = $props();

  const canSend = $derived(!disabled && value.trim().length > 0);

  function submit(event?: SubmitEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onsend();
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }
</script>

<form class="dock" onsubmit={submit}>
  <div class="well">
    <label class="sr" for="composer-input">Message</label>
    <textarea
      id="composer-input"
      name="message"
      rows="2"
      placeholder="Write a message"
      autocomplete="off"
      spellcheck="true"
      disabled={disabled}
      bind:value
      use:autosize={value}
      onkeydown={onkeydown}
    ></textarea>
    <div class="bar">
      <button type="submit" disabled={!canSend}>{disabled ? "Sending" : "Send"}</button>
    </div>
  </div>
</form>

<style>
  .dock {
    flex: 0 0 auto;
    padding: 0.75rem 1.25rem 1.25rem;
  }

  .well {
    max-width: var(--measure);
    margin: 0 auto;
    padding: 0.85rem 0.95rem 0.7rem;
    background: var(--well);
    border: 1px solid var(--well-edge);
    border-radius: 0.9rem;
    box-shadow: var(--shadow);
    transition: box-shadow 0.22s var(--ease), border-color 0.22s var(--ease);
  }

  .well:focus-within {
    border-color: color-mix(in srgb, var(--ink) 28%, var(--well-edge));
    box-shadow: var(--shadow-focus);
  }

  textarea {
    display: block;
    width: 100%;
    min-height: 3.1rem;
    max-height: 12.5rem;
    padding: 0;
    border: 0;
    resize: none;
    background: transparent;
    font-size: 0.96875rem;
    line-height: 1.55;
    letter-spacing: -0.005em;
    outline: none;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  textarea::placeholder {
    color: var(--ink-soft);
    opacity: 0.72;
  }

  .bar {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.55rem;
  }

  button {
    height: 2rem;
    padding: 0 0.9rem;
    border: 0;
    border-radius: 999px;
    background: var(--send);
    color: var(--send-ink);
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: transform 0.12s var(--ease), opacity 0.16s var(--ease), background-color 0.16s var(--ease);
  }

  button:hover:not(:disabled) {
    opacity: 0.88;
  }

  button:active:not(:disabled) {
    transform: scale(0.97);
  }

  button:disabled {
    background: var(--send-disabled);
    color: var(--ink-soft);
    cursor: default;
    opacity: 0.7;
  }

  button:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
