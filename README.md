<p align="center">
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Refresh browsers with an HTTP request</i>
</p>

## Overview

<p align="center">
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh/blob/main/.images/architecture-light.svg?raw=true#gh-light-mode-only" />
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh/blob/main/.images/architecture-dark.svg?raw=true#gh-dark-mode-only" />
</p>

### How it works

1. Send a `POST` request to the event source.
2. Event source emits the request as a Server-Sent Event.
3. The webpage is connected to the event source and is listening for events.
4. The webpage receives the event and refreshes itself.

### Benefits of this method

- No polling
- Immediate effect, no delay
- No server log pollution
- Test many browsers at once - Chrome, Safari, Mobile, etc.

## Installation

### 1. Start the Refresh service

The service runs inside a Docker container, so ensure [Docker is
installed](https://docs.docker.com/get-docker/).

Start the Refresh container (this is just [Mercure](https://mercure.rocks/) with
a little configuration):

```sh
docker run --rm --name refresh --publish 8080:80 ghcr.io/explodinglabs/refresh
```

Test it with:

```sh
curl 'http://localhost:8080/.well-known/mercure?topic=refresh'
```

You should see:

```
:
```

### 3. Connect to the event source in your web page

Include the `refresh.js` script in your HTML (put this at the bottom, right
before `</body>`):

```html
<script
  id="refresh-script"
  type="text/javascript"
  data-events-uri=":8080/.well-known/mercure"
  data-events-topic="refresh"
  src="https://explodinglabs.github.io/refresh/refresh.js"
  async
></script>
```

`data-events-uri` is the location of the event source (the Refresh container).
We could use the full URL like `http://localhost:8080/refresh`, but that
wouldn't work across the network (for example, to test a mobile browser you need
to connect to the event source by it's ip address, not `localhost`). By omitting
the protocol and host, `refresh.js` will use the ones in `window.location` (the
url in the browser window). Another option is to use a path like `/refresh` and
then reverse proxy that to `http://localhost:8080/refresh`.

`data-events-topic` is the topic to subscribe to. We used the topic name
"refresh", but you could use your app's name.

## Usage

Publishing requires a JWT token, so set one:

```sh
export TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdfX0.PXwpfIGng6KObfZlcOXvcnWCJOWTFLtswGI5DZuWSK4
```

This token works because it matches the secret that's hard-coded in the
container. If security is important, change the secret (see
[Configuration](#configuration)).

To refresh the page, send a `html` event:

```sh
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -d "topic=refresh&data=html" \
  http://localhost:8080/.well-known/mercure
```

To update just the styles, send a `css` event (`data=css`). This won't do a
full refresh of the page, just reload the stylesheets. Note this only works if
your css is loaded in `<link>` tags, not in `<style>` tags.

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
      '--data', 'topic=refresh&data=html',
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
      '--data', 'topic=refresh&data=css',
      'http://localhost:8080/.well-known/mercure'
    ],
    {'err_cb': function('g:CbJobFailed')}
  )
```
