function publishEvent(
  uri: string,
  topic: string,
  type: string,
  payload: Record<string, any>
): void {
  fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4`,
    },
    body: new URLSearchParams({
      topic,
      data: JSON.stringify({ type, payload, sender: crypto.randomUUID() }),
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

export function publish(uri: string, topic: string): void {
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
        let payload: Record<string, any> = {};

        if (e.target) {
          const target = e.target as HTMLElement;
          payload.selector = getDomPath(target);
          payload.value = (target as HTMLInputElement).value ?? null;
          payload.scrollY = window.scrollY;
        }

        publishEvent(uri, topic, e.type, payload);
      },
      true // useCapture = true to catch upstream events
    );
  });
}
