# Overview

Chatpad is a small Ubuntu app for talking to the Cursor agent. It is not an IDE and not a terminal. It is a desk you sit at to write.

## Problem

The Cursor CLI is light, but the prompt is not a real text field. Long messages are painful: no word-jump, no word-delete, pastes collapse to `[pasted x characters]`, images have no preview, and selecting text fights the TUI.

`$EDITOR` (Ctrl+G) and vim mode are workarounds. The IDE has a proper composer and also loads a whole editor. Chatpad is the composer without that weight.

## Product

A native window with:

- a conversation transcript (yours on the right, Cursor’s on the left)
- a real composer (word motions, full paste, selection, image thumbnails, custom shortcuts)
- the official Cursor agent behind Send (`@cursor/sdk`, local runtime, the user’s Cursor account)

Same agent, machine, folders, and usage pool as the CLI and the IDE. Not a code editor. Large diffs still belong in the project. Daily ask / tell / paste / go lives here.

This is personal software. The first useful cut is in: login, a folder, a composer, a streamed reply, and Stop. After that it changes as it is used. The composer is the product.

The goal here is to build step by step, not at once. This chatpad should be equiavalent to native terminal CLI: meaning it should be able to run and execute commands or anything like it happens in CLI.