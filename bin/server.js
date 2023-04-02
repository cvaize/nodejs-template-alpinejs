require('dotenv').config()
const {getProducts} = require('../src/data');
const http = require('http');
const ejs = require('ejs');
// const fs = require('fs');
const path = require('path');
const {createClient: redisCreateClient} = require('redis');
const querystring = require('node:querystring');

const hostname = '0.0.0.0';
const port = 3000;

const redisClient = redisCreateClient({url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`});
redisClient.on('error', err => console.log('Redis Client Error', err));
let redisConnected = false;
redisClient.connect().then(() => redisClient.flushAll()).then(() => redisConnected = true);

// const template = fs.readFileSync(path.resolve('src/template/home.ejs'), 'utf-8')

const getCachedResponse = async (key, cb, isUseCache = true) => {
    if (!redisConnected || !isUseCache) {
        console.log(`Return without cache: ${key}`);
        return await cb();
    }

    let response = await redisClient.get(key);
    if (response) {
        console.log(`Return from cache: ${key}`);
        return response;
    }

    response = await cb();
    console.log(`Return without cache: ${key}`);
    await redisClient.set(key, response);
    return response;
}

const execTimeout = async (timeout) => {
    if (timeout) {
        await new Promise((resolve) => {
            setTimeout(resolve, Number(timeout));
        });
    }
}

const writeParams = (params, without) => {
    if(without) {
        params = {...params};
        for (const withoutParam of without) {
            delete params[withoutParam];
        }
    }
    return querystring.stringify(params)
}

const server = http.createServer(async (req, res) => {
    res.statusCode = 200;
    const url = req.url;

    const splitUrl = url.split('?');
    const route = splitUrl[0];
    const strParams = splitUrl[1] ?? "";
    const params = querystring.parse(strParams);

    console.log(`Request url=${url}; route=${route} params=${JSON.stringify(params)}`)
    let response = '404: File Not Found';

    if ((route === '/' || route === '/about') && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        response = await getCachedResponse(url, async () => {
            await execTimeout(params.timeout);
            const count = Number(params.count ?? 100);
            const products = getProducts(count);

            const paramsWithoutPage = {...params};
            delete paramsWithoutPage.page;
            const strParamsWithoutPage = querystring.stringify(paramsWithoutPage);

            const page = Number(params.page ?? 1);
            const components = params.components;
            let template = 'src/template/home.ejs';

            if (components === 'products') {
                template = 'src/template/components/products.ejs';
            }

            return await new Promise((resolve, reject) => {
                ejs.renderFile(template, {
                    products,
                    route,
                    strParamsWithoutPage,
                    page,
                    params,
                    writeParams
                }, {root: path.resolve('src/template')}, function (e, str) {
                    if (e) reject(e);
                    resolve(str);
                });
            });
            // return ejs.render(template, {products, route, strParams}, {async: true, root: path.resolve('src/template')});
        }, params?.cache !== '0');

    } else if (route === '/api' && req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        response = await getCachedResponse(url, async () => {
            await execTimeout(params.timeout);
            const count = Number(params.count ?? 100);
            const products = getProducts(count);

            return JSON.stringify(products);
        }, params?.cache !== '0');

    } else if (route === '/clear-cache' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        await redisClient.flushAll();
        response = `Cache cleared. <a href="/">Home</a>`;
        res.statusCode = 201;
    } else {
        res.statusCode = 404;
    }
    res.end(response);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


/**
 * Exit Program
 */


process.stdin.resume();//so the program will not close instantly

async function exitHandler(options, exitCode) {
    if (options.cleanup) {
        redisConnected = false;
        await redisClient.disconnect();
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));