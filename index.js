'use strict';

const WebSocketServer = require('ws').Server;
const settings = require('./settings');

let Room = require('./models/room');

class FormulaBackEnd {
    constructor (host, port) {
        let rooms = {};

        let options = {
            port: port ? port : settings.port,
            protocolVersion: settings.protocolVersion
        };

        if (host) {
            options.host = host
        }

        const wsServer = new WebSocketServer(options);

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