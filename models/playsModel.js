const pool = require("../config/database");
const Card = require("./cardsModel");
const { upgradeMine } = require("./mineModel");

// auxiliary function to check if the game ended 
async function checkEndGame(game) {
    let ug = await pool.query(`select * from user_game where ug_game_id = ? and ug_user_id = ?`, [game.id, game.player.id]);
    return ug[0][0].ug_hp <= Play.minHp;
}

class Play {
    // At this moment I do not need to store information so we have no constructor

    // Just a to have a way to determine end of game
    static minHp = 0;

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
            if (true || game.player.order === 2) {
                // Criteria to check if game ended
                if (await checkEndGame(game)) {
                    return await Play.endGame(game);
                } else {
                    // Increase the number of turns and continue 
                    await pool.query(`Update game set gm_turn=gm_turn+1 where gm_id = ?`,
                        [game.id]);
                }
            }

            let [cardsOnBoard] = await pool.query(`
            Select ugb_ugc_id as "id", 
            ugb_position as "position"
            from user_game_board
            where ugb_ug_id = ?`, 
                [game.player.id]);

            if (cardsOnBoard) {
                for (let i = 0; i < cardsOnBoard.length; i++) {
                    if (cardsOnBoard[i].id) {
                        await Card.cardAttack(cardsOnBoard[i].id, cardsOnBoard[i].position, game.opponents);
                    }
                    
                }
            }

            [[game.player.gold]] = await pool.query(`SELECT ug_gold AS "gold" FROM user_game WHERE ug_id = ?`, [game.player.id]);
            const [[{ ug_mine_level: minelevel }]] = await pool.query(`SELECT ug_mine_level FROM user_game WHERE ug_id = ?`, [game.player.id]);
            
            game.player.gold.gold += 2 + minelevel * 2;
            await pool.query(`UPDATE user_game SET ug_gold = ? WHERE ug_id = ?`, [game.player.gold.gold, game.player.id]);
            
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
            let sqlScore = `Insert into scoreboard (sb_user_game_id, sb_state_id, sb_points) values (?,?,?)`;
            await pool.query(sqlScore, [game.player.id, 1, 1]);
            await pool.query(sqlScore, [game.opponents[0].id, 1, 1]);

            return { status: 200, result: { msg: "Game ended. Check scores." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getPlayerHand(userId) {
        let [[playerHand]] = await pool.query(`
        Select *
        from user_game_hand, user_game_card
        where ugc_id = ugh_ugc_id and ugc_user_game_id = ?`,
            [userId]);

        return playerHand;
    }

    static async getUserBoardInfo(userId, gameId) {

        let [[playerInfo]] = await pool.query(`
        select ug_gold as "gold", ug_mine_level as "mineLevel", ug_hp as "hp"
        from user_game
        where ug_game_id = ? and ug_user_id = ?`,
            [gameId, userId]);

        [playerInfo.mine] = await pool.query(`
            Select ug_mine_level_cost as "mineCost" 
            from user_game where ug_id = ? and ug_game_id = ?`, 
                [userId, gameId]);

        [playerInfo.hand] = await pool.query(
            `Select
            ugc_id as "id",
            ugc_crd_id as "cardID",
            ugc_user_game_id as "owner",
            ugh_id as "handID",
            crd_name as "name",
            crd_rarity as "rarity",
            crd_type_id as "type",
            ugc_state_id as "state"
            from user_game_hand, user_game_card, card
            where ugc_id = ugh_ugc_id and ugc_user_game_id = ? and ugc_crd_id = crd_id`,
                [userId]);

        for (let i = 0; i < playerInfo.hand.length; i++) {
            let typeDataDB = {};
            if (playerInfo.hand[i].type === 1) {
                [[typeDataDB]] = await pool.query(
                    `Select ctk_hp as "hp", ctk_attack as "attack" from card_attack where ctk_crd_id = ?`,
                        [playerInfo.hand[i].cardID]);
                playerInfo.hand[i].attack = typeDataDB.attack;
                playerInfo.hand[i].hp = typeDataDB.hp;
            }
            else if (playerInfo.hand[i].type === 2) {
                [[typeDataDB]] = await pool.query(
                    `Select csh_hp as "hp" from card_shield where csh_crd_id = ?`,
                        [playerInfo.hand[i].cardID]);
                playerInfo.hand[i].hp = typeDataDB.hp;
            }
            else if (playerInfo.hand[i].type === 3) {
                [[typeDataDB]] = await pool.query(
                    `Select csp_attack as "attack" from card_spell where csp_crd_id = ?`,
                        [playerInfo.hand[i].cardID]);
                playerInfo.hand[i].attack = typeDataDB.attack;
            }
        }

        [playerInfo.board] = await pool.query(
            `Select distinct(ugc_id) as "id", 
            ugc_crd_id as "cardID", 
            ugc_user_game_id as "owner", 
            ugb_id as "boardID", 
            crd_name as "name", 
            crd_rarity as "rarity",
            crd_type_id as "type",
            ugc_state_id as "state",
            uca_hp as "hp",
            uca_ap as "attack", 
            ugb_position as "position"
            from user_game_card, user_game_board, card, user_game_card_attack
            where ugc_id = ugb_ugc_id 
            and ugc_crd_id = crd_id 
            and uca_ugc_id = ugc_id 
            and ugc_user_game_id = ?`,
                [userId]);

        [playerInfo.discard] = await pool.query(
            `Select *
            from user_game_card, user_game_discard
            where ugc_id = ugd_ugc_id and ugc_user_game_id = ?`,
            [userId]);
        
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
            return { status: 200, result: board };

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Play;
