const tested = require("../../src/commands/motd");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, newUser;

beforeEach(() => {
    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);
});

test("Sends ERR_NOMOTD when there is no motd", () => {
    state.motd = undefined;
    tested.run(new mockClient());

    const nomotdReply = mockSend.mock.calls[0][0].getMessageString();
    expect(nomotdReply).toBe("422 username :MOTD is missing");
});

test("Sends RPL_MOTDSTART when there is an motd", () => {
    state.motd = "Line 1\nLine 2\n";
    tested.run(new mockClient());

    const motdstartReply = mockSend.mock.calls[0][0].getMessageString();
    expect(motdstartReply).toBe("375 username :- Message of the day -");
});

test("Sends RPL_MOTD for each line of motd when there is an motd", () => {
    state.motd = "Line 1\nLine 2\n";
    tested.run(new mockClient());

    const line1Reply = mockSend.mock.calls[1][0].getMessageString();
    expect(line1Reply).toBe("372 username :Line 1");
    const line2Reply = mockSend.mock.calls[2][0].getMessageString();
    expect(line2Reply).toBe("372 username :Line 2");
});

test("Sends RPL_ENDOFMOTD after the motd lines", () => {
    state.motd = "Line 1\nLine 2\n";
    tested.run(new mockClient());

    const motdendReply = mockSend.mock.calls[3][0].getMessageString();
    expect(motdendReply).toBe("376 username :End of /MOTD command.");
});