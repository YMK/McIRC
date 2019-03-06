const tested = require("../../src/commands/join");
const state = require("../../src/state");
const user = require("../../src/models/user");
const Channel = require("../../src/models/channel");
const utils = require("../utils");

let mockClient, mockSend, newUser;

beforeEach(() => {
    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);
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

test("Creates multiple new channels", () => {
    expect(state.channels).toEqual({});
    const chanlist = "#test,#cheese,#hello";
    tested.run(new mockClient(), chanlist);

    expect(Object.keys(state.channels).length).toBe(3);
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

test("Sends topic to user if there is one", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    existingChan.setTopic("This is the topic", "userThatSetTheTopic")
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    const messageString = mockSend.mock.calls[1][0].getMessageString();

    expect(messageString).toBe("332 username #test :This is the topic");
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

    expect(messageString).toBe(":username!username@localhost JOIN #test");
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

    expect(messageString).toBe(":username!username@localhost JOIN #test");
});

test("Sends names to user's client", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    const nameReplyString = mockSend.mock.calls[1][0].getMessageString();
    expect(nameReplyString).toBe("353 username = #test owner");

    const endOfNamesString = mockSend.mock.calls[3][0].getMessageString();
    expect(endOfNamesString).toBe("366 username #test :End of /NAMES list");
});

test("Allows user to join when key matches key", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    existingChan.setKey("thisisakey123");
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    const keylist = "thisisakey123";
    tested.run(new mockClient(), chanlist, keylist);

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe(":username!username@localhost JOIN #test");
});

test("Allows user to join when we provide a key but the channel doesn't require one", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    const keylist = "thisisakey123";
    tested.run(new mockClient(), chanlist, keylist);

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe(":username!username@localhost JOIN #test");
});

test("Refuses to allow user to join when no key", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    existingChan.setKey("thisisakey123");
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), chanlist);

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe("475 username #test :Cannot join channel (+k)");
});

test("Refuses to allow user to join when key is incorrect", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    existingChan.setKey("thisisakey123");
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    const keylist = "thisisthewrongkey";
    tested.run(new mockClient(), chanlist, keylist);

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toBe("475 username #test :Cannot join channel (+k)");
});

test("Sending multiple keys", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    existingChan.setKey("thisisakey123");
    state.channels = {"#test": existingChan};
    const chanlist = "#initial,#test";
    const keylist = ",thisisakey123";
    tested.run(new mockClient(), chanlist, keylist);

    let messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe(":username!username@localhost JOIN #initial");

    messageString = mockSend.mock.calls[3][0].getMessageString();
    expect(messageString).toBe(":username!username@localhost JOIN #test");
});