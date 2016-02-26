'use strict';

const WebSocketServer = require('ws').Server;
const settings = require('./settings');

let Room = require('./models/room');

class FormulaBackEnd {
    constructor (host) {
        let rooms = {};

        const wsServer = new WebSocketServer({
            host: host ? host : settings.host,
            port: settings.port,
            protocolVersion: settings.protocolVersion
        });

        wsServer.on('connection', (connection) => {
            let roomId = connection.upgradeReq.url.replace("/?roomId=", "");
            let room;

            if (!roomId) {
                roomId = (new Date()).getTime();
                room = new Room(roomId);
                rooms[roomId] = room;
            } else {
                room = rooms[roomId];
            }

            room && room.onConnect(connection);
        });
    }
}

module.exports = FormulaBackEnd;