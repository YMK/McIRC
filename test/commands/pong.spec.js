const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, mockreceivedPong, tested, user1;

beforeEach(() => {
    mockreceivedPong = jest.fn();
	jest.resetModules();
	jest.mock("../../src/utils/timeout", () => ({
        receivedPong: mockreceivedPong
    }));

    tested = require("../../src/commands/pong");
    mockSend = jest.fn();
    user1 = new user("user1", {send: mockSend}, "user1", "localhost", "", "");
    state.channels = {};
    state.users = {user1};
    mockClient = utils.mockClient(user1, mockSend);
});

test("Replies with pong", () => {
    tested.run(new mockClient(), {args: []});

    expect(mockreceivedPong.mock.calls.length).toBe(1);
});
