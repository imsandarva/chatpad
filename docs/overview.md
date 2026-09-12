# Overview

Chatpad is a small Ubuntu app for talking to the Cursor agent. It is not an IDE and not a terminal. It is a desk you sit at to write.

## Problem

The Cursor CLI is light, but the prompt is not a real text field. Long messages are painful: no word-jump, no word-delete, pastes collapse to `[pasted x characters]`, images have no preview, and selecting text fights the TUI.

`$EDITOR` (Ctrl+G) and vim mode are workarounds. The IDE has a proper composer and also loads a whole editor. Chatpad is the composer without that weight.

## Product

A native window with:

- a conversation transcript — yours on the right, Cursor’s on the left
- a real composer — word motions, full paste, selection
- the official Cursor agent behind Send (`@cursor/sdk`, local runtime, your Cursor account)

Same agent, machine, folders, and usage pool as the CLI and the IDE. Not a code editor. Large diffs still belong in the project. Daily ask / tell / paste / go lives here.

The composer is the product. The rest of the window exists so writing has somewhere to go.

## Now, and next

The first useful cut is in: sign in, pick a folder, write, get a streamed reply, and Stop. Markdown can be on or off. The thread is a normal chat.

Still ahead, one at a time: show the work the agent is doing, pictures in the composer, and keeping the thread when the window closes. See [next steps](./next_steps.md).

The long aim is that this desk can do what the CLI can do — run the same agent, on the same machine — without asking you to type inside a TUI.
