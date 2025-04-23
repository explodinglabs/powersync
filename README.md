<p align="center">
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Refresh browsers with an HTTP request</i>
</p>

## How it works

1. Send a `POST` request to SSEHub.
2. SSEHub emits the request as a Server-Sent Event.
3. The webpage is connected to SSEHub and listening for events.
4. The webpage receives the event and refreshes itself.

<p align="center">
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh/blob/main/.images/architecture-light.svg?raw=true#gh-light-mode-only" />
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh/blob/main/.images/architecture-dark.svg?raw=true#gh-dark-mode-only" />
</p>

## Benefits

- No polling
- Immediate effect, no delay
- No server log pollution
- Test many browsers at once - Chrome, Safari, Mobile, etc. with a single request.

## Installation

### 1. Start the Refresh container

Bring up the Refresh container (this is just
[SSEHub](https://github.com/vgno/ssehub) with a little configuration):

```sh
docker run --detach --name refresh --publish 8080:8080 ghcr.io/explodinglabs/refresh
```

### 2. Create a Channel

Create a channel by simply posting an event to it:

```sh
curl -X POST -d '{"id": 1, "event": "html", "data": null}' -w '%{response_code}' http://localhost:8080/refresh
```

Here we used "refresh" as the channel name, but you could use your app's name.

### 3. Add the Refresh script to your HTML

Include the `refresh.js` script in your page (put this at the bottom, right
before `</body>`):

```html
<script
  type="text/javascript"
  data-events-uri=":8080/refresh"
  src="https://explodinglabs.github.io/refresh/refresh.js"
  async
></script>
```

`data-events-uri` is the location of the event source (the refresh container).
If the protocol and host are omitted, `refresh.js` will use the ones in
`window.location` (the current url in the browser window).

Another option is to set the events uri to a path like `/refresh` and then
reverse proxy that, usually to `http://localhost:8080/refresh`.

## Usage

To refresh the entire page, send a `html` or `js` event:

```sh
curl -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/refresh
```

To update just the styles, send a `css` event:

```sh
curl -X POST -d '{"id": 1, "event": "css", "data": null}' http://localhost:8080/refresh
```

### Vim Usage

Here's how I refresh the browser when a file is saved in vim.

Add to `~/.vimrc` (Vim 9+ only):

```vim
def g:CbJobFailed(channel: channel, msg: string)
  echow msg
enddef

autocmd BufWritePost *.html,*.js
  call job_start(
    ['curl', '--fail', '--silent', '--show-error', '-X', 'POST', '--data', '{"id": 1, "event": "html", "data": null}', 'http://localhost:8080/refresh'],
    {
      'exit_cb': function('g:CbRefreshBrowser'),
      'err_cb': function('g:CbJobFailed')
    }
  )

autocmd BufWritePost *.css
  call job_start(
    ['curl', '--fail', '--silent', '--show-error', '-X', 'POST', '--data', '{"id": 1, "event": "css", "data": null}', 'http://localhost:8080/refresh'],
    {
      'exit_cb': function('g:CbRefreshBrowser'),
      'err_cb': function('g:CbJobFailed')
    }
  )
```

## Troubleshooting

Here are some tips for locating problems.

### Ensure the service is running

Check:

```sh
docker logs refresh
```

You should see:

```
Listening on 0.0.0.0:8080
Started client router thread.
```

### Test the connection

Try:

```sh
curl http://localhost:8080/refresh
```

You should see:

```
:ok

```

Here you can watch the messages coming in.

If you get 404 Not Found, have you created the channel?

### Check the javascript console

It should show:

```
eventSource open
```
