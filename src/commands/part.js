const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PART,
	run: (client, chanlist, reason) => {
		if (!chanlist) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.PART, client.user.nick));
		}

		chanlist.split(",").forEach((chan) => {
			const to = state.get(chan);

			if (!to) {
				return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHCHANNEL, chan, client.user.nick));
			}

			if (!to.getUsers().includes(client.user)) {
				return client.send(Message.makeNumeric(Message.Command.ERR_NOTONCHANNEL, chan, client.user.nick));
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
