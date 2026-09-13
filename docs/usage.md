# Using Chatpad

The window is a desk: header on top, conversation in the middle, composer at the bottom. The write box stays put; only the thread scrolls.

## Sign in

**Sign in** opens Cursor’s login. When it works, the header shows your name. **Sign out** clears it.

The key stays in `~/.cursor/sdk/auth.json`. Chatpad only keeps your name and email so the next open can greet you without waiting. Sign in from the Chatpad window — a browser tab cannot finish it.

## Pick a folder

The header button is the project folder. It starts as this repo. Click it to pick another.

That folder is the agent’s working directory — same idea as opening a project in the CLI. Each folder can have more than one conversation. The same folder, next time you open the window, opens the page you left. You cannot change folders, start a new page, or open an earlier one while a reply is still coming.

## A new page

**New** puts the current conversation away and opens a blank page in this folder. Yesterday stays; it is just not the one you are in. **Earlier** lists those parked pages so you can go back. You cannot start a new page while a reply is still coming, and New stays quiet if the page is already empty.

## Write

The box at the bottom is a real text field. Type as you would anywhere else.

| | |
| --- | --- |
| **Enter** | Send |
| **Shift + Enter** | New line |
| **Send** | Same as Enter |
| **Stop** or **Escape** | End a reply that is still coming |

Send is quiet until there is something to send — a note, a picture, or both. Paste a picture from the clipboard, drop one from a folder, or tap **+**. You’ll see a thumbnail; take it off with the little close mark if you change your mind.

The name on the lower left of the write box is who writes back. Tap it to see the models on your Cursor plan — Composer, Auto, Claude, and the rest that Cursor offers you. Search if the list is long. The next send uses what you pick. You cannot change it while a reply is still coming.

While a reply is coming in, the box stays yours. Keep writing. Send holds that next note until this turn finishes, then sends it. **Keep** puts it back in the box if you change your mind. Stop and Escape still end the reply that is already on the page. Commands and file work appear as quiet lines in Cursor’s turn — tap one to sit with the command or see the path — then the reply. Hover a bubble, a work line, or a code block and tap **Copy** to take it with you — or select just a piece, the way you would anywhere else. Scroll the thread to look back — wheel, trackpad, the bar on the right, or Page Up and Page Down. Tap or drag that bar to jump; Home and End go to the ends. It keeps following only if you stay at the bottom.

## Settings

**Settings** has one quiet choice.

**Markdown** is on by default. Cursor’s replies use headings, lists, and code. Off, you see the raw text. Your own messages stay plain either way.

## Closing the window

The page you were on comes back when you open the window. Sign-in, the folder, the model, and the Markdown switch do too. Earlier conversations in that folder are still there.
