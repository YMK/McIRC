const tested = require("../../src/commands/quit");
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

test("Removes user from channels", () => {
    expect(state.channels["#test"].users.length).toBe(1);
    tested.run(new mockClient(), {args: []});

    expect(state.channels["#test"].users.length).toBe(0);
});

test("Sends error message to user", () => {
    tested.run(new mockClient(), {args: []});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("ERROR");
});

test("Sends quit message to other users in channel", () => {
    const user2Send = jest.fn();
    const user2 = new user("user2", {send: user2Send}, "user2", "localhost", "", "");
    channel1.addUser(user2);
    tested.run(new mockClient(), {args: []});

    const messageString = user2Send.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":user1!user1@localhost QUIT :Quit: ");
});

test("Includes reason in quit message", () => {
    const user2Send = jest.fn();
    const user2 = new user("user2", {send: user2Send}, "user2", "localhost", "", "");
    channel1.addUser(user2);
    tested.run(new mockClient(), {args: ["Bored of this place"]});

    const messageString = user2Send.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":user1!user1@localhost QUIT :Quit: Bored of this place");
});
