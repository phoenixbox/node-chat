var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUSed = [];
var currentRoom = {};

exports.listen = function (server) {
	io = socketio.listen(server);

	io.set('log level', 1);

	io.sockets.on('connection', function(socket) {
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

		joinRoom(socket, 'Lobby');

		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);

		socket.on('rooms', function() {
			socket.emit('rooms', io.sockets.manager.rooms);
		});

		handleClientDisconnection(socket, nickNames, namesUsed);
	})
}

function assginGuestName(socket, guestNumber, nickNames, namesUsed) {
	var name = 'Guest' + guestNumber;

	nickNames[socket.id] = name;

	socket.emit('nameResult', {
		success: true,
		name: name
	});

	namesUsed.push(name);

	return guestNumber + 1;
}

function joinRoom(socket, room) {
	socket.join(room);
	currentRoom[socket.id] = room;

	socket.emit('joinResult' {room: room});
	socket.broadcast.to(room).emit('message', {
		text: nickNames[socket.id] + ' has joined ' + room + '.'
	});

	var usersInRoom = io.sockets.clients(room);
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for (var i in usersinRoom) {
			var userSocketId = usersInRoom[i].id;

			if (userSocketId != socket.id) {
				if (i > 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		socket.emit('message', {text: usersInRoomSummary});
	}
}