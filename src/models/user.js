const Message = require("./message");
const knownModes = {
	"i": "invisible",
	"o": "operator",
	"O": "localOperator",
	"r": "registered",
	"w": "wallops"
};
const opModes = {
	"o": true,
	"O": true,
	"r": true
};

class User {

	constructor(nick, client, username, hostname, servername, realname) {
		this.nick = nick;
		this.client = client;
		this.username = username;
		this.hostname = hostname;
		this.servername = servername;
		this.realname = realname;
		this.channels = [];
		this.registered = false;
		this.modes = {};
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

	getModes() {
		return Object.keys(this.modes);
	}

	setMode(mode) {
		if (opModes[mode] && !this.isOp()) {
			return false;
		}
		this.modes[mode] = true;

return true;
	}

	unsetMode(mode) {
		if (opModes[mode] && !this.isOp()) {
			return false;
		}
		delete this.modes[mode];

return true;
	}

	isOp() {
		return this.modes.o || this.modes.O;
	}

	isInvisible() {
		return this.modes.i;
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
}

User.knownModes = knownModes;

module.exports = User;