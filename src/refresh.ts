const originalLinks: {
  element: HTMLLinkElement;
  originalHref: string;
}[] = [];

// Handle the CSS event
function handleCssEvent(event: MessageEvent) {
  const file = JSON.parse(event.data).file;

  originalLinks.forEach(({ element, originalHref }) => {
    // Set href to the new tmp version with query string
    if (originalHref.endsWith(file)) {
      element.href = `/tmp.${file}?v=${Date.now()}`;
    }
  });
}

function updateElement(oldEl: Element, newEl: Element) {
  if (oldEl.isEqualNode(newEl)) {
    return;
  }

  if (oldEl.nodeName !== newEl.nodeName) {
    oldEl.replaceWith(newEl);
    return;
  }

  if (oldEl instanceof HTMLElement && newEl instanceof HTMLElement) {
    for (const { name } of Array.from(oldEl.attributes)) {
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }
    for (const { name, value } of Array.from(newEl.attributes)) {
      if (oldEl.getAttribute(name) !== value) {
        oldEl.setAttribute(name, value || "");
      }
    }
  }

  if (oldEl.childNodes.length === 0 && newEl.childNodes.length === 0) {
    if (oldEl.textContent !== newEl.textContent) {
      oldEl.textContent = newEl.textContent;
    }
    return;
  }

  const oldChildren = Array.from(oldEl.childNodes);
  const newChildren = Array.from(newEl.childNodes);

  const len = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < len; i++) {
    if (!oldChildren[i]) {
      oldEl.appendChild(newChildren[i]);
    } else if (!newChildren[i]) {
      oldEl.removeChild(oldChildren[i]);
    } else {
      updateElement(oldChildren[i] as Element, newChildren[i] as Element);
    }
  }
}

function handleHtmlEvent(event: MessageEvent) {
  const file = JSON.parse(event.data).file;

  fetch(`/tmp.${file}?v=${Date.now()}`)
    .then((res) => res.text())
    .then((html) => {
      const tempDom = document.createElement("html");
      tempDom.innerHTML = html;

      const newHead = tempDom.querySelector("head");
      const newBody = tempDom.querySelector("body");
      if (!newBody || !newHead) return;

      originalLinks.forEach(({ element, originalHref }) => {
        const originalPath = new URL(originalHref, location.origin).pathname;

        const link = Array.from(
          newHead.querySelectorAll('link[rel="stylesheet"]')
        ).find((linkEl) => {
          if (linkEl instanceof HTMLLinkElement) {
            return (
              new URL(linkEl.href, location.origin).pathname === originalPath
            );
          }
          return false;
        });

        if (link && link instanceof HTMLLinkElement) {
          link.href = element.href; // Restore the live href (might be tmp version)
        }
      });

      updateElement(document.head, newHead);
      updateElement(document.body, newBody);
    })
    .catch((err) => console.error("Failed to load html-tmp:", err));
}

export function subscribe(uri: string, topic: string): void {
  // Load the original links
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    if (link instanceof HTMLLinkElement && link.href) {
      originalLinks.push({ element: link, originalHref: link.href });
    }
  });

  const url = new URL(uri);
  url.searchParams.append("topic", topic);

  const eventSource = new EventSource(url);

  eventSource.onopen = (event: Event) => {
    console.log("eventSource open");
  };

  eventSource.onerror = (event: Event) => {
    console.log("eventSource error");
  };

  // Listen for updates on CSS and HTML
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Handle CSS and HTML updates
    if (data.event === "css-tmp") {
      handleCssEvent(event);
    } else if (data.event === "html-tmp") {
      handleHtmlEvent(event);
    }
  };
}
