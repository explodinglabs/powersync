import { Message } from "./types"; // Assuming Message type is defined
import morphdom from "morphdom";

// Store a map of link elements by their href
let linkMap: Record<string, HTMLLinkElement> = {};

// Refresh and capture current link elements
export function refreshLinks() {
  linkMap = {}; // Reset the link map before refreshing
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link instanceof HTMLLinkElement && link.href) {
      linkMap[new URL(link.href, location.origin).pathname] = link;
    }
  });
}

// Handle the update of CSS content
function handleCss() {
  for (const path in linkMap) {
    linkMap[path].href = `${path}?v=${Date.now()}`;
  }
}

async function handleHtml(filename: string) {
  const html = await fetch(`${filename}?v=${Date.now()}`).then((res) =>
    res.text()
  );

  // Create a document fragment with the new HTML
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, "text/html");

  // Patch the body in one go
  morphdom(document.documentElement, newDoc.documentElement, {
    onBeforeElUpdated: (fromEl, toEl) => {
      // Skip morphing for elements marked as a component
      if (fromEl.hasAttribute("data-component")) {
        return false;
      }

      if (fromEl.hasAttribute("id")) {
        switch (fromEl.tagName) {
          case "INPUT":
            (toEl as HTMLInputElement).value = (fromEl as HTMLInputElement).value;
            (toEl as HTMLInputElement).checked = (fromEl as HTMLInputElement).checked;
            break;
          case "TEXTAREA":
            (toEl as HTMLTextAreaElement).value = (fromEl as HTMLTextAreaElement).value;
            break;
          case "SELECT":
            (toEl as HTMLSelectElement).value = (fromEl as HTMLSelectElement).value;
            break;
          case "OPTION":
            (toEl as HTMLOptionElement).selected = (fromEl as HTMLOptionElement).selected;
            break;
        }
      }

      // Preserve focus
      if (document.activeElement === fromEl) {
        setTimeout(() => (fromEl as HTMLElement).focus(), 0);
        return fromEl.tagName === "BODY" ? true : false;
      }

      return true;
    },
  });

  refreshLinks();
}

// Reload all external JS files
function handleJs() {
  document
    .querySelectorAll<HTMLScriptElement>("script[src]")
    .forEach((script) => {
      const newScript = document.createElement("script");

      // Copy attributes
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Important: set src after copying attributes!
      newScript.src = `${script.src.split("?")[0]}?v=${Date.now()}`;

      script.replaceWith(newScript);
    });
}

// Handle refresh messages (either CSS or HTML)
export function handleRefreshMsg(msg: Message) {
  switch (msg.type) {
    case "css":
      handleCss();
      break;
    case "html":
      handleHtml(msg.params.filename);
      break;
    case "js":
      handleJs();
      break;
  }
}
