import { DiffDOM } from "diff-dom"; // Changed to named import
import { Message } from "./types.js"; // Assuming Message type is defined

// Create an instance of DiffDOM
const diffDOM = new DiffDOM();

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

function rerunNewScripts() {
  const processed = new WeakSet<HTMLScriptElement>();

  document.querySelectorAll("script").forEach((script) => {
    if (processed.has(script)) return; // Already processed

    // Skip if it's an external script that already loaded
    if (
      script.src &&
      document.querySelector(`script[src="${script.src}"]`) !== script
    ) {
      return;
    }

    const newScript = document.createElement("script");
    if (script.src) {
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }

    // Copy attributes (important for type="module", defer, etc.)
    Array.from(script.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });

    processed.add(newScript);
    script.replaceWith(newScript);
  });
}

async function handleHtml(filename: string) {
  try {
    const html = await fetch(`${filename}?v=${Date.now()}`).then((res) =>
      res.text()
    );

    const temp = document.createElement("html");
    temp.innerHTML = html;

    const diffResult = diffDOM.diff(document.documentElement, temp);
    diffDOM.apply(document.documentElement, diffResult);

    rerunNewScripts(); // Reinitialize new scripts
    refreshLinks();
  } catch (err) {
    console.error("Failed to update HTML:", err);
  }
}

// Handle the update of CSS content
function handleCss(filename: string) {
  for (const path in linkMap) {
    if (path == filename.replace(/tmp\./, "")) {
      linkMap[path].href = `${filename}?v=${Date.now()}`;
    }
  }
}

// Initialize the refresh process by capturing the current links
export function setupRefresh() {
  refreshLinks();
}

// Handle refresh messages (either CSS or HTML)
export function handleRefreshMsgs(msg: Message) {
  if (msg.type === "css") {
    handleCss(msg.params.filename);
  } else if (msg.type === "html") {
    handleHtml(msg.params.filename);
  }
}
