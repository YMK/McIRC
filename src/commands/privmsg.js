const messages = require("../enums/messages");
const state = require("../state");

module.exports = {
	test: (command) => command === messages.PRIVMSG,
	run: function (client, toSend) {
		const message = Array.from(arguments).slice(2).join(" ");
		console.log(`PRIVMSG to ${toSend} with ${message}`);
		const to = state.getUser(toSend);
		if (!to) {
			return console.log(`${toSend} doesn't exist`);
		}
		to.sendMessage(client.user.nick, message.slice(1));
	}
};
