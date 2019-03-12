const Message = require("../models/message");
const state = require("../state");
const User = require("../models/user");
const welcome = require("../utils/welcome");
const logger = require("../utils/logger")();
const timeout = require("../utils/timeout");

module.exports = {
	test: (command) => command === Message.Command.USER,
	run: function (client, {args: [username, , , realname]}) {
		// TODO check that there isn't a duplicate
		if (!client.user) {
			logger.debug("User set, no nick first");
			const user = new User(undefined, client, `~${username}`, client.client.remoteAddress, undefined, realname);
			state.addUser(user);
			client.user = user;
		} else {
			logger.debug("User set, already got nick");
			client.user.updateInfo({username: `~${username}`, hostname: client.client.remoteAddress, realname});
			timeout.clearInterval(client.user.username);
			timeout.runTimeout(client);
			welcome(client);
		}
	}
};
