import { Message } from "./types"; // Assuming Message type is defined

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

function isExternal(url) {
  var match = url.match(
    /^([^:/?#]+:)?(?:\/\/([^/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
  );
  if (
    typeof match[1] === "string" &&
    match[1].length > 0 &&
    match[1].toLowerCase() !== location.protocol
  )
    return true;
  if (
    typeof match[2] === "string" &&
    match[2].length > 0 &&
    match[2].replace(
      new RegExp(
        ":(" + { "http:": 80, "https:": 443 }[location.protocol] + ")?$"
      ),
      ""
    ) !== location.host
  )
    return true;
  return false;
}

// Handle the update of CSS content
function handleCss() {
  for (const path in linkMap) {
    if (!isExternal(linkMap[path].href)) {
      linkMap[path].href = `${path}?v=${Date.now()}`;
    }
  }
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

      // Set src after copying attributes
      newScript.src = `${script.src.split("?")[0]}?v=${Date.now()}`;

      script.replaceWith(newScript);
    });
}

// Handle refresh messages (either CSS, HTML, or refresh)
export function handleRefreshMsg(msg: Message) {
  console.log(msg.type);
  switch (msg.type) {
    case "refresh":
      window.location.reload();
      break;
    case "css":
      handleCss();
      break;
    case "js":
      handleJs();
      break;
  }
}
