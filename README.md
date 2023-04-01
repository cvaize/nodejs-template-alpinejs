# Test stand Node.js + EJS + Alpine.js

Install:
```shell
git clone https://github.com/cvaize/nodejs-template-alpinejs.git \
cd nodejs-template-alpinejs \
docker run --user $(id -u):$(id -g) --rm -ti -v $(pwd):/app -w="/app" node:latest npm i
```

Run:
```shell
docker-compose up -d
```

Stop
```shell
docker-compose down
```

Site: https://your-ip-or-domen
