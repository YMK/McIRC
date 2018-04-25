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
			channel = new Channel(chan, client.user);
			state.addChannel(channel);
		} else { // Check user isn't already in channel
			channel.addUser(client.user);
		}
		client.user.addChannel(channel);
		const joinMessage = Message.Builder()
			.withSource(client.user.nick)
			.withCommand(Message.Command.JOIN)
			.withParameter(chan)
			.build();
		client.send(joinMessage);

		// TODO: Send names
		channel.sendMessage(client.user.nick, joinMessage);
	}
};
