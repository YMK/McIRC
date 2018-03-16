const messages = require("../enums/messages");
const state = require("../state");
const User = require("../models/user");

module.exports = {
	test: (command) => command === messages.USER,
	run: (client, username, hostname, servername, realname) => {
		// TODO check that there isn't a duplicate
		if (!client.user) {
			console.log("User set, no nick first");
			const user = new User(undefined, client, username, hostname, servername, realname);
			state.addUser(user);
			client.user = user;
		} else {
			console.log("User set, already got nick");
			client.user.updateInfo({username, hostname, servername, realname});

			client.send(`001 ${client.user.nick} "Welcome to the Internet Relay Network ${client.user.nick}!${client.user.username}@${client.user.hostname}"`);
			client.send(`002 ${client.user.nick} "Your host is localhost, running version 0.0.1"`);
			client.send(`003 ${client.user.nick} "This server was created ${(new Date()).toISOString()}"`);
			client.send(`004 ${client.user.nick} "localhost 0.0.1 o o"`);
		}
	}
};
