const tested = require("../../src/commands/away");
const state = require("../../src/state");
const user = require("../../src/models/user");
const Channel = require("../../src/models/channel");
const utils = require("../utils");

let channel1, mockClient, mockSend, user1;

beforeEach(() => {
    mockSend = jest.fn();
    user1 = new user("user1", {send: mockSend}, "user1", "localhost", "", "");
    channel1 = new Channel("#test", user1);
    user1.addChannel(channel1);
    state.channels = {"#test": channel1};
    state.users = {user1};
    mockClient = utils.mockClient(user1, mockSend);
});

test("Sets user as away", () => {
    expect(user1.isAway()).toBe(false);
    tested.run(new mockClient(), {args: ["Having dinner"]});

    expect(user1.isAway()).toBe(true);
});

test("Sends RPL_NOWAWAY to user", () => {
    tested.run(new mockClient(), {args: ["Having dinner"]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("306 user1 :You have been marked as being away");
});

test("Sets away message correctly", () => {
    tested.run(new mockClient(), {args: ["Having dinner"]});
    expect(user1.getAwayMessage()).toBe("Having dinner");
});

test("Unsets away when sent with no message", () => {
    user1.modes.a = true;
    expect(user1.isAway()).toBe(true);
    tested.run(new mockClient(), {args: [""]});

    expect(user1.isAway()).toBe(false);
});

test("Unsets away message when sent with no message", () => {
    user1.modes.a = true;
    user1.awayMessage = "Something";
    expect(user1.isAway()).toBe(true);
    tested.run(new mockClient(), {args: [""]});

    expect(user1.getAwayMessage()).toBe("");
});

test("Sends RPL_UNAWAY to user when unsetting away", () => {
    user1.modes.a = true;
    expect(user1.isAway()).toBe(true);
    tested.run(new mockClient(), {args: [""]});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("305 user1 :You are no longer marked as being away");
});
