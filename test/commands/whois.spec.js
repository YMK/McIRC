const tested = require("../../src/commands/whois");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");
const Channel = require("../../src/models/channel");

let mockClient, mockSend, user1;

beforeEach(() => {
    user1 = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(user1, mockSend);
});

test("Sends whois RPLs to user", () => {
    expect(state.channels).toEqual({});
    const user2 = new user("user2", {send: jest.fn()}, "user2", "localhost", "", "Real Name");
    const chan1 = new Channel("#chan1", user2);
    const chan2 = new Channel("#chan2", user2);
    state.channels = {"#chan1": chan1, "#chan2": chan2};
    user2.addChannel(chan1);
    user2.addChannel(chan2);

    chan1.addUser(user1);
    user1.addChannel(chan1);

    state.users = {[user1.nick]: user1, [user2.nick]: user2};
    tested.run(new mockClient(), {args: ["user2"]});

    const nameReplyString = mockSend.mock.calls[0][0].getMessageString();
    expect(nameReplyString).toBe("311 username user2 user2 localhost * :Real Name");

    const endOfNamesString = mockSend.mock.calls[1][0].getMessageString();
    expect(endOfNamesString).toBe("319 username user2 :#chan1 #chan2");

    const endOfNamesString2 = mockSend.mock.calls[2][0].getMessageString();
    expect(endOfNamesString2).toBe("312 username user2 mcirc.yamanickill.com :Default Server Info");

    const endOfNamesString4 = mockSend.mock.calls[3][0].getMessageString();
    expect(endOfNamesString4).toBe("318 username user2 :End of /WHOIS list");
});

test("Hides channels for +i user if the other user isn't in the same channel", () => {
    expect(state.channels).toEqual({});
    const user2 = new user("user2", {send: jest.fn()}, "user2", "localhost", "", "Real Name");
    user2.setMode("i");
    const chan1 = new Channel("#chan1", user2);
    const chan2 = new Channel("#chan2", user2);
    state.channels = {"#chan1": chan1, "#chan2": chan2};
    user2.addChannel(chan1);
    user2.addChannel(chan2);

    chan1.addUser(user1);
    user1.addChannel(chan1);

    state.users = {[user1.nick]: user1, [user2.nick]: user2};
    tested.run(new mockClient(), {args: ["user2"]});

    const nameReplyString = mockSend.mock.calls[0][0].getMessageString();
    expect(nameReplyString).toBe("311 username user2 user2 localhost * :Real Name");

    const endOfNamesString = mockSend.mock.calls[1][0].getMessageString();
    expect(endOfNamesString).toBe("319 username user2 :#chan1");

    const endOfNamesString2 = mockSend.mock.calls[2][0].getMessageString();
    expect(endOfNamesString2).toBe("312 username user2 mcirc.yamanickill.com :Default Server Info");

    const endOfNamesString4 = mockSend.mock.calls[3][0].getMessageString();
    expect(endOfNamesString4).toBe("318 username user2 :End of /WHOIS list");
});