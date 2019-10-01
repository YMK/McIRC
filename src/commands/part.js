const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PART,
	run: function (client, {args: [chanlist, reason]}) {
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

			let builder = Message.Builder()
				.withSource(client.user.getHostMask())
				.withCommand(Message.Command.PART)
				.withParameter(chan);
			if (reason && reason !== "") {
				builder = builder.withParameter(reason || "");
			}
			const partMessage = builder
				.build();

			to.sendMessage(null, partMessage);
			to.removeUser(client.user);
		});
	}
};
