import { Message } from "./types";
import { republishDomEvent } from "./domPublisher";
import { handleDomMsg } from "./domSubscriber";
import { handleRefreshMsg, refreshLinks } from "./refresh";

function generateUUID(): string {
  // Generate a UUID v4 (random-based UUID)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // Random hex digit
    const v = c === "x" ? r : (r & 0x3) | 0x8; // Correct version 4 format
    return v.toString(16);
  });
}

const senderId: string = generateUUID();

const scriptTag = document.getElementById("powersync") as HTMLScriptElement;
var uri: string = scriptTag.dataset.eventsUri as string;
// If protocol & host are omitted from the uri, use the ones in the browser's
// address bar
if (uri.startsWith(":")) {
  uri = `${window.location.protocol}//${window.location.hostname}${uri}`;
}
const topic: string = scriptTag.dataset.eventsTopic as string;
const url = new URL(uri);
url.searchParams.append("topic", topic);

// Setup Event Source

const eventSource = new EventSource(url);

eventSource.onopen = (event) => {
  console.log("eventSource open");
};

eventSource.onerror = (event) => {
  console.log("eventSource error");
};

eventSource.onmessage = (event) => {
  const msg: Message = JSON.parse(event.data);

  // Ignore own messages
  if (msg.senderId != senderId) {
    handleDomMsg(msg);
    handleRefreshMsg(msg);
  }
};

// Setup Event Listeners

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
    (e) => {
      republishDomEvent(uri, topic, senderId, event);
    },
    true // useCapture = true to catch upstream events
  );
});

refreshLinks();
