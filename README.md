<p align="center">
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/logo-light.png?raw=true#gh-light-mode-only" />
  <img alt="Logo" height="100" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/logo-dark.png?raw=true#gh-dark-mode-only" />
</p>

<p align="center">
  <i>Refresh browser(s) with an HTTP request</i>
</p>

## How it works

1. The webpage connects to SSEHub and listens for events.
2. You send a `POST` request to SSEHub.
3. SSEHub emits the request as a Server-Sent Event.
4. The webpage receives the event and refreshes itself.

<p align="center">
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/architecture-light.svg?raw=true#gh-light-mode-only" />
  <img alt="Architecture diagram" src="https://github.com/explodinglabs/refresh.js/blob/main/.images/architecture-dark.svg?raw=true#gh-dark-mode-only" />
</p>

## Installation

### Start the container

Bring up the refresh.js container (this is just
[SSEHub](https://github.com/vgno/ssehub) with a little configuration):

```sh
docker run --detach --name refresh.js --publish 8080:8080 ghcr.io/explodinglabs/refresh.js
```

### Create the channel

To create the `changes` channel, simply post an event to it:

```sh
curl -v -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

### Add script to your webpage

Include refresh.js in your html (put this at the bottom, right before
`</html>`):

```html
<script
  type="text/javascript"
  src="https://explodinglabs.github.io/refresh.js/refresh.js"
></script>
```

## Usage

To refresh the entire page, send a "html" event:

```sh
curl -v -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

To refresh just the css, send a "css" event:

```sh
curl -v -X POST -d '{"id": 1, "event": "css", "data": null}' http://localhost:8080/changes
```

## Vim Usage

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

## Build and push the image

```sh
docker build -t ghcr.io/explodinglabs/refresh.js .
docker push ghcr.io/explodinglabs/refresh.js
```
