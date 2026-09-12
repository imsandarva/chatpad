import { writeText } from "./write";

/** Sit a Copy on each code block after markdown lands — same idea as GitHub. */
export function blocks(node: HTMLElement, _token?: unknown) {
  let raf = 0;

  const paint = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      for (const pre of node.querySelectorAll<HTMLElement>("pre")) {
        if (pre.querySelector(":scope > .copy-btn")) continue;
        pre.classList.add("copyable");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "copy-btn";
        btn.textContent = "Copy";
        btn.setAttribute("aria-label", "Copy");
        btn.addEventListener("click", async (event) => {
          event.preventDefault();
          const code = pre.querySelector("code") ?? pre;
          if (!await writeText(code.textContent ?? "")) return;
          btn.textContent = "Copied";
          btn.setAttribute("aria-label", "Copied");
          window.setTimeout(() => {
            if (!btn.isConnected) return;
            btn.textContent = "Copy";
            btn.setAttribute("aria-label", "Copy");
          }, 1200);
        });
        pre.prepend(btn);
      }
    });
  };

  paint();
  return {
    update: paint,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      for (const btn of node.querySelectorAll(".copy-btn")) btn.remove();
    },
  };
}
