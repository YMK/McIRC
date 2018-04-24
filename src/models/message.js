class Message {

	constructor(name, parameters, source) {
		this.command = name;
		this.source = source;
		// TODO: Limit to 15

		// TODO: Error if we have spaces in anything other than the last (and prepend it with ":" if we do)
		this.parameters = parameters || [];
	}

	getMessageString() {
		// [@tags] [:source] <command> <parameters>

		// TODO: add tags
		let string = "";
		if (this.source) {
			string += `:${this.source} `
		}
		string += `${this.command} ${this.parameters.join(" ")}`.trim();

		return string;
	}

	static Builder() {
		return new class Builder {
			// TODO: fromString(commandstring) {

			withCommand(command) {
				this.command = command;

				return this;
			}

			withSource(source) {
				this.source = source;

				return this;
			}

			withParameter(parameter) {
				if (parameter.includes(" ")) {
					parameter = `:${parameter}`;
				}
				this.parameters = this.parameters || [];
				this.parameters.push(parameter);

				return this;
			}

			build() {
				return new Message(this.command, this.parameters, this.source);
			}
		}
	}
}

Message.Command = {
	// Messages
	JOIN: "JOIN",
	NICK: "NICK",
	PING: "PING",
	PONG: "PONG",
	PRIVMSG: "PRIVMSG",
	USER: "USER",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004"
};

module.exports = Message;