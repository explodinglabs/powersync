"use strict";
(() => {
  // src/refresh.ts
  function isExternal(url) {
    var match = url.match(
      /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
    );
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== location.protocol)
      return true;
    if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(
      new RegExp(
        ":(" + { "http:": 80, "https:": 443 }[location.protocol] + ")?$"
      ),
      ""
    ) !== location.host)
      return true;
    return false;
  }
  function refreshCss() {
    let rnd = (Math.random() + 1).toString(36).substring(7);
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
      var link = links[cl];
      if (link.rel === "stylesheet" && !isExternal(link.href)) {
        link.href = link.href.replace(/\?(.*)/, "") + "?" + rnd;
      }
    }
  }
  function subscribe(uri2, topic2) {
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
      console.log(event);
      switch (event.data) {
        case "html":
          window.location.reload();
          break;
        case "css":
          refreshCss();
          break;
      }
    };
  }

  // src/dom.ts
  function publishEvent(uri2, topic2, type, payload) {
    fetch(uri2, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4"
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
      const selector = sibCount > 1 ? "".concat(tag, ":nth-of-type(").concat(sibIndex + 1, ")") : tag;
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
          var _a;
          let payload = {};
          if (e.target) {
            const target = e.target;
            payload.selector = getDomPath(target);
            payload.value = (_a = target.value) != null ? _a : null;
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
    uri = "".concat(window.location.protocol, "//").concat(window.location.hostname).concat(uri);
  }
  var topic = scriptTag.dataset.eventsTopic;
  subscribe(uri, topic);
  publish(uri, topic);
})();
//# sourceMappingURL=powersync.bundle.js.map
