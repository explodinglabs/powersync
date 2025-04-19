<p align="center">
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
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
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/architecture-light.svg?raw=true#gh-light-mode-only" />
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/architecture-dark.svg?raw=true#gh-dark-mode-only" />
</p>

## Benefits

- No polling
- Immediate effect, no delay
- No server log pollution
- Test many browsers at once - Chrome, Safari, Mobile, etc. with a single request.

## Installation

### Start the container

Bring up the refresh.js container (this is just
[SSEHub](https://github.com/vgno/ssehub) with a little configuration):

```sh
docker run --detach --name refresh.js --publish 8080:8080 ghcr.io/explodinglabs/refresh.js
```

### Create a Channel

To create the `changes` channel, simply post an event to it:

```sh
curl -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

This works because SSEHub is configured with `"allowUndefinedChannels": true`.

### Add Refresh.js to Your Webpage

Include `refresh.js` in your html (put this at the bottom, right before
`</html>`):

```html
<script
  type="text/javascript"
  src="https://explodinglabs.github.io/refresh.js/refresh.js"
></script>
```

## Usage

Send a "html" or "js" event to refresh the entire page:

```sh
curl -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

Send a "css" event to just update the styles:

```sh
curl -X POST -d '{"id": 1, "event": "css", "data": null}' http://localhost:8080/changes
```

### Vim Usage

Here's how I send a curl request when a file is saved in vim.

Add to `~/.vimrc` (Vim 9+ only):

```vim
def g:CbJobFailed(channel: channel, msg: string)
  echow msg
enddef

autocmd BufWritePost *.html
  call job_start(
    ['curl', '--fail', '--silent', '--show-error', '-X', 'POST', '--data', '{"id": 1, "event": "html", "data": null}', 'http://localhost:8080/changes'],
    {
      'exit_cb': function('g:CbRefreshBrowser'),
      'err_cb': function('g:CbJobFailed')
    }
  )

autocmd BufWritePost *.css
  call job_start(
    ['curl', '--fail', '--silent', '--show-error', '-X', 'POST', '--data', '{"id": 1, "event": "css", "data": null}', 'http://localhost:8080/changes'],
    {
      'exit_cb': function('g:CbRefreshBrowser'),
      'err_cb': function('g:CbJobFailed')
    }
  )
```

## Troubleshooting

To debug connecting, start a connection from the command-line:

```sh
curl http://localhost/changes
```

### 404 Channel does not exist

An SSE channel needs to be created before connecting, otherwise you get
"Channel does not exist". Channels are created when the first event is
published to it. See [Create a Channel](#create_a_channel).

### 403 Forbidden

This can mean you've published to a domain that's not listed in
`restrictPublish` in `ssehub.json`.
