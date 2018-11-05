const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PRIVMSG,
	run: function (client, recipientList) {
		if (!recipientList) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NORECIPIENT, undefined, client.user.nick));
		}

		let message = Array.from(arguments).slice(2).join(" ");
		if (!message) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOTEXTTOSEND, undefined, client.user.nick));
		}

		if (message.indexOf(":") === 0) {
			message = message.slice(1);
		}

		recipientList.split(",").forEach((recipient) => {

			const to = state.get(recipient);
			if (!to) {
				return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHNICK, to, client.user.nick));
			}

			console.log(`PRIVMSG to ${recipient} with ${message}`);
			to.sendMessage(client.user.nick, message);

		});
	}
};
