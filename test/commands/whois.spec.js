const tested = require("../../src/commands/whois");
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

test("Sends whois RPLs to user", () => {
    expect(state.channels).toEqual({});
    const existingUser = new user("owner", {send: jest.fn()}, "owner", "localhost", "", "Real Name");
    const existingChan = new Channel("#test", existingUser);
    state.channels = {"#test": existingChan};
    existingUser.addChannel(existingChan);
    state.users = {[existingUser.nick]: existingUser};
    tested.run(new mockClient(), {args: ["owner"]});

    const nameReplyString = mockSend.mock.calls[0][0].getMessageString();
    expect(nameReplyString).toBe("311 username owner owner localhost * :Real Name");

    const endOfNamesString = mockSend.mock.calls[1][0].getMessageString();
    expect(endOfNamesString).toBe("319 username owner :#test");

    const endOfNamesString2 = mockSend.mock.calls[2][0].getMessageString();
    expect(endOfNamesString2).toBe("312 username owner mcirc.yamanickill.com :Default Server Info");

    const endOfNamesString4 = mockSend.mock.calls[3][0].getMessageString();
    expect(endOfNamesString4).toBe("318 username owner :End of /WHOIS list");
});