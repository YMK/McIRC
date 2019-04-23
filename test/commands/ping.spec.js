const tested = require("../../src/commands/ping");
const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, user1;

beforeEach(() => {
    mockSend = jest.fn();
    user1 = new user("user1", {send: mockSend}, "user1", "localhost", "", "");
    state.channels = {};
    state.users = {user1};
    mockClient = utils.mockClient(user1, mockSend);
});

test("Replies with pong", () => {
    tested.run(new mockClient(), {args: []});

    const messageString = mockSend.mock.calls[0][0].getMessageString();
    expect(messageString).toBe("PONG");
});
