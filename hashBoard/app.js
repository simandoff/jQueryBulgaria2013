Object.defineProperty(Object.prototype, "json", {enumerable: false, get: function () {
    return JSON.stringify(this)
}});

var http = require('http');
var express = require('express');
var ws = require('ws');
var app = express();
var globalCount = 1000;

app.use(express.static(__dirname + '/static'));
var server = http.createServer(app);
server.listen(4080);

// Web Socket Server Setup
var wss = new ws.Server({server: server});

wss.broadcast = function (data) {
	(typeof data !== 'string') && (data = data.json);
	this.clients.forEach(function (ws) {
		ws.send(data)
	});
}

wss.on('connection', function (ws) {
	var id = ws.upgradeReq.headers['sec-websocket-key'];
	ws.data = {id: id, txt: ''}
	console.log('Client connected: %s, count: %d ', id, wss.clients.length);
	ws.on('message', function (data) {
		try {
			var json = JSON.parse(data);
			ws.data.txt = json.txt;
			ws.data.pos = json.pos;
			wss.broadcast(ws.data);
		} catch (e) {
			console.error(e);
		}
	});

	ws.on('close', function () {
		console.log('Client %s disconnected, count:', id, wss.clients.length);
		wss.broadcast({id: id, remove: 1});
	});

	// Notify the client for current global Count
	// The value can be used for auto generate the hash tag
	ws.send({globalCount: globalCount++}.json);

	// Collect all data and send it to current web socket
	wss.clients.forEach(function (cs) {
		ws.send(cs.data.json)
	});
});
