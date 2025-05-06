<p align="center">
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Browser Synchronization</i>
</p>

Use many browsers at once - Chrome, Safari, Firefox, Desktop/Mobile, etc.

1. **Actions synced across browsers** (input, click, scroll, etc.)
2. **Browsers updated as you edit**

## Quick Start

### 1. Start the Events hub

Ensure [Docker is installed](https://docs.docker.com/get-docker/), and run:

```sh
docker run -d --name powersync -p 8080:80 ghcr.io/explodinglabs/powersync
```

### 2. Add code snippet to your HTML

Insert this right before `</body>`:

```html
<script
  id="powersync"
  type="text/javascript"
  data-events-uri=":8080/.well-known/mercure"
  data-events-topic="powersync"
  src="https://powersync.github.io/powersync.js"
  async
></script>
```

The actions (DOM events) should now be synced.

### 3. Update as you edit

To refresh all browsers, send an HTTP request:

```sh
curl --request POST \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4' \
  --data-urlencode topic=powersync \
  --data-urlencode data='{"type": "refresh"}' \
  http://localhost:8080/.well-known/mercure
```

For the `data` part, these are the types of messages:

- `refresh`: Does a `window.location.reload()`.
- `css`: Refresh the externally loaded stylesheets (`<link rel=stylesheet...`)
- `js`: Restart the externally loaded javascript.
