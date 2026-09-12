# Conversation

The middle of the window is the thread. It reads like a normal chat: you on the right, Cursor on the left. The write box stays at the bottom of the window; only the thread moves.

## Empty

If nothing has been said yet:

> The page is empty.
> Write below whenever you’re ready.

## Turns

Each message is a bubble.

- **Yours** sit on the right, filled in, like a message you sent. Pictures you attached sit in that bubble.
- **Cursor’s** sit on the left, quieter, like a message that arrived.

Short ones stay small. Longer ones wrap, up to most of the column. Two of yours in a row nest a little closer; a change of speaker opens a breath.

The names “You” and “Cursor” are there for a screen reader. On the page, the side is enough.

## The work

When Cursor runs a command or touches a file, that step appears in the same turn — a quiet line on the left, not a bubble. You see it start, then settle, the way the CLI prints the work before the reply.

A command shows the command. A file shows the name. The reply, if there is one, follows underneath.

Hover a bubble, a work line, or a block of code and **Copy** takes the words — the whole note, the command, the file name — so you do not have to fight the page. You can still select a piece and copy that the usual way.

## While a reply is coming

A step that is still running keeps a small pulse. If Cursor is writing, the last bubble stays open and a caret blinks at the end. The thread follows new words down, unless you scroll up to read — then it stays put until you return to the bottom.

The write box does not go still. You can draft the next note — and send it, so it waits its turn — without taking the pen away.

## The bar

When the thread is taller than the window, a slim bar sits on the right. How tall the handle is tells you how long the day is. Drag it, or tap anywhere on the bar, to jump — the way a chat on your phone lets you fly back to this morning. Home and End do the same from the keyboard, as long as you are not typing.

## Stop and fail

**Stop** (or Escape) ends the stream. Whatever already arrived stays. If nothing had arrived yet, the bubble says “You stopped this reply.”

If the send never reaches the agent — not signed in, not in the Chatpad window, or the host missed — that Cursor bubble turns red and says what went wrong.

## Markdown

Cursor’s replies can render as Markdown (see [usage](./usage.md)). Yours do not. Turning Markdown off does not delete anything; it only shows the raw text.

## Memory

Each folder can keep more than one conversation. Close the window and open it again: you are back on the page you left. **New** puts that day away and opens a blank page in the same folder — a new note, not a follow-up. **Earlier** brings an old one back. Pick another folder and you get that folder’s pages, or a blank page if you have not written there yet.

A send on a new page starts a new agent. The old one stays with the day you parked.
