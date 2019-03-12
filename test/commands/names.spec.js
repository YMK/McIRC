const tested = require("../../src/commands/names");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");
const Channel = require("../../src/models/channel");

let mockClient, mockSend, newUser;

beforeEach(() => {
    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);
});

test("Sends names to user's client", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    const chanlist = "#test";
    tested.run(new mockClient(), {args: [chanlist]});

    const nameReplyString = mockSend.mock.calls[0][0].getMessageString();
    expect(nameReplyString).toBe("353 username = #test owner");

    const endOfNamesString = mockSend.mock.calls[1][0].getMessageString();
    expect(endOfNamesString).toBe("366 username #test :End of /NAMES list");
});