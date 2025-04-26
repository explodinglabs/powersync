"use strict";
(() => {
  // src/refresh.ts
  var originalLinks = [];
  function handleCssEvent(event) {
    const file = JSON.parse(event.data).file;
    originalLinks.forEach(({ element, originalHref }) => {
      if (originalHref.endsWith(file)) {
        element.href = `/tmp.${file}?v=${Date.now()}`;
      }
    });
  }
  function updateElement(oldEl, newEl) {
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
        updateElement(oldChildren[i], newChildren[i]);
      }
    }
  }
  function handleHtmlEvent(event) {
    const file = JSON.parse(event.data).file;
    fetch(`/tmp.${file}?v=${Date.now()}`).then((res) => res.text()).then((html) => {
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
            return new URL(linkEl.href, location.origin).pathname === originalPath;
          }
          return false;
        });
        if (link && link instanceof HTMLLinkElement) {
          link.href = element.href;
        }
      });
      updateElement(document.head, newHead);
      updateElement(document.body, newBody);
    }).catch((err) => console.error("Failed to load html-tmp:", err));
  }
  function subscribe(uri2, topic2) {
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (link instanceof HTMLLinkElement && link.href) {
        originalLinks.push({ element: link, originalHref: link.href });
      }
    });
    const url = new URL(uri2);
    url.searchParams.append("topic", topic2);
    const eventSource = new EventSource(url);
    eventSource.onopen = (event) => {
      console.log("eventSource open");
    };
    eventSource.onerror = (event) => {
      console.log("eventSource error");
    };
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "css-tmp") {
        handleCssEvent(event);
      } else if (data.event === "html-tmp") {
        handleHtmlEvent(event);
      }
    };
  }

  // src/dom.ts
  function publishEvent(uri2, topic2, type, payload) {
    fetch(uri2, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4`
      },
      body: new URLSearchParams({
        topic: topic2,
        data: JSON.stringify({ type, payload, sender: crypto.randomUUID() })
      })
    });
  }
  function getDomPath(el) {
    const stack = [];
    while (el.parentNode) {
      let sibCount = 0;
      let sibIndex = 0;
      for (let i = 0; i < el.parentNode.children.length; i++) {
        const sibling = el.parentNode.children[i];
        if (sibling.tagName === el.tagName) {
          if (sibling === el) {
            sibIndex = sibCount;
          }
          sibCount++;
        }
      }
      const tag = el.tagName.toLowerCase();
      const selector = sibCount > 1 ? `${tag}:nth-of-type(${sibIndex + 1})` : tag;
      stack.unshift(selector);
      el = el.parentNode;
    }
    return stack.slice(1).join(" > ");
  }
  function publish(uri2, topic2) {
    [
      "change",
      "click",
      "input",
      "keydown",
      "keyup",
      "pointerdown",
      "pointermove",
      "pointerup",
      "popstate",
      "pushState",
      "replaceState",
      "reset",
      "scroll",
      "submit",
      "touchend",
      "touchmove",
      "touchstart"
    ].forEach((eventName) => {
      window.addEventListener(
        eventName,
        (e) => {
          let payload = {};
          if (e.target) {
            const target = e.target;
            payload.selector = getDomPath(target);
            payload.value = target.value ?? null;
            payload.scrollY = window.scrollY;
          }
          publishEvent(uri2, topic2, e.type, payload);
        },
        true
        // useCapture = true to catch upstream events
      );
    });
  }

  // src/powersync.ts
  var scriptTag = document.getElementById("powersync");
  var uri = scriptTag.dataset.eventsUri;
  if (uri.startsWith(":")) {
    uri = `${window.location.protocol}//${window.location.hostname}${uri}`;
  }
  var topic = scriptTag.dataset.eventsTopic;
  subscribe(uri, topic);
  publish(uri, topic);
})();
//# sourceMappingURL=powersync.dev.js.map
