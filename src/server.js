const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');

const getSteamInfo = require('./api/getStreamInfo');
const player = require('./player');
const browser = require('./browser');
const embed = require('./embed');
const Quality = require('./constants/quality');
const Layout = require('./constants/layout');

const app = express();
let server;

app.use(bodyparser.json());

app.post('/stream/play/:channelId', async (req, res) => {

    const channelId = req.params.channelId;

    let streamInfo;
    try {
        streamInfo = await getSteamInfo(channelId, Quality.SINGLE_HD);
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Could not load stream info',
            error: e
        });
    }

    try {
        await player.play(streamInfo, Layout.CHAT_LEFT);
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Could not start stream on Chromecast',
            error: e
        });
    }

    res.status(200);
    res.json({
        message: 'Playing channel',
        channel: channelId
    });
});

app.post('/stream/stop', async (req, res) => {

    try {
        await player.stop();
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Could not stop app',
            error: e
        });
    }

    res.status(200);
    res.json({
        message: 'Stopped Twitchcast app'
    });
});

app.post('/browse', async (req, res) => {
    try {
        await browser.browse(req.body);
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Could not start browser',
            error: e
        });
    }

    res.status(200);
    res.json({
        message: 'Started browser'
    });
});

app.post('/stream/embed/:channelId', async (req, res) => {

    const channelId = req.params.channelId;

    try {
        await embed.load(channelId);
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Could not start stream on Chromecast',
            error: e
        });
    }

    res.status(200);
    res.json({
        message: 'Playing channel',
        channel: channelId
    });
});

function start(port) {
    server = http.createServer(app);
    server.listen(port);
}

module.exports = {
    start
};
