## Installation

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

Clone this repository:

```sh
git clone https://github.com/explodinglabs/refresh.js.git
cd refresh.js
```

Bring up the required containers:

```sh
docker compose up
```

Include in your webpage (at the bottom, after `</body>`):

```html
<script
  type="text/javascript"
  src="https://raw.githubusercontent.com/explodinglabs/refresh.js/refs/heads/main/refresh.js"
></script>
```
