<p align="center">
  <img alt="Logo light" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo dark" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Browser Synchronization</i>
</p>

- 🔁 **Automatic browser refresh as you edit text**
- ✅ **Actions synced across browsers** (input, click,
  scroll, etc.) _optional_

https://github.com/user-attachments/assets/11899fba-bb7d-4b44-ad25-fe5eba3f2856

## Architecture

<p align="center">
  <img alt="Architecture light" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/architecture-light.svg?raw=true#gh-light-mode-only" />
  <img alt="Architecture dark" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/architecture-dark.svg?raw=true#gh-dark-mode-only" />
</p>

## 🚀 Quick Start

### 1. Start the Events Hub

Make sure [Docker is
installed](https://docs.docker.com/get-docker/), then
run:

```sh
docker run -d --name powersync -p 8080:80 ghcr.io/explodinglabs/powersync
```

### 2. Add PowerSync to Your HTML

Insert the following snippet (generally before the `</body>` closing tag, in
certain cases it only works in `<head>`):

```html
<script
  id="powersync"
  type="text/javascript"
  data-events-uri=":8080/.well-known/mercure"
  data-events-topic="powersync"
  src="https://explodinglabs.com/powersync/powersync-0.1.1.js"
></script>
```

> [!TIP]
> Since 0.1.1, add `?sync=true` to the src url to sync DOM events like input,
> scroll, and clicks across browsers.

Alternative method, excluding the production domain:

```html
<script>
  if (location.hostname !== "myapp.com") {
    const s = document.createElement("script");
    s.id = "powersync";
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://explodinglabs.com/powersync/powersync-0.1.1.js";
    s.dataset.eventsUri = ":8080/.well-known/mercure";
    s.dataset.eventsTopic = "powersync";
    document.head.appendChild(s);
  }
</script>
```

### 3. Trigger Browser Updates After Edits

After building your site, notify browsers with an HTTP request:

```sh
curl -X POST http://localhost:8080/.well-known/mercure \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4' \
  --data-urlencode topic=powersync \
  --data-urlencode data='{"type": "refresh"}'
```

#### Supported `type` Values

| Type    | Description                           |
| ------- | ------------------------------------- |
| refresh | Reloads the entire page               |
| css     | Reloads all external stylesheets      |
| js      | Reloads all external JavaScript files |

### File watching (Linux)

Create a script:

**/usr/local/bin/powersync-watch.sh**

```sh
#!/bin/sh

WATCH_DIR="/path/to/watch"

inotifywait -m -r -e close_write "$WATCH_DIR" | while read -r path event file
do
  curl --fail --silent --show-error \
    -X POST http://localhost:8080/.well-known/mercure \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4' \
    --data-urlencode topic=powersync \
    --data-urlencode data='{"type": "refresh"}' \
    --output /dev/null
done
```

Create a service:

**/etc/systemd/system/powersync-watch.service**

```ini
[Unit]
Description=PowerSync file watcher
After=network.target

[Service]
ExecStart=/usr/local/bin/powersync-watch.sh
Restart=always
User=app
WorkingDirectory=/home/app

[Install]
WantedBy=multi-user.target
```

Start it:

```sh
sudo systemctl daemon-reload
sudo systemctl enable powersync-watch
sudo systemctl start powersync-watch
```

### File watching (MacOS)

Then bring up the stacks.

Start powersync (note the watch directory is in the plist file):

```sh
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.explodinglabs.powersync.watch.plist
```

Kill powersync:

```sh
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.explodinglabs.powersync.watch.plist
```
