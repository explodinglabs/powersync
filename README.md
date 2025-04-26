<p align="center">
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Browser Syncing for Web Developers</i>
</p>

## Overview

Test many browsers at once - Chrome, Safari, Firefox, Desktop/Mobile, etc.

1. **All browsers updated as you edit** (requires editor integration)
2. **DOM events synced across browsers** (scroll, click, touch, etc.)

- No polling
- No file watching
- No delay
- No server log pollution
- No need for a "development" or "live" server

## Quick Start

### 1. Start the PowerSync service

Start the PowerSync container:

```sh
docker run -d --name powersync -p 8080:80 ghcr.io/explodinglabs/powersync
```

### 2. Add the PowerSync script to your web page

Include in your HTML (at the bottom, right before `</body>`):

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

The DOM events should now be synced.

### 3. Update as you edit

To have the browsers update while you edit your site, see [editor
integration]().
