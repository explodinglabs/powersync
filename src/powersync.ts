import { subscribe } from "./refresh.js";
import { publish } from "./dom.js";

const scriptTag = document.getElementById("powersync") as HTMLScriptElement;
var uri: string = scriptTag.dataset.eventsUri as string;
// If protocol & host are omitted from the uri, use the ones in the browser's
// address bar
if (uri.startsWith(":")) {
  uri = `${window.location.protocol}//${window.location.hostname}${uri}`;
}
const topic: string = scriptTag.dataset.eventsTopic as string;

// Subscribe to "refresh html/css" events
subscribe(uri, topic);

// Re-publish DOM events
publish(uri, topic);
