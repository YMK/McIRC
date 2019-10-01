const tested = require("../../src/models/message");

test("Creates message string properly", () => {
	const message = new tested("TOPIC");
	expect(message.getMessageString()).toBe("TOPIC");
});

test("Creates message string with parameters", () => {
	const message = new tested("JOIN", ["#thelounge"]);
	expect(message.getMessageString()).toBe("JOIN #thelounge");
});

test("Builder exists", () => {
	expect(tested.Builder).not.toBe(undefined);
	expect(tested.Builder()).not.toBe(undefined);
});

// TODO: Add more tests for builder

describe("From Message String", () => {

	test("with no tags or source", () => {
		const messageString = "TOPIC #test :This is a test";
		const message = tested.fromMessageString("username", messageString);

		expect(message.command).toEqual("TOPIC");
		expect(message.parameters).toEqual([
"#test",
"This is a test"
]);
	});

	test("with just source", () => {
		const messageString = ":someothersource TOPIC #test :This is a test";
		const message = tested.fromMessageString("username", messageString);

		expect(message.command).toEqual("TOPIC");
		expect(message.parameters).toEqual([
"#test",
"This is a test"
]);
		expect(message.source).toEqual("someothersource");
	});

	test("with just tag", () => {
		const messageString = "@test=123 TOPIC #test :This is a test";
		const message = tested.fromMessageString("username", messageString);

		expect(message.command).toEqual("TOPIC");
		expect(message.parameters).toEqual([
"#test",
"This is a test"
]);
	});

	test("with tag and source", () => {
		const messageString = "@test=123 :someothersource TOPIC #test :This is a test";
		const message = tested.fromMessageString("username", messageString);

		expect(message.command).toEqual("TOPIC");
		expect(message.parameters).toEqual([
"#test",
"This is a test"
]);
		expect(message.source).toEqual("someothersource");
	});

});

test("Type exists", () => {
	expect(tested.Command.NICK).toBe("NICK");
	expect(tested.Command.RPL_WELCOME).toBe("001");
});

test("makeNumeric creates message", () => {
	const message = tested.makeNumeric(tested.Command.ERR_NEEDMOREPARAMS, tested.Command.JOIN, "username");
	expect(message).not.toBe(undefined);
});

test("makeNumeric creates correctly formatted messages", () => {

	expect(tested.makeNumeric(tested.Command.ERR_NOSUCHNICK, "otherperson", "username").getMessageString()).toBe("401 username otherperson :No such nick/channel");
	expect(tested.makeNumeric(tested.Command.ERR_NOSUCHCHANNEL, "#test", "username").getMessageString()).toBe("403 username #test :No such channel");
	expect(tested.makeNumeric(tested.Command.ERR_NORECIPIENT, undefined, "username").getMessageString()).toBe("411 username :No recipient given");
	expect(tested.makeNumeric(tested.Command.ERR_NOTEXTTOSEND, undefined, "username").getMessageString()).toBe("412 username :No text to send");
	expect(tested.makeNumeric(tested.Command.ERR_NONICKNAMEGIVEN, undefined, "username").getMessageString()).toBe("431 username :No nickname given");
	expect(tested.makeNumeric(tested.Command.ERR_NICKNAMEINUSE, "newnick", "username").getMessageString()).toBe("433 username newnick :Nickname is already in use");
	expect(tested.makeNumeric(tested.Command.ERR_NOTONCHANNEL, "#test", "username").getMessageString()).toBe("442 username #test :You're not on that channel");
	expect(tested.makeNumeric(tested.Command.ERR_NEEDMOREPARAMS, tested.Command.JOIN, "username").getMessageString()).toBe("461 username JOIN :Not enough parameters")
})