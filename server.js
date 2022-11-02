var express = require("express");
var socket = require("socket.io");
var app = express();
var onlineParticipants = {};
var server = app.listen(4000, function () {
	console.log("listening for requests on port 4000");
});
// serve static files such as html, css, assets and js files, using build-in middleware functions using express.
app.use(express.static(__dirname));
// capture the socket and pass the server
var io = socket(server);
// when connect is established, the following events will occur.
io.on("connection", (socket) => {
	console.log("made socket connection", socket.id);
	// Listen to the event chat and emit the data with a message chat to the client.
	socket.on("chat", function (data) {
		socket.broadcast.emit("chat", data);
	});
	// Listen to the event typing and emit the data with a message typing to the client.
	socket.on("typing", function (data) {
		socket.broadcast.emit("typing", data);
	});
	// Listen to the event join and emit the data with a message join to the client.
	socket.on("join", (data) => {
		socket.broadcast.emit("join", data);
		onlineParticipants[socket.id] = data;
	});
	// Listen to the event disconnect and emit the user name with a message disconnect to the client.
	socket.on("disconnect", () => {
		socket.broadcast.emit("left", onlineParticipants[socket.id]);
		console.log('onlineParticipants: ', onlineParticipants[socket.id]);
		delete onlineParticipants[socket.id];
		console.log(Object.values(onlineParticipants));
	});
	// Listen to the event online and emit the onlineParticipants with a message online to the client.
	socket.on("online", () => {
		socket.emit("online", Object.values(onlineParticipants));
	});
});
