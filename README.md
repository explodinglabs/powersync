Start ssehub:

```sh
docker run --detach --name ssehub --publish 8080:8080 ghcr.io/explodinglabs/ssehub
```

Start RabbitMQ:

```sh
docker run --detach --name rabbitmq --publish 5672:5672 --publish 15672:15672 rabbitmq:3-management
```

Include in your webpage:

```html
<script
  type="text/javascript"
  src="https://github.com/explodinglabs/refresh.js/refresh.js"
></script>
```
