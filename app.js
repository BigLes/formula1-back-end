'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
let settings;

let Room = require('./models/room');
let rooms = {};

const server = http.createServer(function(request, response) {});
if (process.env.DEVELOP) {
    settings = require('./settings').develop;
} else {
    settings = require('./settings').production;
}

GLOBAL.app = server.listen(settings.port, function() {
    app.settings = settings;
    console.log('Server started');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    let roomId = request.resourceURL.query.roomId;
    let track = request.resourceURL.query.track;
    let room;

    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        return request.reject();
    }

    if (!roomId) {
        room = new Room(roomId, track);
        rooms[roomId] = room;
    } else {
        room = rooms[roomId];
    }

    wsServer.on('connect', room.onConnect.bind(room));
    wsServer.on('close', room.onClose.bind(room));

    request.accept('echo-protocol', request.origin);
});