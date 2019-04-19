const tested = require("../../src/commands/part");
const state = require("../../src/state");
const user = require("../../src/models/user");
const Channel = require("../../src/models/channel");
const utils = require("../utils");

let channel1, mockClient, mockSend, user1;

beforeEach(() => {
    mockSend = jest.fn();
    user1 = new user("user1", {send: mockSend}, "user1", "localhost", "", "");
    channel1 = new Channel("#test", user1);
    state.channels = {"#test": channel1};
    state.users = {user1};
    mockClient = utils.mockClient(user1, mockSend);
});

test("Sends ERR_NEEDMOREPARAMS when no channel requested", () => {
    tested.run(new mockClient(), {args: []});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("461 user1 PART :Not enough parameters");
});

test("Sends ERR_NOSUCHCHANNEL when no channel exists", () => {
    tested.run(new mockClient(), {args: ["#doesntexist"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("403 user1 #doesntexist :No such channel");
});

test("Sends ERR_NOTONCHANNEL when channel exists but user isn't in it", () => {
    const channel2 = new Channel("#channel2", null);
    state.channels["#channel2"] = channel2;
    tested.run(new mockClient(), {args: ["#channel2"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("442 user1 #channel2 :You're not on that channel");
});

test("Removes user from channel", () => {
    expect(state.channels["#test"].users.length).toBe(1);
    tested.run(new mockClient(), {args: ["#test"]});

    expect(state.channels["#test"].users.length).toBe(0);
});

test("Sends part message to user", () => {
    tested.run(new mockClient(), {args: ["#test"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":user1!user1@localhost PART #test ");
});

test("Includes reason in part message", () => {
    tested.run(new mockClient(), {args: ["#test", "Bored of this place"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":user1!user1@localhost PART #test :Bored of this place");
});

test("Sends part message to other users in channel", () => {
    const user2Send = jest.fn();
    const user2 = new user("user2", {send: user2Send}, "user2", "localhost", "", "");
    channel1.addUser(user2);
    tested.run(new mockClient(), {args: ["#test"]});

    const messageString = user2Send.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":user1!user1@localhost PART #test ");
});
