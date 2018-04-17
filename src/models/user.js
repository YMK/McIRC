const Message = require('./message');

module.exports = class User {

	constructor(nick, client, username, hostname, servername, realname) {
		this.nick = nick;
		this.client = client;
		this.username = username;
		this.hostname = hostname;
		this.servername = servername;
		this.realname = realname;
		this.registered = false;
		this.modes = [];
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
};