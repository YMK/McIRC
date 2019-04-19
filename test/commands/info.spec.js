const user = require("../../src/models/user");
const utils = require("../utils");

let mockClient, mockSend, newUser, tested;

beforeEach(() => {
	// Clear require and jest cache
	jest.resetModules();

	jest.mock("../../package.json", () => ({
        version: "1.3.7"
    }));

    tested = require("../../src/commands/info");

    newUser = new user("username", mockClient, "username", "localhost", "", "");
    mockSend = jest.fn();
    mockClient = utils.mockClient(newUser, mockSend);
});

test("Sends RPL_INFO with name/version of McIRC", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[0][0].getMessageString();
    expect(reply).toBe("371 username :This server runs on McIRC, version 1.3.7");
});

test("Sends RPL_INFO with contributors", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[1][0].getMessageString();
    expect(reply).toBe("371 username :McIRC was written by Al McKinlay (McInkay) <mcirc@10people.co.uk>");
});

test("Sends RPL_INFO with bug info", () => {
    tested.run(new mockClient());

    const reply = mockSend.mock.calls[2][0].getMessageString();
    expect(reply).toBe("371 username :To report any bugs, please go to https://github.com/McInkay/McIRC");
});

test("Sends RPL_ENDOFINFO to finish", () => {
    tested.run(new mockClient());

    const {calls} = mockSend.mock;
    const reply = calls[calls.length - 1][0].getMessageString();
    expect(reply).toBe("374 username :End of /INFO list.");
});