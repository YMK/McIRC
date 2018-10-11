const tested = require("../../src/commands/join");
const state = require("../../src/state");
const user = require("../../src/models/user");
const Channel = require("../../src/models/channel");

let mockClient, mockSend, newUser;

beforeEach(() => {
    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = jest.fn().mockImplementation(() => ({
        user: newUser,
        send: mockSend
    }));
});

test("Creates channel if it doesn't exist already", () => {
    expect(state.channels).toEqual({});
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    expect(Object.keys(state.channels).length).toBe(1);
});

test("Doesn't create new channel if it already exists", () => {
    expect(state.channels).toEqual({});
    const existingChan = new Channel("#test", new user("owner", {send: jest.fn()}, "owner", "localhost", "", ""));
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    expect(Object.keys(state.channels).length).toBe(1);
    expect(state.channels["#test"]).toBe(existingChan);
});

test("Adds user to existing channel if already exists", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    expect(state.channels["#test"].users.length).toBe(2);
    expect(state.channels["#test"].users[0]).toBe(existingUser);
    expect(state.channels["#test"].users[1]).not.toBe(existingUser);
    expect(state.channels["#test"].users[1].nick).toBe("username");
    expect(state.channels["#test"].users[1]).toBe(newUser);
});

test("Adds user to newly created channel", () => {
    expect(state.channels).toEqual({});
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    expect(state.channels["#test"].users.length).toBe(1);
    expect(state.channels["#test"].users[0].nick).toBe("username");
    expect(state.channels["#test"].users[0]).toBe(newUser);
});


test("Adds channel to user's list of channels", () => {
    expect(newUser.channels.length).toBe(0);
    expect(state.channels).toEqual({});
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    expect(newUser.channels.length).toBe(1);
});

test("Sends join message to user's client", () => {
    expect(state.channels).toEqual({});
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe(":username JOIN #test");
});

test("Sends join message to other users in channel", () => {
    const existingUserSend = jest.fn();
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: existingUserSend}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    const messageString = existingUserSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe(":username JOIN #test");
});

test.skip("Sends topic to other users in channel", () => {
    expect(true).toBe(false);
});

test.skip("Sends names to user's client", () => {
    expect(true).toBe(false);
});