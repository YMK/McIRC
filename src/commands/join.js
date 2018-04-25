// <channel>{,<channel>} [<key>{,<key>}]

const Message = require("../models/message");
const Channel = require("../models/channel");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.JOIN,
	run: (client, chan) => {
		// TODO: I dunno...support multiple channels
		// TODO: Support keys
		if (!chan) {
			return client.send(Message.Builder().withCommand(Message.Command.ERR_NEEDMOREPARAMS).build());
		}
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
		const namelist = channel.getUsers().reduce((total, user) => total + user.nick + " ", "");
		client.send(Message.Builder()
			.withCommand(Message.Command.RPL_NAMREPLY)
			.withParameter(client.user.nick)
			.withParameter("=")
			.withParameter(channel.name)
			.withParameter(namelist)
			.build());
		client.send(Message.Builder()
			.withCommand(Message.Command.RPL_ENDOFNAMES)
			.withParameter(client.user.nick)
			.withParameter(channel.name)
			.withParameter("End of /NAMES list")
			.build());
		channel.sendMessage(client.user.nick, joinMessage);
	}
};
