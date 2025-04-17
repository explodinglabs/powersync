## Installation

Bring up the refresh.js container (this is just ssehub with a little
configuration):

```sh
docker run --detach --name refresh.js --publish 8080:8080 ghcr.io/explodinglabs/refresh.js
```

Post an event to the channel (this is required to create the channel):

```sh
curl -v -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

Include refresh.js in your webpage (at the bottom, right before `</html>`):

```html
<script
  type="text/javascript"
  src="https://raw.githubusercontent.com/explodinglabs/refresh.js/refs/heads/main/refresh.js"
></script>
```

To refresh the entire page, send a "html" event:

```sh
curl -v -X POST -d '{"id": 1, "event": "html", "data": null}' http://localhost:8080/changes
```

To refresh just the css, send a "css" event:

```sh
curl -v -X POST -d '{"id": 1, "event": "css", "data": null}' http://localhost:8080/changes
```

## Vim Usage

Here's how I send the request when a file is changed in vim.

Add to `~/.vimrc`:

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
