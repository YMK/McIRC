const Message = require('./message');

module.exports = class Channel {

	constructor(name, owner) {
		this.name = name;
		this.users = [owner];
		this.owner = owner;
		this.modes = [];
	}

	addUser(user) {
		this.users.push(user);
	}

	removeUser(user) {
		this.users.splice(this.users.indexOf(user), 1);
	}

	sendMessage(from, messageText) {
		const message = Message.Builder()
			.withCommand(Message.Command.PRIVMSG)
			.withSource(from)
			.withParameter(this.name)
			.withParameter(messageText)
			.build();
		console.log("sending message");
		this.users.forEach((user) => (user.nick !== from) && user.client.send(message));
	}

};