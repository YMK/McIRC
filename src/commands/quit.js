const Message = require("../models/message");

module.exports = {
	test: (command) => command === Message.Command.QUIT,
	run: (client, reason) => {
		const quitMessage = Message.Builder()
			.withSource(`${client.user.username}@${client.user.hostname}`)
			.withCommand(Message.Command.QUIT)
			.withParameter(`Quit: ${reason}`)
			.build();

		client.user.getChannels().forEach((chan) => chan.sendMessage(client.user.username, quitMessage));

		client.disconnected();
	}
};
