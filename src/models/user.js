module.exports = class User {

	constructor(nick, username, hostname, servername, realname) {
		this.nick = nick;
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
};