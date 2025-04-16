var changesEventSource = new EventSource("/events/changes");

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

changesEventSource.onopen = (event) => {
  console.log("changesEventSource open");
};

changesEventSource.onerror = (event) => {
  console.log("changesEventSource error");
};

changesEventSource.addEventListener("html", (event) => {
  document.location.reload();
});

changesEventSource.addEventListener("js", (event) => {
  document.location.reload();
});

changesEventSource.addEventListener("css", (event) => {
  refreshCss();
});
