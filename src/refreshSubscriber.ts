import { diffAndApply } from "./diff.js"; // Changed to named import
import { Message } from "./types.js"; // Assuming Message type is defined
import { widgetRegistry } from "./widgetRegistry.js";

// Store a map of link elements by their href
let linkMap: Record<string, HTMLLinkElement> = {};

// Refresh and capture current link elements
function refreshLinks() {
  linkMap = {}; // Reset the link map before refreshing
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link instanceof HTMLLinkElement && link.href) {
      linkMap[new URL(link.href, location.origin).pathname] = link;
    }
  });
}

// Handle the update of CSS content
function handleCss(filename: string) {
  for (const path in linkMap) {
    if (path == filename.replace(/tmp\./, "")) {
      linkMap[path].href = `${filename}?v=${Date.now()}`;
    }
  }
}

// Reload a single external JS file
function handleJs(filename: string) {
  document
    .querySelectorAll<HTMLScriptElement>("script[src]")
    .forEach((script) => {
      const scriptPath = new URL(script.src, location.origin).pathname;
      if (scriptPath === filename.replace(/tmp\./, "")) {
        const newScript = document.createElement("script");

        // Copy attributes
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Important: set src after copying attributes!
        newScript.src = `${filename}?v=${Date.now()}`;

        script.replaceWith(newScript);
      }
    });
}

async function handleHtml(filename: string) {
  const html = await fetch(`${filename}?v=${Date.now()}`).then((res) =>
    res.text()
  );
  const temp = document.createElement("html");
  temp.innerHTML = html;
  diffAndApply(document.documentElement, temp);

  refreshLinks();
}

export function setupRefresh() {
  document.addEventListener("DOMContentLoaded", () => {
    refreshLinks();
  });
}

// Handle refresh messages (either CSS or HTML)
export function handleRefreshMsgs(msg: Message) {
  switch (msg.type) {
    case "css":
      handleCss(msg.params.filename);
      break;
    case "html":
      handleHtml(msg.params.filename);
      break;
    case "js":
      handleJs(msg.params.filename);
      break;
  }
}
