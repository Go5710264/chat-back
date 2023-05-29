const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body')
const router = require('./routes');
const WebSocket = require('ws')
const { WebSocketServer } = require('ws')

const app = new Koa();

app.use(koaBody({
    multipart: true,
}))  

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if(!origin){
        return await next();
    }

    const headers = { 'Access-Control-Allow-Origin': '*', };

    if(ctx.request.method !== 'OPTIONS'){
        ctx.response.set({ ...headers });
        try {
            return await next();
        } catch (e) {
            e.headers = { ...e.headers, ...headers };
            throw e;
        }
    }

    if(ctx.request.get('Access-Control-Request-Method')){
        ctx.response.set({
            ...headers,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
        });

        if(ctx.request.get('Access-Control-Request-Headers')){
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
        }

        ctx.response.status = 204;
    }
});

//TODO: write code here

app.use(router());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wsServer = new WebSocketServer({
    server
});

const chat = ['welcome'];

wsServer.on('connection', (ws) => {
    ws.on('message', (message) => {
        chat.push(message.toString());
        console.log(chat)

        const eventData = JSON.stringify({ chat: [message.toString()] })

        Array.from(wsServer.clients) // взять всех пользователей чата
            .filter(client => client.readyState === WebSocket.OPEN) // отфильтровать тех кто подключены на данный момент
            .forEach(client => client.send(eventData)) // разослать сообщения
    })

    ws.send(JSON.stringify({ chat }));
    
})

server.listen(port);
