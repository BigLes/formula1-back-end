var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {});
var ids = [[1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197],
        [197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195],
        [195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194],
        [194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199],
        [199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192],
        [192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191],
        [191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190],
        [190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189],
        [189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188],
        [188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186, 187],
        [187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185, 186],
        [186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184, 185],
        [185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183, 184],
        [184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182, 183],
        [183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181, 182],
        [182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180, 181],
        [181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179, 180],
        [180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173, 179],
        [179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1, 173],
        [173, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 199, 194, 195, 197, 1]],
    positions = [
        [221.529, 199.98],
        [208.411, 194.036],
        [208.733, 214.633],
        [194.797, 210.305],
        [194.223, 230.635],
        [178.641, 227.462],
        [179.352, 246.83],
        [165.118, 242.763],
        [164.813, 262.777],
        [150.183, 259.663],
        [153.404, 279.542],
        [136.911, 279.499],
        [141.96, 296.706],
        [125.641, 296.567],
        [131.913, 313.099],
        [115.6, 314.132],
        [123.588, 329.127],
        [106.349, 330.618],
        [114.484, 345.706],
        [98.109, 348.787]
    ],
    connections = [],
    connected = [],
    teams_choosed = [],
    names = [],
    place = 0,
    not_started = true,
    room_open = true;

server.listen(8000, function() {});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        return;
    }
    request.accept('echo-protocol', request.origin);
    //var connections = [];
    //var connection = request.accept('echo-protocol', request.origin);
    //connections.push(request.accept('echo-protocol', request.origin));
    //connection.on('message', function(message) {
    //    console.log("get message 0");
    //    if (connections[1]) {
    //        connections[1].send(message.utf8Data);
    //        console.log("get message", message.utf8Data);
    //    }
    //});
    //connections[0].on('close', function(reasonCode, description) {});
});

function addEvent (k) {
    connections[k].on('message', function(message) {
        var j = 0,
            len = connections.length,
            choosed,
            msg;
        for (; j < len; j++) {
            if (connected[j]) {
                if (k !== j) {
                    msg = JSON.parse(message.utf8Data);
                    msg.data[9] = [[ids[k][j]]];
                    //console.log(msg);
                    connections[j].send(JSON.stringify(msg));
                } else {
                    msg = JSON.parse(message.utf8Data);
                    if (msg.data[0][0][0] === "ChangeTeam") {
                        teams_choosed[k] = true;
                        names[k] = msg.data[2][0][0];
                        choosed = teams_choosed.filter(function (c) {return c === true}).length;
                        sendtoAll(["Loading", choosed]);
                        if (choosed === teams_choosed.length) {
                            sendtoAll(["TeamsSelected"]);
                            sendtoAll(["Loading", 0]);
                        }
                        msg.data[0][0][0] = "SetOwnPosition";
                        msg.data[2][0][0] = positions[k][0];
                        msg.data[3][0][0] = positions[k][1];
                        //console.log(msg);
                        connections[j].send(JSON.stringify(msg));
                    }
                }
            }
        }
    });
}

function sendtoAll (message, cons) {
    var j = 0,
        len = connections.length,
        msg = {c2array: true,
            size: [10,1,1],
            data: [[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]],[[0]]]
        };
    for (; j < message.length; j++) {
        msg.data[j][0][0] = message[j];
    }
    if (cons) {
        console.log(JSON.stringify(msg));
    }
    for (j = 0; j < len; j++) {
        if (connected[j]) {
            connections[j].send(JSON.stringify(msg));
        }
    }
}

function countDown () {
    var i = 0,
        int;
    int = setInterval(function () {
        sendtoAll(["Loading", i]);
        i++;
        if (i >= 16) {
            clearInterval(int);
            sendtoAll(["ChooseTeams", connected.length]);
            room_open = false;
        }
    }, 1000);
}

wsServer.on('connect', function(connection) {
    if (room_open) {
        var i = connections.length;
        connected[i] = true;
        teams_choosed[i] = false;
        if ((connected.filter(function (c) {
                return c === true
            }).length >= 2) && not_started) {
            countDown();
            not_started = false;
        }
        connections.push(connection);
        addEvent(i);
    }
});
wsServer.on('close', function(connection) {
    connected[connections.indexOf(connection)] = false;
    teams_choosed[connections.indexOf(connection)] = true;
    if (teams_choosed.filter(function (c) {return c === true}).length === 0) {
        connections = [];
        connected = [];
        teams_choosed = [];
        not_started = true;
        room_open = true;
    }
});