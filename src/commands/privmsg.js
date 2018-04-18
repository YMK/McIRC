const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.PRIVMSG,
	run: function (client, toSend) {
		let message = Array.from(arguments).slice(2).join(" ");
		if (message.indexOf(":") === 0) {
			message = message.slice(1);
		}
		console.log(`PRIVMSG to ${toSend} with ${message}`);
		const to = state.getUser(toSend);
		if (!to) {
			return console.log(`${toSend} doesn't exist`);
		}
		to.sendMessage(client.user.nick, message);
	}
};
