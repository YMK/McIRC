const nick = require("./nick");
const ping = require("./pong");
const privmsg = require("./privmsg");
const user = require("./user");

module.exports = [
	nick,
	ping,
	privmsg,
	user,
];