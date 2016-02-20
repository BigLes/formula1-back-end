'use strict';

const ids = require('../common/ids');
const WebSocket = require('ws');

class Room {
    constructor (roomId) {
        this.connections = [];
        this.notStarted = true;
        this.roomOpen = true;
        this.positions = require('../common/startPositions');
        this.timeToStart = 15;
        this.roomId = roomId;
        this.track = undefined;
    }

    onConnect (connection) {

        if (this.roomOpen) {
            connection.player = {id: this.connections.length};
            this.connections.push(connection);

            if ((this.connections.filter((connection) => !(connection.readyState === WebSocket.CLOSED)).length >= 2) && this.notStarted) {
                this._countDown();
                this.notStarted = false;
            }

            if (this.track) {
                this._sendToOne(["ChooseTrack", this.track, this.roomId], connection);
            }

            this._addEvent(connection);
        }
    }

    onClose (connection) {
        connection.player.teamChoosed = false;
        if (this.connections.filter((connection) => !(connection.readyState === WebSocket.CLOSED)).length === 0) {
            this.connections = [];
            this.notStarted = true;
            this.roomOpen = true;
        }
    }

    _addEvent (connection) {
        connection.on('message', (message) => {
            let msg = JSON.parse(message);

            this.connections.forEach((tempConnection) => {
                msg.data[9] = [[ids[connection.player.id][tempConnection.player.id]]];
                if ((tempConnection !== connection) && (!(tempConnection.readyState === WebSocket.CLOSED))) {
                    tempConnection.send(JSON.stringify(msg));
                }
            });

            if (msg.data[0][0][0] !== "ChooseTrack") {
                if (msg.data[0][0][0] === "ChangeTeam") {
                    connection.player.teamChoosed = true;
                    connection.player.name = msg.data[2][0][0];
                    const connectedCount = this.connections.filter((connection) => !(connection.readyState === WebSocket.CLOSED)).length;
                    const teamsCount = this.connections.filter((connection) => !(connection.readyState === WebSocket.CLOSED) && connection.player.teamChoosed).length;
                    this._sendToAll(["Loading", teamsCount]);
                    if (connectedCount === teamsCount) {
                        this._sendToAll(["TeamsSelected"]);
                        this._sendToAll(["Loading", 0]);
                    }
                    msg.data[0][0][0] = "SetOwnPosition";
                    msg.data[2][0][0] = this.positions[connection.player.id][0];
                    msg.data[3][0][0] = this.positions[connection.player.id][1];
                    connection.send(JSON.stringify(msg));
                }
            } else {
                this.track = msg.data[1][0][0];
                msg.data[2][0][0] = this.roomId;
                connection.send(JSON.stringify(msg));
            }
        });
        connection.on('close', () => {
            this.onClose(connection);
        });
    }

    _sendToAll (message) {
        let i = message.length;
        let msg = {
            c2array: true,
            size: [10,1,1],
            data: [[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]]]
        };

        while (i--) {
            msg.data[i][0][0] = message[i];
        }

        this.connections.forEach((connection) => {
            connection.send(JSON.stringify(msg));
        });
    }

    _sendToOne (message, connection) {
        let i = message.length;
        let msg = {
            c2array: true,
            size: [10,1,1],
            data: [[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]]]
        };

        while (i--) {
            msg.data[i][0][0] = message[i];
        }

        connection.send(JSON.stringify(msg));
    }

    _countDown () {
        let i = 0,
            int;
        int = setInterval(() => {
            this._sendToAll(["Loading", i]);
            if (i++ >= this.timeToStart) {
                clearInterval(int);
                this._sendToAll(["ChooseTeams", this.connections.filter((connection) => !(connection.readyState === WebSocket.CLOSED)).length]);
                this.roomOpen = false;
            }
        }, 1000);
    }
}

module.exports = Room;
