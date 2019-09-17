const tested = require("../../src/commands/privmsg");
const state = require("../../src/state");
const Message = require("../../src/models/message");
const utils = require("../utils");
const Channel = require("../../src/models/channel");

let channel, mockClient1, mockClient2, mockClient3, mockClient4, mockSend1, mockSend2, mockSend3, mockSend4;

beforeEach(() => {
    mockSend1 = jest.fn();
    mockSend2 = jest.fn();
    mockSend3 = jest.fn();
    mockSend4 = jest.fn();
    mockClient1 = new (utils.mockClient("user1", mockSend1))();
    mockClient2 = new (utils.mockClient("user2", mockSend2))();
    mockClient3 = new (utils.mockClient("user3", mockSend3))();
    mockClient4 = new (utils.mockClient("user3", mockSend4))();
    mockClient1.user.client = mockClient1;
    mockClient2.user.client = mockClient2;
    mockClient3.user.client = mockClient3;
    mockClient4.user.client = mockClient4;

    channel = new Channel("#test", mockClient1.user);
    state.channels = {"#test": channel};
    state.users = {user1: mockClient1.user, user2: mockClient2.user, user3: mockClient3.user};
});

test("Sends PRIVMSG to user2", () => {
    tested.run(mockClient1, {args: ["user2", "Hello"], command: Message.Command.PRIVMSG});

    const privmsg = mockSend2.mock.calls[0][0].getMessageString();
    expect(privmsg).toBe(":user1 PRIVMSG user2 :Hello");
});

test("Doesn't send PRIVMSG to user3", () => {
    tested.run(mockClient1, {args: ["user2", "Hello"], command: Message.Command.PRIVMSG});

    expect(mockSend3.mock.calls.length).toBe(0);
});

test("Sends PRIVMSG to all users on #test", () => {
    channel.addUser(mockClient2.user);
    channel.addUser(mockClient3.user);
    tested.run(mockClient1, {args: ["#test", "Hello"], command: Message.Command.PRIVMSG});

    const privmsg1 = mockSend2.mock.calls[0][0].getMessageString();
    expect(privmsg1).toBe(":user1 PRIVMSG #test :Hello");

    const privmsg2 = mockSend3.mock.calls[0][0].getMessageString();
    expect(privmsg2).toBe(":user1 PRIVMSG #test :Hello");

    expect(mockSend4.mock.calls.length).toBe(0);
    expect(mockSend1.mock.calls.length).toBe(0);
});

test("Sends NOTICE to user2", () => {
    tested.run(mockClient1, {args: ["user2", "Hello"], command: Message.Command.NOTICE});

    const notice = mockSend2.mock.calls[0][0].getMessageString();
    expect(notice).toBe(":user1 NOTICE user2 :Hello");
});

test("Sends NOTICE to all users on #test", () => {
    channel.addUser(mockClient2.user);
    channel.addUser(mockClient3.user);
    tested.run(mockClient1, {args: ["#test", "Hello"], command: Message.Command.NOTICE});

    const privmsg1 = mockSend2.mock.calls[0][0].getMessageString();
    expect(privmsg1).toBe(":user1 NOTICE #test :Hello");

    const privmsg2 = mockSend3.mock.calls[0][0].getMessageString();
    expect(privmsg2).toBe(":user1 NOTICE #test :Hello");

    expect(mockSend4.mock.calls.length).toBe(0);
});

test("Sends RPL_AWAY to user when sending a message to an away user", () => {
    mockClient2.user.modes.a = true;
    mockClient2.user.awayMessage = "Having dinner";
    tested.run(mockClient1, {args: ["user2", "Hello"], command: Message.Command.PRIVMSG});

    const messageString = mockSend1.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("301 user1 user2 :Having dinner");
});

test("Still sends PRIVMSG to away user", () => {
    mockClient2.user.modes.a = true;
    mockClient2.user.awayMessage = "Something";
    tested.run(mockClient1, {args: ["user2", "Hello"], command: Message.Command.PRIVMSG});

    const privmsg = mockSend2.mock.calls[0][0].getMessageString();
    expect(privmsg).toBe(":user1 PRIVMSG user2 :Hello");
});