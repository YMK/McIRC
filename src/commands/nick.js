const messages = require("../enums/messages");
const state = require("../state");
const User = require("../models/user");

module.exports = {
	test: (command) => command === messages.NICK,
	run: (client, newNick) => {
		// TODO check that there isn't a duplicate
		if (client.user) {
			if (client.user.nick) {
				console.log("Updating username");
			} else {
				console.log("Setting username, user already exists");


				client.send(`001 ${client.user.nick} "Welcome to the Internet Relay Network ${client.user.nick}!${client.user.username}@${client.user.hostname}"`);
				client.send(`002 ${client.user.nick} "Your host is localhost, running version 0.0.1"`);
				client.send(`003 ${client.user.nick} "This server was created ${(new Date()).toISOString()}"`);
				client.send(`004 ${client.user.nick} "localhost 0.0.1 o o"`);
			}
			client.user.updateInfo({nick: newNick});
		} else {
			console.log("Setting username, user doesn't exist yet");
			const user = new User(newNick, client);
			state.addUser(user);
			client.user = user;
		}
	}
};
