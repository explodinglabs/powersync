<p align="center">
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Browser Syncing for Web Developers</i>
</p>

## Features

Use many browsers at once - Chrome, Safari, Firefox, Desktop/Mobile, etc.

1. **DOM events synced across browsers** (input, click, scroll, touch, etc.)
2. **Browsers updated as you edit** (for Web developers)

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
