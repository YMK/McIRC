const tested = require("../../src/commands/version");
const {version} = require("../../package.json");

let mockClient, mockSend;

beforeEach(() => {
    mockSend = jest.fn();
    mockClient = jest.fn().mockImplementation(() => ({
            user: {nick: "username"},
            send: mockSend
        }));
});

test("Sends 2 messages", () => {
    tested.run(new mockClient());

    expect(mockSend.mock.calls.length).toBe(2);
});

test("Sends RPL_VERSION", () => {
    tested.run(new mockClient());

    expect(mockSend.mock.calls[1][0].getMessageString()).toBe(`351 username McIRC-${version} mcirc.yamanickill.com`);
});

test("Sends RPL_ISUPPORT", () => {
    tested.run(new mockClient());

    const messageString = mockSend.mock.calls[0][0].getMessageString();

    expect(messageString).toContain("005 username");
    expect(messageString).toContain(":are supported by this server");
});
