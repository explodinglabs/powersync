function isExternal(url: string): boolean {
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

function refreshCss(): void {
  let rnd = (Math.random() + 1).toString(36).substring(7);
  var links = document.getElementsByTagName("link");
  for (var cl in links) {
    var link = links[cl];
    if (link.rel === "stylesheet" && !isExternal(link.href)) {
      link.href = link.href.replace(/\?(.*)/, "") + "?" + rnd;
    }
  }
}

export function subscribe(uri: string, topic: string): void {
  const url = new URL(uri);
  url.searchParams.append("topic", topic);

  const eventSource = new EventSource(url);

  eventSource.onopen = (event: Event) => {
    console.log("eventSource open");
  };

  eventSource.onerror = (event: Event) => {
    console.log("eventSource error");
  };

  eventSource.onmessage = (event: MessageEvent) => {
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
