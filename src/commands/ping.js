const messages = require("../enums/messages");

module.exports = {
	test: (command) => command === messages.PING,
	run: (client, clientName) => {
		client.send(`${messages.PONG} ${clientName}`);
	}
};
