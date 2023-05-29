const pool = require("../config/database");
const utils = require("../config/utils");

// function fromDBCardToCard(dbCard) {
//     return new Card(dbCard.crd_id)
// }

class Card {
    constructor(cardId, deckId, name, type, state, userCardHandData) {
        this.cardId = cardId;
        this.deckId = deckId;
        this.name = name;
        this.type = type;
        this.state = state;
        this.userCardHandData = userCardHandData;
    }

    static async drawCard(game, body) {
        try {
            let [[playernCards]] = await pool.query(
                `Select count(ugh_id) as "num" 
                from user_game_hand 
                where ugh_user_game_id = ?`, 
                    [game.player.id]);

            let [[playerGold]] = await pool.query(`Select ug_gold as "gold" from user_game where ug_id = ?`, [game.player.id]);
            let [[cost]] = await pool.query(`Select rar_cost as "cost" from rarity where rar_id = ?`, [body.rarity]);
            
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                        "You cannot draw card since you are not currently on your turn."
                    }
                }
            }
            else if (playernCards.num > 4) {
                return {
                    status: 400, result: {
                        msg:
                            "You already drew the maximum amount of cards."
                        }
                    }
                }
            else if (playerGold.gold < cost.cost)
            {
                return {
                    status: 400, result: {
                        msg:
                        "You do not have enough gold to draw this card."
                    }
                }
            }
            else {
                // Ajusts player gold
                playerGold.gold -= cost.cost;
                await pool.query(`Update user_game 
                set ug_gold = ? 
                where ug_id = ?`, 
                    [playerGold.gold, game.player.id]);

                // Selects all cards from that rarity
                let [cards] = await pool.query(
                `select * from card where crd_rarity = ?`,
                [body.rarity]);

                // Selects random card from the array
                let randomCard = cards[utils.randomNumber(cards.length)];
                console.log(randomCard);
                
                // Add new card to user game card
                await pool.query(
                `Insert into user_game_card
                (ugc_user_game_id, ugc_crd_id, ugc_state_id)
                values (?, ?, 1)`,
                    [game.player.id, randomCard.crd_id]);

                // Getting the newly created user card id 
                let [[userCardData]] = await pool.query(
                    `Select max(ugc_id) as "maxID"
                    from user_game_card 
                    where ugc_user_game_id = ?`,
                        [game.player.id]);

                let [[cardType]] = await pool.query(
                    `Select crd_type_id as "type" from card, user_game_card
                    where crd_id = ugc_crd_id and ugc_id = ?`,
                        [userCardData.maxID]);

                // Add the newly created card to the hand
                await pool.query(
                    `Insert into user_game_hand
                    (ugh_ugc_id, ugh_user_game_id) values (?, ?)`,
                        [userCardData.maxID, game.player.id]);

                if (cardType.type == 1) {
                    let [[cardDataDB]] = await pool.query(
                    `Select ctk_hp as "hp", ctk_attack "attack" from card_attack, user_game_card
                    where ugc_crd_id = ctk_crd_id and ugc_id = ?`,
                        [userCardData.maxID]);

                    // await pool.query(`
                    // Insert into user_game_card_attack
                    // (uca_ugc_id, uca_hp, uca_ap) values (?, ?, ?)`,
                    //     [userCardData.maxID, cardDataDB.hp, cardDataDB.attack]);
                }
            }
                return { status: 200, result: { msg: "You drew a card." } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
    
    static async playCard(game, ugcID, boardPos) {
        try {
            if (game.player.state.name == "Waiting") {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card since you are not currently on your turn."
                    }
                }
            }
            console.log(ugcID)
            let [[cardData]] = await pool.query(
                `Select ugc_crd_id as "cardID", crd_type_id as "typeID", ugh_id as "ughID"
                from user_game_card, user_game_hand, card where ugc_crd_id = crd_id and ugh_ugc_id = ugc_id and ugc_id = ?`,
                [ugcID]);
                
            if (!cardData) {
                return {status:400, result:{msg:"Please select a valid card."}};
            }
            
            let [[cardInPlace]] = await pool.query(
                `Select * from user_game_board where ugb_ug_id = ? and ugb_position = ?`, 
                    [game.player.id, boardPos]);

            if (cardInPlace && cardData.typeID == 1) {
                return {
                    status: 400, result: {
                        msg:
                            "You cannot play a card in this position."
                    }
                }
            }

            // changes state of the card to board
            await pool.query(`Update user_game_card set ugc_state_id = 2 where ugc_id = ?`, [ugcID]);

            let result;
            // monster card
            if (cardData.typeID === 1) {
                await Card.cardToBoard(ugcID, boardPos, game);

                let [[cardInfo]] = await pool.query(
                    `Select distinct(ctk_attack) as "ap", ctk_hp as "hp" 
                    from card_attack
                    where ctk_crd_id = ?`, 
                        [cardData.cardID]);
            
                await pool.query(
                    `Insert into user_game_card_attack
                    (uca_ugc_id, uca_hp, uca_ap) 
                    values (?, ?, ?)`, 
                        [ugcID, cardInfo.hp, cardInfo.ap]);
                result = {status:200, msg:"Card Played."}
            }
            else if (cardData.typeID === 2) {
                result = await Card.cardShield(ugcID, boardPos, game);
            }
            // spell card
            else if (cardData.typeID === 3) {
                result = await Card.cardSpell(ugcID, boardPos, game);
            }
            
            await pool.query(`Delete from user_game_hand where ugh_id = ?`, [cardData.ughID]);

            return result;

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async cardToBoard(cardID, boardPos, game) {
        
        await pool.query(
            `Insert into user_game_board (ugb_ugc_id, ugb_position, ugb_ug_id) values (?, ?, ?)`, 
                [cardID, boardPos, game.player.id]);
    }

    static async cardAttack(ugcID, boardPos, opponents) {
        
        for (let i = 0; i < opponents.length; i++) {

            let [[attackPower]] = await pool.query(`
            Select uca_ap as "ap" 
            from user_game_card_attack 
            where uca_ugc_id = ?`, 
                [ugcID]);

            let [[cardInFront]] = await pool.query(`
            Select ugb_ugc_id as "ugcID" 
            from user_game_board 
            where ugb_ug_id = ? and ugb_position = ?`, 
                [opponents[i].id, boardPos]);
                
            if (!cardInFront) {
                let [[oppHP]] = await pool.query(`
                Select ug_hp as "hp" from user_game 
                where ug_id = ?`, 
                    [opponents[i].id]);

                oppHP.hp -= attackPower.ap;
                await pool.query(`Update user_game set ug_hp = ? where ug_id = ?`, [oppHP.hp, opponents[i].id]);
            } else {
                    
                let [[cardInFrontData]] = await pool.query(`Select uca_hp as "hp" 
                from user_game_card_attack where uca_ugc_id = ?`,
                    [cardInFront.ugcID]);

                cardInFrontData.hp -= attackPower.ap;
                
                if (cardInFrontData.hp > 0) {
                    await pool.query(`
                    Update user_game_card_attack 
                    set uca_hp = ? 
                    where uca_ugc_id = ?`,
                        [cardInFrontData.hp, cardInFront.ugcID]);
                }
                else {
                    // adds the card to the discard table
                    await pool.query(`
                    Insert into user_game_discard
                    (ugd_ugc_id) 
                    value (?)`, 
                        [cardInFront.ugcID]);

                    // deletes it from the board table
                    await pool.query(`Delete from user_game_board 
                    where ugb_ugc_id = ?`, 
                        [cardInFront.ugcID]);
                }
            }
        }
    }

    static async cardSpell(ugcID, boardPos, game) {
        try {
            
            let[[buffedCard]] = await pool.query(
                `Select ugb_ugc_id as "ugcID"
                from user_game_board
                where ugb_position = ? and ugb_ug_id = ?`, 
                    [boardPos, game.player.id]);

            if (!buffedCard) {
                return { status: 400, msg: "Please choose a valid card." }
            }

            let [[cardData]] = await pool.query(`select ugc_crd_id as "cardID" from user_game_card where ugc_id = ?`, [ugcID]);

            let [[buff]] = await pool.query(
                `Select csp_attack 
                from card_spell 
                where csp_crd_id =  ?`, 
                    [cardData.cardID]);

            let [[buffedCardData]] = await pool.query(
                `Select uca_ap as "ap" from user_game_card_attack where uca_ugc_id = ?`,
                    [buffedCard.ugcID]);

            buffedCardData.ap += buff.csp_attack;
            
            await pool.query(`Update user_game_card_attack set uca_ap = ? where uca_ugc_id = ?`,
                [buffedCardData.ap, buffedCard.ugcID]);

            return { status: 200, msg: "Card Played." }

            } catch (err) {
                console.log(err);
                return { status: 500, result: err };
        }
    }

    static async cardShield(ugcID, boardPos, game) {
        try {
            // Get the card that is going to be healed
            let[[healedCard]] = await pool.query(
                `Select ugb_id as "boardID", ugb_ugc_id as "cardID"
                from user_game_board
                where ugb_position = ? and ugb_ug_id = ?`, 
                    [boardPos, game.player.id]);

            // Does the card exist?
            if (!healedCard) {
                return { status: 400, msg:"Please choose a valid card." }
            }

            let [[cardData]] = await pool.query(`select ugc_crd_id as "cardID" from user_game_card where ugc_id = ?`, [ugcID]);

            // Get the heal amount
            let [[healingData]] = await pool.query(`
                Select csh_hp as "hp" from card_shield where csh_crd_id = ?`,
                    [cardData.cardID]);

            // Get the data of the monster
            let [[healedCardData]] = await pool.query(`
                Select uca_hp as "hp" from user_game_card_attack where uca_ugc_id = ?`,
                    [healedCard.cardID]);

            healedCardData.hp += healingData.hp;

            await pool.query(
                `Update user_game_card_attack
                set uca_hp = ? where uca_ugc_id = ?`,
                    [healedCardData.hp, healedCard.cardID]);

            return { status: 200, msg: "Card Played." }

        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

// class MatchDecks {
//     constructor(myCards, oppCards) {
//         this.myCards = myCards;
//         this.oppCards = oppCards;
//     }
    
//     static async resetPlayerDeck(playerId) {
//             try {
//                 let [result] = await pool.query(`delete from user_game_card where ugc_user_game_id = ?`, [playerId]);
//                 return {status:200, result: {msg:"All cards removed"}};
//             } catch (err) {
//                 console.log(err);
//                 return { status: 500, result: err };
//             }
//     }
// }

module.exports = Card;

