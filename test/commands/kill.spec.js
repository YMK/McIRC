const tested = require("../../src/commands/kill");
const state = require("../../src/state");
const user = require("../../src/models/user");
const Channel = require("../../src/models/channel");
const utils = require("../utils");

let channel1, killedUser, mockOpClient, mockOpSend, mockSend, mockSend2, opUser, user2;

beforeEach(() => {
    mockSend = jest.fn();
    mockSend2 = jest.fn();
    mockOpSend = jest.fn();
    killedUser = new user("killedUser", {send: mockSend}, "killedUser", "localhost", "", "");
    user2 = new user("user2", {send: mockSend2}, "user2", "localhost", "", "");
    opUser = new user("op", {send: mockOpSend}, "op", "localhost", "", "");
    opUser.modes.o = true;
    channel1 = new Channel("#test", user2);
    killedUser.addChannel(channel1);
    user2.addChannel(channel1);
    channel1.addUser(killedUser);
    state.channels = {"#test": channel1};
    state.users = {killedUser, opUser, user2};
    mockOpClient = utils.mockClient(opUser, mockOpSend);
});

// Errors

test("Sends ERR_NEEDMOREPARAMS when no user specified", () => {
    tested.run(new mockOpClient(), {args: []});

    const messageString = mockOpSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("461 op KILL :Not enough parameters");
});

test("Sends ERR_NOPRIVS when user isn't an op", () => {
    opUser.modes.o = false;
    tested.run(new mockOpClient(), {args: ["notAUser"]});

    const messageString = mockOpSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("723 op kill :Insufficient oper privileges.");
});

test("Sends ERR_NOSUCHNICK when there is no user", () => {
    expect(state.users).toEqual({killedUser, opUser, user2});
    tested.run(new mockOpClient(), {args: ["notAUser"]});

    const reply = mockOpSend.mock.calls[0][0].getMessageString();
    expect(reply).toBe("401 op notAUser :No such nick/channel");
});

// TODO: ERR_NOSUCHSERVER

// Happy path

test("Removes user from channels", () => {
    expect(state.channels["#test"].users.length).toBe(2);
    tested.run(new mockOpClient(), {args: ["killedUser", "Because I don't like you"]});

    expect(state.channels["#test"].users.length).toBe(1);
});

test("Sends kill message to user", () => {
    tested.run(new mockOpClient(), {args: ["killedUser", "Because I don't like you"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":op!op@localhost KILL killedUser :Because I don't like you");
});

test("Sends Error to user", () => {
    tested.run(new mockOpClient(), {args: ["killedUser", "Because I don't like you"]});

    const messageString = mockSend.mock.calls[1][0].getMessageString();
    expect(messageString).toBe("ERROR :Killed (op (Because I don't like you))");
});

test("Sends quit to all other users in channels", () => {
    tested.run(new mockOpClient(), {args: ["killedUser", "Because I don't like you"]});

    const messageString = mockSend2.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":killedUser!killedUser@localhost QUIT :Killed (op (Because I don't like you))");
});
