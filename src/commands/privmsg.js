const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PRIVMSG,
	run: function (client, recipientList) {
		if (!recipientList) {
			return client.send(Message.Builder()
				.withCommand(Message.Command.ERR_NORECIPIENT)
				.withParameter(Message.Command.PRIVMSG)
				.withParameter("No recipient given")
				.build());
		}

		let message = Array.from(arguments).slice(2).join(" ");
		if (!message) {
			return client.send(Message.Builder()
				.withCommand(Message.Command.ERR_NOTEXTTOSEND)
				.withParameter(Message.Command.PRIVMSG)
				.withParameter("No text to send")
				.build());
		}

		if (message.indexOf(":") === 0) {
			message = message.slice(1);
		}

		recipientList.split(",").forEach((recipient) => {

			const to = state.get(recipient);
			if (!to) {
				return client.send(Message.Builder()
					.withCommand(Message.Command.ERR_NOSUCHNICK)
					.withParameter(recipient)
					.withParameter("No such nick/channel")
					.build());
			}

			console.log(`PRIVMSG to ${recipient} with ${message}`);
			to.sendMessage(client.user.nick, message);

		});
	}
};
