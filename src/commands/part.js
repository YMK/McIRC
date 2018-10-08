const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PART,
	run: (client, chanlist, reason) => {
		if (!chanlist) {
			return client.send(Message.Builder()
				.withCommand(Message.Command.ERR_NEEDMOREPARAMS)
				.withParameter(Message.Command.PART)
				.withParameter("Not enough parameters")
				.build());
		}

		chanlist.split(",").forEach((chan) => {
			const to = state.get(chan);

			if (!to) {
				return client.send(Message.Builder()
					.withCommand(Message.Command.ERR_NOSUCHCHANNEL)
					.withParameter(Message.Command.PART)
					.withParameter("No such channel")
					.build());
			}

			if (!to.getUsers().includes(client.user)) {
				return client.send(Message.Builder()
					.withCommand(Message.Command.ERR_NOTONCHANNEL)
					.withParameter(Message.Command.PART)
					.withParameter("You're not on that channel")
					.build());
			}

			const partMessage = Message.Builder()
				.withSource(`${client.user.username}@${client.user.hostname}`)
				.withCommand(Message.Command.PART)
				.withParameter(chan)
				.withParameter(reason || "")
				.build();

			to.sendMessage(null, partMessage);
			to.removeUser(client.user);
		});
	}
};
