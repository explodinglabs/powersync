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
