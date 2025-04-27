"use strict";
(() => {
  // src/domSubscriber.ts
  var programmaticEvents = {};
  function withProgrammaticEvent(eventType, callback) {
    programmaticEvents[eventType] = true;
    requestAnimationFrame(() => {
      programmaticEvents[eventType] = false;
    });
    callback();
  }
  var dispatchers = {
    change: (el) => {
      el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    },
    click: (el) => {
      el.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    },
    input: (el, value) => {
      if (el instanceof HTMLSelectElement) {
        el.value = value;
        el.dispatchEvent(
          new Event("change", { bubbles: true, cancelable: true })
        );
      } else if (el instanceof HTMLElement && el.isContentEditable) {
        el.textContent = value;
        el.dispatchEvent(
          new Event("input", {
            bubbles: true,
            cancelable: true
          })
        );
      } else {
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.value = value;
        }
        el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      }
    },
    keydown: (el, input) => {
      el.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: input
          // could fill in later if you want smarter behavior
        })
      );
    },
    keyup: (el) => {
      el.dispatchEvent(
        new KeyboardEvent("keyup", {
          bubbles: true,
          cancelable: true,
          key: ""
        })
      );
    },
    pointerdown: (el) => {
      el.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "touch",
          isPrimary: true
        })
      );
    },
    pointermove: (el) => {
      el.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "touch",
          isPrimary: true
        })
      );
    },
    pointerup: (el) => {
      el.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: "touch",
          isPrimary: true
        })
      );
    },
    popstate: (el) => {
      el.dispatchEvent(
        new PopStateEvent("popstate", {
          bubbles: true,
          cancelable: true,
          state: history.state
        })
      );
    },
    pushState: (el) => {
      history.pushState({}, "", window.location.href);
    },
    replaceState: (el) => {
      history.replaceState({}, "", window.location.href);
    },
    reset: (el) => {
      el.dispatchEvent(
        new Event("reset", {
          bubbles: true,
          cancelable: true
        })
      );
    },
    scroll: (el, _, scrollY) => {
      if (el instanceof HTMLElement) {
        el.scrollTop = scrollY;
      } else if (el instanceof Document) {
        document.documentElement.scrollTop = scrollY;
      } else if (el instanceof Window) {
        el.scrollTo(0, scrollY);
      }
    },
    submit: (el) => {
      el.dispatchEvent(
        new Event("submit", {
          bubbles: true,
          cancelable: true
        })
      );
    },
    touchend: (el) => {
      el.dispatchEvent(
        new TouchEvent("touchend", {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: []
        })
      );
    },
    touchmove: (el) => {
      el.dispatchEvent(
        new TouchEvent("touchmove", {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: []
        })
      );
    },
    touchstart: (el) => {
      el.dispatchEvent(
        new TouchEvent("touchstart", {
          bubbles: true,
          cancelable: true,
          touches: [],
          targetTouches: [],
          changedTouches: []
        })
      );
    }
  };
  function handleDomMsgs({ type, params }) {
    const dispatcher = dispatchers[type];
    if (dispatcher) {
      let targetElement = window;
      if (params.selector) {
        targetElement = document.querySelector(params.selector) ?? window;
      }
      withProgrammaticEvent(type, () => {
        dispatcher(targetElement, params.value, params.scrollY);
      });
    }
  }

  // src/domPublisher.ts
  function publishMessage(uri2, topic2, msg) {
    fetch(uri2, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4`
      },
      body: new URLSearchParams({
        topic: topic2,
        data: JSON.stringify(msg)
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
  function republishDomEvents(uri2, topic2, senderId2) {
    [
      "change",
      "click",
      // Done
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
      // Done
      "submit",
      "touchend",
      "touchmove",
      "touchstart"
    ].forEach((eventName) => {
      window.addEventListener(
        eventName,
        (e) => {
          if (!programmaticEvents[e.type]) {
            if (e.target) {
              const target = e.target;
              const msg = {
                senderId: senderId2,
                type: e.type,
                params: {
                  selector: getDomPath(target),
                  value: target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.value : target instanceof HTMLElement && target.isContentEditable ? target.innerHTML.replace(/&nbsp;/g, " ") : target instanceof HTMLSelectElement ? target.value : null,
                  scrollY: window.scrollY
                }
              };
              publishMessage(uri2, topic2, msg);
            }
          }
        },
        true
        // useCapture = true to catch upstream events
      );
    });
  }

  // src/refreshSubscriber.ts
  var originalLinks = [];
  function refreshOriginalLinks() {
    originalLinks.length = 0;
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      if (link instanceof HTMLLinkElement && link.href) {
        originalLinks.push({ element: link, originalHref: link.href });
      }
    });
  }
  function handleCssTmp(file) {
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
  function handleHtmlTmp(file) {
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
      refreshOriginalLinks();
    }).catch((err) => console.error("Failed to load html-tmp:", err));
  }
  function setupRefresh() {
    refreshOriginalLinks();
  }
  function handleRefreshMsgs(msg) {
    console.log(msg.type);
    if (msg.type === "css-tmp") {
      handleCssTmp(msg.params.file);
    } else if (msg.type === "html-tmp") {
      handleHtmlTmp(msg.params.file);
    }
  }

  // src/powersync.ts
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  var senderId = generateUUID();
  var scriptTag = document.getElementById("powersync");
  var uri = scriptTag.dataset.eventsUri;
  if (uri.startsWith(":")) {
    uri = `${window.location.protocol}//${window.location.hostname}${uri}`;
  }
  console.log(uri);
  var topic = scriptTag.dataset.eventsTopic;
  var url = new URL(uri);
  url.searchParams.append("topic", topic);
  var eventSource = new EventSource(url);
  eventSource.onopen = (event) => {
    console.log("eventSource open");
  };
  eventSource.onerror = (event) => {
    console.log("eventSource error");
  };
  setupRefresh();
  eventSource.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.senderId != senderId) {
      handleDomMsgs(msg);
      handleRefreshMsgs(msg);
    }
  };
  republishDomEvents(uri, topic, senderId);
})();
//# sourceMappingURL=powersync.dev.js.map
