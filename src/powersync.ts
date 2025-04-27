import { Message } from "./types.js";
import { republishDomEvents } from "./domPublisher.js";
import { handleDomMsgs } from "./domSubscriber.js";
import { setupRefresh, handleRefreshMsgs } from "./refreshSubscriber.js";

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
console.log(uri);
const topic: string = scriptTag.dataset.eventsTopic as string;
const url = new URL(uri);
url.searchParams.append("topic", topic);

const eventSource = new EventSource(url);

eventSource.onopen = (event) => {
  console.log("eventSource open");
};

eventSource.onerror = (event) => {
  console.log("eventSource error");
};

setupRefresh();

eventSource.onmessage = (event) => {
  const msg: Message = JSON.parse(event.data);

  // Ignore own messages
  if (msg.senderId != senderId) {
    handleDomMsgs(msg);
    handleRefreshMsgs(msg);
  }
};

republishDomEvents(uri, topic, senderId);
