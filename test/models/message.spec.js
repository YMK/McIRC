const message = require('../../src/models/message');

test('Creates message string properly', () => {
	const tested = new message("TOPIC");
	expect(tested.getMessageString()).toBe("TOPIC");
});

test('Creates message string with parameters', () => {
	const tested = new message("JOIN", ["#thelounge"]);
	expect(tested.getMessageString()).toBe("JOIN #thelounge");
});

test('Builder exists', () => {
	expect(message.Builder).not.toBe(undefined);
	expect(message.Builder()).not.toBe(undefined);
});

// TODO: Add more tests for builder

test('Type exists', () => {
	expect(message.Command.NICK).toBe("NICK");
	expect(message.Command.RPL_WELCOME).toBe("001");
});