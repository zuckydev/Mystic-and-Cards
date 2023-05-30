const pool = require("../config/database");

class Mine {
    constructor(minelevel, gold) {
        this.minelevel = minelevel;
        this.gold = gold;
    }

    static async upgradeMine(game, body, playerMineLevel) {
        try {

            let [[minelevel]] = await pool.query(`Select ug_mine_level as "num" from user_game where ug_id = ?`, [game.player.id]);
            let [[playerGold]] = await pool.query(`Select ug_gold as "gold" from user_game where ug_id = ?`, [game.player.id]);
            let [[upgradecost]] = await pool.query(`Select ug_mine_level_cost as "upgradecost" from user_game where ug_id = ?`, [game.player.id]);
            console.log('Body:', game);
            console.log('Mine Level:', game.minelevel);


            if (game.player.state.name === "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot buy a mine upgrade since you are not currently on your turn."

                    }
                }
            } else if (minelevel.num > 5) {
                return {
                    status: 400, result: {
                        msg:
                            "You already bought the maximum amount of upgrades."

                    }
                }
            } else if (playerGold.gold < upgradecost.upgradecost) {
                return {
                    status: 400, result: {
                        msg:
                            "You do not have enough gold to buy the upgrade."
                    }
                }
            } else {
                playerGold.gold -= upgradecost.upgradecost;
                await pool.query(`Update user_game 
                    set ug_gold = ? 
                    where ug_id = ?`,
                    [playerGold.gold, game.player.id]);

                await pool.query(
                    `Update user_game
                    set ug_mine_level = ug_mine_level + 1
                    where ug_id = ?`,
                    [game.player.id]
                );
            }
            return { status: 200, result: { msg: "Mine ugraded." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Mine;