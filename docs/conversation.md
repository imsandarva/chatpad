# Conversation

The middle of the window is the thread. It reads like a normal chat: you on the right, Cursor on the left.

## Empty

If nothing has been said yet:

> The page is empty.
> Write below whenever you’re ready.

## Turns

Each message is a bubble.

- **Yours** sit on the right, filled in, like a message you sent.
- **Cursor’s** sit on the left, quieter, like a message that arrived.

Short ones stay small. Longer ones wrap, up to most of the column. Two of yours in a row nest a little closer; a change of speaker opens a breath.

The names “You” and “Cursor” are there for a screen reader. On the page, the side is enough.

## While a reply is coming

The last Cursor bubble stays open and a small caret blinks at the end. The page follows the text down as it arrives.

## Stop and fail

**Stop** (or Escape) ends the stream. Whatever already arrived stays. If nothing had arrived yet, the bubble says “You stopped this reply.”

If the send never reaches the agent — not signed in, not in the Chatpad window, or the host missed — that Cursor bubble turns red and says what went wrong.

## Markdown

Cursor’s replies can render as Markdown (see [usage](./usage.md)). Yours do not. Turning Markdown off does not delete anything; it only shows the raw text.

## Memory

The thread is in this window’s memory. It is not written to disk. A new folder in the same window starts a new agent; the old bubbles stay on the page until you close the window. Keeping the thread across days is still ahead — see [next steps](./next_steps.md).
