import { Message, DomParams } from "./types.js";

export const programmaticEvents: Record<string, boolean> = {};

function withProgrammaticEvent(eventType: string, callback: () => void) {
  programmaticEvents[eventType] = true;
  requestAnimationFrame(() => {
    programmaticEvents[eventType] = false;
  });
  callback();
}

const dispatchers: Record<string, (el, params) => void> = {
  change: (el) => {
    el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  },
  click: (el) => {
    el.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );
  },
  input: (el, params) => {
    if (el instanceof HTMLSelectElement) {
      // If it's a dropdown, ensure the value is updated and trigger 'change'
      el.value = params.inputValue;
      el.dispatchEvent(
        new Event("change", { bubbles: true, cancelable: true })
      );
    } else if (el instanceof HTMLElement && el.isContentEditable) {
      // Handle input for contenteditable elements
      el.textContent = params.inputValue; // Sync the text content with the new value
      el.dispatchEvent(
        new Event("input", {
          bubbles: true,
          cancelable: true,
        })
      ); // Dispatch the input event to propagate changes
    } else {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = params.inputValue;
      }
      // Handle input for other types of elements like <input>, <textarea>
      el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    }
  },
  keydown: (el, params) => {
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: params.inputValue,
      })
    );
  },
  keyup: (el) => {
    el.dispatchEvent(
      new KeyboardEvent("keyup", {
        bubbles: true,
        cancelable: true,
        key: "",
      })
    );
  },
  pointerdown: (el, params) => {
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: params.pointer.x,
        clientY: params.pointer.y,
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
      })
    );
  },
  pointermove: (el, params) => {
    el.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        clientX: params.pointer.x,
        clientY: params.pointer.y,
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
      })
    );
  },
  pointerup: (el, params) => {
    el.dispatchEvent(
      new PointerEvent("pointerup", {
        bubbles: true,
        cancelable: true,
        clientX: params.pointer.x,
        clientY: params.pointer.y,
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
      })
    );
  },
  popstate: (el) => {
    el.dispatchEvent(
      new PopStateEvent("popstate", {
        bubbles: true,
        cancelable: true,
        state: history.state,
      })
    );
  },
  pushState: (el) => {
    // Note: pushState itself doesn't emit an event — we can simulate a
    // "popstate" if needed
    history.pushState({}, "", window.location.href);
  },
  replaceState: (el) => {
    // Similar: replaceState doesn't emit a real event either, but you can call
    // replaceState manually
    history.replaceState({}, "", window.location.href);
  },
  reset: (el) => {
    el.dispatchEvent(
      new Event("reset", {
        bubbles: true,
        cancelable: true,
      })
    );
  },
  scroll: (el, params) => {
    if (el instanceof HTMLElement) {
      el.scrollTop = params.scroll.y;
    } else if (el instanceof Document) {
      document.documentElement.scrollTop = params.scroll.y;
    } else if (el instanceof Window) {
      el.scrollTo(params.scroll.x, params.scroll.y);
    }
  },
  submit: (el) => {
    el.dispatchEvent(
      new Event("submit", {
        bubbles: true,
        cancelable: true,
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
        changedTouches: [],
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
        changedTouches: [],
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
        changedTouches: [],
      })
    );
  },
};

export function handleDomMsg({ type, params }: Message): void {
  const dispatcher = dispatchers[type];
  if (dispatcher) {
    let targetElement: Element | Window = window;
    if (params.selector) {
      targetElement = document.querySelector(params.selector) ?? window;
    }

    withProgrammaticEvent(type, () => {
      dispatcher(targetElement, params);
    });
  }
}
