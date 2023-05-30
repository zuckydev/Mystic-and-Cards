const express = require('express');
const router = express.Router();
const Mine = require("../models/mineModel");
const Play = require("../models/playsModel");
const auth = require("../middleware/auth");


router.get('/getBoard', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Get information about the board");
        if (!req.game) {
            res.status(400).send({ msg: "You are not in a game, please create or join a game" });
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

router.post("/upgrade", auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Upgrading mine");
        if (!req.game) {
            res.status(400).send({ msg: "You are not in a game, please create or join a game" });
        }
        else {
            let result = await Mine.upgradeMine(req.game, req.body);
            res.status(result.status).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;