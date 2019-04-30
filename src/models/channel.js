const Message = require("./message");
const Topic = require("./topic");

const knownModes = {
	"I": "invisible"
};
const manualModes = {
};

module.exports = class Channel {

	constructor(name, owner) {
		this.name = name;
		this.users = [owner];
		this.owner = owner;
		this.topic = null;
		this.modes = [];
		this.key = null;
		this.modes = {};
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

	setKey(key) {
		this.key = key;
	}

	clearKey() {
		this.key = null;
	}

	getModes() {
		return Object.keys(this.modes);
	}

	setMode(mode, value = true) {
		if (manualModes[mode]) {
			return false;
		}
		this.modes[mode] = value;

		return true;
	}

	unsetMode(mode) {
		if (manualModes[mode]) {
			return false;
		}
		delete this.modes[mode];

		return true;
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

	sendNotice(from, messageText) {
		let message;
		if (typeof messageText === "string") {
			message = Message.Builder()
				.withCommand(Message.Command.NOTICE)
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