const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.NAMES,
	run: (client, chanlist) => {
		let chanName;
		if (chanlist) {
			[chanName] = chanlist.split(","); // We silently ignore all except the first, as is standard practice nowadays

			const channel = state.channels[chanName];
			if (channel) {
				channel.getUsers()
				.forEach((user) => client.send(Message.Builder()
					.withCommand(Message.Command.RPL_NAMREPLY)
					.withParameter(client.user.nick)
					.withParameter("=")
					.withParameter(channel.name)
					.withParameter(user.nick)
					.build()));
			}
		}

		client.send(Message.makeNumeric(Message.Command.RPL_ENDOFNAMES, chanName, client.user.nick));
    }
};