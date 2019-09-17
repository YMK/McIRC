const state = require("../../src/state");
const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, newUser, tested;

beforeEach(() => {
	// Clear require and jest cache
	jest.resetModules();

	// Mock config
	jest.mock("../../config.default.json", () => ({
        serverName: "mcirc.yamanickill.com",
        admin: {
            location: "Server Location",
            owner: "Owner Information",
            email: "email@domain.com"
        }
    }));

    tested = require("../../src/commands/admin");

    newUser = new user("username", mockClient, "username", "localhost", "", "");
    state.channels = {};
    state.users = {};
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);
    // Set admin in config
});

test("Sends RPL_ADMINME", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[0][0].getMessageString();
    expect(reply).toBe("256 username mcirc.yamanickill.com :Administrative info");
});

test("Sends RPL_ADMINLOC1", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[1][0].getMessageString();
    expect(reply).toBe("257 username :Server Location");
});

test("Sends RPL_ADMINLOC2", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[2][0].getMessageString();
    expect(reply).toBe("258 username :Owner Information");
});

test("Sends RPL_ADMINEMAIL", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[3][0].getMessageString();
    expect(reply).toBe("259 username email@domain.com");
});