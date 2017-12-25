const { promisify } = require('util');
const Client = require('castv2-client').Client;
const mdns = require('mdns');

const DEVICE_DETECTION_TIMEOUT = 10000;
const CLIENT_CONNECTION_TIMEOUT = 10000;

let currentDevice;
let activeClient;

async function detectDevice() {

    if (currentDevice) return currentDevice;

    return new Promise((resolve, reject) => {

        // Using a custom resolver sequence should fix error on debian systems
        // https://stackoverflow.com/questions/29589543/raspberry-pi-mdns-getaddrinfo-3008-error
        const sequence = [
            mdns.rst.DNSServiceResolve(),
            'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }),
            mdns.rst.makeAddressesUnique()
        ];

        const browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});

        browser.on('serviceUp', function (service) {
            console.log(`found device "${service.name}" at ${service.addresses[0]}:${service.port}`);
            currentDevice = service.addresses[0];
            resolve(currentDevice);
            browser.stop();
        });
        browser.start();

        setTimeout(() => {
            browser.stop();
            reject(`Device detection timed out after ${DEVICE_DETECTION_TIMEOUT} ms`)
        }, DEVICE_DETECTION_TIMEOUT);
    });
}

async function connect() {

    if (activeClient) return activeClient;

    const device = await detectDevice();

    return new Promise((resolve, reject) => {

        const client = new Client();

        client.connect(device, (err) => {

            if (err) return reject(err);

            activeClient = client;

            client.once('error', disposeClient);

            resolve(client);
        });

        setTimeout(() => {
            reject(`Client connection timed out after ${CLIENT_CONNECTION_TIMEOUT} ms`)
        }, CLIENT_CONNECTION_TIMEOUT);
    });
}

async function getApp(Application) {

    const client = await connect();
    const clientLaunch = promisify(client.launch.bind(client));
    const clientJoin = promisify(client.join.bind(client));

    const session = await findSession(client, Application);

    if (session) {
        return await clientJoin(session, Application);
    } else {
        return await clientLaunch(Application);
    }
}

async function findSession(client, Application) {

    const clientGetSessions = promisify(client.getSessions.bind(client));

    const sessions = await clientGetSessions();

    if (!sessions) return false;

    const matches = sessions.filter(session => session.appId === Application.APP_ID);

    return matches.length > 0
        ? matches[0]
        : null;
}

function disposeClient() {
    if (!activeClient) return;

    try {
        activeClient.close();
    } catch (e) {
        // ignore
    }
    activeClient = null;
    console.log(`client disconnected`);
}

module.exports = {
    connect,
    findSession,
    getApp
};
