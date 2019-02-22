const Message = require("../models/message");
const state = require("../state");
const User = require("../models/user");
const welcome = require("../utils/welcome");
const logger = require("../utils/logger");
const timeout = require("../utils/timeout");

module.exports = {
	test: (command) => command === Message.Command.USER,
	run: (client, username, hostname, servername, realname) => {
		// TODO check that there isn't a duplicate
		if (!client.user) {
			logger.debug("User set, no nick first");
			const user = new User(undefined, client, username, hostname, servername, realname);
			state.addUser(user);
			client.user = user;
		} else {
			logger.debug("User set, already got nick");
			client.user.updateInfo({username, hostname, servername, realname});
			timeout.clearInterval(client.user.username);
			timeout.runTimeout(client);
			welcome(client);
		}
	}
};
