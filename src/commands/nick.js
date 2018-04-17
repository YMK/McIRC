const Message = require("../models/message");
const state = require("../state");
const User = require("../models/user");
const welcome = require("../utils/welcome");

module.exports = {
	test: (command) => command === Message.Command.NICK,
	run: (client, newNick) => {
		// TODO check that there isn't a duplicate
		if (client.user) {
			const oldNick = client.user.nick;
			client.user.updateInfo({nick: newNick});
			if (client.user.nick) {
				console.log("Updating username");
				state.changeUserNick(oldNick, newNick);
				client.send(Message.Builder()
					.withCommand(Message.Command.NICK)
					.withSource(oldNick)
					.withParameter(newNick)
					.build());
				client.send(`:${oldNick} ${Message.Command.NICK} ${newNick}`);
			} else {
				console.log("Setting username, user already exists");
				welcome(client);
			}
		} else {
			console.log("Setting username, user doesn't exist yet");
			const user = new User(newNick, client);
			state.addUser(user);
			client.user = user;
		}
	}
};
