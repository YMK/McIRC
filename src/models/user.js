const Message = require("./message");

module.exports = class User {

	constructor(nick, client, username, hostname, servername, realname) {
		this.nick = nick;
		this.client = client;
		this.username = username;
		this.hostname = hostname;
		this.servername = servername;
		this.realname = realname;
		this.channels = [];
		this.registered = false;
		this.modes = [];
	}

	setClient(client) {
		this.client = client;
	}

	addChannel(chan) {
		this.channels.push(chan);
	}

	getChannels() {
		return this.channels;
	}

	getHostMask() {
		return `${this.nick}!${this.username}@${this.hostname}`;
	}

	updateInfo({nick, username, hostname, servername, realname}) {
		this.nick = nick || this.nick;
		this.username = username || this.username;
		this.hostname = hostname || this.hostname;
		this.servername = servername || this.servername;
		this.realname = realname || this.realname;
	}

	sendMessage(from, messageText) {
		const message = Message.Builder()
			.withCommand(Message.Command.PRIVMSG)
			.withSource(from)
			.withParameter(this.nick)
			.withParameter(messageText)
			.build();
		this.client.sendMessage(message);
	}

	sendNotice(from, messageText) {
		const message = Message.Builder()
			.withCommand(Message.Command.NOTICE)
			.withSource(from)
			.withParameter(this.nick)
			.withParameter(messageText)
			.build();
		this.client.sendMessage(message);
	}
};