const Message = require("./message");
const Topic = require("./topic");

module.exports = class Channel {

	constructor(name, owner) {
		this.name = name;
		this.users = [owner];
		this.owner = owner;
		this.topic = null;
		this.modes = [];
	}

	addUser(user) {
		this.users.push(user);
	}

	removeUser(user) {
		this.users.splice(this.users.indexOf(user), 1);
	}

	getUsers() {
		return this.users;
	}

	setTopic(text, author) {
		if (this.topic) {
			this.topic.changeTopic(text, author);
		} else {
			this.topic = new Topic(text, author);
		}

return text;
	}

	clearTopic() {
		this.topic = null;
	}

	sendMessage(from, messageText) {
		let message;
		if (typeof messageText === "string") {
			message = Message.Builder()
				.withCommand(Message.Command.PRIVMSG)
				.withSource(from)
				.withParameter(this.name)
				.withParameter(messageText)
				.build();
		} else {
			message = messageText;
		}
		this.users.forEach((user) => user.nick !== from && user.client.send(message));
	}

};