// <channel>{,<channel>} [<key>{,<key>}]

const Message = require("../models/message");
const Channel = require("../models/channel");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.JOIN,
	run: (client, chan) => {
		// TODO: I dunno...support multiple channels
		// TODO: Support keys
		console.log(`${client.user.nick} wants to join ${chan}`);
		// Create channel if it doesn't exist
		let channel = state.channels[chan];
		if (!channel) {
			state.addChannel(new Channel(chan, client.user));
		} else {
			channel.addUser(client.user);
		}
		client.send(Message.Builder()
			.withSource(client.user.nick)
			.withCommand(Message.Command.JOIN)
			.withParameter(chan)
			.build());

		// TODO: Send names
		// TODO: Send join to other users
	}
};
