const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');

const browser = require('./browser');
const embed = require('./embed');

const app = express();
let server;

app.use(bodyparser.json());

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

app.post('/stream/channel/:channelId', async (req, res) => {

    const channelId = req.params.channelId;

    try {
        await embed.playChannel(channelId);
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

app.post('/stream/channel/:channelId/latestVideo', async (req, res) => {

    const channelId = req.params.channelId;

    try {
        await embed.playLatestVideo(channelId);
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
        message: 'Playing latest video',
        channel: channelId
    });
});

app.post('/stream/seek/:minutes', async (req, res) => {

    const minutes = req.params.minutes;

    try {
        await embed.seekTo(minutes);
    } catch (e) {
        console.error(e);
        res.status(500);
        return res.json({
            message: 'Error executing seek',
            error: e
        });
    }

    res.status(200);
    res.json({
        message: `Seek to ${minutes} minutes`
    });
});

app.post('/stream/stop', async (req, res) => {

    try {
        await embed.stop();
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
        message: 'Stopped Twitch app'
    });
});

function start(port) {
    server = http.createServer(app);
    server.listen(port);
}

module.exports = {
    start
};
