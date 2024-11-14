var changesEventSource = new EventSource("/events/changes");

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
  var links = document.getElementsByTagName("link");
  for (var cl in links) {
    var link = links[cl];
    if (link.rel === "stylesheet") {
      let rnd = (Math.random() + 1).toString(36).substring(7);
      link.href = link.href.replace(/\?(.*)/, "") + "?" + rnd;
    }
  }
});
