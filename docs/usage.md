# Using Chatpad

The window is a desk: header on top, conversation in the middle, composer at the bottom. The write box stays put; only the thread scrolls.

## Sign in

**Sign in** opens Cursor’s login. When it works, the header shows your name. **Sign out** clears it.

The key stays in `~/.cursor/sdk/auth.json`. Chatpad only keeps your name and email so the next open can greet you without waiting. Sign in from the Chatpad window — a browser tab cannot finish it.

## Pick a folder

The header button is the project folder. It starts as this repo. Click it to pick another.

That folder is the agent’s working directory — same idea as opening a project in the CLI. Each folder has its own thread. The same folder, next time you open the window, picks up where you left off. You cannot change folders while a reply is still coming.

## Write

The box at the bottom is a real text field. Type as you would anywhere else.

| | |
| --- | --- |
| **Enter** | Send |
| **Shift + Enter** | New line |
| **Send** | Same as Enter |
| **Stop** or **Escape** | End a reply that is still coming |

Send is quiet until there is something to send — a note, a picture, or both. Paste a picture from the clipboard, drop one from a folder, or tap **+**. You’ll see a thumbnail; take it off with the little close mark if you change your mind.

While a reply is coming in, the box waits and Send becomes Stop. Commands and file work appear as quiet lines in Cursor’s turn, then the reply. Scroll the thread to look back — wheel, trackpad, the bar on the right, or Page Up and Page Down. Tap or drag that bar to jump; Home and End go to the ends. It keeps following only if you stay at the bottom.

## Settings

**Settings** is one switch for now: **Markdown**. On (the default), Cursor’s replies use headings, lists, and code. Off, you see the raw text. Your own messages stay plain either way.

## Closing the window

The thread for this folder comes back when you open the window. Sign-in, the folder, and the Markdown switch do too.
