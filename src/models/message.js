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
				this.parameters = this.parameters || [];
				if (parameter.includes(" ")) {
					this.parameters.push(`:${parameter}`);
				} else {
					this.parameters.push(parameter);
				}

				return this;
			}

			build() {
				return new Message(this.command, this.parameters, this.source);
			}
		}()
	}
}

Message.Command = {
	// Messages
	JOIN: "JOIN",
	NICK: "NICK",
	PART: "PART",
	PING: "PING",
	PONG: "PONG",
	PRIVMSG: "PRIVMSG",
	QUIT: "QUIT",
	USER: "USER",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004",
	RPL_NAMREPLY: "353",
	RPL_ENDOFNAMES: "366",

	ERR_NOSUCHCHANNEL: "403",
	ERR_NONICKNAMEGIVEN: "431",
	ERR_NICKNAMEINUSE: "433",
	ERR_NOTONCHANNEL: "442",
	ERR_NEEDMOREPARAMS: "461",
};

module.exports = Message;