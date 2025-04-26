<p align="center">
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="300" src="https://github.com/explodinglabs/powersync/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>BrowserSync alternative for Power Users</i>
</p>

Test many browsers at once - Chrome, Safari, Firefox, Desktop/Mobile, etc.

1. All browsers updated as you edit. (requires editor integration)
2. DOM events synced across browsers (scroll, click, touch, etc.)

- No polling
- No file watching
- No delay
- No server log pollution
- No need for a "development" or "live" server

## Quick Start

### 1. Start the PowerSync service

Start the PowerSync container (this is just [Mercure](https://mercure.rocks/)
with a little configuration):

```sh
docker run --rm --name powersync --publish 8080:80 ghcr.io/explodinglabs/powersync
```

### 2. Add the PowerSync script to your web page

Include the `powersync.js` script in your HTML (put this at the bottom, right
before `</body>`):

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

`data-events-uri` is the location of the event source (the PowerSync
container). We could use the full URL like `http://localhost:8080/powersync`,
but that wouldn't work across the network (for example, to test a mobile
browser you need to connect to the event source by it's ip address, not
`localhost`). By omitting the protocol and host, `powersync.js` will use the
ones in `window.location` (the url in the browser window). Another option is to
use a path like `/powersync` and then reverse proxy that to
`http://localhost:8080/powersync`.

`data-events-topic` is the topic to subscribe to. We used the topic name
"powersync", but you could use your app's name.

### 3. Send a request

Publishing requires a JWT token:

```sh
export TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4
```

This specific token works because it matches the secret that's hard-coded in the
container. If security is important, change the secret (see
[Configuration](#configuration)).

To refresh the page, send a `html` event:

```sh
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -d "topic=powersync&data=html" \
  http://localhost:8080/.well-known/mercure
```

To update just the stylesheets, send a `css` event (`data=css`). This won't do a
full refresh of the page, just refresh the styles. Note this only works if your
css is loaded from external stylesheets in `<link>` tags, not embedded in
`<style>` tags.

## Configuration

By default no authentication needed to subscribe, because the Caddyfile has the
`anonymous` directive. But a token is needed to publish.

The secrets are set in the Caddyfile. If you want to change them:

1. Write your own Caddyfile file with a different keys.
2. Mount the Caddyfile into the container at `/etc/caddy/Caddyfile`.
3. [Generate a new token](https://jwt.io/), with payload `{"mercure": {"publish": ["*"]}}`, and your secret in the "VERIFY SIGNATURE" section.

## Bonus: Vim Usage

Here's how I refresh the browser when a file is saved in Vim.

Add to `~/.vimrc` (Vim 9+ only):

```vim
def g:CbJobFailed(channel: channel, msg: string)
  echow msg
enddef

autocmd BufWritePost *.html,*.js
  call job_start(
    [
      'curl', '--fail', '--silent', '--show-error',
      '-X', 'POST',
      '-H', 'Authorization: Bearer (your token)',
      '--data', 'topic=powersync&data=html',
      'http://localhost:8080/.well-known/mercure'
    ],
    {'err_cb': function('g:CbJobFailed')}
  )

autocmd BufWritePost *.css
  call job_start(
    [
      'curl', '--fail', '--silent', '--show-error',
      '-X', 'POST',
      '-H', 'Authorization: Bearer (your token)',
      '--data', 'topic=powersync&data=css',
      'http://localhost:8080/.well-known/mercure'
    ],
    {'err_cb': function('g:CbJobFailed')}
  )
```
