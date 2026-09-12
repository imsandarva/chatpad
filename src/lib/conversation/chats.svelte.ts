import type { ChatIndex } from "./store";

/** Earlier pages in this folder — titles only; the live thread stays in `conversation`. */
export const chats = $state({ items: [] as ChatIndex[] });

export function setCatalog(items: ChatIndex[]) {
  chats.items = items;
}
