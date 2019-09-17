const tested = require("../../src/commands/topic");
const utils = require("../utils");
const state = require("../../src/state");
const Channel = require("../../src/models/channel");
const User = require("../../src/models/user");

let mockClient, mockSend;

beforeEach(() => {
    mockSend = jest.fn();
    state.channels = {};
    state.users = {};
    mockClient = utils.mockClient("username", mockSend);
});

test("Send ERR_NEEDMOREPARAMS if no channel name", () => {
    tested.run(new mockClient());

    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].getMessageString()).toBe("461 username TOPIC :Not enough parameters");
});

test("Send ERR_NOSUCHCHANNEL if no channel", () => {
    tested.run(new mockClient(), {args: ["#nochannel"]});

    expect(mockSend.mock.calls.length).toBe(1);
    expect(mockSend.mock.calls[0][0].getMessageString()).toBe("403 username #nochannel :No such channel");
});

describe("Getting TOPIC", () => {
    let existingChan;

    beforeEach(() => {
        Date.now = jest.fn(() => new Date(1541072832 * 1000));
        expect(state.channels).toEqual({});
        existingChan = new Channel("#channel", new User("owner", {send: jest.fn()}, "owner", "localhost", "", ""));
        state.channels = {"#channel": existingChan};
    });

    describe("When topic not set", () => {
        beforeEach(() => {
            tested.run(new mockClient(), {args: ["#channel"]});
        });

        test("Sends 1 message when topic doesn't exists", () => {
            expect(mockSend.mock.calls.length).toBe(1);
        });

        test("Sends RPL_NOTOPIC", () => {
            expect(mockSend.mock.calls[0][0].getMessageString()).toBe("331 username #channel :No topic is set");
        });
    });

    describe("When topic is set", () => {
        beforeEach(() => {
            existingChan.setTopic("This is the topic", "userWhoSetTheTopic");
            tested.run(new mockClient(), {args: ["#channel"]});
        });

        test("Sends 2 messages when topic exists", () => {
            expect(mockSend.mock.calls.length).toBe(2);
        });

        test("Sends RPL_TOPIC", () => {
            expect(mockSend.mock.calls[0][0].getMessageString()).toBe("332 username #channel :This is the topic");
        });

        test("Sends RPL_TOPICWHOTIME ", () => {
            expect(mockSend.mock.calls[1][0].getMessageString()).toBe("333 username #channel userWhoSetTheTopic :1541072832");
        });
    });
});

describe("Setting topic", () => {

    let otherUserMockSend;

    beforeEach(() => {
        Date.now = jest.fn(() => new Date(1541072832 * 1000));
        expect(state.channels).toEqual({});

        expect(state.channels).toEqual({});
        const existingChan = new Channel("#channel", new User("owner", {send: jest.fn()}, "owner", "localhost", "", ""));
        otherUserMockSend = jest.fn()
        existingChan.addUser(new User("otherUser", {send: otherUserMockSend}, "owner", "localhost", "", ""))
        state.channels = {"#channel": existingChan};

        tested.run(new mockClient(), {args: ["#channel", "This is the new topic"]});
    });

    test("Sends RPL_TOPIC after setting", () => {
        expect(mockSend.mock.calls.length).toBe(1);
        expect(mockSend.mock.calls[0][0].getMessageString()).toBe("332 username #channel :This is the new topic");
    });

    test("Sets the topic", () => {
        expect(state.channels["#channel"].topic).not.toBeNull();
        expect(state.channels["#channel"].topic.text).toEqual("This is the new topic");
        expect(state.channels["#channel"].topic.author).toEqual("username");
        expect(state.channels["#channel"].topic.time).toEqual(1541072832);
    });

    test("Sends TOPIC message to all other users", () => {
        expect(otherUserMockSend.mock.calls.length).toBe(1);
        expect(otherUserMockSend.mock.calls[0][0].getMessageString()).toBe("332 username #channel :This is the new topic");
    });
});

describe("Clearing topic", () => {

    let otherUserMockSend;

    beforeEach(() => {
        Date.now = jest.fn(() => new Date(1541072832 * 1000));
        expect(state.channels).toEqual({});

        expect(state.channels).toEqual({});
        const existingChan = new Channel("#channel", new User("owner", {send: jest.fn()}, "owner", "localhost", "", ""));
        otherUserMockSend = jest.fn()
        existingChan.addUser(new User("otherUser", {send: otherUserMockSend}, "owner", "localhost", "", ""))
        existingChan.setTopic("This is the topic", "userWhoSetTheTopic");

        state.channels = {"#channel": existingChan};

        tested.run(new mockClient(), {args: ["#channel", ""]});
    });

    test("Sends NOTOPIC", () => {
        expect(mockSend.mock.calls.length).toBe(1);
        expect(mockSend.mock.calls[0][0].getMessageString()).toBe("331 username #channel :No topic is set");
    });

    test("Clears topic", () => {
        expect(state.channels["#channel"].topic).toBeNull();
    });

    test("Sends NOTOPIC message to all other users", () => {
        expect(otherUserMockSend.mock.calls.length).toBe(1);
        expect(otherUserMockSend.mock.calls[0][0].getMessageString()).toBe("331 username #channel :No topic is set");
    });

});
