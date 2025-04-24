const scriptTag = document.getElementById("refresh-script");
var uri = scriptTag.dataset.eventsUri;
if (uri.startsWith(":")) {
  uri = `${window.location.protocol}//${window.location.hostname}${uri}`;
}
const url = new URL(uri);
url.searchParams.append("topic", scriptTag.dataset.eventsTopic);
// console.log(url);
const eventSource = new EventSource(url);

function isExternal(url) {
  var match = url.match(
    /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/
  );
  if (
    typeof match[1] === "string" &&
    match[1].length > 0 &&
    match[1].toLowerCase() !== location.protocol
  )
    return true;
  if (
    typeof match[2] === "string" &&
    match[2].length > 0 &&
    match[2].replace(
      new RegExp(
        ":(" + { "http:": 80, "https:": 443 }[location.protocol] + ")?$"
      ),
      ""
    ) !== location.host
  )
    return true;
  return false;
}

function refreshCss() {
  let rnd = (Math.random() + 1).toString(36).substring(7);
  var links = document.getElementsByTagName("link");
  for (var cl in links) {
    var link = links[cl];
    if (link.rel === "stylesheet" && !isExternal(link.href)) {
      // console.log(link.href);
      link.href = link.href.replace(/\?(.*)/, "") + "?" + rnd;
    }
  }
}

eventSource.onopen = (event) => {
  console.log("eventSource open");
};

eventSource.onerror = (event) => {
  console.log("eventSource error");
  // console.log(event);
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
