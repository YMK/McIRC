const Message = require("../models/message");
const state = require("../state");
const User = require("../models/user");
const welcome = require("../utils/welcome");

module.exports = {
	test: (command) => command === Message.Command.USER,
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
			welcome(client);
		}
	}
};
