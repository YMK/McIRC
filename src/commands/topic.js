const Message = require("../models/message");
const state = require("../state");

module.exports = {
	test: (command) => command === Message.Command.TOPIC,
	run: (client, chanName, newTopic) => {
		if (!chanName) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NEEDMOREPARAMS, Message.Command.TOPIC, client.user.nick));
		}

		const channel = state.channels[chanName];

		if (!channel) {
			return client.send(Message.makeNumeric(Message.Command.ERR_NOSUCHCHANNEL, chanName, client.user.nick));
		}

		if (!channel.topic && !newTopic) {
			return client.send(Message.makeNumeric(Message.Command.RPL_NOTOPIC, chanName, client.user.nick));
		}

		if (newTopic) {
			channel.setTopic(newTopic, client.user.nick);
			const topicMessage = Message.Builder()
				.withCommand(Message.Command.RPL_TOPIC)
				.withParameter(client.user.nick)
				.withParameter(channel.name)
				.withParameter(channel.topic.text)
				.build();

			client.send(topicMessage);
			channel.sendMessage(client.user.nick, topicMessage);
		} else if (newTopic === "") {
			channel.clearTopic();
			const noTopicMessage = Message.makeNumeric(Message.Command.RPL_NOTOPIC, chanName, client.user.nick);
			client.send(noTopicMessage);
			channel.sendMessage(client.user.nick, noTopicMessage);
		} else {
			client.send(Message.Builder()
				.withCommand(Message.Command.RPL_TOPIC)
				.withParameter(client.user.nick)
				.withParameter(channel.name)
				.withParameter(channel.topic.text)
				.build());

			client.send(Message.Builder()
				.withCommand(Message.Command.RPL_TOPICWHOTIME)
				.withParameter(client.user.nick)
				.withParameter(channel.name)
				.withParameter(channel.topic.author)
				.withParameter(String(channel.topic.time))
				.build());
		}
	}
};
