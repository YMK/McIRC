const logger = require("../src/utils/logger")({level: "debug"});
const McIrc = require("../src/");
const server = new McIrc();

server.start();
const net = require("net");
const assert = require("assert").strict;
const {format, parse} = require("tekko");

const makeClient = () => {
    const client = net.connect({
        host: "localhost",
        port: "6667"
    });
    client.buffer = [];

    client.setEncoding("utf8");

    client.on("data", (data) => {
        let lines = data.toString().split(/\r\n/);
        if (lines[lines.length - 1] === "") {
            lines = lines.slice(0, lines.length - 1);
        }
        lines.forEach((line) => {
            logger.debug(`Raw Received: ${line}`);
            if (data.startsWith("PING")) {
                logger.debug("Raw sending: PONG");
                client.write("PONG\r\n")
            } else {
                client.buffer.push(line);
            }
        });
    });

    client.waitForResponses = (number = 1) => new Promise((resolve) => {
        const id = setInterval(() => {
            if (client.buffer.length >= number) {
                clearTimeout(id);
                resolve(client.buffer.slice())
                client.buffer = [];
            }
        }, 1)
    });

    return client;
};

const client1 = makeClient();

const checkRegistration = async function () {
    client1.write(format({command: "NICK", params: ["McInkay"]}));
    client1.write("\r\n");
    client1.write(format({command: "USER", params: ["McInkay", "localhost", "*"], trailing: "Real name of user"}));
    client1.write("\r\n");

    const responses = await client1.waitForResponses(5);
    assert(responses.length >= 5);
    assert(parse(responses.shift()).command === "001");
    assert(parse(responses.shift()).command === "002");
    assert(parse(responses.shift()).command === "003");
    assert(parse(responses.shift()).command === "004");
    assert(parse(responses.shift()).command === "005");
    for (let i = 0; i < responses.length; i++) {
        assert(parse(responses.shift()).command === "005");
    }
    logger.info("Registered correctly");
}

const checkJoining = async function () {
    client1.write(format({command: "JOIN", params: ["#test"]}));

    const responses = await client1.waitForResponses(3);
    assert(responses.length === 3);
    assert(parse(responses.shift()).command === "JOIN");
    assert(parse(responses.shift()).command === "353");
    assert(parse(responses.shift()).command === "366");
    logger.info("Joined correctly");
}

const checkSendingMessages = async function () {
    const client2 = makeClient();

    client2.write(format({command: "NICK", params: ["User2"]}));
    client2.write("\r\n");
    client2.write(format({command: "USER", params: ["User2", "localhost", "*"], trailing: "Real name of user"}));
    client2.write("\r\n");
    await client2.waitForResponses(5);

    client2.write(format({command: "JOIN", params: ["#test"]}));
    await client2.waitForResponses(4);

    await client1.waitForResponses(1); // Clear out client1 buffer

    client2.write(format({command: "PRIVMSG", params: ["#test"], trailing: "Hey there"}));
    const client1Responses = await client1.waitForResponses(1);
    assert(client1Responses.length === 1);
    const client1Message = parse(client1Responses.shift());
    assert(client1Message.command === "PRIVMSG");
    assert(client1Message.trailing === "Hey there");
    assert(client1Message.prefix.name === "User2");

    client1.write(format({command: "PRIVMSG", params: ["#test"], trailing: "How's it going?"}));
    const client2Responses = await client2.waitForResponses(1);
    assert(client2Responses.length === 1);
    const client2Message = parse(client2Responses.shift());
    assert(client2Message.command === "PRIVMSG");
    assert(client2Message.trailing === "How's it going?");
    assert(client2Message.prefix.name === "McInkay");

    logger.info("Sending messages works correctly");
}

const runTests = async function () {
    const tests = [checkRegistration, checkJoining, checkSendingMessages];
    for (const test of tests) {
        // eslint-disable-next-line no-await-in-loop
        await test();
    }
}

runTests()
    .then(() => 0)
    .catch((e) => {
        logger.error(e);

        return 1;
    })
    // eslint-disable-next-line no-process-exit
    .then((code) => process.exit(code));