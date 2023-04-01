const {products} = require('../src/data');
const http = require('http');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const hostname = '0.0.0.0';
const port = 3000;

const template = fs.readFileSync(path.resolve('src/template/home.ejs'), 'utf-8')

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    if (req.url === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        let html = ejs.render(template, {products});

        res.end(html);
    } else if (req.url === '/api' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(products));
    } else {
        res.statusCode = 404;
        res.end('404: File Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});