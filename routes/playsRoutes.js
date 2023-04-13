const express = require('express');
const router = express.Router();
const Play = require("../models/playsModel");
const auth = require("../middleware/auth");

// End the turn
router.patch('/endturn', auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Play End Turn");
        if (!req.game) {
            res.status(400).send({ msg: "You are not at a game, please create or join a game" });
        } else if (req.game.player.state.name != "Playing") {
            // Do not need to check if there are two players since in that case
            // the player will not be on Playing state
            res.status(400).send({
                msg:
                    "You cannot end turn since you are not currently on your turn"
            });
        } else {
            let result = await Play.endTurn(req.game);
            res.status(result.status).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

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
        res.status(result.status).send(result.result);
    }
});

router.patch("/draw", auth.verifyAuth, async function (req, res, next) {
    try {
        console.log("Drawing card");
        if (!req.game) {
            res.status(400).send({ msg: "You are not a game, please create or join a game" });
        }
        else {
            let result = await Play.drawCard(game, req.body.deck);
            res.status(result.status).send(result.result);
        }
    } catch (err) {
        console.log(err);
        res.status(result.status).send(result.result);
    }
});

module.exports = router;