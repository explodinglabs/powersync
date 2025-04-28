import { DomMessage } from "./types.js";
import { programmaticEvents } from "./domSubscriber.js";

function publishMessage(uri: string, topic: string, msg: DomMessage): void {
  fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4`,
    },
    body: new URLSearchParams({
      topic,
      data: JSON.stringify(msg),
    }),
  });
}

// Util to create a unique selector (not perfect but works for simple cases)
function getDomPath(el: HTMLElement): string {
  const stack: string[] = [];
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
    el = el.parentNode as HTMLElement;
  }
  return stack.slice(1).join(" > ");
}

export function republishDomEvents(
  uri: string,
  topic: string,
  senderId: string
): void {
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
    "touchstart",
  ].forEach((eventName: string) => {
    window.addEventListener(
      eventName,
      (e: Event) => {
        if (!programmaticEvents[e.type]) {
          if (e.target) {
            const target = e.target as HTMLElement;

            const msg: DomMessage = {
              senderId: senderId,
              type: e.type,
              params: {
                selector: getDomPath(target),
                inputValue:
                  target instanceof HTMLInputElement ||
                  target instanceof HTMLTextAreaElement
                    ? target.value
                    : target instanceof HTMLElement && target.isContentEditable
                    ? target.innerHTML.replace(/&nbsp;/g, " ") // Replace &nbsp; with a space
                    : target instanceof HTMLSelectElement
                    ? target.value
                    : null,
                pointer: {
                  x: (e as MouseEvent).clientX,
                  y: (e as MouseEvent).clientY,
                },
                scroll: {
                  x: window.scrollX,
                  y: window.scrollY,
                },
              },
            };

            publishMessage(uri, topic, msg);
          }
        }
      },
      true // useCapture = true to catch upstream events
    );
  });
}
