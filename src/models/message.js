const {format, parse} = require("tekko");
const {config} = require("../configManager");
const {version} = require("../../package.json");

class Message {

	constructor(name, parameters, source, trailing) {
		this.command = name;
		this.source = source;

		// TODO: Limit to 15
		this.parameters = parameters || [];
		this.parameters.push(trailing);
		this.parameters = this.parameters.filter((param) => param !== undefined);
	}

	getMessageString() {
		// [@tags] [:source] <command> <parameters>

		// TODO: add tags

		const formatParams = {
			command: this.command,
			params: this.parameters
		};

		if (this.source) {
			formatParams.prefix = {name: this.source};
		}

		return format(formatParams);
	}

	static makeISupport(username) {
		/* eslint-disable multiline-comment-style */
		return Message.Builder()
			.withCommand(Message.Command.RPL_ISUPPORT)
			.withParameter(username)
			.withParameter("AWALEN=200")
			.withParameter("CASEMAPPING=ascii")
			.withParameter(`CHANLIMIT=${config.chanTypes}:`)
			// TODO: Add CHANMODES=ASDSDGFW (for channel modes) **REQUIRED**
			.withParameter(`CHANNELLEN=${config.channelLength}`)
			.withParameter(`CHANTYPES=${config.chanTypes}`)
			// TODO: Add ELIST= (for LIST search) **REQUIRED**
			// TODO: Add EXCEPTS=e (for ban exceptions)
			// TODO: Add EXTBAN= (for extended ban masks)
			.withParameter(`HOSTLEN=${config.hostLength}`)
			// TODO: Add KICKLEN=255 (for kick reason lengths) **REQUIRED**
			// TODO: Add MAXLIST= (for something to do with modes) **REQUIRED**
			.withParameter(`NETWORK=${config.network}`)
			.withParameter(`NICKLEN=${config.nickLength}`)
			// TODO: Add PREFX= (for user prefixes on channels)
			// TODO: Maybe add SAFELIST if necessary? Maybe make it configurable
			// TODO: Add SILENCE
			// TODO: Add STATUSMSG= (for supporting sending messages to a prefix on a channel) **REQUIRED**
			.withParameter(`TOPICLEN=${config.topicLength}`)
			.withParameter(`USERLEN=${config.userLength}`)
			.withParameter("are supported by this server")
			.build();
		/* eslint-enable */
	}

	static makeVersion(username) {
		return Message.Builder()
			.withCommand(this.Command.RPL_VERSION)
			.withParameter(username)
			.withParameter(`McIRC-${version}`)
			.withParameter(config.serverName)
			.build();
	}

	static makeNumeric(numeric, customParams, user, customMessage) {
		const message = customMessage || this.NumericMessage[numeric];
		let params = [user];
		if (customParams && Array.isArray(customParams)) {
			params = params.concat(customParams);
		} else if (customParams) {
			params.push(customParams);
		}

		return new Message(numeric, params, undefined, message);
	}

	static fromMessageString(user, string) {
		const parsed = parse(string);
		const source = parsed.prefix && parsed.prefix.name ? parsed.prefix.name : user;

		return new Message(parsed.command, parsed.params, source);
	}

	static Builder() {
		return new class Builder {
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
				this.parameters.push(parameter);

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
	AWAY: "AWAY",
	ADMIN: "ADMIN",
	ERROR: "ERROR",
	JOIN: "JOIN",
	KILL: "KILL",
	MODE: "MODE",
	MOTD: "MOTD",
	NAMES: "NAMES",
	NOTICE: "NOTICE",
	NICK: "NICK",
	PART: "PART",
	PING: "PING",
	PONG: "PONG",
	PRIVMSG: "PRIVMSG",
	QUIT: "QUIT",
	TOPIC: "TOPIC",
	USER: "USER",
	VERSION: "VERSION",
	WHOIS: "WHOIS",

	// Numerics
	RPL_WELCOME: "001",
	RPL_YOURHOST: "002",
	RPL_CREATED: "003",
	RPL_MYINFO: "004",
	RPL_ISUPPORT: "005",
	RPL_UMODEIS: "221",
	RPL_ADMINME: "256",
	RPL_ADMINLOC1: "257",
	RPL_ADMINLOC2: "258",
	RPL_ADMINEMAIL: "259",
	RPL_AWAY: "301",
	RPL_UNAWAY: "305",
	RPL_NOWAWAY: "306",
	RPL_WHOISUSER: "311",
	RPL_WHOISSERVER: "312",
	RPL_WHOISOPERATOR: "313",
	RPL_WHOISIDLE: "317",
	RPL_ENDOFWHOIS: "318",
	RPL_WHOISCHANNELS: "319",
	RPL_NOTOPIC: "331",
	RPL_TOPIC: "332",
	RPL_TOPICWHOTIME: "333",
	RPL_VERSION: "351",
	RPL_NAMREPLY: "353",
	RPL_ENDOFNAMES: "366",
	RPL_INFO: "371",
	RPL_MOTD: "372",
	RPL_ENDOFINFO: "374",
	RPL_MOTDSTART: "375",
	RPL_ENDOFMOTD: "376",
	RPL_TIME: "391",

	ERR_NOSUCHNICK: "401",
	ERR_NOSUCHCHANNEL: "403",
	ERR_NORECIPIENT: "411",
	ERR_NOTEXTTOSEND: "412",
	ERR_UNKNOWNCOMMAND: "421",
	ERR_NOMOTD: "422",
	ERR_NONICKNAMEGIVEN: "431",
	ERR_NICKNAMEINUSE: "433",
	ERR_NOTONCHANNEL: "442",
	ERR_NEEDMOREPARAMS: "461",
	ERR_BADCHANNELKEY: "475",
	ERR_UMODEUNKNOWNFLAG: "501",
	ERR_USERSDONTMATCH: "502",
	ERR_NOPRIVS: "723"
};

Message.NumericMessage = {
	[Message.Command.RPL_ADMINME]: "Administrative info",
	[Message.Command.RPL_UNAWAY]: "You are no longer marked as being away",
	[Message.Command.RPL_NOWAWAY]: "You have been marked as being away",
	[Message.Command.RPL_WHOISOPERATOR]: "is an IRC operator",
	[Message.Command.RPL_ENDOFWHOIS]: "End of /WHOIS list",
	[Message.Command.RPL_NOTOPIC]: "No topic is set",
	[Message.Command.RPL_ENDOFNAMES]: "End of /NAMES list",
	[Message.Command.RPL_ENDOFINFO]: "End of /INFO list.",
	[Message.Command.RPL_MOTDSTART]: "- Message of the day -",
	[Message.Command.RPL_ENDOFMOTD]: "End of /MOTD command.",
	[Message.Command.ERR_NOSUCHNICK]: "No such nick/channel",
	[Message.Command.ERR_NOSUCHCHANNEL]: "No such channel",
	[Message.Command.ERR_NORECIPIENT]: "No recipient given",
	[Message.Command.ERR_NOTEXTTOSEND]: "No text to send",
	[Message.Command.ERR_UNKNOWNCOMMAND]: "Unknown command",
	[Message.Command.ERR_NOMOTD]: "MOTD is missing",
	[Message.Command.ERR_NONICKNAMEGIVEN]: "No nickname given",
	[Message.Command.ERR_NICKNAMEINUSE]: "Nickname is already in use",
	[Message.Command.ERR_NOTONCHANNEL]: "You're not on that channel",
	[Message.Command.ERR_NEEDMOREPARAMS]: "Not enough parameters",
	[Message.Command.ERR_BADCHANNELKEY]: "Cannot join channel (+k)",
	[Message.Command.ERR_UMODEUNKNOWNFLAG]: "Unknwon MODE flag",
	[Message.Command.ERR_USERSDONTMATCH]: "Cant change mode for other users",
	[Message.Command.ERR_NOPRIVS]: "Insufficient oper privileges."
}

module.exports = Message;