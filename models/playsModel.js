const pool = require("../config/database");

// auxiliary function to check if the game ended 
async function checkEndGame(game) {
    return game.turn >= Play.maxNumberTurns;
}

class Play {
    // At this moment I do not need to store information so we have no constructor

    // Just a to have a way to determine end of game
    static maxNumberTurns = 10;

    // we consider all verifications were made
    static async startGame(game) {
        try {
            // Randomly determines who starts    
            let myTurn = (Math.random() < 0.5);
            let p1Id = myTurn ? game.player.id : game.opponents[0].id;
            let p2Id = myTurn ? game.opponents[0].id : game.player.id;
            // Player that start changes to the state Playing and order 1 
            await pool.query(`Update user_game set ug_state_id=?,ug_order=? where ug_id = ?`, [2, 1, p1Id]);
            // Player that is second changes to order 2
            await pool.query(`Update user_game set ug_order=? where ug_id = ?`, [2, p2Id]);

            // Changing the game state to start
            await pool.query(`Update game set gm_state_id=? where gm_id = ?`, [2, game.id]);

            // ---- Specific rules for each game start bellow

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // This considers that only one player plays at each moment, 
    // so ending my turn starts the other players turn
    // We consider the following verifications were already made:
    // - The user is authenticated
    // - The user has a game running
    // NOTE: This might be the place to check for victory, but it depends on the game
    static async endTurn(game) {
        try {
            // Change player state to waiting (1)
            await pool.query(`Update user_game set ug_state_id=? where ug_id = ?`,
                [1, game.player.id]);
            // Change opponent state to playing (2)
            await pool.query(`Update user_game set ug_state_id=? where ug_id = ?`,
                [2, game.opponents[0].id]);

            // Both players played
            if (game.player.order == 2) {
                // Criteria to check if game ended
                if (await checkEndGame(game)) {
                    return await Play.endGame(game);
                } else {
                    // Increase the number of turns and continue 
                    await pool.query(`Update game set gm_turn=gm_turn+1 where gm_id = ?`,
                        [game.id]);
                }
            }

            return { status: 200, result: { msg: "Your turn ended." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // Makes all the calculation needed to end and score the game
    static async endGame(game) {
        try {
            // Both players go to score phase (id = 3)
            let sqlPlayer = `Update user_game set ug_state_id = ? where ug_id = ?`;
            await pool.query(sqlPlayer, [3, game.player.id]);
            await pool.query(sqlPlayer, [3, game.opponents[0].id]);
            // Set game to finished (id = 3)
            await pool.query(`Update game set gm_state_id=? where gm_id = ?`, [3, game.id]);

            // Insert score lines with the state and points.
            // For this template both are  tied (id = 1) and with one point 
            let sqlScore = `Insert into scoreboard (sb_user_game_id,sb_state_id,sb_points) values (?,?,?)`;
            await pool.query(sqlScore, [game.player.id, 1, 1]);
            await pool.query(sqlScore, [game.opponents[0].id, 1, 1]);

            return { status: 200, result: { msg: "Game ended. Check scores." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getUserBoardInfo(userId, gameId) {
        let [[playerInfo]] = await pool.query(`
        select ug_gold as "gold", ug_mine_level as "mineLevel"
        from user_game
        where ug_game_id = ? and ug_user_id = ?`,
            [gameId, userId]);

        [playerInfo.hand] = await pool.query(`select * from user_game_card where ugc_state_id = 1`);

        [playerInfo.zone] = await pool.query(`select * from user_game_card where ugc_state_id = 2`);

        [playerInfo.discard] = await pool.query(`select * from user_game_card where ugc_state_id = 3`);


        return playerInfo
    }

    static async getBoard(game) {
        try {
            let board = {};
            board.player = await Play.getUserBoardInfo(game.player.id, game.id);

            board.opponents = [];

            for (let i = 0; i < game.opponents.length; i++) {
                const element = game.opponents[i];
                board.opponents[i] = await Play.getUserBoardInfo(game.opponents[i].id, game.id);
            }
            console.log(board);
            return { status: 200, result: board };

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    // static async #generatePlayerDeck(playerID) {
    //     // Gets the 3 base decks (divided by rarity)
    //     let [baseDecks] = await pool.query(`Select * from deck`);
    //     console.log("Base Decks");
    //     console.log(baseDecks);

    //     // Makes a copy of the template deck onto user game deck
    //     for (let i = 0; i < baseDecks.length; i++) {
    //         await pool.query(`Insert into user_game_deck(ugd_user_game_id, ugd_rar_id) values (?, ?)`, [playerID, baseDecks[i].dec_rarity_id]);
    //     }

    //     // Get the template cards from the database
    //     let [baseCards] = await pool.query(`Select crd_id as "card_id", dhc_dec_id as "deck_id" from card, deck_has_card where crd_id = dhc_crd_id`);
    //     // Get the user game decks that were made
    //     let [userGameDecks] = await pool.query(`Select ugd_id as "deck_id", ugd_rar_id as "rarity" from user_game_deck where ugd_user_game_id = ? order by ugd_id`, [playerID]);

    //     console.log("User Game Decks");
    //     console.log(userGameDecks);

    //     // For every template card
    //     for (let i = 0; i < baseCards.length; i++) {

    //         // Add a new user game card
    //         // State is hard coded in (1 is "Deck")
    //         await pool.query(`Insert into user_game_card(ugc_crd_id, ugc_user_game_id, ugc_state_id) values (?, ?, ?)`, [baseCards[i].card_id, playerID, 1]);

    //         // Selects the last card we added
    //         let [[userGameCardID]] = await pool.query(`Select max(ugc_id) as "max_id" from user_game_card where ugc_user_game_id = ?`, [playerID]);

    //         // Inserts it into the right deck
    //         // console.log("userGameDecks[baseCards[i] .rarity].id: ");
    //         console.log(userGameDecks[baseCards[i].rarity].ID);
    //         await pool.query(`Insert into user_game_deck_cards(udc_ugc_id, udc_ugd_id) values (?, ?)`, [userGameCardID.max_id, userGameDecks[baseCards[i]].rarity.id]);

    //     }
    //}
}

module.exports = Play;