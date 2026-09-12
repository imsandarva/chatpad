<script lang="ts">
  import { onMount } from "svelte";
  import { inspectPaste, pathsFromWeb } from "./attach";
  import { autosize } from "./autosize";
  import { filesFrom, MAX_PICS, release, toDraft, type DraftPic } from "./images";
  import { clipboardAttach, filesFromPaths, listenFileDrop, type NativePics } from "./native";
  import Thumbs from "./Thumbs.svelte";

  let {
    value = $bindable(""),
    pics = $bindable([] as DraftPic[]),
    disabled = false,
    stopping = false,
    onsend,
    onstop,
  }: {
    value: string;
    pics: DraftPic[];
    disabled?: boolean;
    stopping?: boolean;
    onsend: () => void;
    onstop: () => void;
  } = $props();

  let picker: HTMLInputElement | undefined = $state();
  let hover = $state(0);
  let hint = $state("");
  const canSend = $derived(!disabled && (value.trim().length > 0 || pics.length > 0));
  const note = $derived(pics.length ? "Add a note if you like" : "Write a message");

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

  async function take(files: File[]) {
    if (disabled || !files.length) return;
    hint = "";
    const room = MAX_PICS - pics.length;
    if (room <= 0) {
      hint = "That’s enough pictures for one message.";
      return;
    }
    const next: DraftPic[] = [];
    for (const file of files.slice(0, room)) {
      try { next.push(await toDraft(file)); }
      catch (err) { hint = err instanceof Error && err.message === "too-big" ? "That picture is too large." : "Couldn’t use that picture."; }
    }
    if (next.length) pics = [...pics, ...next];
    if (files.length > room) hint = "That’s enough pictures for one message.";
  }

  async function accept(result: NativePics, emptyHint = false) {
    if (result.files.length) await take(result.files);
    if (result.oversize) hint = "That picture is too large.";
    else if (!result.files.length && emptyHint) hint = "That isn’t a picture.";
  }

  function drop(id: string) {
    const gone = pics.find((pic) => pic.id === id);
    if (gone) release(gone);
    pics = pics.filter((pic) => pic.id !== id);
  }

  async function onpaste(event: ClipboardEvent) {
    const peek = inspectPaste(event);
    if (peek.files.length) {
      if (!peek.hasText) event.preventDefault();
      await take(peek.files);
      return;
    }
    if (peek.paths.length) {
      event.preventDefault();
      await accept(await filesFromPaths(peek.paths), true);
      return;
    }
    if (peek.hasText) return;
    event.preventDefault();
    const native = await clipboardAttach();
    if (native.files.length || native.oversize) await accept(native);
  }

  function ondragenter(event: DragEvent) {
    if (![...event.dataTransfer?.types ?? []].includes("Files")) return;
    event.preventDefault();
    hover += 1;
  }

  function ondragleave() {
    hover = Math.max(0, hover - 1);
  }

  function ondragover(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  }

  async function ondrop(event: DragEvent) {
    event.preventDefault();
    hover = 0;
    const files = event.dataTransfer ? filesFrom(event.dataTransfer) : [];
    if (files.length) { await take(files); return; }
    const paths = pathsFromWeb(event.dataTransfer ?? null);
    if (paths.length) await accept(await filesFromPaths(paths), true);
  }

  onMount(() => {
    let stop = () => {};
    void listenFileDrop((over) => { hover = over ? 1 : 0; }, (pics) => void accept(pics, true)).then((unlisten) => { stop = unlisten; });
    return () => stop();
  });

  $effect(() => {
    if (!disabled) return;
    const onkey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !stopping) {
        event.preventDefault();
        onstop();
      }
    };
    window.addEventListener("keydown", onkey);
    return () => window.removeEventListener("keydown", onkey);
  });
</script>

<form class="dock" onsubmit={submit}>
  <div class="well" class:over={hover > 0} role="group" aria-label="Write a message" {ondragenter} {ondragleave} {ondragover} {ondrop}>
    <Thumbs images={pics} onremove={disabled ? undefined : drop} />
    {#if hint}
      <p class="hint">{hint}</p>
    {:else if hover > 0}
      <p class="hint">Drop to attach</p>
    {/if}
    <label class="sr" for="composer-input">Message</label>
    <textarea
      id="composer-input"
      name="message"
      rows="2"
      placeholder={note}
      autocomplete="off"
      spellcheck="true"
      disabled={disabled}
      bind:value
      use:autosize={value}
      onkeydown={onkeydown}
      {onpaste}
    ></textarea>
    <div class="bar">
      <input class="sr" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple bind:this={picker} disabled={disabled} onchange={() => { if (picker?.files) void take(filesFrom(picker.files)); if (picker) picker.value = ""; }} />
      <button type="button" class="add" disabled={disabled} aria-label="Add a picture" onclick={() => picker?.click()}>+</button>
      {#if disabled}
        <button type="button" class="stop" disabled={stopping} aria-label="Stop this reply" onclick={onstop}>{stopping ? "Stopping" : "Stop"}</button>
      {:else}
        <button type="submit" disabled={!canSend}>Send</button>
      {/if}
    </div>
  </div>
</form>

<style>
  .dock {
    min-width: 0;
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
    transition: box-shadow 0.22s var(--ease), border-color 0.22s var(--ease), background-color 0.22s var(--ease);
  }

  .well:focus-within,
  .well.over {
    border-color: color-mix(in srgb, var(--ink) 28%, var(--well-edge));
    box-shadow: var(--shadow-focus);
  }

  .well.over {
    background: color-mix(in srgb, var(--ink) 4%, var(--well));
  }

  .hint {
    margin: 0 0 0.45rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--ink-soft);
    animation: fade 0.22s var(--ease) both;
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
    align-items: center;
    justify-content: flex-end;
    gap: 0.45rem;
    margin-top: 0.55rem;
  }

  .add {
    margin-right: auto;
    width: 2rem;
    padding: 0;
    background: transparent;
    color: var(--ink-soft);
    font-size: 1.15rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0;
  }

  .add:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ink) 6%, transparent);
    color: var(--ink);
    opacity: 1;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
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
    transition: transform 0.12s var(--ease), opacity 0.16s var(--ease), background-color 0.16s var(--ease), color 0.16s var(--ease);
  }

  .stop::before {
    content: "";
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 0.08rem;
    background: currentColor;
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

  .add:disabled {
    background: transparent;
  }

  button:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
