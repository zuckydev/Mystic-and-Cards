const express = require('express');
const router = express.Router();
const Card = require("../models/cardModel");
const Play = require("../models/playsModel");
const auth = require("../middleware/auth");

router.get('/', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Get information about the board");
        if (!req.game) {
            res.status(400).send({ msg: "You are not a game, please create or join a game" });
        }
        else {
            let result = await Play.getBoard(req.game);
            res.status(result.status).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.post("/draw", auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Drawing card");
        if (!req.game) {
            res.status(400).send({ msg: "You are not a game, please create or join a game" });
        }
        else {
            let result = await Card.drawCard(req.game, req.body);
            res.status(result.status).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;